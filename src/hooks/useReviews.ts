import { useState, useEffect, useCallback } from "react";
import { Review } from "../types";
import { reviewStorage } from "../services/storage";
import { generateUUID } from "../utils/helpers";

// 리뷰 관리 커스텀 훅
export const useReviews = (
  itemId?: string | number,
  itemType?: "movie" | "book"
) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리뷰 불러오기
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      let fetchedReviews: Review[];

      if (itemId && itemType) {
        // 특정 아이템의 리뷰만 가져오기
        fetchedReviews = await reviewStorage.getByItem(itemId, itemType);
      } else {
        // 모든 리뷰 가져오기
        fetchedReviews = await reviewStorage.getAll();
      }

      setReviews(fetchedReviews);
      setError(null);
    } catch (err) {
      setError("리뷰를 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType]);

  // 리뷰 추가/수정
  const saveReview = useCallback(
    async (reviewData: Omit<Review, "id" | "createdAt" | "updatedAt">) => {
      try {
        // 기존 리뷰 찾기 (같은 사용자가 같은 아이템에 작성한 리뷰)
        const existingReview = reviews.find(
          (r) =>
            r.userId === reviewData.userId &&
            r.itemId === reviewData.itemId &&
            r.itemType === reviewData.itemType
        );

        const now = new Date().toISOString();
        let newReview: Review;

        if (existingReview) {
          // 기존 리뷰 업데이트
          newReview = {
            ...existingReview,
            ...reviewData,
            updatedAt: now,
          };
        } else {
          // 새 리뷰 생성
          newReview = {
            id: generateUUID(),
            ...reviewData,
            createdAt: now,
            updatedAt: now,
          };
        }

        await reviewStorage.save(newReview);

        // 상태 업데이트
        setReviews((prevReviews) => {
          if (existingReview) {
            return prevReviews.map((r) =>
              r.id === existingReview.id ? newReview : r
            );
          } else {
            return [...prevReviews, newReview];
          }
        });

        return newReview;
      } catch (err) {
        setError("리뷰를 저장하는 중 오류가 발생했습니다");
        console.error("Error saving review:", err);
        throw err;
      }
    },
    [reviews]
  );

  // 리뷰 삭제
  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      await reviewStorage.delete(reviewId);

      // 상태 업데이트
      setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError("리뷰를 삭제하는 중 오류가 발생했습니다");
      console.error("Error deleting review:", err);
      throw err;
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    saveReview,
    deleteReview,
  };
};
