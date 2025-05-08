import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GiftedChat, Bubble, Send, IMessage } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socketService from "../services/socketService";

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
      avatar: "https://via.placeholder.com/100",
    },
  },
  {
    _id: "2",
    text: "저도 그 장면이 가장 인상적이었어요. 계급 차이를 계단으로 표현한 연출이 뛰어났습니다.",
    createdAt: new Date(Date.now() - 3000000),
    user: {
      _id: "user2",
      name: "아카데미러버",
      avatar: "https://via.placeholder.com/100",
    },
  },
  {
    _id: "3",
    text: "비가 내리는 장면도 잊을 수 없어요. 같은 비지만 완전히 다른 상황을 경험하는 두 가족의 모습이 대조적이었죠.",
    createdAt: new Date(Date.now() - 2400000),
    user: {
      _id: "user3",
      name: "시네필",
      avatar: "https://via.placeholder.com/100",
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
  const [participants, setParticipants] = useState(DUMMY_PARTICIPANTS);

  // 채팅 메시지 조회
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // 실제로는 API 호출로 메시지 가져오기
        // 임시 데이터 사용
        setTimeout(() => {
          setMessages(DUMMY_MESSAGES);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("메시지를 가져오는 중 오류 발생:", error);
        setLoading(false);
      }
    };

    // 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        setUser({
          _id: CURRENT_USER_ID,
          name: username || "사용자",
          avatar: "https://via.placeholder.com/100",
        });
      } catch (error) {
        console.error("사용자 정보를 가져오는 중 오류 발생:", error);
      }
    };

    fetchUserInfo();
    fetchMessages();

    // 웹소켓 연결 및 토론방 참여
    const setupSocketConnection = async () => {
      try {
        const socket = await socketService.initialize();
        await socketService.joinDiscussion(discussionId);

        // 실시간 메시지 수신 이벤트
        socket.on("newMessage", (message: any) => {
          const formattedMessage: IMessage = {
            _id: message.id,
            text: message.message,
            createdAt: new Date(message.timestamp),
            user: {
              _id: message.user?.id || "unknown",
              name: message.username,
              avatar: message.user?.avatar || "https://via.placeholder.com/100",
            },
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [formattedMessage])
          );
        });

        // 타이핑 상태 이벤트
        socket.on(
          "userTyping",
          ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
            setParticipants((prev) =>
              prev.map((p) => (p.id === userId ? { ...p, isTyping } : p))
            );
          }
        );

        // 참가자 상태 변경 이벤트
        socket.on("participantUpdate", (updatedParticipant: any) => {
          setParticipants((prev) => {
            const exists = prev.some((p) => p.id === updatedParticipant.id);
            if (exists) {
              return prev.map((p) =>
                p.id === updatedParticipant.id
                  ? { ...p, ...updatedParticipant }
                  : p
              );
            } else {
              return [...prev, updatedParticipant];
            }
          });
        });

        // 참가자 퇴장 이벤트
        socket.on("participantLeft", (userId: string) => {
          setParticipants((prev) => prev.filter((p) => p.id !== userId));
        });
      } catch (error) {
        console.error("웹소켓 연결 중 오류 발생:", error);
      }
    };

    setupSocketConnection();

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      socketService.leaveDiscussion(discussionId);
    };
  }, [discussionId]);

  // 메시지 전송
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      try {
        const [firstMessage] = newMessages;

        // 메시지 저장 및 소켓을 통해 전송
        await socketService.sendMessage(discussionId, firstMessage.text);

        // 로컬 상태 업데이트 (최적화된 UI 반응)
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, newMessages)
        );
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

  // 타이핑 이벤트 처리
  const handleInputTextChanged = (text: string) => {
    if (socketService.socket) {
      socketService.socket.emit("typing", {
        discussionId,
        userId: CURRENT_USER_ID,
        isTyping: text.length > 0,
      });
    }
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
      (p) => p.isTyping && p.id !== CURRENT_USER_ID
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
              {participant.id === CURRENT_USER_ID ? " (나)" : ""}
            </Text>
            {participant.isTyping && (
              <Text style={styles.typingIndicator}>입력 중...</Text>
            )}
          </View>
        ))}
      </View>
    );
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => onSend(newMessages)}
          user={{
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderFooter={renderFooter}
          placeholder="메시지 입력..."
          onInputTextChanged={handleInputTextChanged}
          alwaysShowSend
          renderAvatarOnTop
          showAvatarForEveryMessage={false}
          showUserAvatar
          renderUsernameOnMessage
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
});
