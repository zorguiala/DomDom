import { useState, useCallback } from "react";

interface UseSearchResult<T> {
  searchText: string;
  setSearchText: (text: string) => void;
  filteredItems: T[];
}

/**
 * A custom hook for handling search functionality
 * @param items The array of items to filter
 * @param filterFn The function to use for filtering items based on search text
 * @returns An object containing search text, setter, and filtered items
 */
export const useSearch = <T,>(
  items: T[],
  filterFn: (item: T, searchText: string) => boolean
): UseSearchResult<T> => {
  const [searchText, setSearchText] = useState("");

  const filteredItems = useCallback(
    () => items.filter((item) => filterFn(item, searchText)),
    [items, searchText, filterFn]
  )();

  return {
    searchText,
    setSearchText,
    filteredItems,
  };
};
