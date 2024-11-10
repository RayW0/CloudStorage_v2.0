import { getStorage, ref } from "firebase/storage";
import getStorageReference from "./storageRef";

const getDownloadRef = async (file) => {

// Create a reference with an initial file path and name
const storage = getStorage();
const filePath = await getStorageReference(file);
// Create a reference from a Google Cloud Storage URI
const gsReference = ref(storage, `gs://mystorage-310d4.firebasestorage.app/${filePath}}`);

// Create a reference from an HTTPS URL
// Note that in the URL, characters are URL escaped!
// const httpsReference = ref(storage, 'https://firebasestorage.googleapis.com/b/bucket/o/images%20stars.jpg'); 

console.log("URL", gsReference);

return gsReference;
};

export default getDownloadRef;

