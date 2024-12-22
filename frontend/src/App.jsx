import { RouterProvider, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';

import router from 'routes';
import ThemeCustomization from 'themes';

import UserProfileProvider from 'contexts/UserContext';
import ScrollTop from 'components/ScrollTop';

export default function App() {
  return (
    <ThemeCustomization>
      <AuthProvider>
        <UserProfileProvider>
          <ScrollTop>
            <ToastContainer />
            <RouterProvider router={router} />
          </ScrollTop>
        </UserProfileProvider>
      </AuthProvider>
    </ThemeCustomization>
  );
}
