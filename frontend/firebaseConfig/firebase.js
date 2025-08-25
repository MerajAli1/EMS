// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAo9XpMMkXwrId-LY6ngfpQDPmwWmQE9Hk",
  authDomain: "ems-simmulation.firebaseapp.com",
  databaseURL: "https://ems-simmulation-default-rtdb.firebaseio.com",
  projectId: "ems-simmulation",
  storageBucket: "ems-simmulation.firebasestorage.app",
  messagingSenderId: "727941100069",
  appId: "1:727941100069:web:fc5509e5bc01b789c145cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { app, database };