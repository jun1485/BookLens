/**
 * 아이템(영화/책) 관련 타입 정의
 */

// 아이템 타입 구분
export type ItemType = "movie" | "book";

// 아이템 기본 상세 정보 인터페이스
export interface ItemDetails {
  id: string | number;
  type: ItemType;
  title: string;
  loading: boolean;
  error: boolean;
}

// API에서 가져온 영화/책 제목 정보를 저장하기 위한 캐시 아이템 인터페이스
export interface ItemTitleCache {
  [key: string]: string; // key: `${type}_${id}` 형식, value: 제목
}
