// src/utils/getFileIcon.js

import React from 'react';
import { Avatar } from '@mui/material'; // Импортируем Avatar
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

/**
 * Функция для получения иконки файла на основе его типа или расширения.
 *
 * @param {Object} file - Объект файла.
 * @param {string} file.type - Тип файла (например, 'file' или 'folder').
 * @param {string} file.name - Имя файла.
 * @param {string} [file.downloadURL] - URL изображения (для аватара).
 * @returns {JSX.Element} - Компонент иконки.
 */
const getFileIcon = (file) => {
  if (file.type === 'folder') {
    return <FolderOutlinedIcon />;
  }

  const extension = file.name.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return <PictureAsPdfOutlinedIcon />;
    case 'doc':
    case 'docx':
    case 'txt':
      return <DescriptionOutlinedIcon />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      // Если у файла есть downloadURL, отображаем Avatar с изображением
      return file.downloadURL ? (
        <Avatar
          variant="square"
          src={file.downloadURL}
          alt={file.name}
          sx={{ width: 24, height: 24, mr: 1 }} // Настройка размера Avatar
        />
      ) : (
        <ImageOutlinedIcon />
      );
    case 'mp3':
    case 'wav':
      return <AudiotrackOutlinedIcon />;
    case 'mp4':
    case 'avi':
      return <MovieOutlinedIcon />;
    case 'zip':
    case 'rar':
    case '7z':
      return <ArchiveOutlinedIcon />;
    case 'js':
    case 'html':
    case 'css':
    case 'json':
      return <CodeOutlinedIcon />;
    case 'deleted':
      return <DeleteOutlineOutlinedIcon />;
    default:
      return <InsertDriveFileOutlinedIcon />;
  }
};

export default getFileIcon;
