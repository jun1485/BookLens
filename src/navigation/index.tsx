import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList, MainTabParamList } from "./types";

// 스크린 임포트
import { MoviesScreen } from "../screens/MoviesScreen";
import { MovieDetailScreen } from "../screens/MovieDetailScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { Text, View } from "react-native";

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
        component={PlaceholderScreen}
        options={{ title: "내 리뷰" }}
      />
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{ title: "프로필" }}
      />
    </Tab.Navigator>
  );
};

// 앱 네비게이션 구조
export const AppNavigation = () => {
  return (
    <NavigationContainer>
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
          component={PlaceholderScreen}
          options={{ title: "내 컬렉션" }}
        />
        <Stack.Screen
          name="CollectionDetail"
          component={PlaceholderScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
        <Stack.Screen
          name="CreateCollection"
          component={PlaceholderScreen}
          options={{ title: "새 컬렉션" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
