import { getStorage, ref, getDownloadURL } from "firebase/storage";
import getStorageReference from "./storageRef"; // Предполагаем, что эта функция возвращает `filePath`

const fileDownloadURL = async (file) => {
  try {
    const storage = getStorage();

    // Получаем путь к файлу
    const { filePath } = await getStorageReference(file); // Убедись, что `getStorageReference` возвращает объект с `filePath`
    console.log("Путь к файлу:", filePath);

    // Получаем ссылку на загрузку
    const downloadURL = await getDownloadURL(ref(storage, filePath));
    console.log("URL для загрузки файла:", downloadURL);

    // Загружаем файл как Blob и инициируем скачивание
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = (event) => {
      const blob = xhr.response;
      console.log("Файл загружен в виде blob:", blob);

      // Создаем временный URL для скачивания
      const url = URL.createObjectURL(blob);
      
      // Создаем ссылку для скачивания и инициируем клик
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name; // Устанавливаем имя файла для скачивания
      document.body.appendChild(a);
      a.click();

      // Очищаем после скачивания
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    xhr.open("GET", downloadURL);
    xhr.send();

    return downloadURL;

  } catch (error) {
    console.error("Ошибка при получении URL для загрузки файла:", error);
    throw error;
  }
};

export default fileDownloadURL;
