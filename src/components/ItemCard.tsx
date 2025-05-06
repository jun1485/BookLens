import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Movie, Book } from "../types";
import { truncateText, getTMDBImageUrl, formatDate } from "../utils/helpers";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24; // 2열 그리드 형태로 배치

type ItemCardProps = {
  item: Movie | Book;
  itemType: "movie" | "book";
  onPress: () => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  itemType,
  onPress,
}) => {
  // 영화인지 책인지에 따라 표시 방식 분기
  const isMovie = itemType === "movie";
  const movie = isMovie ? (item as Movie) : null;
  const book = !isMovie ? (item as Book) : null;

  // 제목
  const title = isMovie ? movie?.title : book?.title;

  // 이미지 URL
  const imageUrl = isMovie
    ? getTMDBImageUrl(movie?.poster_path)
    : book?.cover_image || "";

  // 부가정보 (영화: 개봉일, 책: 저자)
  const subtitle = isMovie
    ? movie?.release_date
      ? formatDate(movie.release_date)
      : ""
    : book?.author || "";

  // 평점 (영화만)
  const rating = isMovie && movie ? movie.vote_average : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <Image
          source={{
            uri:
              imageUrl || "https://via.placeholder.com/150x225?text=No+Image",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {isMovie && rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{(rating / 2).toFixed(1)}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    margin: 8,
  },
  card: {
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rating: {
    color: "#FFC107",
    fontSize: 12,
    fontWeight: "bold",
  },
});
