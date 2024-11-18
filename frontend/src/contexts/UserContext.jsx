// src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import useUserProfile from 'hooks/useUserProfile';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const { userName, userEmail, userPosition, profilePic, userBio, userPhone } = useUserProfile();
  const [formData, setFormData] = useState({
    email: '',
    position: '',
    profile_pic: '',
    userbio: '',
    userphone: ''
  });

  useEffect(() => {
    setFormData({
      username: userName,
      email: userEmail,
      position: userPosition,
      profile_pic: profilePic,
      userbio: userBio,
      userphone: userPhone
    });
  }, [userName, userEmail, userPosition, profilePic, userBio, userPhone]);

  return (
    <UserProfileContext.Provider value={{ formData, setFormData }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = () => useContext(UserProfileContext);

// Добавляем экспорт по умолчанию
export default UserProfileProvider;
