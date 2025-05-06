import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    const iconName =
      i <= rating ? "star" : i - 0.5 <= rating ? "star-half" : "star-outline";

    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => handleStarPress(i)}
        disabled={disabled}
        style={[styles.starContainer, { padding: size / 8 }]}
      >
        <Ionicons name={iconName} size={size} color="#FFC107" />
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starContainer: {
    padding: 3,
  },
});
