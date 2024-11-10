// src/components/GroupsList.jsx
import React from 'react';
import { Box, Typography, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';

const GroupsList = ({ groups, handleDeleteGroup }) => (
  <Box mt={2}>
    <Typography variant="h6">Список групп:</Typography>
    {groups.length > 0 ? (
      groups.map((group) => (
        <Stack
          key={group.id}
          direction="row"
          alignItems="center"
          spacing={1}
          mt={1}
        >
          <Typography>{group.name}</Typography>
          <Tooltip title="Удалить группу">
            <IconButton
              color="error"
              onClick={() => handleDeleteGroup(group.id)}
            >
              <DeleteForever />
            </IconButton>
          </Tooltip>
        </Stack>
      ))
    ) : (
      <Typography variant="body2">Группы не найдены.</Typography>
    )}
  </Box>
);

export default GroupsList;
