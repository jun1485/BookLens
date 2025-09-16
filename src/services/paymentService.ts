import {
  userStorage,
  paymentStorage,
  subscriptionPlansStorage,
} from "./storage";
import { PaymentInfo, SubscriptionPlan } from "../types";
import {
  initConnection,
  endConnection,
  getProducts,
  getSubscriptions,
  requestPurchase,
  requestSubscription,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  flushFailedPurchasesCachedAsPendingAndroid,
  acknowledgePurchaseAndroid,
  type Product,
  type Subscription,
  type Purchase as IAPPurchase,
  type PurchaseError,
  type ProductPurchase,
  type SubscriptionPurchase,
} from "react-native-iap";
import { Platform } from "react-native";
import type {
  SubscriptionProduct,
  InAppProduct,
  Purchase,
  PurchaseResult,
  PaymentInitOptions,
  PaymentError,
} from "../types/payment";

// 토스페이먼츠 클라이언트 키
const TOSS_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // 테스트 클라이언트 키, 실제 사용시 환경변수로 관리 필요

// 결제 상태 타입
type PaymentStatus =
  | "READY"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED";

// 토스페이먼츠 SDK 타입 정의
interface TossPaymentsSDK {
  requestPayment: (method: string, options: any) => Promise<void>;
}

type SubscriptionStatus = {
  isPremium: boolean;
  expiryDate?: Date;
  currentPlan?: SubscriptionPlan;
};

/**
 * Google Play 결제 서비스 클래스
 * React Native IAP를 사용하여 Google Play Billing Library 6.0.1+ 지원
 */
class PaymentService {
  private isInitialized = false;
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;

  /**
   * 결제 서비스 초기화
   * Google Play Billing Library 6.0.1+ 을 사용합니다
   */
  async initialize(options: PaymentInitOptions = {}): Promise<boolean> {
    try {
      console.log("📱 Google Play 결제 서비스 초기화 시작...");

      // Google Play 결제 서비스 연결
      await initConnection();

      // Android에서 실패한 대기 중인 구매 정리
      if (Platform.OS === "android") {
        await this.flushFailedPurchases();
      }

      // 구매 업데이트 리스너 설정
      this.setupPurchaseListeners();

      this.isInitialized = true;
      console.log("✅ Google Play 결제 서비스 초기화 완료");

      return true;
    } catch (error) {
      console.error("❌ Google Play 결제 서비스 초기화 실패:", error);
      return false;
    }
  }

