// 페이지네이션 + 검색 필터를 묶은 공통 훅.
// 인사·게스트·출입로그 등 테이블 페이지가 동일 패턴을 반복하던 부분을 추출한다.
import { useMemo, useState } from "react";

interface UsePaginatedTableOptions<T> {
  items: T[];
  itemsPerPage: number;
  filterFn?: (item: T, searchTerm: string) => boolean;
}

interface UsePaginatedTableResult<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredItems: T[];
  paginatedItems: T[];
  totalPages: number;
  resetPage: () => void;
}

export function usePaginatedTable<T>({
  items,
  itemsPerPage,
  filterFn,
}: UsePaginatedTableOptions<T>): UsePaginatedTableResult<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!filterFn || !searchTerm.trim()) return items;
    return items.filter((item) => filterFn(item, searchTerm));
  }, [items, searchTerm, filterFn]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const resetPage = () => setCurrentPage(1);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    filteredItems,
    paginatedItems,
    totalPages,
    resetPage,
  };
}
