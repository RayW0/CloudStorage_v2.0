// src/utils/getFileIcon.js

import React from 'react';
import { Avatar } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const getFileIcon = ({ file }) => {
  if (!file) {
    console.warn('getFileIcon received undefined file');
    return <QuestionMarkIcon sx={{ fontSize: 40 }} />;
  }

  if (file.type === 'folder') {
    return <FolderOutlinedIcon sx={{ fontSize: 40 }} />;
  }

  const extension = file.name?.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return <PictureAsPdfOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    case 'doc':
    case 'docx':
    case 'txt':
      return <DescriptionOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return file.downloadURL ? (
        <Avatar
          variant="rounded"
          src={file.downloadURL}
          sx={{ width: 40, height: 40, mr: 1 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '';
          }}
        />
      ) : (
        <ImageOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />
      );
    case 'mp3':
    case 'wav':
      return <AudiotrackOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    case 'mp4':
    case 'avi':
      return <MovieOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <ArchiveOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    case 'js':
    case 'html':
    case 'css':
    case 'json':
      return <CodeOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
    default:
      return <InsertDriveFileOutlinedIcon sx={{ fontSize: 35, mr: 1 }} />;
  }
};

export default getFileIcon;
