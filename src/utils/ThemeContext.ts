import React from "react";
import { THEME } from "./theme";

// Theme 타입 정의 (theme.ts의 THEME 객체와 동일한 구조)
export type ThemeType = typeof THEME;

// 기본값으로 theme.ts의 THEME 객체를 사용하는 컨텍스트 생성
export const ThemeContext = React.createContext<ThemeType>(THEME);

// ThemeContext를 사용하기 위한 커스텀 훅
export const useTheme = () => React.useContext(ThemeContext);
