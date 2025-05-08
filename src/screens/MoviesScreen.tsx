import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useMovies } from "../hooks/useMovies";
import { ItemCard } from "../components/ItemCard";
import { Movie } from "../types";

// 스타일 테마
const THEME = {
  background: "#f9f9f9",
  text: "#333333",
  error: "#FF6B6B",
  placeholder: "#9E9E9E",
  accent: "#6200EE",
};

type MoviesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MoviesScreen = () => {
  const navigation = useNavigation<MoviesScreenNavigationProp>();
  const { movies, loading, error, loadMore, refresh } = useMovies();

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate("MovieDetail", {
      movieId: movie.id,
      movie: movie,
    });
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <ItemCard
      item={item}
      itemType="movie"
      onPress={() => handleMoviePress(item)}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>인기 영화</Text>
      </View>

      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => `movie-${item.id}`}
        numColumns={2}
        contentContainerStyle={styles.list}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loading && movies.length === 0}
            onRefresh={refresh}
            colors={[THEME.accent]}
            tintColor={THEME.accent}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>영화가 없습니다.</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.text,
  },
  list: {
    padding: 8,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: THEME.background,
  },
  errorText: {
    fontSize: 16,
    color: THEME.error,
    textAlign: "center",
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 16,
    color: THEME.placeholder,
    textAlign: "center",
    fontWeight: "500",
  },
  loaderContainer: {
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
