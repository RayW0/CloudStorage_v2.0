import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from 'firebaseConfig';

export const getUserFiles = async (userId, directory) => {
  const filesCollection = collection(db, 'files');
  const q = query(
    filesCollection,
    where('ownerId', '==', userId),
    where('directory', '==', directory)
  );
  const querySnapshot = await getDocs(q);
  const files = [];
  querySnapshot.forEach((doc) => {
    files.push({ id: doc.id, ...doc.data() });
  });
  return files;
};
