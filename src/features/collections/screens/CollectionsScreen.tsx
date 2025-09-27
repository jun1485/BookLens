import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Collection } from "../../../types";
import { RootStackParamList } from "../../../navigation/types";
import { useCollections } from "../hooks";
import { Ionicons } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CollectionsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    deleteCollection,
  } = useCollections();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 컬렉션 목록 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  // 컬렉션 생성 모달 표시
  const showCreateCollectionModal = () => {
    setNewCollectionName("");
    setModalVisible(true);
  };

  // 컬렉션 생성
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("오류", "컬렉션 이름을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await createCollection(newCollectionName.trim());
      setModalVisible(false);
      Alert.alert("완료", "새 컬렉션이 생성되었습니다.");
    } catch (err) {
      Alert.alert("오류", "컬렉션 생성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 컬렉션 삭제
  const handleDeleteCollection = (collection: Collection) => {
    Alert.alert(
      "컬렉션 삭제",
      `"${collection.name}" 컬렉션을 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
              // 삭제 후 리스트 새로고침
              fetchCollections();
            } catch (err) {
              Alert.alert("오류", "컬렉션을 삭제하는 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  // 컬렉션 상세 보기
  const handleViewCollection = (collection: Collection) => {
    navigation.navigate("CollectionDetail", {
      collectionId: collection.id,
      name: collection.name,
    });
  };

  // 컬렉션 아이템 렌더링
  const renderCollectionItem = ({ item }: { item: Collection }) => {
    return (
      <TouchableOpacity
        style={styles.collectionCard}
        onPress={() => handleViewCollection(item)}
      >
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionName}>{item.name}</Text>
          <Text style={styles.itemCount}>{item.items.length}개의 작품</Text>
        </View>

        <View style={styles.collectionActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCollection(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !collections.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 컬렉션 목록 */}
      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.collectionsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>아직 컬렉션이 없습니다</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={showCreateCollectionModal}
            >
              <Text style={styles.emptyButtonText}>컬렉션 만들기</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 새 컬렉션 추가 버튼 */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={showCreateCollectionModal}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* 새 컬렉션 생성 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 컬렉션 만들기</Text>

            <TextInput
              style={styles.input}
              placeholder="컬렉션 이름 입력"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  submitting && { opacity: 0.7 },
                ]}
                onPress={handleCreateCollection}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>생성</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  collectionsList: {
    padding: 16,
    paddingBottom: 80,
  },
  collectionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
  collectionActions: {
    flexDirection: "row",
  },
  deleteButton: {
    padding: 8,
  },
  fabButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2196F3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#333",
  },
  createButton: {
    backgroundColor: "#2196F3",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
