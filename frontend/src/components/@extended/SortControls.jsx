// src/components/SortControls.jsx
import React from 'react';
import { FormControl, Select, MenuItem, InputLabel, Stack } from '@mui/material';

const SortControls = ({ sortField, sortOrder, onSortFieldChange, onSortOrderChange }) => {
  return (
    <Stack direction="row" spacing={2}>
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel id="sort-field-label">Сортировать по</InputLabel>
        <Select
          labelId="sort-field-label"
          value={sortField}
          onChange={onSortFieldChange}
          label="Сортировать по"
        >
          <MenuItem value="name">Имя файла</MenuItem>
          <MenuItem value="size">Размер</MenuItem>
          <MenuItem value="last_modified">Дата изменения</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" sx={{ minWidth: 120 }}>
        <InputLabel id="sort-order-label">Порядок</InputLabel>
        <Select
          labelId="sort-order-label"
          value={sortOrder}
          onChange={onSortOrderChange}
          label="Порядок"
        >
          <MenuItem value="asc">По возрастанию</MenuItem>
          <MenuItem value="desc">По убыванию</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};

export default SortControls;
