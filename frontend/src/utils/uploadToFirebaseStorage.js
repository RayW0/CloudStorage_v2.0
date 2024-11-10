import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

export default async function uploadToStorage(file, directory) {
  const auth = getAuth();
  const userId = auth.currentUser.uid;
  const storage = getStorage();
  const storageRef = ref(storage, `user_files/${userId}${directory}${file.name}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return {
    downloadURL,
    filePath: storageRef.fullPath
  };
}
