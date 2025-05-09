import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Movie, Book } from "../types";
import { truncateText, getTMDBImageUrl, formatDate } from "../utils/helpers";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24; // 좌우 간격 조정

// 테마 색상
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
        <View style={styles.imageContainer}>
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
          {!isMovie && (
            <View style={styles.bookmarkContainer}>
              <View style={styles.bookmark} />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    margin: 8,
    height: 280,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: THEME.surface,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "400",
  },
  ratingContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rating: {
    color: THEME.rating,
    fontSize: 12,
    fontWeight: "bold",
  },
  bookmarkContainer: {
    position: "absolute",
    top: 0,
    right: 12,
  },
  bookmark: {
    width: 30,
    height: 40,
    backgroundColor: THEME.primary,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
