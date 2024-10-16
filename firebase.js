// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

// Firebase configuration (replace with your own details)
const firebaseConfig = {
  apiKey: "AIzaSyCXen53Z5J17EhplODfxbFfi_9tYg9MNys",
  authDomain: "deee-89f7f.firebaseapp.com",
  databaseURL: "https://deeee-7de98-default-rtdb.asia-southeast1.firebasedatabase.app/",  // Add the database URL
  projectId: "deee-89f7f",
  storageBucket: "deee-89f7f.appspot.com",
  messagingSenderId: "624913459521",
  appId: "1:624913459521:web:c64f417a61a3ea360499c0"
};

// Initialize Firebase and Realtime Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };