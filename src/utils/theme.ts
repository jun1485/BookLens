// 앱 전체에서 사용하는 테마 상수 정의
export const THEME = {
  primary: "#6200EE", // 메인 컬러
  secondary: "#03DAC6", // 포인트 컬러
  background: "#FFFFFF", // 배경 색상
  text: "#1F1F1F", // 텍스트 컬러
  inactive: "#9E9E9E", // 비활성화 아이콘 색상
  card: "#FFFFFF", // 카드 배경 색상
  success: "#4CAF50", // 성공/완료 색상
  error: "#F44336", // 오류 색상
  warning: "#FFC107", // 경고 색상
  info: "#2196F3", // 정보 색상
};

// 테마 색상 이름으로 접근할 수 있는 함수
export const getColor = (colorName: keyof typeof THEME): string => {
  return THEME[colorName];
};
