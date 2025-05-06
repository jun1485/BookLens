// UUID 생성 함수
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 날짜 포맷팅 함수
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// 별점 계산 함수 (평균)
export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // 소수점 첫째 자리까지
};

// TMDB 이미지 URL 생성 함수
export const getTMDBImageUrl = (
  path: string | undefined,
  size: "poster" | "backdrop" = "poster"
): string => {
  if (!path) return "";

  const baseUrl = "https://image.tmdb.org/t/p/";

  // 이미지 크기 설정
  const imageSize = size === "poster" ? "w342" : "w780";

  return `${baseUrl}${imageSize}${path}`;
};

// 텍스트 줄임 함수
export const truncateText = (text: string, maxLength = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// 비슷한 장르 영화/책 찾기 함수
export const findSimilarByGenre = <
  T extends { genres?: { id: number; name: string }[] }
>(
  item: T,
  items: T[],
  limit = 5
): T[] => {
  if (!item.genres || item.genres.length === 0) return [];

  const genreIds = item.genres.map((genre) => genre.id);

  // 현재 아이템 제외하고 장르가 일치하는 아이템들 필터링
  const similarItems = items
    .filter((otherItem) => {
      if (!otherItem.genres) return false;
      // 같은 아이템은 제외
      if (otherItem === item) return false;
      // 공통 장르가 있는지 확인
      return otherItem.genres.some((genre) => genreIds.includes(genre.id));
    })
    .slice(0, limit);

  return similarItems;
};
