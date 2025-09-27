import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../../navigation/types";
import { ItemCard } from "../../../components/ItemCard";
import { SearchBar } from "../../../components/SearchBar";
import { Movie, Book } from "../../../types";
import { useMovieSearch } from "../../movies/hooks";
import { useBookSearch } from "../../books/hooks";

type SearchNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const [searchType, setSearchType] = useState<"movie" | "book">("movie");

  // 영화 검색 훅
  const {
    results: movieResults,
    loading: movieLoading,
    error: movieError,
    searchMovies,
    loadMore: loadMoreMovies,
  } = useMovieSearch();

  // 책 검색 훅
  const {
    results: bookResults,
    loading: bookLoading,
    error: bookError,
    searchBooks,
    loadMore: loadMoreBooks,
  } = useBookSearch();

  // 현재 선택된 검색 타입에 따른 상태
  const results = searchType === "movie" ? movieResults : bookResults;
  const loading = searchType === "movie" ? movieLoading : bookLoading;
  const error = searchType === "movie" ? movieError : bookError;
  const loadMore = searchType === "movie" ? loadMoreMovies : loadMoreBooks;

  const handleSearch = (query: string) => {
    if (searchType === "movie") {
      searchMovies(query);
    } else {
      searchBooks(query);
    }
  };

  const handleItemPress = (item: Movie | Book) => {
    if (searchType === "movie") {
      navigation.navigate("MovieDetail", {
        movieId: (item as Movie).id,
        movie: item as Movie,
      });
    } else {
      navigation.navigate("BookDetail", {
        isbn: (item as Book).isbn,
        book: item as Book,
      });
    }
  };

  const renderItem = ({ item }: { item: Movie | Book }) => (
    <ItemCard
      item={item}
      itemType={searchType}
      onPress={() => handleItemPress(item)}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchTypeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            searchType === "movie" && styles.activeTypeButton,
          ]}
          onPress={() => setSearchType("movie")}
        >
          <Ionicons
            name="film-outline"
            size={18}
            color={searchType === "movie" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.typeText,
              searchType === "movie" && styles.activeTypeText,
            ]}
          >
            영화
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            searchType === "book" && styles.activeTypeButton,
          ]}
          onPress={() => setSearchType("book")}
        >
          <Ionicons
            name="book-outline"
            size={18}
            color={searchType === "book" ? "#fff" : "#666"}
          />
          <Text
            style={[
              styles.typeText,
              searchType === "book" && styles.activeTypeText,
            ]}
          >
            책
          </Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder={`${searchType === "movie" ? "영화" : "책"} 검색...`}
        onSearch={handleSearch}
      />

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) =>
            searchType === "movie"
              ? `movie-${(item as Movie).id}`
              : `book-${(item as Book).isbn}`
          }
          numColumns={2}
          contentContainerStyle={styles.list}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  검색어를 입력하여 {searchType === "movie" ? "영화" : "책"}를
                  찾아보세요
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: "#f5f5f5",
  },
  activeTypeButton: {
    backgroundColor: "#2196F3",
  },
  typeText: {
    marginLeft: 4,
    fontWeight: "500",
    color: "#666",
  },
  activeTypeText: {
    color: "#fff",
  },
  list: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
  loaderContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});
