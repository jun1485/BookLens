import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../utils/theme";

// 테마 컬러
const COLORS = {
  starFilled: THEME.warning,
  starEmpty: "#E0E0E0",
};

type StarRatingProps = {
  maxStars?: number;
  rating: number;
  size?: number;
  disabled?: boolean;
  onRatingChange?: (rating: number) => void;
};

export const StarRating: React.FC<StarRatingProps> = ({
  maxStars = 5,
  rating,
  size = 24,
  disabled = false,
  onRatingChange,
}) => {
  // 별점 아이콘 배열 생성
  const stars = [];

  const handleStarPress = (selectedRating: number) => {
    if (!disabled && onRatingChange) {
      // 이미 선택된 별을 클릭하면 선택 해제
      if (selectedRating === rating) {
        onRatingChange(0);
      } else {
        onRatingChange(selectedRating);
      }
    }
  };

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= rating;
    const isHalfFilled = !isFilled && i - 0.5 <= rating;

    const iconName = isFilled
      ? "star"
      : isHalfFilled
      ? "star-half"
      : "star-outline";
    const starColor =
      isFilled || isHalfFilled ? COLORS.starFilled : COLORS.starEmpty;

    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => handleStarPress(i)}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.6}
        style={[styles.starContainer, { padding: size / 8 }]}
      >
        <Ionicons
          name={iconName}
          size={size}
          color={starColor}
          style={styles.starIcon}
        />
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  starContainer: {
    padding: 3,
  },
  starIcon: {
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
});
