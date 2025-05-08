import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // 프로필 정보 (실제 앱에서는 인증 시스템에서 가져옴)
  const mockUser = {
    username: "사용자",
    email: "user123@example.com",
    registeredDate: "2023-05-15",
  };

  // 메뉴 아이템 렌더링 함수
  const renderMenuItem = (
    icon: string,
    label: string,
    onPress: () => void,
    rightText?: string
  ) => {
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon as any} size={22} color="#2196F3" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <View style={styles.menuRight}>
          {rightText && <Text style={styles.menuRightText}>{rightText}</Text>}
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{mockUser.username}</Text>
          <Text style={styles.email}>{mockUser.email}</Text>
        </View>
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 내 컨텐츠 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 콘텐츠</Text>

        {renderMenuItem("star-outline", "내 리뷰", () =>
          navigation.navigate("Main", { screen: "MyReviews" })
        )}

        {renderMenuItem("albums-outline", "내 컬렉션", () =>
          navigation.navigate("Collections")
        )}

        {renderMenuItem("bookmark-outline", "보고 싶어요", () => {})}

        {renderMenuItem("checkmark-circle-outline", "봤어요", () => {})}
      </View>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>

        {renderMenuItem("person-outline", "계정 정보", () => {})}

        {renderMenuItem("notifications-outline", "알림 설정", () => {})}

        {renderMenuItem("shield-outline", "개인정보 보호", () => {})}

        {renderMenuItem("help-circle-outline", "도움말", () => {})}

        {renderMenuItem("log-out-outline", "로그아웃", () => {})}
      </View>

      {/* 앱 정보 */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>북무비 앱 v1.0.0</Text>
        <Text style={styles.copyright}>© 2023 북무비</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 8,
    backgroundColor: "#f5f5f5",
  },
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIconContainer: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuRightText: {
    fontSize: 14,
    color: "#999",
    marginRight: 4,
  },
  appInfo: {
    padding: 20,
    alignItems: "center",
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: "#bbb",
  },
});
