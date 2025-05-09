import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 서버 URL (실제 배포 시 변경해야 함)
const SOCKET_URL = "http://localhost:3000";

// 개발 모드에서 실제 서버 연결 여부 설정 (false면 가상 서비스 사용)
const USE_REAL_SERVER = false;

// 메시지 로컬 처리 활성화 여부 (false일 경우 서버 응답만 처리)
// 이 옵션을 추가하여 메시지 중복 처리 문제 해결
const HANDLE_MESSAGE_LOCALLY = false; // 중복 메시지 방지를 위해 비활성화

// 간단한 이벤트 에미터 구현
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter((l) => l !== listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;
    this.events[event].forEach((listener) => {
      listener(...args);
    });
    return true;
  }

  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }
}

// 가상 소켓 서비스 (실제 서버 없을 때 대체용)
class MockSocketService extends SimpleEventEmitter {
  id: string = `mock-${Date.now()}`;
  connected: boolean = true;

  emit(event: string, ...args: any[]): boolean {
    // 마지막 인자가 함수인 경우 콜백으로 간주
    const lastArg = args[args.length - 1];
    if (typeof lastArg === "function") {
      const callback = args.pop();
      callback({ status: "ok" });
    }
    // 이벤트 전달
    return super.emit(event, ...args);
  }

  disconnect(): this {
    this.connected = false;
    this.emit("disconnect");
    return this;
  }
}

class SocketService {
  public socket: Socket | MockSocketService | null = null;
  private username: string | null = null;
  private mockEmitter: MockSocketService | null = null;

  // 소켓 연결 초기화
  async initialize(): Promise<Socket | MockSocketService> {
    if (this.socket) {
      return this.socket;
    }

    try {
      // 사용자 이름 가져오기
      this.username = await AsyncStorage.getItem("username");

      if (USE_REAL_SERVER) {
        // 실제 서버에 연결 시도
        try {
          this.socket = io(SOCKET_URL, {
            transports: ["websocket"],
            query: {
              username: this.username || "Anonymous User",
            },
            timeout: 5000, // 5초 타임아웃
          });

          this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket?.id);
          });

          this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
          });

          this.socket.on("error", (error) => {
            console.error("Socket error:", error);
          });

          return this.socket;
        } catch (error) {
          console.error("Socket connection failed, using mock service", error);
          return this.initMockService();
        }
      } else {
        // 개발용 가상 서비스 사용
        console.log("Using mock socket service (development mode)");
        return this.initMockService();
      }
    } catch (error) {
      console.error("Socket initialization error:", error);
      return this.initMockService();
    }
  }

  // 가상 소켓 서비스 초기화
  private initMockService(): MockSocketService {
    if (!this.mockEmitter) {
      console.log("Initializing mock socket service");
      this.mockEmitter = new MockSocketService();
      this.socket = this.mockEmitter;

      // 몇 초 후에 연결 이벤트 발생시키기
      setTimeout(() => {
        this.mockEmitter?.emit("connect");
      }, 500);
    }
    return this.mockEmitter;
  }

  // 특정 토론방 참여
  joinDiscussion(discussionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }

      this.socket.emit("joinDiscussion", { discussionId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          // 가상 서비스인 경우 모의 참가자 이벤트 발생
          if (!USE_REAL_SERVER && this.mockEmitter) {
            setTimeout(() => {
              this.mockEmitter?.emit("participantUpdate", {
                id: "mock-user-1",
                username: "새로운참가자",
                isTyping: false,
              });
            }, 2000);
          }
          resolve();
        }
      });
    });
  }

  // 토론방 떠나기
  leaveDiscussion(discussionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }

      this.socket.emit("leaveDiscussion", { discussionId }, () => {
        resolve();
      });
    });
  }

  // 메시지 보내기
  sendMessage(discussionId: string, message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not initialized"));
        return;
      }

      const messageData = {
        discussionId,
        message,
        username: this.username || "익명 사용자",
        timestamp: new Date().toISOString(),
        id: `msg-${Date.now()}`, // 고유 ID 생성
      };

      this.socket.emit("sendMessage", messageData, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          // 가상 서비스인 경우 모의 메시지 이벤트 발생
          if (!USE_REAL_SERVER && this.mockEmitter) {
            // 중복 메시지 방지: 로컬 처리 옵션이 활성화된 경우에만 이벤트 발생
            if (!HANDLE_MESSAGE_LOCALLY) {
              setTimeout(() => {
                const mockMessage = {
                  ...messageData,
                  user: {
                    id: "current_user_id",
                    avatar: "https://via.placeholder.com/100",
                  },
                };
                this.mockEmitter?.emit("newMessage", mockMessage);
              }, 500);
            }
          }
          resolve();
        }
      });
    });
  }

  // 연결 해제
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.mockEmitter = null;
  }
}

export default new SocketService();
