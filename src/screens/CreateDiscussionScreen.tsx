import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CreateDiscussionScreen = () => {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<"movie" | "book">("movie");
  const [contentTitle, setContentTitle] = useState("");
  const [contentId, setContentId] = useState("");
  const [loading, setLoading] = useState(false);

  // 토론방 생성 처리
  const handleCreateDiscussion = async () => {
    if (!title || !description || !contentTitle || !contentId) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 실제로는 API 호출로 토론방 생성 요청
      // 임시 데이터 사용
      const username = (await AsyncStorage.getItem("username")) || "익명";

      // 임시 응답 (실제로는 API에서 받아옴)
      const newDiscussion = {
        id: `discussion-${Date.now()}`,
        title,
        description,
        contentType,
        contentId: contentType === "movie" ? Number(contentId) : contentId,
        contentTitle,
        createdAt: new Date(),
        createdBy: {
          id: "current_user_id",
          username,
        },
        participants: 1,
        isActive: true,
      };

      // 성공 시 딜레이 후 토론방으로 이동 (실제로는 API 응답 후 이동)
      setTimeout(() => {
        setLoading(false);
        navigation.navigate("DiscussionDetail", {
          discussionId: newDiscussion.id,
          title: newDiscussion.title,
        });
      }, 1000);
    } catch (error) {
      console.error("토론방 생성 중 오류 발생:", error);
      setLoading(false);
      Alert.alert("오류", "토론방 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 컨텐츠 타입 선택 버튼
  const ContentTypeButton = ({
    type,
    label,
  }: {
    type: "movie" | "book";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.contentTypeButton,
        contentType === type && styles.contentTypeButtonActive,
      ]}
      onPress={() => setContentType(type)}
    >
      <Ionicons
        name={type === "movie" ? "film-outline" : "book-outline"}
        size={20}
        color={contentType === type ? "#fff" : "#666"}
      />
      <Text
        style={[
          styles.contentTypeText,
          contentType === type && styles.contentTypeTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        scrollEnabled={true}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>컨텐츠 유형</Text>
          <View style={styles.contentTypeContainer}>
            <ContentTypeButton type="movie" label="영화" />
            <ContentTypeButton type="book" label="도서" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {contentType === "movie" ? "영화 제목" : "도서 제목"}
          </Text>
          <TextInput
            style={styles.input}
            value={contentTitle}
            onChangeText={setContentTitle}
            placeholder={
              contentType === "movie" ? "영화 제목 입력" : "도서 제목 입력"
            }
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {contentType === "movie" ? "영화 ID" : "ISBN"}
          </Text>
          <TextInput
            style={styles.input}
            value={contentId}
            onChangeText={setContentId}
            placeholder={contentType === "movie" ? "영화 ID 입력" : "ISBN 입력"}
            placeholderTextColor="#999"
            keyboardType={contentType === "movie" ? "numeric" : "default"}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>토론방 제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="토론방 제목 입력"
            placeholderTextColor="#999"
            maxLength={50}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="토론방 설명 입력"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateDiscussion}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>토론방 만들기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    minHeight: 100,
  },
  contentTypeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  contentTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  contentTypeButtonActive: {
    backgroundColor: "#2196F3",
  },
  contentTypeText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#666",
  },
  contentTypeTextActive: {
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
