import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userStorage } from "../services/storage";
import { useNavigation } from "@react-navigation/native";
import { checkAllStorage, deleteReviewDirectly } from "../utils/storageReset";

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [isPremium, setIsPremium] = useState(false);
  const [reviewIdToDelete, setReviewIdToDelete] = useState("");

  // 구독 상태 확인
  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premium = await userStorage.isPremium();
      setIsPremium(premium);
    };

    checkPremiumStatus();
  }, []);

  // AsyncStorage 초기화 및 앱 재시작
  const handleClearStorageAndRestart = () => {
    Alert.alert(
      "데이터 초기화",
      "모든 앱 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
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

              // 앱 재시작 로직 수정
              Alert.alert(
                "초기화 완료",
                "데이터가 초기화되었습니다. 앱을 완전히 종료한 후 다시 실행해주세요.",
                [{ text: "확인", onPress: () => {} }]
              );
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

  // 구독 화면으로 이동
  const navigateToSubscription = () => {
    navigation.navigate("Subscription");
  };

  // 스토리지 정보 출력
  const handleShowStorageInfo = async () => {
    try {
      const keys = await checkAllStorage();
      Alert.alert(
        "저장소 정보",
        `총 ${keys.length}개의 키가 발견되었습니다. 상세 정보는 콘솔을 확인하세요.`
      );
    } catch (error) {
      console.error("저장소 정보 확인 오류:", error);
      Alert.alert("오류", "저장소 정보를 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 리뷰 직접 삭제
  const handleDirectlyDeleteReview = async () => {
    if (!reviewIdToDelete.trim()) {
      Alert.alert("오류", "삭제할 리뷰 ID를 입력해주세요.");
      return;
    }

    Alert.alert(
      "리뷰 직접 삭제",
      `정말로 ID '${reviewIdToDelete}'의 리뷰를 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteReviewDirectly(reviewIdToDelete);
              if (result) {
                Alert.alert(
                  "성공",
                  "리뷰가 성공적으로 삭제되었습니다. 앱을 다시 시작하세요."
                );
                setReviewIdToDelete("");
              } else {
                Alert.alert(
                  "실패",
                  "리뷰를 삭제할 수 없습니다. 로그를 확인하세요."
                );
              }
            } catch (error) {
              console.error("리뷰 직접 삭제 오류:", error);
              Alert.alert("오류", "리뷰 삭제 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 구독 섹션 추가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>구독</Text>

          <TouchableOpacity style={styles.row} onPress={navigateToSubscription}>
            <View style={styles.rowLeft}>
              <Ionicons name="diamond-outline" size={24} color="#6200EE" />
              <Text style={styles.rowText}>
                {isPremium ? "구독 관리" : "프리미엄 구독하기"}
              </Text>
            </View>
            {isPremium && (
              <View style={styles.premiumTag}>
                <Text style={styles.premiumTagText}>프리미엄</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

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

          <TouchableOpacity style={styles.row} onPress={handleShowStorageInfo}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6200EE"
              />
              <Text style={styles.rowText}>저장소 정보 자세히 보기</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* 디버깅 섹션 추가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>디버깅 도구</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>리뷰 ID로 직접 삭제:</Text>
            <TextInput
              style={styles.input}
              value={reviewIdToDelete}
              onChangeText={setReviewIdToDelete}
              placeholder="삭제할 리뷰 ID 입력"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDirectlyDeleteReview}
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
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
  premiumTag: {
    backgroundColor: "#6200EE",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  premiumTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
