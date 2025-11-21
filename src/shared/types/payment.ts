/**
 * Google Play 결제 관련 타입 정의
 */

// 상품 타입 - 일회성 구매 또는 구독
export type ProductType = "inapp" | "subs";

// 결제 상태
export type PurchaseState = "pending" | "purchased" | "restored";

// 구독 상품 정보
export interface SubscriptionProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  type: ProductType;
  localizedPrice: string;
  introductoryPrice?: string;
  introductoryPricePaymentMode?: string;
  introductoryPriceNumberOfPeriods?: number;
  introductoryPriceSubscriptionPeriod?: string;
  subscriptionPeriod?: string;
  freeTrialPeriod?: string;
}

// 일회성 상품 정보
export interface InAppProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  type: ProductType;
  localizedPrice: string;
}

// 구매 정보
export interface Purchase {
  productId: string;
  transactionDate: number;
  transactionId: string;
  transactionReceipt: string;
  purchaseToken?: string;
  dataAndroid?: string;
  signatureAndroid?: string;
  isAcknowledgedAndroid?: boolean;
  purchaseStateAndroid?: number;
  autoRenewingAndroid?: boolean;
  originalTransactionDateIOS?: number;
  originalTransactionIdentifierIOS?: string;
}

// 구매 결과
export interface PurchaseResult {
  responseCode?: number;
  debugMessage?: string;
  code?: string;
  message?: string;
}

// 결제 서비스 초기화 옵션
export interface PaymentInitOptions {
  enablePendingPurchases?: boolean;
}

// 결제 오류
export interface PaymentError {
  code: string;
  message: string;
  userCancelled?: boolean;
}
