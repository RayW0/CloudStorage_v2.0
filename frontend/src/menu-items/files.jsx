// assets
import {FolderOutlined, FolderAddOutlined} from '@ant-design/icons';

// icons
const icons = {
    FolderAddOutlined,
    FolderOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const files = {
  id: 'group-files',
  title: 'Файлы',
  type: 'group',
  children: [
    {
      id: 'my-files',
      title: 'Все файлы',
      type: 'item',
      url: '/files',
      icon: icons.FolderOutlined,
      breadcrumbs: true
    },
  ]
};

export default files;
