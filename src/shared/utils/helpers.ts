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

// 색상 투명도 헬퍼 함수
export const addAlpha = (color: string, opacity: number): string => {
  // 색상이 #RGB 또는 #RRGGBB 형식인 경우
  if (color.startsWith("#")) {
    let r, g, b;
    if (color.length === 4) {
      // #RGB 형식인 경우 #RRGGBB 형식으로 변환
      r = parseInt(color[1] + color[1], 16);
      g = parseInt(color[2] + color[2], 16);
      b = parseInt(color[3] + color[3], 16);
    } else if (color.length === 7) {
      // #RRGGBB 형식인 경우
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      // 지원하지 않는 형식
      return color;
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // 이미 rgba 형식인 경우 알파값만 변경
  if (color.startsWith("rgba")) {
    return color.replace(/rgba\((.+?),\s*[\d\.]+\)/, `rgba($1, ${opacity})`);
  }
  // rgb 형식인 경우 rgba로 변환
  if (color.startsWith("rgb")) {
    return color.replace(/rgb/, "rgba").replace(/\)/, `, ${opacity})`);
  }

  // 지원하지 않는 형식
  return color;
};
