import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorage 데이터 확인용 유틸리티
export const checkAllStorage = async () => {
  try {
    // AsyncStorage의 모든 키 가져오기
    const keys = await AsyncStorage.getAllKeys();
    console.log("모든 스토리지 키:", keys);

    // 각 키에 대한 데이터 가져오기
    for (const key of keys) {
      const data = await AsyncStorage.getItem(key);
      try {
        const parsedData = JSON.parse(data);
        console.log(
          `키 [${key}] 데이터:`,
          Array.isArray(parsedData)
            ? `배열 (${parsedData.length}개 항목)`
            : typeof parsedData === "object"
            ? "객체"
            : parsedData
        );
      } catch (e) {
        console.log(`키 [${key}] 데이터:`, data);
      }
    }
    return keys;
  } catch (error) {
    console.error("스토리지 확인 오류:", error);
    return [];
  }
};

// 리뷰 관련 스토리지만 초기화
export const resetReviewStorage = async () => {
  try {
    await AsyncStorage.removeItem("app_reviews");
    await AsyncStorage.removeItem("reviews");
    console.log("리뷰 스토리지 초기화 완료");
    return true;
  } catch (error) {
    console.error("리뷰 스토리지 초기화 오류:", error);
    return false;
  }
};

// 모든 스토리지 초기화 (주의: 모든 데이터 삭제됨)
export const resetAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("모든 스토리지 초기화 완료");
    return true;
  } catch (error) {
    console.error("스토리지 초기화 오류:", error);
    return false;
  }
};

// 특정 리뷰 ID 삭제 직접 테스트
export const deleteReviewDirectly = async (reviewId) => {
  try {
    console.log("[deleteReviewDirectly] 시작, 삭제할 리뷰 ID:", reviewId);

    // 모든 스토리지 키 확인 (디버깅 용도)
    const keys = await AsyncStorage.getAllKeys();
    console.log("[deleteReviewDirectly] 현재 스토리지 키들:", keys);

    // 리뷰 데이터 가져오기
    const STORAGE_KEY = "app_reviews";
    const reviewsData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!reviewsData) {
      console.log("[deleteReviewDirectly] 삭제할 리뷰 데이터가 없음");
      return false;
    }

    // 데이터 파싱
    const reviews = JSON.parse(reviewsData);
    console.log("[deleteReviewDirectly] 삭제 전 리뷰 수:", reviews.length);

    // 삭제 전 모든 리뷰 ID 출력 (디버깅 용도)
    console.log(
      "[deleteReviewDirectly] 현재 모든 리뷰 ID:",
      reviews.map((r) => r.id)
    );

    // ID로 리뷰 필터링
    const initialLength = reviews.length;
    const updatedReviews = reviews.filter((review) => review.id !== reviewId);

    // 변경 사항이 있는지 확인
    if (updatedReviews.length === initialLength) {
      console.log(
        `[deleteReviewDirectly] ID ${reviewId}인 리뷰를 찾을 수 없음`
      );
      return false;
    }

    // 업데이트된 데이터 저장
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
    console.log(
      "[deleteReviewDirectly] 리뷰 삭제 성공! 남은 리뷰 수:",
      updatedReviews.length
    );
    return true;
  } catch (error) {
    console.error("[deleteReviewDirectly] 리뷰 직접 삭제 오류:", error);
    return false;
  }
};
