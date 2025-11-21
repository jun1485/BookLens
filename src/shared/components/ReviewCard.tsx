import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  currentUserId?: string;
}

// 별점 표시 컴포넌트
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={16}
          color={star <= rating ? "#FFD700" : "#BBBBBB"}
          style={styles.starIcon}
        />
      ))}
    </View>
  );
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onPress,
  onEdit,
  onDelete,
  currentUserId = "user123", // 기본값 설정
}) => {
  // 날짜 형식 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 현재 사용자의 리뷰인지 확인
  const isUserReview = review.userId === currentUserId;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{review.username}</Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
        <RatingStars rating={review.rating} />
      </View>

      <Text style={styles.content}>{review.content}</Text>

      {/* 사용자의 리뷰인 경우에만 수정/삭제 버튼 표시 */}
      {isUserReview && (
        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(review)}
            >
              <Ionicons name="create-outline" size={16} color="#6200EE" />
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(review.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
              <Text style={[styles.actionButtonText, { color: "#FF6B6B" }]}>
                삭제
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starIcon: {
    marginHorizontal: 1,
  },
  content: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  // 액션 버튼 스타일 추가
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#6200EE",
  },
});
