import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import AdminPanel from 'pages/AdminPanel';
import AdminRoute from 'routes/AdminRoute';
import NotAuthorized from 'pages/NotAuthorized';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'admin',
      element: (
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      )
    },
    {
      path: 'not-authorized',
      element: <NotAuthorized />
    }
  ]
};

export default MainRoutes;
