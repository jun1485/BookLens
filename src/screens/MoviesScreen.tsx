import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useMovies } from "../hooks/useMovies";
import { ItemCard } from "../components/ItemCard";
import { Movie } from "../types";

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
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>영화가 없습니다.</Text>
            </View>
          ) : null
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
  },
  loaderContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
});
