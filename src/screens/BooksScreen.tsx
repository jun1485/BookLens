import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useBestSellers,
  useNewReleases,
  useRecommendedBooks,
} from "../hooks/useBooks";
import { Book } from "../types";
import { AdBanner } from "../components/AdBanner";
import { ItemCard } from "../components/ItemCard";

// 화면 너비 구하기
const { width } = Dimensions.get("window");

// 테마 정의
const THEME = {
  primary: "#6200EE",
  accent: "#03DAC6",
  background: "#FFFFFF",
  surface: "#FFFFFF",
  error: "#B00020",
  text: "#000000",
  textSecondary: "#666666",
  border: "#E0E0E0",
  rating: "#FFC107",
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
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>모두 보기</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={THEME.primary}
        />
      ) : books.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookList}
        >
          {books.map((item) => (
            <View key={`book-${item.isbn}`} style={styles.bookCardWrapper}>
              <ItemCard
                item={item}
                itemType="book"
                onPress={() => onBookPress(item)}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>책이 없습니다</Text>
        </View>
      )}
    </View>
  );
};

export const BooksScreen = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  // 베스트셀러 훅 사용
  const {
    books: bestSellers,
    loading: bestSellersLoading,
    refetch: refetchBestSellers,
  } = useBestSellers();

  // 최신 출시 도서 훅 사용
  const {
    books: newReleases,
    loading: newReleasesLoading,
    refetch: refetchNewReleases,
  } = useNewReleases();

  // 추천 도서 훅 사용
  const {
    books: recommendations,
    loading: recommendationsLoading,
    refetch: refetchRecommendations,
  } = useRecommendedBooks();

  // 새로고침 처리
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchBestSellers(),
      refetchNewReleases(),
      refetchRecommendations(),
    ]);
    setRefreshing(false);
  }, [refetchBestSellers, refetchNewReleases, refetchRecommendations]);

  // 책 상세 페이지로 이동
  const handleBookPress = useCallback(
    (book: Book) => {
      navigation.navigate("BookDetail", {
        isbn: book.isbn,
        book: book,
      });
    },
    [navigation]
  );

  // 섹션별 도서 목록
  const sections = [
    {
      id: "banner_top",
      type: "banner",
      containerId: "books_top_banner",
    },
    {
      id: "bestSellers",
      type: "section",
      title: "베스트셀러",
      books: bestSellers,
      loading: bestSellersLoading,
      onSeeAll: () =>
        navigation.navigate("Search", {
          initialTab: "book",
          initialQuery: "베스트셀러",
        }),
    },
    {
      id: "newReleases",
      type: "section",
      title: "최신 출시",
      books: newReleases,
      loading: newReleasesLoading,
      onSeeAll: () =>
        navigation.navigate("Search", {
          initialTab: "book",
          initialQuery: "최신출간",
        }),
    },
    {
      id: "banner_middle",
      type: "banner",
      containerId: "books_middle_banner",
    },
    {
      id: "recommendations",
      type: "section",
      title: "추천 도서",
      books: recommendations,
      loading: recommendationsLoading,
      onSeeAll: () =>
        navigation.navigate("Search", {
          initialTab: "book",
          initialQuery: "추천도서",
        }),
    },
    {
      id: "banner_bottom",
      type: "banner",
      containerId: "books_bottom_banner",
    },
  ];

  // 아이템 렌더링 함수
  const renderItem = useCallback(
    ({ item }: any) => {
      if (item.type === "banner") {
        return <AdBanner containerId={item.containerId} />;
      }

      if (item.type === "section") {
        return (
          <BookSection
            title={item.title}
            books={item.books}
            loading={item.loading}
            onSeeAll={item.onSeeAll}
            onBookPress={handleBookPress}
          />
        );
      }

      return null;
    },
    [handleBookPress]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={THEME.background} barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>책 둘러보기</Text>
      </View>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[THEME.primary]}
            tintColor={THEME.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.text,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
  },
  bookList: {
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 16,
  },
  bookCardWrapper: {
    marginRight: 12,
    width: (width - 80) / 2.5,
  },
  loader: {
    marginVertical: 20,
    alignSelf: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.surface,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyText: {
    textAlign: "center",
    color: THEME.textSecondary,
    fontSize: 14,
  },
  listContainer: {
    paddingVertical: 8,
  },
});
