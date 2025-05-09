// 영화 타입 정의
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genres?: Genre[];
}

// 책 타입 정의
export interface Book {
  isbn: string;
  title: string;
  author: string;
  description: string;
  cover_image: string;
  published_date: string;
  publisher: string;
  price: number;
}

// 장르 타입 정의
export interface Genre {
  id: number;
  name: string;
}

// 리뷰 타입 정의
export interface Review {
  id: string;
  itemId: string | number; // 영화의 경우 number, 책의 경우 string(isbn)
  itemType: "movie" | "book";
  rating: number; // 1-5 별점
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  username: string;
}

// 사용자 타입 정의
export interface User {
  id: string;
  username: string;
  email: string;
  collections: Collection[];
  isPremium: boolean; // 프리미엄 사용자 여부
  subscriptionExpiry?: number; // 구독 만료 시간 (타임스탬프)
}

// 컬렉션 타입 정의
export interface Collection {
  id: string;
  name: string;
  items: Array<{
    id: string | number;
    type: "movie" | "book";
  }>;
}

// API 응답 타입 정의
export interface ApiResponse<T> {
  results: T[];
  total_results?: number;
  total_pages?: number;
  page?: number;
}

// 구독 플랜 타입 정의
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // 일 단위
  description: string;
  features: string[];
}

// 결제 정보 타입 정의
export interface PaymentInfo {
  paymentKey: string;
  orderId: string;
  amount: number;
  orderName: string;
  status:
    | "READY"
    | "IN_PROGRESS"
    | "DONE"
    | "CANCELED"
    | "PARTIAL_CANCELED"
    | "ABORTED"
    | "EXPIRED";
  transactionDate?: string;
  subscriptionInfo?: {
    planId: string;
    startDate: number;
    endDate: number;
  };
}
