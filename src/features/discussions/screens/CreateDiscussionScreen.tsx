import React, { useState, useEffect } from "react";
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

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    contentTitle: false,
    contentId: false,
  });

  // 뒤로가기 처리
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            try {
              navigation.pop();
            } catch (error) {
              console.error("네비게이션 오류:", error);
              navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            }
          }}
          style={{ marginLeft: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 각 필드 검증 함수
  const validateField = (field: string, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: value.trim() === "" }));
    return value.trim() !== "";
  };

  // 토론방 생성 처리
  const handleCreateDiscussion = async () => {
    // 모든 필드 검증
    const titleValid = validateField("title", title);
    const descriptionValid = validateField("description", description);
    const contentTitleValid = validateField("contentTitle", contentTitle);
    const contentIdValid = validateField("contentId", contentId);

    if (
      !titleValid ||
      !descriptionValid ||
      !contentTitleValid ||
      !contentIdValid
    ) {
      Alert.alert("입력 오류", "모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      // 사용자 이름 가져오기
      const username = (await AsyncStorage.getItem("username")) || "익명";

      // 새 토론방 데이터
      const newDiscussion = {
        id: `discussion-${Date.now()}`,
        title,
        description,
        contentType,
        contentId: contentType === "movie" ? Number(contentId) : contentId,
        contentTitle,
        coverImage: `https://picsum.photos/seed/${Date.now()}/150/200`,
        createdAt: new Date(),
        createdBy: {
          id: "current_user_id",
          username,
        },
        participants: 1,
        lastMessage: "",
        lastActivity: new Date(),
        isActive: true,
      };

      // AsyncStorage에서 기존 토론방 목록 가져오기
      const savedDiscussionsJson = await AsyncStorage.getItem(
        "saved_discussions"
      );
      const savedDiscussions = savedDiscussionsJson
        ? JSON.parse(savedDiscussionsJson)
        : [];

      // 새 토론방 추가
      const updatedDiscussions = [newDiscussion, ...savedDiscussions];

      // AsyncStorage에 저장
      await AsyncStorage.setItem(
        "saved_discussions",
        JSON.stringify(updatedDiscussions)
      );

      // 성공 시 토론방으로 이동
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
            style={[styles.input, errors.contentTitle && styles.inputError]}
            value={contentTitle}
            onChangeText={(text) => {
              setContentTitle(text);
              validateField("contentTitle", text);
            }}
            placeholder={
              contentType === "movie" ? "영화 제목 입력" : "도서 제목 입력"
            }
            placeholderTextColor="#999"
          />
          {errors.contentTitle && (
            <Text style={styles.errorText}>
              {contentType === "movie" ? "영화 제목을" : "도서 제목을"}{" "}
              입력해주세요
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {contentType === "movie" ? "영화 ID" : "ISBN"}
          </Text>
          <TextInput
            style={[styles.input, errors.contentId && styles.inputError]}
            value={contentId}
            onChangeText={(text) => {
              setContentId(text);
              validateField("contentId", text);
            }}
            placeholder={contentType === "movie" ? "영화 ID 입력" : "ISBN 입력"}
            placeholderTextColor="#999"
            keyboardType={contentType === "movie" ? "numeric" : "default"}
          />
          {errors.contentId && (
            <Text style={styles.errorText}>
              {contentType === "movie" ? "영화 ID를" : "ISBN을"} 입력해주세요
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>토론방 제목</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              validateField("title", text);
            }}
            placeholder="토론방 제목 입력"
            placeholderTextColor="#999"
            maxLength={50}
          />
          {errors.title && (
            <Text style={styles.errorText}>토론방 제목을 입력해주세요</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>설명</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              validateField("description", text);
            }}
            placeholder="토론방 설명 입력"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text style={styles.errorText}>토론방 설명을 입력해주세요</Text>
          )}
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
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 4,
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
    fontSize: 18,
    fontWeight: "bold",
  },
});
