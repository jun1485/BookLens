import {
  userStorage,
  paymentStorage,
  subscriptionPlansStorage,
} from "./storage";
import { PaymentInfo, SubscriptionPlan } from "../types";

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

// 결제 서비스
export const paymentService = {
  // 토스페이먼츠 SDK 로드 - React Native에서 웹뷰를 통해 처리 필요
  loadTossPaymentsSDK: async (): Promise<TossPaymentsSDK> => {
    try {
      // 실제 구현에서는 WebView를 통해 토스페이먼츠 SDK를 로드
      // 여기서는 목업 객체 반환
      return {
        requestPayment: async (method: string, options: any) => {
          console.log("토스페이먼츠 결제 요청:", method, options);
          // 실제 구현에서는 WebView를 통해 결제 페이지로 이동
        },
      };
    } catch (error) {
      console.error("토스페이먼츠 SDK 로드 중 오류 발생:", error);
      throw new Error("결제 모듈을 로드할 수 없습니다.");
    }
  },

  // 결제 요청 생성 및 처리
  requestPayment: async (planId: string): Promise<void> => {
    try {
      // 구독 플랜 정보 가져오기
      const plan = await subscriptionPlansStorage.getPlanById(planId);
      if (!plan) {
        throw new Error("구독 플랜을 찾을 수 없습니다.");
      }

      // 토스페이먼츠 SDK 로드
      const tossPayments = await paymentService.loadTossPaymentsSDK();

      // 주문 ID 생성 (고유값)
      const orderId = `BOOKREV_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`;

      // 결제 요청
      await tossPayments.requestPayment("카드", {
        amount: plan.price,
        orderId: orderId,
        orderName: `북&영화 리뷰 앱 ${plan.name}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        windowTarget: "_self",
      });
    } catch (error) {
      console.error("결제 요청 중 오류 발생:", error);
      throw error;
    }
  },

  // 결제 성공 처리
  handlePaymentSuccess: async (paymentData: {
    paymentKey: string;
    orderId: string;
    amount: number;
  }): Promise<void> => {
    try {
      // 서버에서 결제 승인 검증이 필요하나, 이 예제에서는 생략
      // 실제 구현시 서버에 승인 요청 필요

      // 주문 ID에서 플랜 ID 추출 (실제로는 서버에서 관리)
      const planId = paymentData.orderId.includes("monthly")
        ? "monthly"
        : "yearly";

      // 플랜 정보 가져오기
      const plan = await subscriptionPlansStorage.getPlanById(planId);
      if (!plan) {
        throw new Error("구독 플랜을 찾을 수 없습니다.");
      }

      // 결제 정보 생성
      const now = Date.now();
      const expiryDate = now + plan.duration * 24 * 60 * 60 * 1000; // 플랜 기간(일) * 하루 밀리초

      // 결제 정보 저장
      const paymentInfo: PaymentInfo = {
        paymentKey: paymentData.paymentKey,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        orderName: `북&영화 리뷰 앱 ${plan.name}`,
        status: "DONE", // 결제 완료 상태
        transactionDate: new Date().toISOString(),
        subscriptionInfo: {
          planId: plan.id,
          startDate: now,
          endDate: expiryDate,
        },
      };

      await paymentStorage.savePayment(paymentInfo);

      // 사용자 구독 상태 업데이트
      await userStorage.updateSubscription(true, expiryDate);

      console.log("결제 완료 및 구독 활성화:", plan.name);
    } catch (error) {
      console.error("결제 완료 처리 중 오류 발생:", error);
      throw error;
    }
  },

  // 결제 취소 처리
  cancelSubscription: async (): Promise<void> => {
    try {
      // 최근 결제 정보 가져오기
      const latestPayment = await paymentStorage.getLatestPayment();
      if (!latestPayment || latestPayment.status !== "DONE") {
        throw new Error("활성화된 구독이 없습니다.");
      }

      // 실제로는 토스페이먼츠 API를 통해 결제 취소 요청 필요
      // 여기서는 로컬에서만 상태 변경

      // 구독 상태 업데이트
      await userStorage.updateSubscription(false);

      console.log("구독 취소 완료");
    } catch (error) {
      console.error("구독 취소 중 오류 발생:", error);
      throw error;
    }
  },

  // 구독 상태 확인
  checkSubscriptionStatus: async (): Promise<{
    isPremium: boolean;
    expiryDate?: Date;
    currentPlan?: SubscriptionPlan;
  }> => {
    try {
      const isPremium = await userStorage.isPremium();
      const user = await userStorage.getProfile();
      const latestPayment = await paymentStorage.getLatestPayment();

      let currentPlan: SubscriptionPlan | undefined;
      if (latestPayment?.subscriptionInfo?.planId) {
        currentPlan =
          (await subscriptionPlansStorage.getPlanById(
            latestPayment.subscriptionInfo.planId
          )) || undefined;
      }

      return {
        isPremium,
        expiryDate: user?.subscriptionExpiry
          ? new Date(user.subscriptionExpiry)
          : undefined,
        currentPlan,
      };
    } catch (error) {
      console.error("구독 상태 확인 중 오류 발생:", error);
      return { isPremium: false };
    }
  },
};
