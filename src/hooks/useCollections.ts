import { useState, useEffect, useCallback } from "react";
import { Collection } from "../types";
import { collectionStorage } from "../services/storage";
import { generateUUID } from "../utils/helpers";

// 컬렉션 관리 커스텀 훅
export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컬렉션 불러오기
  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedCollections = await collectionStorage.getAll();
      setCollections(fetchedCollections);
      setError(null);
    } catch (err) {
      setError("컬렉션을 불러오는 중 오류가 발생했습니다");
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 새 컬렉션 생성
  const createCollection = useCallback(
    async (name: string): Promise<Collection> => {
      try {
        const newCollection: Collection = {
          id: generateUUID(),
          name,
          items: [],
        };

        await collectionStorage.save(newCollection);

        // 상태 업데이트
        setCollections((prevCollections) => [
          ...prevCollections,
          newCollection,
        ]);

        return newCollection;
      } catch (err) {
        setError("컬렉션을 생성하는 중 오류가 발생했습니다");
        console.error("Error creating collection:", err);
        throw err;
      }
    },
    []
  );

  // 컬렉션 업데이트
  const updateCollection = useCallback(
    async (collection: Collection): Promise<Collection> => {
      try {
        await collectionStorage.save(collection);

        // 상태 업데이트
        setCollections((prevCollections) =>
          prevCollections.map((c) => (c.id === collection.id ? collection : c))
        );

        return collection;
      } catch (err) {
        setError("컬렉션을 업데이트하는 중 오류가 발생했습니다");
        console.error("Error updating collection:", err);
        throw err;
      }
    },
    []
  );

  // 컬렉션 삭제
  const deleteCollection = useCallback(
    async (collectionId: string): Promise<void> => {
      try {
        await collectionStorage.delete(collectionId);

        // 상태 업데이트
        setCollections((prevCollections) =>
          prevCollections.filter((c) => c.id !== collectionId)
        );
      } catch (err) {
        setError("컬렉션을 삭제하는 중 오류가 발생했습니다");
        console.error("Error deleting collection:", err);
        throw err;
      }
    },
    []
  );

  // 컬렉션에 아이템 추가
  const addItemToCollection = useCallback(
    async (
      collectionId: string,
      itemId: string | number,
      itemType: "movie" | "book"
    ): Promise<void> => {
      try {
        await collectionStorage.addItem(collectionId, itemId, itemType);

        // 상태 업데이트
        setCollections((prevCollections) =>
          prevCollections.map((collection) => {
            if (collection.id === collectionId) {
              // 중복 체크
              const itemExists = collection.items.some(
                (item) => item.id === itemId && item.type === itemType
              );

              if (!itemExists) {
                return {
                  ...collection,
                  items: [...collection.items, { id: itemId, type: itemType }],
                };
              }
            }
            return collection;
          })
        );
      } catch (err) {
        setError("아이템을 컬렉션에 추가하는 중 오류가 발생했습니다");
        console.error("Error adding item to collection:", err);
        throw err;
      }
    },
    []
  );

  // 컬렉션에서 아이템 제거
  const removeItemFromCollection = useCallback(
    async (
      collectionId: string,
      itemId: string | number,
      itemType: "movie" | "book"
    ): Promise<void> => {
      try {
        await collectionStorage.removeItem(collectionId, itemId, itemType);

        // 상태 업데이트
        setCollections((prevCollections) =>
          prevCollections.map((collection) => {
            if (collection.id === collectionId) {
              return {
                ...collection,
                items: collection.items.filter(
                  (item) => !(item.id === itemId && item.type === itemType)
                ),
              };
            }
            return collection;
          })
        );
      } catch (err) {
        setError("아이템을 컬렉션에서 제거하는 중 오류가 발생했습니다");
        console.error("Error removing item from collection:", err);
        throw err;
      }
    },
    []
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
