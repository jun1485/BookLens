import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinkingOptions } from "@react-navigation/native";

import { RootStackParamList, MainTabParamList } from "./types";

import { MoviesScreen } from "../screens/MoviesScreen";
import { MovieDetailScreen } from "../screens/MovieDetailScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { MyReviewsScreen } from "../screens/MyReviewsScreen";
import { CollectionsScreen } from "../screens/CollectionsScreen";
import { CollectionDetailScreen } from "../screens/CollectionDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { Text, View } from "react-native";
import { DiscussionsScreen } from "../screens/DiscussionsScreen";
import { DiscussionDetailScreen } from "../screens/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "../screens/CreateDiscussionScreen";

// 임시 화면 컴포넌트
const PlaceholderScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{route.name} 화면 (개발 중)</Text>
  </View>
);

// 스택 내비게이터
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 탭 내비게이션
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Movies") {
            iconName = focused ? "film" : "film-outline";
          } else if (route.name === "Books") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "MyReviews") {
            iconName = focused ? "star" : "star-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Discussions") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Movies"
        component={MoviesScreen}
        options={{ title: "영화" }}
      />
      <Tab.Screen
        name="Books"
        component={PlaceholderScreen}
        options={{ title: "책" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "검색" }}
      />
      <Tab.Screen
        name="MyReviews"
        component={MyReviewsScreen}
        options={{ title: "내 리뷰" }}
      />
      <Tab.Screen
        name="Discussions"
        component={DiscussionsScreen}
        options={{ title: "토론" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "프로필" }}
      />
    </Tab.Navigator>
  );
};

// URL 설정을 위한 linking 객체
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["https://bookmovie-app.com", "bookmovie://"],
  config: {
    screens: {
      Main: {
        screens: {
          Movies: "movies",
          Books: "books",
          Search: "search",
          MyReviews: "my-reviews",
          Profile: "profile",
          Discussions: "discussions",
        },
      },
      MovieDetail: {
        path: "movie/:movieId",
        parse: {
          movieId: (movieId: string) => Number(movieId),
        },
      },
      BookDetail: {
        path: "book/:isbn",
        parse: {
          isbn: (isbn: string) => String(isbn),
        },
      },
      Review: {
        path: "review/:itemType/:itemId",
        parse: {
          itemId: (itemId: string) =>
            itemId.includes("-") ? itemId : Number(itemId),
          itemType: (itemType: string) => itemType as "movie" | "book",
        },
      },
      Collections: "collections",
      CollectionDetail: {
        path: "collection/:collectionId",
        parse: {
          collectionId: (collectionId: string) => String(collectionId),
        },
      },
      CreateCollection: "create-collection",
      DiscussionDetail: {
        path: "discussion/:discussionId",
        parse: {
          discussionId: (discussionId: string) => String(discussionId),
        },
      },
      CreateDiscussion: "create-discussion",
    },
  },
};

// 앱 네비게이션 구조
export const AppNavigation = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={({ route }) => ({ title: "영화 상세" })}
        />
        <Stack.Screen
          name="BookDetail"
          component={PlaceholderScreen}
          options={{ title: "책 상세" }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{ title: "리뷰 작성" }}
        />
        <Stack.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{ title: "내 컬렉션" }}
        />
        <Stack.Screen
          name="CollectionDetail"
          component={CollectionDetailScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="CreateCollection"
          component={PlaceholderScreen}
          options={{ title: "새 컬렉션" }}
        />
        <Stack.Screen
          name="DiscussionDetail"
          component={DiscussionDetailScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
        <Stack.Screen
          name="CreateDiscussion"
          component={CreateDiscussionScreen}
          options={{ title: "토론방 만들기" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
