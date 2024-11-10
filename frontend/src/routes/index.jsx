import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import FilesRoutes from './FilesRoutes';
import UserMenuRoutes from './UserMenuRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([ MainRoutes, LoginRoutes, FilesRoutes, UserMenuRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
