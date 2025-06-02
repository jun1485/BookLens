import "react-native-get-random-values"; // crypto polyfill 추가
import "react-native-url-polyfill/auto"; // URL polyfill 추가
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AppNavigation } from "./src/navigation";
// import { adService } from "./src/services/adService";
import { userStorage } from "./src/services/storage";
import { paymentService } from "./src/services/paymentService";

export default function App() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Google Play 결제 서비스 초기화
        const paymentInitialized = await paymentService.initialize({
          enablePendingPurchases: true, // 대기 중인 구매 지원
        });

        if (paymentInitialized) {
          console.log("✅ Google Play 결제 서비스 초기화 성공");
        } else {
          console.warn("⚠️ Google Play 결제 서비스 초기화 실패");
        }

        // await adService.initializeAds();

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

    // 앱 종료 시 결제 서비스 정리
    return () => {
      paymentService.terminate().catch((error) => {
        console.warn("결제 서비스 종료 중 오류:", error);
      });
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigation />
    </View>
  );
}
