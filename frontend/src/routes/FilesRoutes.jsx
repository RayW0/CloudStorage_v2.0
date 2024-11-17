import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import Trash from 'pages/files/Trash';

// render - login
const MyFiles = Loadable(lazy(() => import('pages/files/myfiles')));
// ==============================|| AUTH ROUTING ||============================== //

const FilesRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/files',
      element: <MyFiles />
    },
    {
      path: '/trash',
      element: <Trash />
    }
  ]
};

export default FilesRoutes;
