import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Review,
  Collection,
  User,
  PaymentInfo,
  SubscriptionPlan,
} from "../types";

// 스토리지 키 정의
const STORAGE_KEYS = {
  REVIEWS: "reviews",
  COLLECTIONS: "collections",
  WATCHED_MOVIES: "watched_movies",
  READ_BOOKS: "read_books",
  USER_PROFILE: "user_profile",
  SUBSCRIPTION: "subscription",
  PAYMENT_HISTORY: "payment_history",
};

// 리뷰 관리 서비스
export const reviewStorage = {
  // 모든 리뷰 가져오기
  getAll: async (): Promise<Review[]> => {
    try {
      const reviewsJson = await AsyncStorage.getItem(STORAGE_KEYS.REVIEWS);
      return reviewsJson ? JSON.parse(reviewsJson) : [];
    } catch (error) {
      console.error("리뷰를 가져오는 중 오류 발생:", error);
      return [];
    }
  },

  // 특정 아이템의 리뷰 가져오기
  getByItem: async (
    itemId: string | number,
    itemType: "movie" | "book"
  ): Promise<Review[]> => {
    try {
      const reviews = await reviewStorage.getAll();
      return reviews.filter(
        (review) => review.itemId === itemId && review.itemType === itemType
      );
    } catch (error) {
      console.error("아이템 리뷰를 가져오는 중 오류 발생:", error);
      return [];
    }
  },

  // 리뷰 저장하기
  save: async (review: Review): Promise<void> => {
    try {
      const reviews = await reviewStorage.getAll();

      // 기존 리뷰가 있으면 업데이트, 없으면 추가
      const existingIndex = reviews.findIndex((r) => r.id === review.id);

      if (existingIndex >= 0) {
        reviews[existingIndex] = review;
      } else {
        reviews.push(review);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (error) {
      console.error("리뷰를 저장하는 중 오류 발생:", error);
    }
  },

  // 리뷰 삭제하기
  delete: async (reviewId: string): Promise<void> => {
    try {
      const reviews = await reviewStorage.getAll();
      const filteredReviews = reviews.filter(
        (review) => review.id !== reviewId
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REVIEWS,
        JSON.stringify(filteredReviews)
      );
    } catch (error) {
      console.error("리뷰를 삭제하는 중 오류 발생:", error);
    }
  },
};

// 컬렉션 관리 서비스
export const collectionStorage = {
  // 모든 컬렉션 가져오기
  getAll: async (): Promise<Collection[]> => {
    try {
      const collectionsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.COLLECTIONS
      );
      return collectionsJson ? JSON.parse(collectionsJson) : [];
    } catch (error) {
      console.error("컬렉션을 가져오는 중 오류 발생:", error);
      return [];
    }
  },

  // 특정 컬렉션 가져오기
  getById: async (collectionId: string): Promise<Collection | null> => {
    try {
      const collections = await collectionStorage.getAll();
      return (
        collections.find((collection) => collection.id === collectionId) || null
      );
    } catch (error) {
      console.error("컬렉션을 가져오는 중 오류 발생:", error);
      return null;
    }
  },

  // 컬렉션 저장하기
  save: async (collection: Collection): Promise<void> => {
    try {
      const collections = await collectionStorage.getAll();

      // 기존 컬렉션이 있으면 업데이트, 없으면 추가
      const existingIndex = collections.findIndex(
        (c) => c.id === collection.id
      );

      if (existingIndex >= 0) {
        collections[existingIndex] = collection;
      } else {
        collections.push(collection);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.COLLECTIONS,
        JSON.stringify(collections)
      );
    } catch (error) {
      console.error("컬렉션을 저장하는 중 오류 발생:", error);
    }
  },

  // 컬렉션 삭제하기
  delete: async (collectionId: string): Promise<void> => {
    try {
      const collections = await collectionStorage.getAll();
      const filteredCollections = collections.filter(
        (collection) => collection.id !== collectionId
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.COLLECTIONS,
        JSON.stringify(filteredCollections)
      );
    } catch (error) {
      console.error("컬렉션을 삭제하는 중 오류 발생:", error);
    }
  },

  // 컬렉션에 아이템 추가하기
  addItem: async (
    collectionId: string,
    itemId: string | number,
    itemType: "movie" | "book"
  ): Promise<void> => {
    try {
      const collections = await collectionStorage.getAll();
      const collectionIndex = collections.findIndex(
        (c) => c.id === collectionId
      );

      if (collectionIndex >= 0) {
        // 중복 체크
        const itemExists = collections[collectionIndex].items.some(
          (item) => item.id === itemId && item.type === itemType
        );

        if (!itemExists) {
          collections[collectionIndex].items.push({
            id: itemId,
            type: itemType,
          });
          await AsyncStorage.setItem(
            STORAGE_KEYS.COLLECTIONS,
            JSON.stringify(collections)
          );
        }
      }
    } catch (error) {
      console.error("컬렉션에 아이템을 추가하는 중 오류 발생:", error);
    }
  },

  // 컬렉션에서 아이템 제거하기
  removeItem: async (
    collectionId: string,
    itemId: string | number,
    itemType: "movie" | "book"
  ): Promise<void> => {
    try {
      const collections = await collectionStorage.getAll();
      const collectionIndex = collections.findIndex(
        (c) => c.id === collectionId
      );

      if (collectionIndex >= 0) {
        collections[collectionIndex].items = collections[
          collectionIndex
        ].items.filter(
          (item) => !(item.id === itemId && item.type === itemType)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.COLLECTIONS,
          JSON.stringify(collections)
        );
      }
    } catch (error) {
      console.error("컬렉션에서 아이템을 제거하는 중 오류 발생:", error);
    }
  },
};

// 사용자 프로필 관리 서비스
export const userStorage = {
  // 사용자 프로필 가져오기
  getProfile: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("사용자 프로필을 가져오는 중 오류 발생:", error);
      return null;
    }
  },

  // 사용자 프로필 저장하기
  saveProfile: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(user)
      );
    } catch (error) {
      console.error("사용자 프로필을 저장하는 중 오류 발생:", error);
    }
  },

  // 프리미엄 상태 확인
  isPremium: async (): Promise<boolean> => {
    try {
      const user = await userStorage.getProfile();
      // 사용자가 없거나 isPremium이 false이거나, 구독이 만료된 경우
      if (!user?.isPremium) return false;

      // 구독 만료 시간이 없는 경우에는 영구 프리미엄으로 간주
      if (!user.subscriptionExpiry) return true;

      // 현재 시간과 만료 시간 비교
      return user.subscriptionExpiry > Date.now();
    } catch (error) {
      console.error("프리미엄 상태 확인 중 오류 발생:", error);
      return false;
    }
  },

  // 구독 상태 업데이트
  updateSubscription: async (
    isPremium: boolean,
    expiryDate?: number
  ): Promise<void> => {
    try {
      const user = await userStorage.getProfile();
      if (!user) return;

      user.isPremium = isPremium;
      if (expiryDate) {
        user.subscriptionExpiry = expiryDate;
      }

      await userStorage.saveProfile(user);
    } catch (error) {
      console.error("구독 상태 업데이트 중 오류 발생:", error);
    }
  },
};

