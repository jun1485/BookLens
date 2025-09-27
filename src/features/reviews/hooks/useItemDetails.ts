import { useState, useEffect } from "react";

import { ItemDetails, ItemType } from "../../../types/itemTypes";
import { movieService } from "../../movies/api/movieService";
import { bookService } from "../../books/api/bookService";

/**
 * 영화/책 아이템의 제목을 가져오는 훅
 * @param itemType 아이템 타입 ("movie" | "book")
 * @param itemId 아이템 ID (영화 ID 또는 ISBN)
 * @returns 아이템 상세 정보 객체와 로딩 상태
 */
export const useItemDetails = (
  itemType: ItemType,
  itemId: string | number
): ItemDetails => {
  const [details, setDetails] = useState<ItemDetails>({
    id: itemId,
    type: itemType,
    title:
      itemType === "movie" ? `영화 (ID: ${itemId})` : `책 (ISBN: ${itemId})`,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchItemDetails = async () => {
      // ID가 없으면 무시
      if (!itemId) {
        setDetails((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        if (itemType === "movie") {
          // 영화 정보 가져오기
          const movieData = await movieService.getMovieDetails(Number(itemId));
          if (movieData && movieData.title) {
            setDetails({
              id: itemId,
              type: "movie",
              title: movieData.title,
              loading: false,
              error: false,
            });
          } else {
            throw new Error("영화 제목을 가져올 수 없습니다");
          }
        } else {
          // 책 정보 가져오기
          const searchResult = await bookService.searchBooks(`isbn:${itemId}`);
          if (
            searchResult.results.length > 0 &&
            searchResult.results[0].title
          ) {
            setDetails({
              id: itemId,
              type: "book",
              title: searchResult.results[0].title,
              loading: false,
              error: false,
            });
          } else {
            throw new Error("책 제목을 가져올 수 없습니다");
          }
        }
      } catch (err) {
        console.error(`제목 가져오기 오류 (${itemType} ${itemId}):`, err);
        setDetails({
          id: itemId,
          type: itemType,
          title:
            itemType === "movie"
              ? `영화 (ID: ${itemId})`
              : `책 (ISBN: ${itemId})`,
          loading: false,
          error: true,
        });
      }
    };

    fetchItemDetails();
  }, [itemId, itemType]);

  return details;
};

/**
 * 여러 아이템의 제목을 한번에 관리하는 유틸리티 함수
 * @returns 각 아이템의 제목
 */
export const getItemTitleFetcher = () => {
  const fetchItemTitle = async (
    itemType: ItemType,
    itemId: string | number
  ): Promise<string> => {
    try {
      if (itemType === "movie") {
        const movieData = await movieService.getMovieDetails(Number(itemId));
        return movieData?.title || `영화 (ID: ${itemId})`;
      } else {
        const searchResult = await bookService.searchBooks(`isbn:${itemId}`);
        return searchResult.results.length > 0
          ? searchResult.results[0].title
          : `책 (ISBN: ${itemId})`;
      }
    } catch (err) {
      console.error(`제목 가져오기 오류 (${itemType} ${itemId}):`, err);
      return itemType === "movie"
        ? `영화 (ID: ${itemId})`
        : `책 (ISBN: ${itemId})`;
    }
  };

  return { fetchItemTitle };
};
