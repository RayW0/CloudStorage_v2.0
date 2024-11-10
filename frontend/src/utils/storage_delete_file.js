import { getStorage, ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from 'firebaseConfig';

export default async function deleteFile(file) {
  if (file.type === 'file') {
    // Удаление файла из Storage
    const storage = getStorage();
    const fileRef = ref(storage, file.path);
    await deleteObject(fileRef);
  }
  // Удаление записи из Firestore
  await deleteDoc(doc(db, 'files', file.id));
}
