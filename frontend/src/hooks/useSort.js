// src/hooks/useSort.js
import { useMemo } from 'react';

const useSort = (items, field, order) => {
  return useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn('useSort: items is not an array', items);
      return [];
    }
    return [...items].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, field, order]);
};

export default useSort;