// 결제 기록 관리 서비스
export const paymentStorage = {
  // 모든 결제 기록 가져오기
  getAllPayments: async (): Promise<PaymentInfo[]> => {
    try {
      const paymentsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.PAYMENT_HISTORY
      );
      return paymentsJson ? JSON.parse(paymentsJson) : [];
    } catch (error) {
      console.error("결제 기록을 가져오는 중 오류 발생:", error);
      return [];
    }
  },

  // 결제 기록 저장하기
  savePayment: async (payment: PaymentInfo): Promise<void> => {
    try {
      const payments = await paymentStorage.getAllPayments();
      payments.push(payment);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PAYMENT_HISTORY,
        JSON.stringify(payments)
      );
    } catch (error) {
      console.error("결제 기록을 저장하는 중 오류 발생:", error);
    }
  },

  // 가장 최근 결제 정보 가져오기
  getLatestPayment: async (): Promise<PaymentInfo | null> => {
    try {
      const payments = await paymentStorage.getAllPayments();
      if (payments.length === 0) return null;

      // 날짜순으로 정렬 (최신이 먼저)
      return payments.sort((a, b) => {
        const dateA = a.transactionDate
          ? new Date(a.transactionDate).getTime()
          : 0;
        const dateB = b.transactionDate
          ? new Date(b.transactionDate).getTime()
          : 0;
        return dateB - dateA;
      })[0];
    } catch (error) {
      console.error("최근 결제 정보를 가져오는 중 오류 발생:", error);
      return null;
    }
  },
};

// 구독 플랜 관리 서비스
export const subscriptionPlansStorage = {
  // 기본 구독 플랜 목록
  getDefaultPlans: (): SubscriptionPlan[] => {
    return [
      {
        id: "monthly",
        name: "월간 구독",
        price: 4900,
        duration: 30, // 30일
        description: "한 달 동안 모든 프리미엄 기능 이용",
        features: [
          "광고 제거",
          "무제한 리뷰",
          "고급 리뷰 템플릿",
          "프리미엄 커뮤니티 액세스",
        ],
      },
      {
        id: "yearly",
        name: "연간 구독",
        price: 49000,
        duration: 365, // 365일
        description: "일 년 동안 모든 프리미엄 기능 이용 (16% 할인)",
        features: [
          "광고 제거",
          "무제한 리뷰",
          "고급 리뷰 템플릿",
          "프리미엄 커뮤니티 액세스",
          "구독 선물하기 기능",
        ],
      },
    ];
  },

  // 구독 플랜 가져오기
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      // 저장된 플랜이 있으면 가져오고, 없으면 기본 플랜 반환
      const plansJson = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      return plansJson
        ? JSON.parse(plansJson)
        : subscriptionPlansStorage.getDefaultPlans();
    } catch (error) {
      console.error("구독 플랜을 가져오는 중 오류 발생:", error);
      return subscriptionPlansStorage.getDefaultPlans();
    }
  },

  // 구독 플랜 ID로 가져오기
  getPlanById: async (planId: string): Promise<SubscriptionPlan | null> => {
    try {
      const plans = await subscriptionPlansStorage.getPlans();
      return plans.find((plan) => plan.id === planId) || null;
    } catch (error) {
      console.error("구독 플랜을 가져오는 중 오류 발생:", error);
      return null;
    }
  },
};
