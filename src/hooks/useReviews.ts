import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Review } from "../types";
import { reviewStorage } from "../services/storage";

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    itemId: "9788932917245", // 책의 ISBN
    itemType: "book",
    rating: 4,
    content:
      "이 책은 정말 인상적이었습니다. 작가의 서술 방식이 독특하고 이야기 전개가 흥미롭습니다.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    userId: "user123",
    username: "독서광",
  },
  {
    id: "2",
    itemId: "9788932917245",
    itemType: "book",
    rating: 5,
    content:
      "최근에 읽은 책 중 최고였습니다. 캐릭터들의 심리 묘사가 특히 뛰어났고, 마지막 반전이 놀라웠습니다.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    userId: "user123",
    username: "책벌레",
  },
  {
    id: "3",
    itemId: 505642, // 영화 ID
    itemType: "movie",
    rating: 3,
    content:
      "연출은 좋았지만, 스토리가 다소 뻔했습니다. 배우들의 연기는 훌륭했습니다.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    userId: "user123",
    username: "영화팬",
  },
];

// AsyncStorage 키 상수
const STORAGE_KEY = "app_reviews";

export const useReviews = (
  itemType?: "movie" | "book",
  itemId?: string | number
) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모든 리뷰 데이터 가져오기
  const getAllReviews = useCallback(async (): Promise<Review[]> => {
    const storedReviews = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedReviews) {
      return JSON.parse(storedReviews);
    }
    // 초기 데이터가 없는 경우 가상 데이터 사용
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_REVIEWS));
    return MOCK_REVIEWS;
  }, []);

  // 리뷰 가져오기
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      // 모든 리뷰 데이터 가져오기
      const reviewsData = await getAllReviews();

      console.log("모든 리뷰 데이터:", reviewsData);

      // 필터링 조건에 따라 리뷰 필터링
      let filteredReviews = reviewsData;

      // itemType이 지정된 경우 필터링
      if (itemType) {
        filteredReviews = filteredReviews.filter(
          (review) => review.itemType === itemType
        );
      }

      // itemId가 지정된 경우 추가 필터링
      if (itemId) {
        filteredReviews = filteredReviews.filter(
          (review) => String(review.itemId) === String(itemId)
        );
      }

      console.log("필터링된 리뷰 데이터:", filteredReviews);

      // 날짜 기준 내림차순 정렬
      const sortedReviews = filteredReviews.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(sortedReviews);
      setError(null);
    } catch (err) {
      console.error("리뷰를 가져오는 중 오류 발생:", err);
      setError("리뷰를 불러오는 데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [itemType, itemId, getAllReviews]);

  // 리뷰 수정하기
  const updateReview = useCallback(
    async (
      reviewId: string,
      updatedData: Pick<Review, "rating" | "content">
    ) => {
      try {
        console.log("리뷰 수정 시작:", reviewId, updatedData);

        // 모든 리뷰 데이터 가져오기
        const reviewsData = await getAllReviews();

        // 수정할 리뷰 찾기
        const reviewIndex = reviewsData.findIndex((r) => r.id === reviewId);

        if (reviewIndex === -1) {
          throw new Error("리뷰를 찾을 수 없습니다");
        }

        // 리뷰 업데이트
        const updatedReview = {
          ...reviewsData[reviewIndex],
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };

        reviewsData[reviewIndex] = updatedReview;

        console.log("수정된 리뷰:", updatedReview);

        // 업데이트된 데이터 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reviewsData));
        console.log("리뷰 수정 저장 완료");

        // 현재 상태 업데이트
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? updatedReview : r))
        );

        return updatedReview;
      } catch (err) {
        console.error("리뷰 수정 중 오류 발생:", err);
        throw new Error("리뷰를 수정할 수 없습니다");
      }
    },
    [getAllReviews]
  );

  // 리뷰 추가하기
  const addReview = useCallback(
    async (newReview: Omit<Review, "id" | "createdAt" | "updatedAt">) => {
      try {
        console.log("리뷰 추가 시작:", newReview);

        // 모든 리뷰 데이터 가져오기
        const reviewsData = await getAllReviews();

        // 같은 사용자가 같은 아이템에 대해 이미 작성한 리뷰가 있는지 확인
        const existingReview = reviewsData.find(
          (review) =>
            review.userId === newReview.userId &&
            String(review.itemId) === String(newReview.itemId) &&
            review.itemType === newReview.itemType
        );

        // 이미 리뷰가 있으면 업데이트
        if (existingReview) {
          console.log(
            "이미 존재하는 리뷰 발견, 업데이트합니다:",
            existingReview.id
          );
          return updateReview(existingReview.id, {
            rating: newReview.rating,
            content: newReview.content,
          });
        }

        // 새 리뷰 ID 생성
        const newId = `review_${Date.now()}`;
        const now = new Date().toISOString();

        const reviewToAdd: Review = {
          ...newReview,
          id: newId,
          createdAt: now,
          updatedAt: now,
        };

        console.log("추가할 리뷰:", reviewToAdd);

        // 기존 데이터에 새 리뷰 추가
        const updatedReviews = [reviewToAdd, ...reviewsData];

        // 업데이트된 데이터 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
        console.log("리뷰 저장 완료");

        // 현재 보여주는 리뷰에 해당되면 상태 업데이트
        let shouldUpdate = true;

        if (itemType && reviewToAdd.itemType !== itemType) {
          shouldUpdate = false;
        }

        if (itemId && String(reviewToAdd.itemId) !== String(itemId)) {
          shouldUpdate = false;
        }

        if (shouldUpdate) {
          setReviews((prev) => [reviewToAdd, ...prev]);
        }

        return reviewToAdd;
      } catch (err) {
        console.error("리뷰 추가 중 오류 발생:", err);
        throw new Error("리뷰를 추가할 수 없습니다");
      }
    },
    [itemType, itemId, getAllReviews, updateReview]
  );

  // 리뷰 삭제하기
  const deleteReview = useCallback(
    async (reviewId: string) => {
      console.log("[deleteReview] 함수 시작, ID:", reviewId);

      try {
        // 직접 AsyncStorage에서 데이터 가져오기
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        console.log(
          "[deleteReview] AsyncStorage에서 데이터 가져옴, 데이터 존재:",
          !!storedData
        );

        if (!storedData) {
          console.error("[deleteReview] 저장된 리뷰 데이터가 없습니다");
          return false;
        }

        // 저장된 데이터를 JSON으로 파싱
        const allReviews = JSON.parse(storedData);
        console.log("[deleteReview] 전체 리뷰 수:", allReviews.length);

        // 삭제할 리뷰 검색
        const reviewIndex = allReviews.findIndex(
          (r: Review) => r.id === reviewId
        );
        console.log("[deleteReview] 삭제할 리뷰 인덱스:", reviewIndex);

        if (reviewIndex === -1) {
          console.error(
            "[deleteReview] 해당 ID의 리뷰를 찾을 수 없음:",
            reviewId
          );
          return false;
        }

        // 리뷰 삭제
        allReviews.splice(reviewIndex, 1);
        console.log(
          "[deleteReview] 리뷰 삭제 후 남은 리뷰 수:",
          allReviews.length
        );

        // 업데이트된 데이터를 AsyncStorage에 저장
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));
        console.log("[deleteReview] AsyncStorage 업데이트 완료");

        // 현재 상태 업데이트
        setReviews((prevReviews) => {
          const newReviews = prevReviews.filter((r) => r.id !== reviewId);
          console.log(
            "[deleteReview] UI 업데이트 완료, 새 리뷰 수:",
            newReviews.length
          );
          return newReviews;
        });

        return true;
      } catch (error) {
        console.error("[deleteReview] 오류 발생:", error);
        return false;
      }
    },
    [] // getAllReviews 의존성 제거
  );

  // 초기 리뷰 로드
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    addReview,
    updateReview,
    deleteReview,
  };
};
