import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  BackHandler,
} from "react-native";
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
  CommonActions,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useMovieDetails } from "../hooks/useMovies";
import { useReviews } from "../hooks/useReviews";
import { useCollections } from "../hooks/useCollections";
import { StarRating } from "../components/StarRating";
import {
  getTMDBImageUrl,
  formatDate,
  calculateAverageRating,
} from "../utils/helpers";

type MovieDetailRouteProp = RouteProp<RootStackParamList, "MovieDetail">;
type MovieDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MovieDetailScreen = () => {
  const route = useRoute<MovieDetailRouteProp>();
  const navigation = useNavigation<MovieDetailNavigationProp>();

  const {
    movieId: routeMovieId,
    movie: initialMovie = null,
    refresh = false,
    fromScreen = undefined,
  } = route.params || {};

  // movieId가 문자열로 전달될 경우 숫자로 변환
  const movieId =
    typeof routeMovieId === "string"
      ? parseInt(routeMovieId as string, 10)
      : routeMovieId;

  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const handleGoBack = () => {
    // 리뷰 작성 화면에서 왔다면 스택을 재구성하여 리뷰 작성 화면을 건너뜀
    if (fromScreen === "Review") {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "Main",
              params: { screen: "MyReviews" },
            },
          ],
        })
      );
    } else {
      navigation.goBack();
    }
  };

  // 헤더 뒤로가기 버튼 커스터마이징
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleGoBack} style={{ marginLeft: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, fromScreen]);

  // 뒤로가기 버튼을 눌렀을 때 이전 화면으로 이동
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true; // 기본 뒤로가기 동작 방지
      };

      // 안드로이드 뒤로가기 버튼 이벤트 리스너 추가
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation, fromScreen])
  );

  // 영화 상세 정보 가져오기
  const { movie, loading, error } = useMovieDetails(movieId);

  // 영화 리뷰 가져오기
  const { reviews, fetchReviews } = useReviews(movieId, "movie");

  // 리뷰 새로고침 플래그가 있으면 리뷰 목록 새로고침
  useEffect(() => {
    if (refresh) {
      fetchReviews();
    }
  }, [refresh, fetchReviews]);

  // 컬렉션 관리
  const { collections, addItemToCollection } = useCollections();

  // 초기 영화 데이터와 상세 정보 합치기
  const movieData = movie || initialMovie;

  // 리뷰 평균 별점
  const reviewRatings = reviews.map((review) => review.rating);
  const averageRating = calculateAverageRating(reviewRatings);

  const handleWriteReview = () => {
    if (movieData) {
      navigation.navigate("Review", {
        itemId: movieId,
        itemType: "movie",
        title: movieData.title,
      });
    }
  };

  const handleAddToCollection = () => {
    setShowCollectionModal(true);
  };

  const handleShare = async () => {
    if (!movieData) return;

    try {
      await Share.share({
        message: `${movieData.title} 영화를 추천합니다! ${movieData.overview}`,
      });
    } catch (error) {
      console.error("Error sharing movie:", error);
    }
  };

  if (loading && !initialMovie) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error || !movieData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {error || "영화 정보를 불러올 수 없습니다."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 영화 포스터 및 배경 */}
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri:
              getTMDBImageUrl(movieData.backdrop_path, "backdrop") ||
              getTMDBImageUrl(movieData.poster_path, "poster"),
          }}
          style={styles.backdrop}
          resizeMode="cover"
        />
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: getTMDBImageUrl(movieData.poster_path) }}
            style={styles.poster}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 영화 제목 및 기본 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{movieData.title}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.releaseDate}>
            {movieData.release_date
              ? formatDate(movieData.release_date)
              : "출시일 정보 없음"}
          </Text>

          {movieData.genres && (
            <Text style={styles.genres}>
              {movieData.genres.map((genre) => genre.name).join(", ")}
            </Text>
          )}
        </View>

        {/* 평점 */}
        <View style={styles.ratingContainer}>
          <StarRating rating={averageRating} disabled={true} size={20} />
          <Text style={styles.ratingText}>
            {averageRating > 0
              ? `${averageRating.toFixed(1)} (${reviews.length}개의 리뷰)`
              : "아직 리뷰가 없습니다"}
          </Text>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWriteReview}
          >
            <Ionicons name="create-outline" size={20} color="#2196F3" />
            <Text style={styles.actionText}>리뷰 작성</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCollection}
          >
            <Ionicons name="add-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.actionText}>컬렉션에 추가</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#2196F3" />
            <Text style={styles.actionText}>공유</Text>
          </TouchableOpacity>
        </View>

        {/* 줄거리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>줄거리</Text>
          <Text style={styles.overview}>
            {movieData.overview || "줄거리 정보가 없습니다."}
          </Text>
        </View>

        {/* 리뷰 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>리뷰</Text>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.username}</Text>
                  <StarRating
                    rating={review.rating}
                    disabled={true}
                    size={16}
                  />
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              아직 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  headerContainer: {
    position: "relative",
    height: 200,
  },
  backdrop: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  posterContainer: {
    position: "absolute",
    bottom: -60,
    left: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderRadius: 8,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  infoContainer: {
    marginTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    paddingRight: 100,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  releaseDate: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  genres: {
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: "#2196F3",
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  reviewItem: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: "500",
  },
  reviewContent: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
});
