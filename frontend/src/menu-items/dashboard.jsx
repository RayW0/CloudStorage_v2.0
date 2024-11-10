// assets
import { DashboardOutlined, SettingOutlined } from '@ant-design/icons';
// icons
const icons = {
  DashboardOutlined,
  SettingOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Навигация',
  type: 'group',
  children: [
    {
      id: 'admin-panel',
      title: 'Админ панель',
      type: 'item',
      url: '/admin',
      icon: icons.SettingOutlined,
      breadcrumbs: false
    },
    {
      id: 'dashboard',
      title: 'Виджеты',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
