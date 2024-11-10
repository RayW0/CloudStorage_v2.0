// assets
import { FolderOutlined, FolderAddOutlined } from '@ant-design/icons';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// icons
const icons = {
  FolderAddOutlined,
  FolderOutlined,
  DeleteOutlineIcon
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
    {
      id: 'trash',
      title: 'Корзина',
      type: 'item',
      url: '/trash',
      icon: icons.DeleteOutlineIcon,
      breadcrumbs: true
    }
  ]
};

export default files;
