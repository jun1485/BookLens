import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Alert,
  Linking,
  FlatList,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Book, Review } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { bookService } from "../services/api";
import { useReviews } from "../hooks/useReviews";
import { useCollections } from "../hooks/useCollections";
import { ReviewCard } from "../components/ReviewCard";

type BookDetailRouteProp = RouteProp<RootStackParamList, "BookDetail">;
type BookDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const BookDetailScreen = () => {
  const route = useRoute<BookDetailRouteProp>();
  const navigation = useNavigation<BookDetailNavigationProp>();
  const { isbn, book: initialBook } = route.params;

  const [book, setBook] = useState<Book | null>(initialBook || null);
  const [loading, setLoading] = useState(!initialBook);
  const [refreshing, setRefreshing] = useState(false);

  // 리뷰 관련 상태
  const {
    reviews,
    loading: reviewsLoading,
    fetchReviews,
    deleteReview,
  } = useReviews("book", isbn);

  // 컬렉션 관련 hook
  const { collections, addItemToCollection } = useCollections();

  // 책 상세 정보 로드
  const fetchBookDetails = async () => {
    if (!isbn) return;

    try {
      setLoading(true);
      const response = await bookService.searchBooks(`isbn:${isbn}`);
      if (response.results.length > 0) {
        setBook(response.results[0]);
      }
    } catch (error) {
      console.error("책 상세 정보를 가져오는 중 오류 발생:", error);
      Alert.alert("오류", "책 정보를 불러오는 데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (!initialBook) {
      fetchBookDetails();
    }
    fetchReviews();
  }, [isbn]);

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBookDetails(), fetchReviews()]);
    setRefreshing(false);
  };

  // 리뷰 작성으로 이동
  const handleWriteReview = () => {
    navigation.navigate("Review", {
      itemId: isbn,
      itemType: "book",
      title: book?.title || "",
    });
  };

  // 공유하기
  const handleShare = async () => {
    if (!book) return;

    try {
      await Share.share({
        message: `${book.title} by ${book.author}\n${book.description}`,
        title: book.title,
      });
    } catch (error) {
      console.error("공유 중 오류 발생:", error);
    }
  };

  // 컬렉션에 추가
  const handleAddToCollection = async () => {
    if (!book) return;

    if (collections.length === 0) {
      Alert.alert(
        "컬렉션 없음",
        "저장할 컬렉션이 없습니다. 컬렉션을 먼저 만드시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "컬렉션 만들기",
            onPress: () => navigation.navigate("CreateCollection"),
          },
        ]
      );
      return;
    }

    // 컬렉션 선택 옵션 만들기
    const options = collections.map((collection) => ({
      text: collection.name,
      onPress: async () => {
        try {
          await addItemToCollection(collection.id, isbn, "book");
          Alert.alert(
            "성공",
            `'${book.title}'이(가) '${collection.name}'에 추가되었습니다`
          );
        } catch (error) {
          Alert.alert("오류", "컬렉션에 추가하는 데 실패했습니다");
        }
      },
    }));

    // 컬렉션 선택 대화상자 표시
    Alert.alert("컬렉션에 추가", "책을 저장할 컬렉션을 선택하세요", [
      { text: "취소", style: "cancel" },
      ...options,
    ]);
  };

  // 구매 페이지로 이동
  const handleBuyBook = async () => {
    if (!book) return;

    // 네이버 검색 페이지로 연결 (실제 앱에서는 제휴사 링크 사용)
    const url = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(
      `${book.title} ${book.author} 책`
    )}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("오류", "링크를 열 수 없습니다");
    }
  };

  // 리뷰 수정 핸들러
  const handleEditReview = (review: Review) => {
    navigation.navigate("Review", {
      itemId: isbn,
      itemType: "book",
      reviewId: review.id,
      title: book?.title || "",
    });
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = (reviewId: string) => {
    console.log(
      "BookDetailScreen - handleDeleteReview 호출됨. reviewId:",
      reviewId
    );
    if (!reviewId) {
      console.error("BookDetailScreen - 삭제할 리뷰 ID가 없습니다.");
      return;
    }

    Alert.alert("리뷰 삭제", "정말로 이 리뷰를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("BookDetailScreen - 리뷰 삭제 시작:", reviewId);
            const result = await deleteReview(reviewId);
            console.log("BookDetailScreen - 리뷰 삭제 결과:", result);

            // 삭제 후 리뷰 목록 새로고침
            await fetchReviews();
            console.log("BookDetailScreen - 리뷰 목록 새로고침 완료");

            // 사용자에게 삭제 완료 알림
            Alert.alert("완료", "리뷰가 삭제되었습니다.");
          } catch (err) {
            console.error("BookDetailScreen - 리뷰 삭제 오류:", err);
            Alert.alert("오류", "리뷰를 삭제하는 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const renderBookDetails = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      );
    }

    if (!book) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>책 정보를 찾을 수 없습니다</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewCard
            key={item.id}
            review={item}
            currentUserId="user123"
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        )}
        ListHeaderComponent={
          <>
            {/* 책 이미지 및 기본 정보 */}
            <View style={styles.bookHeader}>
              <Image
                source={{
                  uri:
                    book.cover_image ||
                    "https://via.placeholder.com/150x225?text=No+Image",
                }}
                style={styles.bookCover}
                resizeMode="cover"
              />

              <View style={styles.bookInfo}>
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.author}>{book.author}</Text>
                <Text style={styles.publisher}>
                  {book.publisher} | {book.published_date}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    {book.price.toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>

            {/* 액션 버튼 영역 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleWriteReview}
              >
                <Ionicons name="create-outline" size={22} color="#6200EE" />
                <Text style={styles.actionButtonText}>리뷰 작성</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddToCollection}
              >
                <Ionicons name="bookmark-outline" size={22} color="#6200EE" />
                <Text style={styles.actionButtonText}>컬렉션에 추가</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={22} color="#6200EE" />
                <Text style={styles.actionButtonText}>공유하기</Text>
              </TouchableOpacity>
            </View>

            {/* 상세 정보 영역 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>책 소개</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>

            {/* 구매 버튼 */}
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyBook}>
              <Text style={styles.buyButtonText}>구매하기</Text>
            </TouchableOpacity>

            {/* 리뷰 섹션 헤더 */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>리뷰</Text>
                <View style={styles.reviewHeaderActions}>
                  <TouchableOpacity
                    onPress={fetchReviews}
                    style={styles.refreshButton}
                  >
                    <Ionicons name="refresh" size={20} color="#6200EE" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleWriteReview}>
                    <Text style={styles.writeReviewText}>리뷰 작성</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {reviewsLoading && (
                <ActivityIndicator style={styles.loader} color="#6200EE" />
              )}

              {!reviewsLoading && reviews.length === 0 && (
                <View style={styles.emptyReviewsContainer}>
                  <Text style={styles.emptyReviewsText}>
                    아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
                  </Text>
                  <TouchableOpacity
                    style={styles.writeFirstReviewButton}
                    onPress={handleWriteReview}
                  >
                    <Text style={styles.writeFirstReviewText}>
                      첫 리뷰 작성하기
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          reviewsLoading ? null : (
            <View style={styles.emptyReviewsContainer}>
              <Text style={styles.emptyReviewsText}>
                아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.scrollContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>{renderBookDetails()}</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  bookHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1F1F1F",
  },
  author: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  publisher: {
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
  },
  priceContainer: {
    marginTop: "auto",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200EE",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e1e1e1",
    paddingVertical: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 8,
  },
  actionButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#6200EE",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1F1F1F",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 20,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reviewHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    marginRight: 12,
    padding: 2,
  },
  writeReviewText: {
    color: "#6200EE",
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  emptyReviewsContainer: {
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    marginTop: 10,
  },
  emptyReviewsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  writeFirstReviewButton: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  writeFirstReviewText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
