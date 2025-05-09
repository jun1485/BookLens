import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useReviews } from "../hooks/useReviews";
import { StarRating } from "../components/StarRating";

type ReviewRouteProp = RouteProp<RootStackParamList, "Review">;
type ReviewNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ReviewScreen = () => {
  const route = useRoute<ReviewRouteProp>();
  const navigation = useNavigation<ReviewNavigationProp>();

  // URL에서 전달된 매개변수 처리 및 기본값 설정
  const {
    itemId: routeItemId,
    itemType: routeItemType = "movie",
    reviewId,
    title = "작품",
  } = route.params || {};

  // itemId와 itemType을 올바르게 처리
  const itemId = routeItemId || "";
  const itemType =
    routeItemType === "movie" || routeItemType === "book"
      ? routeItemType
      : "movie";

  // 유저 정보 (실제 앱에서는 인증 시스템에서 가져옴)
  const mockUserId = "user123";
  const mockUsername = "사용자";

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { reviews, addReview, updateReview, deleteReview } = useReviews(
    itemType,
    itemId
  );

  // 기존 리뷰가 있는 경우 불러오기
  useEffect(() => {
    if (reviewId) {
      const existingReview = reviews.find((r) => r.id === reviewId);
      if (existingReview) {
        setRating(existingReview.rating);
        setContent(existingReview.content);
      }
    }
  }, [reviewId, reviews]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("오류", "별점을 선택해주세요");
      return;
    }

    if (!content.trim()) {
      Alert.alert("오류", "리뷰 내용을 입력해주세요");
      return;
    }

    try {
      setSubmitting(true);

      if (reviewId) {
        await updateReview(reviewId, {
          rating,
          content,
        });
      } else {
        await addReview({
          itemId,
          itemType,
          rating,
          content,
          userId: mockUserId,
          username: mockUsername,
        });
      }

      // 리뷰 저장 후 해당 아이템의 상세 페이지로 이동
      if (itemType === "movie") {
        navigation.navigate("MovieDetail", {
          movieId: Number(itemId),
          refresh: true,
          fromScreen: "Review",
        });
      } else {
        navigation.navigate("BookDetail", {
          isbn: String(itemId),
          refresh: true,
          fromScreen: "Review",
        });
      }

      // 성공 메시지 표시
      Alert.alert("완료", "리뷰가 저장되었습니다");
    } catch (error) {
      Alert.alert("오류", "리뷰 저장 중 오류가 발생했습니다");
      console.error("Error saving review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewId) {
      console.error("ReviewScreen - 삭제할 리뷰 ID가 없습니다.");
      return;
    }

    console.log("ReviewScreen - handleDelete 호출됨, reviewId:", reviewId);

    Alert.alert("삭제 확인", "정말 이 리뷰를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("ReviewScreen - 리뷰 삭제 시작:", reviewId);
            setSubmitting(true);

            const result = await deleteReview(reviewId);
            console.log("ReviewScreen - 리뷰 삭제 결과:", result);

            // 성공 알림
            Alert.alert("완료", "리뷰가 삭제되었습니다", [
              {
                text: "확인",
                onPress: () => {
                  // 리뷰 삭제 후 해당 아이템의 상세 페이지로 이동
                  if (itemType === "movie") {
                    navigation.navigate("MovieDetail", {
                      movieId: Number(itemId),
                      refresh: true,
                      fromScreen: "Review",
                    });
                  } else {
                    navigation.navigate("BookDetail", {
                      isbn: String(itemId),
                      refresh: true,
                      fromScreen: "Review",
                    });
                  }
                },
              },
            ]);
          } catch (error) {
            console.error("ReviewScreen - 리뷰 삭제 오류:", error);
            Alert.alert("오류", "리뷰 삭제 중 오류가 발생했습니다");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        scrollEnabled={true}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {itemType === "movie" ? "영화" : "책"} 리뷰 작성
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.label}>별점</Text>
          <StarRating rating={rating} onRatingChange={setRating} size={36} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.label}>리뷰 내용</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="이 작품에 대한 생각을 자유롭게 작성해주세요"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {reviewId ? "리뷰 수정" : "리뷰 저장"}
              </Text>
            )}
          </TouchableOpacity>

          {reviewId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={submitting}
            >
              <Text style={styles.deleteButtonText}>리뷰 삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  ratingContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  contentContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "500",
  },
});
