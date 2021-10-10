// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { Messwert } from "./messwert";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAo7MNX8AOsA86YsXehy3-_2Osi5bx1OM",
  authDomain: "mittelwert.firebaseapp.com",
  databaseURL:
    "https://mittelwert-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mittelwert",
  storageBucket: "mittelwert.appspot.com",
  messagingSenderId: "138539764615",
  appId: "1:138539764615:web:15e7b26f5660d175bca122"
};

export function init() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log(app.options.projectId);
}
export function writeStationsData(
  station: string,
  component: string,
  values: Messwert[]
) {
  const db = getDatabase();

  set(ref(db, station), {
    component: {
      ...values
    }
  })
    .then(() => {
      console.info("Data successfully saved!");
    })
    .catch((error) => {
      console.error(error);
    });
}
