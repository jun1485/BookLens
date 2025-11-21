export interface User {
  id: string;
  username: string;
  avatar?: string;
}

export interface Message {
  id: string;
  text: string;
  createdAt: Date;
  user: User;
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  contentType: "movie" | "book";
  contentId: string | number;
  contentTitle: string;
  coverImage?: string;
  createdAt: Date;
  createdBy: User;
  participants: number;
  lastMessage?: string;
  lastActivity?: Date;
  isActive: boolean;
}

export interface DiscussionParticipant {
  id: string;
  discussionId: string;
  userId: string;
  username: string;
  joinedAt: Date;
  isTyping: boolean;
  avatar?: string;
  lastSeen?: Date;
}
