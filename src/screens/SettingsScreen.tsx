import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNRestart from "react-native-restart";

export const SettingsScreen = () => {
  // AsyncStorage 초기화 및 앱 재시작
  const handleClearStorageAndRestart = () => {
    Alert.alert(
      "데이터 초기화",
      "모든 앱 데이터를 초기화하고 앱을 재시작하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("모든 AsyncStorage 데이터 초기화 시작");
              await AsyncStorage.clear();
              console.log("모든 AsyncStorage 데이터 초기화 완료");

              // 앱 재시작
              setTimeout(() => {
                RNRestart.Restart();
              }, 1000);
            } catch (error) {
              console.error("데이터 초기화 중 오류 발생:", error);
              Alert.alert("오류", "데이터 초기화 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  // 리뷰 데이터 초기화
  const handleClearReviews = async () => {
    Alert.alert(
      "리뷰 초기화",
      "모든 리뷰 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("리뷰 데이터 초기화 시작");
              await AsyncStorage.removeItem("app_reviews");
              console.log("리뷰 데이터 초기화 완료");
              Alert.alert(
                "완료",
                "리뷰 데이터가 초기화되었습니다. 앱을 다시 시작해주세요."
              );
            } catch (error) {
              console.error("리뷰 데이터 초기화 중 오류 발생:", error);
              Alert.alert("오류", "리뷰 데이터 초기화 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  // 컬렉션 데이터 초기화
  const handleClearCollections = async () => {
    Alert.alert(
      "컬렉션 초기화",
      "모든 컬렉션 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("컬렉션 데이터 초기화 시작");
              await AsyncStorage.removeItem("app_collections");
              console.log("컬렉션 데이터 초기화 완료");
              Alert.alert(
                "완료",
                "컬렉션 데이터가 초기화되었습니다. 앱을 다시 시작해주세요."
              );
            } catch (error) {
              console.error("컬렉션 데이터 초기화 중 오류 발생:", error);
              Alert.alert(
                "오류",
                "컬렉션 데이터 초기화 중 문제가 발생했습니다."
              );
            }
          },
        },
      ]
    );
  };

  // AsyncStorage 현재 상태 콘솔에 출력
  const handleDebugStorage = async () => {
    try {
      console.log("===== AsyncStorage 디버깅 시작 =====");

      // 모든 키 가져오기
      const keys = await AsyncStorage.getAllKeys();
      console.log("모든 키:", keys);

      // 각 키별로 데이터 확인
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        console.log(`키: ${key}, 데이터:`, data);
      }

      console.log("===== AsyncStorage 디버깅 완료 =====");
      Alert.alert("완료", "콘솔에 AsyncStorage 데이터가 출력되었습니다.");
    } catch (error) {
      console.error("AsyncStorage 디버깅 중 오류 발생:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 데이터</Text>

          <TouchableOpacity style={styles.row} onPress={handleClearReviews}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#6200EE"
              />
              <Text style={styles.rowText}>리뷰 데이터 초기화</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleClearCollections}>
            <View style={styles.rowLeft}>
              <Ionicons name="bookmarks-outline" size={24} color="#6200EE" />
              <Text style={styles.rowText}>컬렉션 데이터 초기화</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handleDebugStorage}>
            <View style={styles.rowLeft}>
              <Ionicons name="bug-outline" size={24} color="#6200EE" />
              <Text style={styles.rowText}>AsyncStorage 디버깅</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearStorageAndRestart}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />
            <Text style={styles.dangerButtonText}>
              모든 데이터 초기화 및 재시작
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  section: {
    backgroundColor: "#fff",
    marginVertical: 16,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    padding: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  dangerSection: {
    marginHorizontal: 16,
    marginBottom: 40,
  },
  dangerButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
