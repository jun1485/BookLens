import { useState, useEffect } from "react";
import { movieService, bookService } from "../services/api";
import { ItemDetails, ItemType, ItemTitleCache } from "../types/itemTypes";

const itemTitleCache: ItemTitleCache = {};

const createCacheKey = (itemType: ItemType, itemId: string | number) =>
  `${itemType}_${String(itemId)}`;

const getFallbackTitle = (itemType: ItemType, itemId: string | number) =>
  itemType === "movie"
    ? `영화 (ID: ${itemId})`
    : `책 (ISBN: ${itemId})`;

const hasValidItemId = (itemId: string | number): boolean => {
  if (itemId === null || itemId === undefined) {
    return false;
  }

  if (typeof itemId === "string") {
    return itemId.trim().length > 0;
  }

  return true;
};

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
  const [details, setDetails] = useState<ItemDetails>(() => {
    const fallbackTitle = getFallbackTitle(itemType, itemId);

    if (!hasValidItemId(itemId)) {
      return {
        id: itemId,
        type: itemType,
        title: fallbackTitle,
        loading: false,
        error: false,
      };
    }

    const cacheKey = createCacheKey(itemType, itemId);
    const cachedTitle = itemTitleCache[cacheKey];

    return {
      id: itemId,
      type: itemType,
      title: cachedTitle ?? fallbackTitle,
      loading: !cachedTitle,
      error: false,
    };
  });

  useEffect(() => {
    let isActive = true;
    const fallbackTitle = getFallbackTitle(itemType, itemId);
    const cacheKey = createCacheKey(itemType, itemId);
    const shouldFetch = hasValidItemId(itemId);

    if (!shouldFetch) {
      setDetails({
        id: itemId,
        type: itemType,
        title: fallbackTitle,
        loading: false,
        error: false,
      });

      return () => {
        isActive = false;
      };
    }

    const cachedTitle = itemTitleCache[cacheKey];
    if (cachedTitle) {
      setDetails({
        id: itemId,
        type: itemType,
        title: cachedTitle,
        loading: false,
        error: false,
      });

      return () => {
        isActive = false;
      };
    }

    setDetails({
      id: itemId,
      type: itemType,
      title: fallbackTitle,
      loading: true,
      error: false,
    });

    const fetchItemDetails = async () => {
      try {
        if (itemType === "movie") {
          const movieId = Number(itemId);
          if (!Number.isFinite(movieId)) {
            throw new Error(`유효하지 않은 영화 ID: ${itemId}`);
          }

          const movieData = await movieService.getMovieDetails(movieId);
          const movieTitle = movieData?.title ? movieData.title.trim() : "";
          const resolvedTitle = movieTitle || fallbackTitle;

          if (movieTitle) {
            itemTitleCache[cacheKey] = movieTitle;
          }

          if (isActive) {
            setDetails({
              id: itemId,
              type: "movie",
              title: resolvedTitle,
              loading: false,
              error: false,
            });
          }
        } else {
          const searchResult = await bookService.searchBooks(`isbn:${itemId}`);
          const firstBookWithTitle = searchResult.results.find(
            (book) => book.title && book.title.trim().length > 0
          );
          const bookTitle = firstBookWithTitle
            ? firstBookWithTitle.title.trim()
            : "";
          const resolvedTitle = bookTitle || fallbackTitle;

          if (bookTitle) {
            itemTitleCache[cacheKey] = bookTitle;
          }

          if (isActive) {
            setDetails({
              id: itemId,
              type: "book",
              title: resolvedTitle,
              loading: false,
              error: false,
            });
          }
        }
      } catch (err) {
        console.error(`제목 가져오기 오류 (${itemType} ${itemId}):`, err);
        if (isActive) {
          setDetails({
            id: itemId,
            type: itemType,
            title: fallbackTitle,
            loading: false,
            error: true,
          });
        }
      }
    };

    fetchItemDetails();

    return () => {
      isActive = false;
    };
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
    const fallbackTitle = getFallbackTitle(itemType, itemId);

    if (!hasValidItemId(itemId)) {
      return fallbackTitle;
    }

    const cacheKey = createCacheKey(itemType, itemId);
    const cachedTitle = itemTitleCache[cacheKey];
    if (cachedTitle) {
      return cachedTitle;
    }

    try {
      if (itemType === "movie") {
        const movieId = Number(itemId);
        if (!Number.isFinite(movieId)) {
          throw new Error(`유효하지 않은 영화 ID: ${itemId}`);
        }

        const movieData = await movieService.getMovieDetails(movieId);
        const movieTitle = movieData?.title ? movieData.title.trim() : "";

        if (movieTitle) {
          itemTitleCache[cacheKey] = movieTitle;
          return movieTitle;
        }
      } else {
        const searchResult = await bookService.searchBooks(`isbn:${itemId}`);
        const firstBookWithTitle = searchResult.results.find(
          (book) => book.title && book.title.trim().length > 0
        );
        const bookTitle = firstBookWithTitle
          ? firstBookWithTitle.title.trim()
          : "";

        if (bookTitle) {
          itemTitleCache[cacheKey] = bookTitle;
          return bookTitle;
        }
      }
    } catch (err) {
      console.error(`제목 가져오기 오류 (${itemType} ${itemId}):`, err);
    }

    return fallbackTitle;
  };

  return { fetchItemTitle };
};
