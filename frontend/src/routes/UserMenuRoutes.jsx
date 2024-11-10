import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';

const ViewProfile = Loadable(lazy(() => import('pages/profile/UserProfile')));



// ==============================|| MAIN ROUTING ||============================== //

const UserMenuRoutes = {
  path: '/',
  element: <Dashboard />,
  children: [
    {
      path: '/user/view-profile',
      element: <ViewProfile />
    },
    
  ]
};

export default UserMenuRoutes;
