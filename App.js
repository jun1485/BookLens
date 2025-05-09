import "react-native-url-polyfill/auto";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AppNavigation } from "./src/navigation";
import { adService } from "./src/services/adService";
import { userStorage } from "./src/services/storage";

export default function App() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // 환경 변수 로딩 확인
        console.log(
          "TMDB API KEY 설정 확인:",
          process.env.TMDB_API_KEY ? "설정됨" : "미설정"
        );

        if (!process.env.TMDB_API_KEY) {
          console.warn(
            "TMDB API KEY가 설정되지 않았습니다. 영화 데이터를 불러올 수 없습니다."
          );
        }

        await adService.initializeAds();

        const userProfile = await userStorage.getProfile();
        if (!userProfile) {
          await userStorage.saveProfile({
            id: "default_user",
            username: "사용자",
            email: "user@example.com",
            collections: [],
            isPremium: false,
          });
        }

        console.log("서비스 초기화 완료");
      } catch (error) {
        console.error("서비스 초기화 중 오류 발생:", error);
      }
    };

    initializeServices();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigation />
    </View>
  );
}
