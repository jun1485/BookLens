import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Discussion } from "../../../types/discussion";
import socketService from "../../../services/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DiscussionsScreen = () => {
  const navigation = useNavigation<any>();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "movies" | "books">("all");

  // 토론방 데이터 가져오기
  const fetchDiscussions = useCallback(async () => {
    try {
      // AsyncStorage에서 저장된 토론방 데이터 가져오기
      const savedDiscussionsJson = await AsyncStorage.getItem(
        "saved_discussions"
      );
      const savedDiscussions = savedDiscussionsJson
        ? (JSON.parse(savedDiscussionsJson) as Discussion[])
        : [];

      // Date 객체로 변환 (JSON.parse는 Date를 문자열로 파싱)
      const formattedDiscussions = savedDiscussions.map((discussion) => ({
        ...discussion,
        createdAt: new Date(discussion.createdAt),
        lastActivity: discussion.lastActivity
          ? new Date(discussion.lastActivity)
          : undefined,
      }));

      setDiscussions(formattedDiscussions);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("토론방 데이터를 가져오는 중 오류 발생:", error);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchDiscussions();

      // 웹소켓 연결 초기화
      const initializeSocket = async () => {
        try {
          await socketService.initialize();
        } catch (error) {
          console.error("웹소켓 연결 실패:", error);
        }
      };

      initializeSocket();

      return () => {
        // 화면 벗어날 때 정리
      };
    }, [])
  );

  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiscussions();
  };

  // 필터링된 토론방 목록
  const filteredDiscussions = discussions.filter((discussion) => {
    if (filter === "all") return true;
    if (filter === "movies") return discussion.contentType === "movie";
    if (filter === "books") return discussion.contentType === "book";
    return true;
  });

  // 토론방 아이템 렌더링
  const renderDiscussionItem = ({ item }: { item: Discussion }) => {
    const formattedDate = item.lastActivity
      ? `${item.lastActivity.toLocaleDateString()}`
      : `${item.createdAt.toLocaleDateString()}`;

    return (
      <TouchableOpacity
        style={styles.discussionItem}
        onPress={() =>
          navigation.navigate("DiscussionDetail", {
            discussionId: item.id,
            title: item.title,
          })
        }
      >
        <Image source={{ uri: item.coverImage }} style={styles.coverImage} />
        <View style={styles.discussionInfo}>
          <Text style={styles.discussionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.contentTitle} numberOfLines={1}>
            {item.contentType === "movie" ? "🎬 " : "📚 "}
            {item.contentTitle}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || item.description}
          </Text>
          <View style={styles.discussionMeta}>
            <Text style={styles.participants}>
              <Ionicons name="people-outline" size={14} /> {item.participants}명
              참여 중
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 필터 버튼 컴포넌트
  const FilterButton = ({
    title,
    value,
  }: {
    title: string;
    value: "all" | "movies" | "books";
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton title="전체" value="all" />
        <FilterButton title="영화" value="movies" />
        <FilterButton title="도서" value="books" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredDiscussions}
          renderItem={renderDiscussionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>토론방이 없습니다.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreateDiscussion")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#2196F3",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 12,
  },
  discussionItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  coverImage: {
    width: 70,
    height: 100,
    borderRadius: 4,
  },
  discussionInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contentTitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  discussionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participants: {
    fontSize: 12,
    color: "#888",
  },
  date: {
    fontSize: 12,
    color: "#888",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
