// src/hooks/useSort.js
import { useState, useMemo } from 'react';

const useSort = (files, sortField, sortOrder) => {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [files, sortField, sortOrder]);

  return sortedFiles;
};

export default useSort;
