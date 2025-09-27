import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Collection } from "../../../types";

// 가상의 컬렉션 데이터
const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "1",
    name: "좋아하는 책",
    items: [
      { id: "9788932917245", type: "book" },
      { id: "9788954699600", type: "book" },
    ],
  },
  {
    id: "2",
    name: "나중에 볼 영화",
    items: [
      { id: 505642, type: "movie" },
      { id: 399566, type: "movie" },
    ],
  },
  {
    id: "3",
    name: "취향 저격",
    items: [
      { id: "9788936434267", type: "book" },
      { id: 675353, type: "movie" },
    ],
  },
];

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컬렉션 목록 가져오기
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);

      // 실제 구현에서는 API를 통해 가져와야 함
      // 임시 구현: AsyncStorage 사용
      const storageKey = "app_collections";
      const storedCollections = await AsyncStorage.getItem(storageKey);

      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
      } else {
        // 초기 데이터가 없는 경우, 가상 데이터 사용
        setCollections(MOCK_COLLECTIONS);
        // 가상 데이터 저장
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(MOCK_COLLECTIONS)
        );
      }

      setError(null);
    } catch (err) {
      console.error("컬렉션을 불러오는 중 오류 발생:", err);
      setError("컬렉션을 불러오는 데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  // 새 컬렉션 생성
  const createCollection = useCallback(
    async (name: string) => {
      try {
        // 빈 이름은 허용하지 않음
        if (!name.trim()) {
          throw new Error("컬렉션 이름을 입력해주세요");
        }

        // 중복 이름 확인
        if (collections.some((c) => c.name === name)) {
          throw new Error("이미 같은 이름의 컬렉션이 있습니다");
        }

        // 새 컬렉션 생성
        const newCollection: Collection = {
          id: `collection_${Date.now()}`,
          name,
          items: [],
        };

        // 컬렉션 목록 업데이트
        const updatedCollections = [...collections, newCollection];

        // AsyncStorage에 저장
        const storageKey = "app_collections";
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCollections)
        );

        // 상태 업데이트
        setCollections(updatedCollections);

        return newCollection;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "컬렉션을 생성하는 데 실패했습니다";
        console.error("컬렉션 생성 중 오류 발생:", err);
        throw new Error(errorMessage);
      }
    },
    [collections]
  );

  // 컬렉션 이름 수정
  const updateCollection = useCallback(
    async (collectionId: string, newName: string) => {
      try {
        // 빈 이름은 허용하지 않음
        if (!newName.trim()) {
          throw new Error("컬렉션 이름을 입력해주세요");
        }

        // 동일한 ID의 컬렉션이 있는지 확인
        const collectionIndex = collections.findIndex(
          (c) => c.id === collectionId
        );
        if (collectionIndex === -1) {
          throw new Error("컬렉션을 찾을 수 없습니다");
        }

        // 다른 컬렉션과 이름 중복 확인
        if (
          collections.some((c) => c.name === newName && c.id !== collectionId)
        ) {
          throw new Error("이미 같은 이름의 컬렉션이 있습니다");
        }

        // 컬렉션 업데이트
        const updatedCollections = [...collections];
        updatedCollections[collectionIndex] = {
          ...updatedCollections[collectionIndex],
          name: newName,
        };

        // AsyncStorage에 저장
        const storageKey = "app_collections";
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCollections)
        );

        // 상태 업데이트
        setCollections(updatedCollections);

        return updatedCollections[collectionIndex];
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "컬렉션을 수정하는 데 실패했습니다";
        console.error("컬렉션 수정 중 오류 발생:", err);
        throw new Error(errorMessage);
      }
    },
    [collections]
  );

  // 컬렉션 삭제
  const deleteCollection = useCallback(
    async (collectionId: string) => {
      try {
        // 해당 컬렉션이 있는지 확인
        if (!collections.some((c) => c.id === collectionId)) {
          throw new Error("컬렉션을 찾을 수 없습니다");
        }

        // 컬렉션 필터링
        const updatedCollections = collections.filter(
          (c) => c.id !== collectionId
        );

        // AsyncStorage에 저장
        const storageKey = "app_collections";
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCollections)
        );

        // 상태 업데이트
        setCollections(updatedCollections);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "컬렉션을 삭제하는 데 실패했습니다";
        console.error("컬렉션 삭제 중 오류 발생:", err);
        throw new Error(errorMessage);
      }
    },
    [collections]
  );

  // 컬렉션에 아이템 추가
  const addItemToCollection = useCallback(
    async (
      collectionId: string,
      itemId: string | number,
      itemType: "movie" | "book"
    ) => {
      try {
        // 해당 컬렉션 찾기
        const collectionIndex = collections.findIndex(
          (c) => c.id === collectionId
        );
        if (collectionIndex === -1) {
          throw new Error("컬렉션을 찾을 수 없습니다");
        }

        const collection = collections[collectionIndex];

        // 이미 해당 아이템이 컬렉션에 있는지 확인
        if (
          collection.items.some(
            (item) => item.id === itemId && item.type === itemType
          )
        ) {
          throw new Error("이미 컬렉션에 추가된 아이템입니다");
        }

        // 아이템 추가
        const updatedCollection = {
          ...collection,
          items: [...collection.items, { id: itemId, type: itemType }],
        };

        // 컬렉션 목록 업데이트
        const updatedCollections = [...collections];
        updatedCollections[collectionIndex] = updatedCollection;

        // AsyncStorage에 저장
        const storageKey = "app_collections";
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCollections)
        );

        // 상태 업데이트
        setCollections(updatedCollections);

        return updatedCollection;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "아이템을 추가하는 데 실패했습니다";
        console.error("아이템 추가 중 오류 발생:", err);
        throw new Error(errorMessage);
      }
    },
    [collections]
  );

  // 컬렉션에서 아이템 제거
  const removeItemFromCollection = useCallback(
    async (
      collectionId: string,
      itemId: string | number,
      itemType: "movie" | "book"
    ) => {
      try {
        // 해당 컬렉션 찾기
        const collectionIndex = collections.findIndex(
          (c) => c.id === collectionId
        );
        if (collectionIndex === -1) {
          throw new Error("컬렉션을 찾을 수 없습니다");
        }

        const collection = collections[collectionIndex];

        // 아이템 필터링
        const updatedItems = collection.items.filter(
          (item) => !(item.id === itemId && item.type === itemType)
        );

        // 아이템이 제거되지 않았다면 오류
        if (updatedItems.length === collection.items.length) {
          throw new Error("해당 아이템을 찾을 수 없습니다");
        }

        // 컬렉션 업데이트
        const updatedCollection = {
          ...collection,
          items: updatedItems,
        };

        // 컬렉션 목록 업데이트
        const updatedCollections = [...collections];
        updatedCollections[collectionIndex] = updatedCollection;

        // AsyncStorage에 저장
        const storageKey = "app_collections";
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedCollections)
        );

        // 상태 업데이트
        setCollections(updatedCollections);

        return updatedCollection;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "아이템을 제거하는 데 실패했습니다";
        console.error("아이템 제거 중 오류 발생:", err);
        throw new Error(errorMessage);
      }
    },
    [collections]
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection,
  };
};
