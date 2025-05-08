import React, { useState, useEffect } from "react";
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
import { Review } from "../types";
import { RootStackParamList } from "../navigation/types";
import { useReviews } from "../hooks/useReviews";
import { Ionicons } from "@expo/vector-icons";
import { StarRating } from "../components/StarRating";
import { formatDate } from "../utils/helpers";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyReviewsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { reviews, loading, error, fetchReviews, deleteReview } = useReviews();
  const [refreshing, setRefreshing] = useState(false);

  // 현재 로그인한 사용자 아이디 (실제 앱에서는 인증 시스템에서 가져옴)
  const mockUserId = "user123";

  // 사용자의 리뷰만 필터링
  const userReviews = reviews.filter((review) => review.userId === mockUserId);

  // 리뷰 목록 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  // 리뷰 편집
  const handleEditReview = (review: Review) => {
    navigation.navigate("Review", {
      itemId: review.itemId,
      itemType: review.itemType,
      reviewId: review.id,
      title: getItemTitle(review),
    });
  };

  // 리뷰 삭제
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert("리뷰 삭제", "정말로 이 리뷰를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(reviewId);
            // 삭제 후 리스트 새로고침
            fetchReviews();
          } catch (err) {
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

  // 아이템 제목 (데이터가 없는 경우를 위한 임시 처리)
  const getItemTitle = (review: Review) => {
    return review.itemType === "movie"
      ? `영화 (ID: ${review.itemId})`
      : `책 (ISBN: ${review.itemId})`;
  };

  // 리뷰 아이템 렌더링
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
              color="#666"
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
            <Ionicons name="create-outline" size={20} color="#2196F3" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteReview(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !userReviews.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
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
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
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
    color: "#666",
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  reviewType: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewTypeText: {
    fontSize: 12,
    color: "#666",
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
    color: "#999",
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
