import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { app } from "../constants/firebase";

export const uploadFile = async (
  file: File,
  folderName: string,
  replace?: boolean
) => {
  const storage = getStorage(app);

  const name = replace ? file.name : `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folderName}/${name}`);

  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
};

export const deleteFile = async (url: string) => {
  const storage = getStorage(app);

  const storageRef = ref(storage, url);

  try {
    await deleteObject(storageRef);
  } catch (e) {
    console.log("File to delete not found, skipping");
  }
};
