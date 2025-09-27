import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation/types";
import { ItemCard } from "../../../components/ItemCard";
import { Movie, Book } from "../../../types";
import { useCollections } from "../hooks";
import { movieService } from "../../movies/api/movieService";
import { bookService } from "../../books/api/bookService";
import { Ionicons } from "@expo/vector-icons";

type CollectionDetailRouteProp = RouteProp<
  RootStackParamList,
  "CollectionDetail"
>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CollectionItem {
  id: string | number;
  type: "movie" | "book";
  data?: Movie | Book;
}

export const CollectionDetailScreen = () => {
  const route = useRoute<CollectionDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { collectionId, name } = route.params;

  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { collections, removeItemFromCollection } = useCollections();

  // 현재 컬렉션 찾기
  const collection = collections.find((col) => col.id === collectionId);

  // 컬렉션 아이템 데이터 로드
  const loadCollectionItems = async () => {
    if (!collection) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 컬렉션에 있는 모든 아이템들의 상세 정보 가져오기
      const itemsWithData = await Promise.all(
        collection.items.map(async (item) => {
          try {
            let itemData;

            if (item.type === "movie") {
              itemData = await movieService.getMovieDetails(Number(item.id));
            } else {
              // 책의 경우 검색 API를 사용하여 데이터 가져오기
              const searchResult = await bookService.searchBooks(
                `isbn:${item.id}`
              );
              itemData =
                searchResult.results.length > 0
                  ? searchResult.results[0]
                  : undefined;
            }

            return {
              ...item,
              data: itemData,
            };
          } catch (err) {
            console.error(
              `Error fetching details for ${item.type} ${item.id}:`,
              err
            );
            return item; // 데이터 로드 실패 시 기본 아이템만 반환
          }
        })
      );

      setItems(itemsWithData);
    } catch (err) {
      Alert.alert("오류", "컬렉션 아이템을 로드하는 중 오류가 발생했습니다.");
      console.error("Error loading collection items:", err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 및 컬렉션 변경 시 아이템 로드
  useEffect(() => {
    loadCollectionItems();
  }, [collection]);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollectionItems();
    setRefreshing(false);
  };

  // 아이템 클릭 시 상세 페이지로 이동
  const handleItemPress = (item: CollectionItem) => {
    if (item.type === "movie" && item.data) {
      navigation.navigate("MovieDetail", {
        movieId: Number(item.id),
        movie: item.data as Movie,
      });
    } else if (item.type === "book" && item.data) {
      navigation.navigate("BookDetail", {
        isbn: String(item.id),
        book: item.data as Book,
      });
    }
  };

  // 컬렉션에서 아이템 제거
  const handleRemoveItem = (item: CollectionItem) => {
    Alert.alert("아이템 제거", "이 아이템을 컬렉션에서 제거하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "제거",
        style: "destructive",
        onPress: async () => {
          try {
            await removeItemFromCollection(collectionId, item.id, item.type);
            // 제거 후 목록 갱신
            const updatedItems = items.filter(
              (i) => !(i.id === item.id && i.type === item.type)
            );
            setItems(updatedItems);
            Alert.alert("완료", "아이템이 컬렉션에서 제거되었습니다.");
          } catch (err) {
            Alert.alert("오류", "아이템 제거 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 아이템 렌더링
  const renderItem = ({ item }: { item: CollectionItem }) => {
    if (!item.data) {
      // 데이터가 로드되지 않은 경우
      return (
        <View style={styles.loadingItemCard}>
          <ActivityIndicator size="small" color="#2196F3" />
          <Text style={styles.loadingText}>
            {item.type === "movie" ? "영화" : "책"} 로딩 중...
          </Text>
        </View>
      );
    }

    return (
      <View>
        <ItemCard
          item={item.data}
          itemType={item.type}
          onPress={() => handleItemPress(item)}
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Ionicons name="close-circle" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  // 헤더 타이틀 설정
  useEffect(() => {
    navigation.setOptions({
      title: name || "컬렉션 상세",
    });
  }, [name, navigation]);

  if (loading && !items.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>컬렉션을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        numColumns={2}
        contentContainerStyle={styles.itemsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>이 컬렉션에 아이템이 없습니다</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("Main", { screen: "Search" })}
            >
              <Text style={styles.emptyButtonText}>작품 검색하러 가기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemsList: {
    padding: 16,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  loadingItemCard: {
    width: "45%",
    height: 200,
    margin: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
