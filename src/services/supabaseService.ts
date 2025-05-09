import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

// Supabase URL과 API 키 설정 (실제 값으로 변경 필요)
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

// Supabase 클라이언트 생성
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 채팅 메시지 타입 정의
export interface ChatMessage {
  id: string;
  discussion_id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  avatar_url?: string;
}

// 사용자 타입 정의
export interface ChatUser {
  id: string;
  username: string;
  avatar_url?: string;
}

class SupabaseService {
  // 현재 사용자 정보
  private currentUser: ChatUser | null = null;

  // 초기화 함수
  async initialize(): Promise<ChatUser> {
    try {
      // 저장된 사용자 정보 불러오기
      const username = await AsyncStorage.getItem("username");
      const userId =
        (await AsyncStorage.getItem("userId")) || `user-${Date.now()}`;

      this.currentUser = {
        id: userId,
        username: username || "익명 사용자",
      };

      // 사용자 ID가 없으면 저장
      if (!(await AsyncStorage.getItem("userId"))) {
        await AsyncStorage.setItem("userId", userId);
      }

      return this.currentUser;
    } catch (error) {
      console.error("Supabase 초기화 오류:", error);
      throw error;
    }
  }

  // 토론방 메시지 구독
  subscribeToDiscussion(
    discussionId: string,
    onNewMessage: (message: ChatMessage) => void
  ): () => void {
    try {
      // Supabase Realtime 구독 설정
      const subscription = supabase
        .channel(`discussion:${discussionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `discussion_id=eq.${discussionId}`,
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            onNewMessage(newMessage);
          }
        )
        .subscribe();

      // 구독 해제 함수 반환
      return () => {
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.error("메시지 구독 오류:", error);
      return () => {}; // 빈 함수 반환
    }
  }

  // 토론방 메시지 불러오기
  async getMessages(discussionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("메시지 조회 오류:", error);
      return [];
    }
  }

  // 메시지 전송
  async sendMessage(
    discussionId: string,
    message: string
  ): Promise<ChatMessage | null> {
    try {
      if (!this.currentUser) {
        throw new Error("사용자 정보가 없습니다");
      }

      const messageData = {
        discussion_id: discussionId,
        user_id: this.currentUser.id,
        username: this.currentUser.username,
        message,
        avatar_url: this.currentUser.avatar_url,
      };

      const { data, error } = await supabase
        .from("chat_messages")
        .insert(messageData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      return null;
    }
  }

  // 토론방 참가자 목록 가져오기
  async getParticipants(discussionId: string): Promise<ChatUser[]> {
    try {
      // 고유한 사용자 ID 목록 가져오기
      const { data, error } = await supabase
        .from("chat_messages")
        .select("user_id, username, avatar_url")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // 중복 제거
      const uniqueUsers = data.reduce(
        (acc: Record<string, ChatUser>, current) => {
          if (!acc[current.user_id]) {
            acc[current.user_id] = {
              id: current.user_id,
              username: current.username,
              avatar_url: current.avatar_url,
            };
          }
          return acc;
        },
        {}
      );

      return Object.values(uniqueUsers);
    } catch (error) {
      console.error("참가자 목록 조회 오류:", error);
      return [];
    }
  }
}

export default new SupabaseService();
