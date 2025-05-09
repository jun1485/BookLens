import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { adService } from "../services/adService";

interface AdBannerProps {
  containerId?: string;
  adUnitId?: string;
  isTestDevice?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  containerId = "default_banner",
  adUnitId = "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy",
  isTestDevice = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [showAd, setShowAd] = useState(true);

  useEffect(() => {
    const checkAdStatus = async () => {
      try {
        setLoading(true);

        // 광고 표시 여부 확인 (프리미엄 사용자는 광고 표시하지 않음)
        const shouldShowAds = await adService.shouldShowAds();
        setShowAd(shouldShowAds);

        if (shouldShowAds) {
          // 실제 광고 로드
          await adService.loadBannerAd(containerId);
        }
      } catch (error) {
        console.error("배너 광고 상태 확인 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdStatus();
  }, [containerId]);

  if (loading) {
    return (
      <View style={styles.adContainer}>
        <Text style={styles.loadingText}>광고 로드 중...</Text>
      </View>
    );
  }

  if (!showAd) {
    // 프리미엄 사용자는 광고 공간 표시하지 않음
    return null;
  }

  return (
    <View style={styles.adContainer} testID={containerId}>
      {/* 실제 구현에서는 AdMob 또는 다른 광고 SDK 컴포넌트 사용 */}
      {isTestDevice && (
        <View style={styles.testAdContainer}>
          <Text style={styles.testAdText}>광고 영역</Text>
          <Text style={styles.testAdSubText}>
            프리미엄 구독으로 광고를 제거하세요
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: "100%",
    height: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#999",
  },
  testAdContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ebebeb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  testAdText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  testAdSubText: {
    fontSize: 10,
    color: "#6200EE",
    marginTop: 2,
  },
});
