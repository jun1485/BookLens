import { NavigatorScreenParams } from "@react-navigation/native";
import { Movie, Book } from "../types";

// 메인 내비게이션 타입
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  MovieDetail: {
    movieId: number; // 영화 ID
    movie?: Movie; // 영화 정보
    refresh?: boolean; // 새로고침 여부
    fromScreen?: string; // 영화 상세 페이지에서 온 경로
  };
  BookDetail: {
    isbn: string; // ISBN
    book?: Book; // 책 정보
    refresh?: boolean; // 새로고침 여부
    fromScreen?: string; // 책 상세 페이지에서 온 경로
  };
  Review: {
    itemId: string | number;
    itemType: "movie" | "book";
    reviewId?: string;
    title: string;
  };
  Collections: undefined;
  CollectionDetail: { collectionId: string; name: string };
  CreateCollection: undefined;
  DiscussionDetail: { discussionId: string; title: string };
  CreateDiscussion: undefined;
  Settings: undefined;
  Subscription: undefined; // 구독 관리 화면
};

// 탭 내비게이션 타입
export type MainTabParamList = {
  Movies: undefined;
  Books: undefined;
  Search: undefined;
  MyReviews: undefined;
  Profile: undefined;
  Discussions: undefined;
};
