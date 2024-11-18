// src/components/LatestFilesWidget.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { CardContent, Typography, Stack, Grow, useTheme, Box, List, ListItem, ListItemIcon, ListItemText, Avatar, CardActions, Button } from '@mui/material';
import { FileOutlined, InfoOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';

export default function LatestFilesWidget({ files, link }) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Grow in>
      <MainCard
        sx={{
          minWidth: { xs: '100%', sm: 275 },
          maxWidth: 350,
          mb: 3,
          cursor: 'pointer',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[8]
          },
          borderRadius: 4,
          position: 'relative',
          background: `linear-gradient(135deg, ${theme.palette.grey[200]} 30%, ${theme.palette.grey[400]} 90%)`,
          color: theme.palette.text.primary,
          overflow: 'hidden'
        }}
        elevation={3}
      >
        <CardContent>
          <Stack direction="column" spacing={2} alignItems="flex-start">
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Последние загруженные файлы
              <InfoOutlined
                style={{
                  marginLeft: 8,
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: theme.palette.text.secondary,
                  verticalAlign: 'middle'
                }}
              />
            </Typography>
            <List dense>
              {files && files.length > 0 ? (
                files.map((file, index) => (
                  <ListItem key={file.name + index} sx={{ paddingLeft: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: theme.palette.common.white, color: theme.palette.grey[800] }}>
                        <FileOutlined />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`Загружен: ${new Date(file.uploadDate).toLocaleDateString()}`}
                      primaryTypographyProps={{
                        variant: 'body1',
                        sx: { color: theme.palette.text.secondary }
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        sx: { color: theme.palette.text.disabled }
                      }}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Нет загруженных файлов.
                </Typography>
              )}
            </List>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', paddingRight: 2, paddingBottom: 1 }}>
          <Button
            size="small"
            sx={{
              color: theme.palette.grey[700],
              borderColor: theme.palette.grey[700],
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
            variant="outlined"
            onClick={() => navigate(link)}
          >
            Все файлы
          </Button>
        </CardActions>
      </MainCard>
    </Grow>
  );
}

LatestFilesWidget.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      uploadDate: PropTypes.string.isRequired
    })
  ),
  link: PropTypes.string
};

LatestFilesWidget.defaultProps = {
  files: [],
  link: '/files'
};
