// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwenFPidxY2Q_lP8K38DyABfytsXUESh0",
  authDomain: "just-chef-it.firebaseapp.com",
  projectId: "just-chef-it",
  storageBucket: "just-chef-it.firebasestorage.app",
  messagingSenderId: "957261406434",
  appId: "1:957261406434:web:6521d6200b2f4f49a97ebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export { app, provider, db };