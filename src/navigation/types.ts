import { NavigatorScreenParams } from "@react-navigation/native";
import { Movie, Book } from "../types";

// 메인 내비게이션 타입
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  MovieDetail: { movieId: number; movie?: Movie };
  BookDetail: { isbn: string; book?: Book };
  Review: {
    itemId: string | number;
    itemType: "movie" | "book";
    reviewId?: string;
    title: string;
  };
  Collections: undefined;
  CollectionDetail: { collectionId: string; name: string };
  CreateCollection: undefined;
};

// 탭 내비게이션 타입
export type MainTabParamList = {
  Movies: undefined;
  Books: undefined;
  Search: undefined;
  MyReviews: undefined;
  Profile: undefined;
};
