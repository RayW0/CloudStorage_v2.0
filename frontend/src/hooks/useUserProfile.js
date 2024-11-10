import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';

export default function useUserProfile() {
  const [userName, setUserName] = useState('Гость');
  const [userEmail, setUserEmail] = useState('');
  const [userStatus, setUserStatus] = useState('Не в сети');
  const [userRole, setUserRole] = useState('Гость');
  const [userPosition, setUserPosition] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [userBio, setUserBio] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [userGroupId, setUserGroupId] = useState('');
  const [userGroupName, setUserGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || 'Гость');
        setUserEmail(user.email || '');

        try {
          await user.getIdToken(true);
          const token = await user.getIdTokenResult();
          setUserRole(token.claims.admin ? 'admin' : 'user'); // Предполагается, что роль админа определяется через кастомные утверждения

          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPosition(userData.position || 'не указано');
            setProfilePic(userData.profile_pic || '');
            setUserBio(userData.userbio || '');
            setUserPhone(userData.userphone || '');
            setIsBlocked(userData.isBlocked || false);
            setUserGroupId(userData.group || '');
            setUserStatus(userData.status || 'online');

            if (userData.group) {
              const groupDocRef = doc(db, 'groups', userData.group);
              const groupDoc = await getDoc(groupDocRef);
              if (groupDoc.exists()) {
                setUserGroupName(groupDoc.data().name);
              } else {
                setUserGroupName('Неизвестная группа');
              }
            } else {
              setUserGroupName('');
            }
          } else {
            // Если документ пользователя не найден, сбросить состояния
            setUserPosition('');
            setProfilePic('');
            setUserBio('');
            setUserPhone('');
            setIsBlocked(false);
            setUserGroupId('');
            setUserGroupName('');
            setUserStatus('Не в сети');
          }
        } catch (error) {
          console.error('Ошибка при получении данных:', error);
        }
      } else {
        // Если пользователь не аутентифицирован, сбросить все состояния
        setUserName('Гость');
        setUserEmail('');
        setUserRole('Гость');
        setUserPosition('');
        setProfilePic('');
        setUserBio('');
        setUserPhone('');
        setIsBlocked(false);
        setUserGroupId('');
        setUserGroupName('');
        setUserStatus('Не в сети');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    userName,
    userEmail,
    userStatus,
    userRole,
    userPosition,
    profilePic,
    userBio,
    userPhone,
    isBlocked,
    userGroupId,
    userGroupName,
    isLoading
  };
}
