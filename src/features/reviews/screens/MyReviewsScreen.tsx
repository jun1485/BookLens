import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Review } from "../../../types";
import { RootStackParamList } from "../../../navigation/types";
import { useReviews } from "../hooks";
import { Ionicons } from "@expo/vector-icons";
import { StarRating } from "../../../components/StarRating";
import { formatDate } from "../../../utils/helpers";
import { THEME } from "../../../utils/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteReviewDirectly } from "../../../utils/storageReset";
import { ItemDetails } from "../../../types/itemTypes";
import { getItemTitleFetcher } from "../hooks";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { fetchItemTitle } = getItemTitleFetcher();

  // 아무 값도 전달하지 않았을 때 모든 리뷰를 가져오도록 함
  const {
    reviews: allReviews,
    loading,
    error,
    fetchReviews,
    deleteReview,
  } = useReviews();

  const [refreshing, setRefreshing] = useState(false);
  const [itemTitles, setItemTitles] = useState<ItemDetails[]>([]);

  const mockUserId = "user123";

  useEffect(() => {
    console.log("MyReviewsScreen - 모든 리뷰:", allReviews);
    console.log("MyReviewsScreen - 현재 사용자 ID:", mockUserId);
  }, [allReviews]);

  // 중복 없는 사용자의 리뷰 생성
  const userReviews = useMemo(() => {
    // userId가 mockUserId인 리뷰만 필터링
    const filteredReviews = allReviews.filter(
      (review) => review.userId === mockUserId
    );

    // itemType과 itemId로 그룹화하여 중복 제거
    const uniqueReviewMap = new Map();

    filteredReviews.forEach((review) => {
      const key = `${review.itemType}_${review.itemId}`;

      // Map에 없거나, 기존 리뷰보다 최신 리뷰인 경우 업데이트
      if (
        !uniqueReviewMap.has(key) ||
        new Date(review.updatedAt || review.createdAt) >
          new Date(
            uniqueReviewMap.get(key).updatedAt ||
              uniqueReviewMap.get(key).createdAt
          )
      ) {
        uniqueReviewMap.set(key, review);
      }
    });

    // Map의 값들을 배열로 변환하여 날짜 기준 내림차순 정렬
    return Array.from(uniqueReviewMap.values()).sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [allReviews, mockUserId]);

  const getItemTitle = useCallback(
    (review: Review) => {
      const titleInfo = itemTitles.find(
        (title) => title.id === review.itemId && title.type === review.itemType
      );

      if (titleInfo) {
        if (titleInfo.loading) {
          return review.itemType === "movie"
            ? `영화 (로딩 중...)`
            : `책 (로딩 중...)`;
        }
        return titleInfo.title;
      }

      return review.itemType === "movie"
        ? `영화 (ID: ${review.itemId})`
        : `책 (ISBN: ${review.itemId})`;
    },
    [itemTitles]
  );

  useEffect(() => {
    const fetchItemTitles = async () => {
      const uniqueItems = userReviews.map((review) => ({
        id: review.itemId,
        type: review.itemType,
      }));

      const itemsToFetch = uniqueItems.filter(
        (item) =>
          !itemTitles.some(
            (titleItem) =>
              titleItem.id === item.id && titleItem.type === item.type
          )
      );

      if (itemsToFetch.length === 0) return;

      const initialTitles = itemsToFetch.map((item) => ({
        id: item.id,
        type: item.type,
        title:
          item.type === "movie"
            ? `영화 (ID: ${item.id})`
            : `책 (ISBN: ${item.id})`,
        loading: true,
        error: false,
      }));

      setItemTitles((prev) => [...prev, ...initialTitles]);

      for (const item of itemsToFetch) {
        try {
          const title = await fetchItemTitle(item.type, item.id);

          setItemTitles((prev) =>
            prev.map((titleItem) =>
              titleItem.id === item.id && titleItem.type === item.type
                ? { ...titleItem, title, loading: false }
                : titleItem
            )
          );
        } catch (err) {
          console.error(`제목 가져오기 오류 (${item.type} ${item.id}):`, err);
          setItemTitles((prev) =>
            prev.map((titleItem) =>
              titleItem.id === item.id && titleItem.type === item.type
                ? { ...titleItem, loading: false, error: true }
                : titleItem
            )
          );
        }
      }
    };

    fetchItemTitles();
  }, [userReviews, fetchItemTitle]);

  useEffect(() => {
    console.log("MyReviewsScreen - 필터링된 사용자 리뷰:", userReviews);
  }, [userReviews]);

  const handleRefresh = async () => {
    console.log("MyReviewsScreen - 새로고침 시작");
    setRefreshing(true);

    try {
      const storedData = await AsyncStorage.getItem("app_reviews");
      console.log(
        "MyReviewsScreen - AsyncStorage 데이터:",
        storedData ? JSON.parse(storedData).length : 0,
        "개 리뷰"
      );
    } catch (err) {
      console.error("MyReviewsScreen - AsyncStorage 확인 중 오류:", err);
    }

    await fetchReviews();

    setItemTitles([]);

    setRefreshing(false);
    console.log("MyReviewsScreen - 새로고침 완료");
  };

  const handleEditReview = (review: Review) => {
    console.log("MyReviewsScreen - 리뷰 편집:", review.id);
    navigation.navigate("Review", {
      itemId: review.itemId,
      itemType: review.itemType,
      reviewId: review.id,
      title: getItemTitle(review),
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    console.log(
      "MyReviewsScreen - handleDeleteReview 호출됨. reviewId:",
      reviewId
    );
    if (!reviewId) {
      console.error("MyReviewsScreen - 삭제할 리뷰 ID가 없습니다.");
      return;
    }

    Alert.alert("리뷰 삭제", "정말로 이 리뷰를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            console.log(
              "MyReviewsScreen - 리뷰 삭제 시작 (직접 삭제 방식):",
              reviewId
            );

            const directResult = await deleteReviewDirectly(reviewId);
            console.log("MyReviewsScreen - 직접 삭제 결과:", directResult);

            try {
              await deleteReview(reviewId);
              console.log("MyReviewsScreen - 훅 삭제 완료");
            } catch (err) {
              console.error("MyReviewsScreen - 훅 삭제 실패:", err);
            }

            await fetchReviews();
            console.log("MyReviewsScreen - 리뷰 목록 새로고침 완료");

            Alert.alert("완료", "리뷰가 삭제되었습니다.", [
              {
                text: "확인",
                onPress: () => {
                  setRefreshing(true);
                  setTimeout(() => {
                    fetchReviews().then(() => {
                      setRefreshing(false);
                    });
                  }, 500);
                },
              },
            ]);
          } catch (err) {
            console.error("MyReviewsScreen - 리뷰 삭제 오류:", err);
            Alert.alert("오류", "리뷰를 삭제하는 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 리뷰가 속한 아이템(영화/책) 상세 페이지로 이동
  const handleViewItem = (review: Review) => {
    if (review.itemType === "movie") {
      navigation.navigate("MovieDetail", {
        movieId: Number(review.itemId),
        refresh: true,
      });
    } else {
      navigation.navigate("BookDetail", {
        isbn: String(review.itemId),
        refresh: true,
      });
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => {
    return (
      <View style={styles.reviewCard}>
        <TouchableOpacity
          style={styles.reviewContent}
          onPress={() => handleViewItem(item)}
        >
          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.reviewTitle}>{getItemTitle(item)}</Text>
              <Text style={styles.reviewDate}>
                {formatDate(item.updatedAt || item.createdAt)}
              </Text>
            </View>
            <StarRating rating={item.rating} disabled size={16} />
          </View>

          <Text style={styles.reviewText} numberOfLines={3}>
            {item.content}
          </Text>

          <View style={styles.reviewType}>
            <Ionicons
              name={item.itemType === "movie" ? "film-outline" : "book-outline"}
              size={14}
              color={THEME.inactive}
            />
            <Text style={styles.reviewTypeText}>
              {item.itemType === "movie" ? "영화" : "책"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditReview(item)}
          >
            <Ionicons name="create-outline" size={20} color={THEME.info} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteReview(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={THEME.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !userReviews.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.info} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={userReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>아직 작성한 리뷰가 없습니다</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("Main", { screen: "Search" })}
            >
              <Text style={styles.emptyButtonText}>작품 검색하러 가기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    flexDirection: "row",
    backgroundColor: THEME.background,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: THEME.info,
  },
  reviewContent: {
    flex: 1,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: THEME.inactive,
  },
  reviewText: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 8,
  },
  reviewType: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewTypeText: {
    fontSize: 12,
    color: THEME.inactive,
    marginLeft: 4,
  },
  reviewActions: {
    padding: 8,
    justifyContent: "space-around",
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.inactive,
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: THEME.info,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: THEME.background,
    fontWeight: "500",
  },
});