  /**
   * 결제 서비스 종료
   */
  async terminate(): Promise<void> {
    try {
      // 리스너 정리
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }

      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      // 연결 종료
      await endConnection();
      this.isInitialized = false;

      console.log("📱 Google Play 결제 서비스 종료됨");
    } catch (error) {
      console.error("❌ 결제 서비스 종료 중 오류:", error);
    }
  }

  /**
   * 일회성 상품 목록 조회
   */
  async getInAppProducts(productIds: string[]): Promise<InAppProduct[]> {
    if (!this.isInitialized) {
      throw new Error("결제 서비스가 초기화되지 않았습니다");
    }

    try {
      const products = await getProducts({ skus: productIds });
      return products.map(this.convertToInAppProduct);
    } catch (error) {
      console.error("❌ 일회성 상품 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 구독 상품 목록 조회
   */
  async getSubscriptionProducts(
    productIds: string[]
  ): Promise<SubscriptionProduct[]> {
    if (!this.isInitialized) {
      throw new Error("결제 서비스가 초기화되지 않았습니다");
    }

    try {
      const subscriptions = await getSubscriptions({ skus: productIds });
      return subscriptions.map(this.convertToSubscriptionProduct);
    } catch (error) {
      console.error("❌ 구독 상품 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 일회성 상품 구매
   */
  async purchaseProduct(productId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("결제 서비스가 초기화되지 않았습니다");
    }

    try {
      if (Platform.OS === "android") {
        await requestPurchase({ skus: [productId] });
      } else {
        await requestPurchase({
          sku: productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });
      }
    } catch (error) {
      console.error("❌ 상품 구매 실패:", error);
      throw error;
    }
  }

  /**
   * 구독 상품 구매
   */
  async purchaseSubscription(
    productId: string,
    offerToken?: string
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("결제 서비스가 초기화되지 않았습니다");
    }

    try {
      const purchaseParams: any = { sku: productId };

      // Android에서 특정 오퍼가 있는 경우
      if (Platform.OS === "android" && offerToken) {
        purchaseParams.subscriptionOffers = [{ sku: productId, offerToken }];
      }

      await requestSubscription(purchaseParams);
    } catch (error) {
      console.error("❌ 구독 구매 실패:", error);
      throw error;
    }
  }

  /**
   * 구매 완료 처리
   * Google Play Billing Library 6.0.1+에서는 구매 확인이 필수입니다
   */
  async finalizePurchase(
    purchase: Purchase,
    isConsumable: boolean = false
  ): Promise<void> {
    try {
      // 구매 완료 처리
      await finishTransaction({
        purchase: purchase as any,
        isConsumable,
      });

      console.log("✅ 구매 완료 처리됨:", purchase.productId);
    } catch (error) {
      console.error("❌ 구매 완료 처리 실패:", error);
      throw error;
    }
  }

  /**
   * Android에서 구매 확인
   */
  async acknowledgePurchase(
    purchaseToken: string,
    developerPayload?: string
  ): Promise<void> {
    if (Platform.OS !== "android") {
      return;
    }

    try {
      await acknowledgePurchaseAndroid({
        token: purchaseToken,
        developerPayload,
      });

      console.log("✅ Android 구매 확인 완료");
    } catch (error) {
      console.error("❌ Android 구매 확인 실패:", error);
      throw error;
    }
  }

  /**
   * 저장된 정보를 기반으로 현재 구독 상태를 확인합니다.
   */
  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const [user, latestPayment] = await Promise.all([
        userStorage.getProfile(),
        paymentStorage.getLatestPayment(),
      ]);

      const expiryTimestamp =
        user?.subscriptionExpiry ?? latestPayment?.subscriptionInfo?.endDate;

      let expiryDate: Date | undefined;
      if (typeof expiryTimestamp === "number") {
        const parsed = new Date(expiryTimestamp);
        if (!Number.isNaN(parsed.getTime())) {
          expiryDate = parsed;
        }
      }

      const hasActiveSubscription = Boolean(
        user?.isPremium && (!expiryDate || expiryDate.getTime() > Date.now())
      );

      if (user && !hasActiveSubscription && user.isPremium) {
        await userStorage.saveProfile({
          ...user,
          isPremium: false,
        });
      }

      const planId = latestPayment?.subscriptionInfo?.planId;
      let currentPlan: SubscriptionPlan | undefined;
      if (planId) {
        const plan = await subscriptionPlansStorage.getPlanById(planId);
        if (plan) {
          currentPlan = plan;
        }
      }

      return {
        isPremium: hasActiveSubscription,
        ...(expiryDate ? { expiryDate } : {}),
        ...(currentPlan ? { currentPlan } : {}),
      };
    } catch (error) {
      console.error("❌ 구독 상태 확인 중 오류:", error);
      return { isPremium: false };
    }
  }

  /**
   * 선택한 구독 플랜에 대해 결제 요청을 처리합니다.
   * 실제 결제 연동이 없는 경우 로컬 시뮬레이션으로 처리합니다.
   */
  async requestPayment(planId: string): Promise<void> {
    try {
      const plan = await subscriptionPlansStorage.getPlanById(planId);
      if (!plan) {
        throw new Error(`존재하지 않는 구독 플랜입니다: ${planId}`);
      }

      const now = Date.now();
      const expiry = now + plan.duration * 24 * 60 * 60 * 1000;

      const paymentRecord: PaymentInfo = {
        paymentKey: `local_${now}`,
        orderId: `order_${plan.id}_${now}`,
        amount: plan.price,
        orderName: plan.name,
        status: "DONE",
        transactionDate: new Date(now).toISOString(),
        subscriptionInfo: {
          planId: plan.id,
          startDate: now,
          endDate: expiry,
        },
      };

      await paymentStorage.savePayment(paymentRecord);
      await userStorage.updateSubscription(true, expiry);
    } catch (error) {
      console.error("❌ 결제 요청 처리 중 오류:", error);
      throw error;
    }
  }

  /**
   * 현재 활성화된 구독을 취소합니다.
   */
  async cancelSubscription(): Promise<void> {
    try {
      const user = await userStorage.getProfile();
      if (user) {
        user.isPremium = false;
        delete user.subscriptionExpiry;
        await userStorage.saveProfile(user);
      }

      const latestPayment = await paymentStorage.getLatestPayment();
      if (latestPayment) {
        const cancellationRecord: PaymentInfo = {
          paymentKey: `${latestPayment.paymentKey}_cancel_${Date.now()}`,
          orderId: `${latestPayment.orderId}_cancel`,
          amount: 0,
          orderName: `[취소] ${latestPayment.orderName}`,
          status: "CANCELED",
          transactionDate: new Date().toISOString(),
          subscriptionInfo: latestPayment.subscriptionInfo
            ? {
                ...latestPayment.subscriptionInfo,
                endDate: Date.now(),
              }
            : undefined,
        };

        await paymentStorage.savePayment(cancellationRecord);
      }
    } catch (error) {
      console.error("❌ 구독 취소 처리 중 오류:", error);
      throw error;
    }
  }

  /**
   * 구매 리스너 설정
   */
  private setupPurchaseListeners(): void {
    // 구매 성공 리스너
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      (purchase: ProductPurchase | SubscriptionPurchase) => {
        console.log("📱 구매 업데이트:", purchase);
        this.handlePurchaseUpdate(purchase);
      }
    );

    // 구매 오류 리스너
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.warn("⚠️ 구매 오류:", error);
        this.handlePurchaseError(error);
      }
    );
  }

  /**
   * 구매 업데이트 처리
   */
  private async handlePurchaseUpdate(
    purchase: ProductPurchase | SubscriptionPurchase
  ): Promise<void> {
    try {
      // 구매 영수증이 있는 경우에만 처리
      if (purchase.transactionReceipt) {
        // 여기서 서버에 구매 정보를 전송하고 검증할 수 있습니다
        console.log("📄 구매 영수증:", purchase.transactionReceipt);

        // 구매 확인 처리 (Google Play Billing Library 6.0.1+에서 필수)
        // 실제 앱에서는 서버 검증 후 확인 처리해야 합니다
        await this.finalizePurchase(purchase as any, false);
      }
    } catch (error) {
      console.error("❌ 구매 업데이트 처리 실패:", error);
    }
  }

  /**
   * 구매 오류 처리
   */
  private handlePurchaseError(error: PurchaseError): void {
    // 사용자가 구매를 취소한 경우는 오류로 처리하지 않음
    if (error.code === "E_USER_CANCELLED") {
      console.log("📱 사용자가 구매를 취소했습니다");
      return;
    }

    console.error("❌ 구매 오류 발생:", error);
  }

  /**
   * Android에서 실패한 대기 중인 구매 정리
   */
  private async flushFailedPurchases(): Promise<void> {
    try {
      await flushFailedPurchasesCachedAsPendingAndroid();
      console.log("✅ 실패한 대기 중인 구매 정리 완료");
    } catch (error) {
      console.warn("⚠️ 실패한 구매 정리 중 오류:", error);
      // 이 오류는 치명적이지 않으므로 무시할 수 있습니다
    }
  }

  /**
   * Product를 InAppProduct로 변환
   */
  private convertToInAppProduct(product: Product): InAppProduct {
    return {
      productId: product.productId,
      price: product.price,
      currency: product.currency,
      title: product.title,
      description: product.description,
      type: "inapp",
      localizedPrice: product.localizedPrice,
    };
  }

  /**
   * Subscription을 SubscriptionProduct로 변환
   */
  private convertToSubscriptionProduct(
    subscription: Subscription
  ): SubscriptionProduct {
    return {
      productId: subscription.productId,
      price: (subscription as any).price || "",
      currency: (subscription as any).currency || "",
      title: subscription.title,
      description: subscription.description,
      type: "subs",
      localizedPrice: (subscription as any).localizedPrice || "",
      introductoryPrice: (subscription as any).introductoryPrice,
      introductoryPricePaymentMode: (subscription as any)
        .introductoryPricePaymentMode,
      introductoryPriceNumberOfPeriods: (subscription as any)
        .introductoryPriceNumberOfPeriods,
      introductoryPriceSubscriptionPeriod: (subscription as any)
        .introductoryPriceSubscriptionPeriod,
      subscriptionPeriod: (subscription as any).subscriptionPeriod,
      freeTrialPeriod: (subscription as any).freeTrialPeriod,
    };
  }

  /**
   * 서비스 초기화 상태 확인
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// 싱글톤 인스턴스 생성
export const paymentService = new PaymentService();

export default PaymentService;
