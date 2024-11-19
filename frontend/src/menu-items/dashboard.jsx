// assets
import DashboardIcon from '@mui/icons-material/Dashboard';
// icons
const icons = {
  DashboardIcon,
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Навигация',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Виджеты',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardIcon,
      breadcrumbs: true
    }
  ]
};

export default dashboard;
