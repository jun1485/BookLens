import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();

  // 설정 화면으로 이동
  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 프로필 헤더 */}
        <View style={styles.header}>
          {/* 설정 버튼 */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={navigateToSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>

          {/* 프로필 이미지 */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/150" }}
              style={styles.profileImage}
            />
          </View>

          {/* 사용자 정보 */}
          <Text style={styles.username}>사용자</Text>
          <Text style={styles.email}>user123@example.com</Text>

          {/* 통계 정보 */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>리뷰</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>컬렉션</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>28</Text>
              <Text style={styles.statLabel}>토론</Text>
            </View>
          </View>
        </View>

        {/* 기능 버튼 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("MyReviews")}
          >
            <Ionicons name="star-outline" size={24} color="#6200EE" />
            <Text style={styles.actionButtonText}>내 리뷰</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Collections")}
          >
            <Ionicons name="bookmarks-outline" size={24} color="#6200EE" />
            <Text style={styles.actionButtonText}>내 컬렉션</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Discussions")}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#6200EE" />
            <Text style={styles.actionButtonText}>토론</Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToSettings}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={22} color="#6200EE" />
              <Text style={styles.menuItemText}>설정</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color="#6200EE" />
              <Text style={styles.menuItemText}>도움말</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#6200EE"
              />
              <Text style={styles.menuItemText}>정보</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
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
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginVertical: 15,
    borderWidth: 3,
    borderColor: "#6200EE",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6200EE",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: "row",
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginTop: 8,
    color: "#333",
    fontSize: 14,
  },
  menuList: {
    backgroundColor: "#fff",
    marginVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
  },
});
