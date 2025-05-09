import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  GiftedChat,
  Bubble,
  Send,
  IMessage,
  Composer,
  InputToolbar,
} from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabaseService, {
  ChatMessage,
  ChatUser,
} from "../services/supabaseService";

// 가상의 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
const CURRENT_USER_ID = "current_user_id";

// 임시 메시지 데이터 (실제로는 API에서 가져와야 함)
const DUMMY_MESSAGES: IMessage[] = [
  {
    _id: "1",
    text: "기생충의 계단 장면이 정말 상징적이었죠.",
    createdAt: new Date(Date.now() - 3600000),
    user: {
      _id: "user1",
      name: "영화광팬",
      avatar: "https://picsum.photos/seed/user1/100/100",
    },
  },
  {
    _id: "2",
    text: "저도 그 장면이 가장 인상적이었어요. 계급 차이를 계단으로 표현한 연출이 뛰어났습니다.",
    createdAt: new Date(Date.now() - 3000000),
    user: {
      _id: "user2",
      name: "아카데미러버",
      avatar: "https://picsum.photos/seed/user2/100/100",
    },
  },
  {
    _id: "3",
    text: "비가 내리는 장면도 잊을 수 없어요. 같은 비지만 완전히 다른 상황을 경험하는 두 가족의 모습이 대조적이었죠.",
    createdAt: new Date(Date.now() - 2400000),
    user: {
      _id: "user3",
      name: "시네필",
      avatar: "https://picsum.photos/seed/user3/100/100",
    },
  },
];

// 임시 참가자 데이터 (실제로는 API에서 가져와야 함)
const DUMMY_PARTICIPANTS = [
  { id: "user1", username: "영화광팬", isTyping: false },
  { id: "user2", username: "아카데미러버", isTyping: false },
  { id: "user3", username: "시네필", isTyping: false },
  { id: CURRENT_USER_ID, username: "나", isTyping: false },
];

