import AsyncStorage from "@react-native-async-storage/async-storage";
import { Review, Collection } from "../types";

// 스토리지 키 정의
const STORAGE_KEYS = {
  REVIEWS: "reviews",
  COLLECTIONS: "collections",
  WATCHED_MOVIES: "watched_movies",
  READ_BOOKS: "read_books",
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
