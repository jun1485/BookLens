import React from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Platform } from "react-native";

import { RootStackParamList, MainTabParamList } from "./types";

import { MoviesScreen } from "../screens/MoviesScreen";
import { MovieDetailScreen } from "../screens/MovieDetailScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { MyReviewsScreen } from "../screens/MyReviewsScreen";
import { CollectionsScreen } from "../screens/CollectionsScreen";
import { CollectionDetailScreen } from "../screens/CollectionDetailScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { DiscussionsScreen } from "../screens/DiscussionsScreen";
import { DiscussionDetailScreen } from "../screens/DiscussionDetailScreen";
import { CreateDiscussionScreen } from "../screens/CreateDiscussionScreen";
import { BooksScreen } from "../screens/BooksScreen";
import { BookDetailScreen } from "../screens/BookDetailScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SubscriptionScreen } from "../screens/SubscriptionScreen";

import { THEME } from "../utils/theme";

// 임시 화면 컴포넌트
const PlaceholderScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>{route.name} 화면 (개발 중)</Text>
  </View>
);

// 스택 내비게이터
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 탭 아이콘 컴포넌트
const TabIcon = ({
  name,
  focused,
  color,
}: {
  name: any;
  focused: boolean;
  color: string;
}) => {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={focused ? 24 : 20} color={color} />
    </View>
  );
};

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

          return <TabIcon name={iconName} focused={focused} color={color} />;
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Movies"
        component={MoviesScreen}
        options={{ title: "영화" }}
      />
      <Tab.Screen
        name="Books"
        component={BooksScreen}
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
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: THEME.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={({ route }) => ({
            title: "영화 상세",
            animation: "slide_from_right",
          })}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{
            title: "책 상세",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{
            title: "리뷰 작성",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{
            title: "내 컬렉션",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="CollectionDetail"
          component={CollectionDetailScreen}
          options={({ route }) => ({
            title: route.params.name,
            animation: "slide_from_right",
          })}
        />
        <Stack.Screen
          name="CreateCollection"
          component={PlaceholderScreen}
          options={{
            title: "새 컬렉션",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="DiscussionDetail"
          component={DiscussionDetailScreen}
          options={({ route }) => ({
            title: route.params.title,
            animation: "slide_from_right",
          })}
        />
        <Stack.Screen
          name="CreateDiscussion"
          component={CreateDiscussionScreen}
          options={{
            title: "새 토론",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: "설정",
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{
            title: "프리미엄 구독",
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    color: THEME.text,
    fontWeight: "bold",
  },
  tabBar: {
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    height: Platform.OS === "ios" ? 85 : 60,
    paddingBottom: Platform.OS === "ios" ? 25 : 5,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