export const DiscussionDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { discussionId, title } = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    avatar?: string;
  }>({
    _id: CURRENT_USER_ID,
    name: "사용자",
  });
  const [isParticipantsVisible, setIsParticipantsVisible] = useState(false);
  const [participants, setParticipants] = useState<
    (ChatUser & { isTyping: boolean })[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");

  // 뒤로가기 커스텀 핸들러
  const handleGoBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error("네비게이션 오류:", error);
      navigation.navigate("Main", { screen: "Discussions" });
    }
  };

  // 헤더 설정
  useEffect(() => {
    // 뒤로가기 버튼을 커스텀 버튼으로 대체
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity style={{ marginLeft: 10 }} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 채팅 메시지를 AsyncStorage에 저장하는 함수
  const saveMessagesToStorage = async (msgs: IMessage[]) => {
    try {
      // 각 토론방마다 별도의 키로 메시지를 저장
      const storageKey = `discussion_messages_${discussionId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (error) {
      console.error("메시지 저장 중 오류 발생:", error);
    }
  };

  // 채팅 메시지 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Supabase 초기화 및 사용자 정보 설정
        const currentUser = await supabaseService.initialize();
        setUser({
          _id: currentUser.id,
          name: currentUser.username,
          avatar: currentUser.avatar_url,
        });

        // 2. 토론방 메시지 불러오기
        const chatMessages = await supabaseService.getMessages(discussionId);

        const formattedMessages: IMessage[] = chatMessages.map((msg) => ({
          _id: msg.id,
          text: msg.message,
          createdAt: new Date(msg.created_at),
          user: {
            _id: msg.user_id,
            name: msg.username,
            avatar:
              msg.avatar_url ||
              `https://picsum.photos/seed/${msg.user_id}/100/100`,
          },
        }));

        setMessages(formattedMessages);

        // 3. 참가자 목록 불러오기
        const chatParticipants = await supabaseService.getParticipants(
          discussionId
        );
        setParticipants(
          chatParticipants.map((participant) => ({
            ...participant,
            isTyping: false,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        setLoading(false);
      }
    };

    fetchData();

    // 4. 메시지 구독 설정
    const unsubscribe = supabaseService.subscribeToDiscussion(
      discussionId,
      (newMessage: ChatMessage) => {
        // 새 메시지 수신 시 처리
        const formattedMessage: IMessage = {
          _id: newMessage.id,
          text: newMessage.message,
          createdAt: new Date(newMessage.created_at),
          user: {
            _id: newMessage.user_id,
            name: newMessage.username,
            avatar:
              newMessage.avatar_url ||
              `https://picsum.photos/seed/${newMessage.user_id}/100/100`,
          },
        };

        // 메시지 추가
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [formattedMessage])
        );

        // 새 참가자 확인 및 추가
        setParticipants((prevParticipants) => {
          const existingParticipant = prevParticipants.find(
            (p) => p.id === newMessage.user_id
          );

          if (!existingParticipant) {
            // 새 참가자 추가
            return [
              ...prevParticipants,
              {
                id: newMessage.user_id,
                username: newMessage.username,
                avatar_url: newMessage.avatar_url,
                isTyping: false,
              },
            ];
          }

          return prevParticipants;
        });
      }
    );

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribe();
    };
  }, [discussionId]);

  // 메시지 전송
  const onMessageSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      try {
        const [firstMessage] = newMessages;
        if (!firstMessage?.text || firstMessage.text.trim().length === 0)
          return;

        // Supabase를 통해 메시지 전송
        await supabaseService.sendMessage(discussionId, firstMessage.text);

        // 입력 필드 초기화
        setInputMessage("");
      } catch (error) {
        console.error("메시지 전송 중 오류 발생:", error);
      }
    },
    [discussionId]
  );

  // 참가자 목록 토글
  const toggleParticipants = () => {
    setIsParticipantsVisible(!isParticipantsVisible);
  };

  // 타이핑 상태는 이 데모에서는 구현하지 않음
  const handleInputTextChanged = (text: string) => {
    setInputMessage(text);
  };

  // 채팅 버블 커스터마이징
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#2196F3",
          },
          left: {
            backgroundColor: "#f0f0f0",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
          left: {
            color: "#333",
          },
        }}
      />
    );
  };

  // 전송 버튼 커스터마이징
  const renderSend = (props: any) => {
    return (
      <Send
        {...props}
        containerStyle={{
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          marginBottom: 5,
        }}
      >
        <Ionicons name="send" size={24} color="#2196F3" />
      </Send>
    );
  };

  // 타이핑 중인 사용자 표시
  const renderFooter = () => {
    const typingUsers = participants.filter(
      (p) => p.isTyping && p.id !== user._id
    );
    if (typingUsers.length === 0) return null;

    const typingText =
      typingUsers.length === 1
        ? `${typingUsers[0].username} 입력 중...`
        : `${typingUsers.length}명이 입력 중...`;

    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{typingText}</Text>
      </View>
    );
  };

  // 참가자 목록 렌더링
  const renderParticipants = () => {
    if (!isParticipantsVisible) return null;

    return (
      <View style={styles.participantsContainer}>
        <View style={styles.participantsHeader}>
          <Text style={styles.participantsTitle}>
            참가자 ({participants.length})
          </Text>
          <TouchableOpacity onPress={toggleParticipants}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {participants.map((participant) => (
          <View key={participant.id} style={styles.participantItem}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantAvatarText}>
                {participant.username.charAt(0)}
              </Text>
            </View>
            <Text style={styles.participantName}>
              {participant.username}
              {participant.id === user._id ? " (나)" : ""}
            </Text>
            {participant.isTyping && (
              <Text style={styles.typingIndicator}>입력 중...</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // 커스텀 InputToolbar 렌더링
  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputToolbarPrimary}
      />
    );
  };

  // 커스텀 Composer 렌더링
  const renderCustomComposer = (props: any) => {
    return (
      <Composer
        {...props}
        textInputProps={{
          ...props.textInputProps,
          onKeyPress: ({ nativeEvent }) => {
            if (nativeEvent && nativeEvent.key === "Enter") {
              props.onSend({ text: props.text.trim() });
              return;
            }
          },
          returnKeyType: "send",
          multiline: Platform.OS === "ios",
          blurOnSubmit: false,
        }}
        composerHeight={Platform.OS === "ios" ? 36 : 41}
      />
    );
  };

  // 메시지 렌더링을 위한 커스텀 함수 - key prop 에러 해결
  const renderMessage = (props: any) => {
    const { currentMessage } = props;
    return <View key={currentMessage._id}>{props.renderBubble(props)}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={toggleParticipants}
          style={styles.participantsButton}
        >
          <Ionicons name="people" size={24} color="#2196F3" />
          <Text style={styles.participantsCount}>{participants.length}</Text>
        </TouchableOpacity>
      </View>

      {renderParticipants()}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 30}
        enabled
      >
        <GiftedChat
          messages={messages}
          onSend={onMessageSend}
          user={{
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderFooter={renderFooter}
          renderInputToolbar={renderInputToolbar}
          renderComposer={renderCustomComposer}
          renderMessage={renderMessage}
          placeholder="메시지 입력..."
          onInputTextChanged={handleInputTextChanged}
          text={inputMessage}
          alwaysShowSend
          renderAvatarOnTop
          showAvatarForEveryMessage={false}
          showUserAvatar
          minInputToolbarHeight={50}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  participantsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsCount: {
    marginLeft: 4,
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  footerContainer: {
    padding: 5,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  participantsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "70%",
    zIndex: 10,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderLeftColor: "#e1e1e1",
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  participantsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  participantAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  participantName: {
    fontSize: 14,
    flex: 1,
  },
  typingIndicator: {
    fontSize: 12,
    color: "#2196F3",
    fontStyle: "italic",
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
  },
  inputToolbarPrimary: {
    alignItems: "center",
  },
});
