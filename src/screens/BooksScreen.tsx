import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useBestSellers } from "../hooks/useBooks";
import { bookService } from "../services/api";
import { Book } from "../types";

// 책 카드 컴포넌트
const BookCard = ({ book, onPress }: { book: Book; onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
      <Image
        source={{
          uri:
            book.cover_image ||
            "https://via.placeholder.com/150x225?text=No+Image",
        }}
        style={styles.bookCover}
        resizeMode="cover"
      />
      <Text style={styles.bookTitle} numberOfLines={2} ellipsizeMode="tail">
        {book.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
};

// 책 목록 섹션 컴포넌트
const BookSection = ({
  title,
  books,
  loading,
  onSeeAll,
  onBookPress,
}: {
  title: string;
  books: Book[];
  loading: boolean;
  onSeeAll?: () => void;
  onBookPress: (book: Book) => void;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>모두 보기</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#6200EE" />
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => onBookPress(item)} />
          )}
          keyExtractor={(item) => `book-${item.isbn}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookList}
        />
      ) : (
        <Text style={styles.emptyText}>책이 없습니다</Text>
      )}
    </View>
  );
};

export const BooksScreen = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const {
    books: bestSellers,
    loading: bestSellersLoading,
    refetch: refetchBestSellers,
  } = useBestSellers();

  // 최신 책 상태
  const [newReleases, setNewReleases] = useState<Book[]>([]);
  const [newReleasesLoading, setNewReleasesLoading] = useState(true);

  // 추천 책 상태
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  // 최신 책 로드
  const loadNewReleases = useCallback(async () => {
    try {
      setNewReleasesLoading(true);
      // 실제 구현에서는 출시일 기준으로 정렬된 API 호출이 있어야 함
      const response = await bookService.searchBooks("최신출간");
      setNewReleases(response.results);
    } catch (error) {
      console.error("최신 책을 불러오는 중 오류 발생:", error);
    } finally {
      setNewReleasesLoading(false);
    }
  }, []);

  // 추천 책 로드
  const loadRecommendations = useCallback(async () => {
    try {
      setRecommendationsLoading(true);
      // 실제 구현에서는 사용자 맞춤형 추천 로직이 있어야 함
      const response = await bookService.searchBooks("추천도서");
      setRecommendations(response.results);
    } catch (error) {
      console.error("추천 책을 불러오는 중 오류 발생:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadNewReleases();
    loadRecommendations();
  }, [loadNewReleases, loadRecommendations]);

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchBestSellers(),
      loadNewReleases(),
      loadRecommendations(),
    ]);
    setRefreshing(false);
  };

  // 책 상세 페이지로 이동
  const handleBookPress = (book: Book) => {
    navigation.navigate("BookDetail", {
      isbn: book.isbn,
      book: book,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 베스트셀러 섹션 */}
        <BookSection
          title="베스트셀러"
          books={bestSellers}
          loading={bestSellersLoading}
          onSeeAll={() =>
            navigation.navigate("Search", {
              initialTab: "book",
              initialQuery: "베스트셀러",
            })
          }
          onBookPress={handleBookPress}
        />

        {/* 최신 출시 섹션 */}
        <BookSection
          title="최신 출시"
          books={newReleases}
          loading={newReleasesLoading}
          onSeeAll={() =>
            navigation.navigate("Search", {
              initialTab: "book",
              initialQuery: "최신출간",
            })
          }
          onBookPress={handleBookPress}
        />

        {/* 추천 도서 섹션 */}
        <BookSection
          title="추천 도서"
          books={recommendations}
          loading={recommendationsLoading}
          onSeeAll={() =>
            navigation.navigate("Search", {
              initialTab: "book",
              initialQuery: "추천도서",
            })
          }
          onBookPress={handleBookPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1F1F",
  },
  seeAllText: {
    fontSize: 14,
    color: "#6200EE",
  },
  bookList: {
    paddingVertical: 5,
  },
  bookCard: {
    width: 120,
    marginRight: 15,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1F1F1F",
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 15,
  },
});
