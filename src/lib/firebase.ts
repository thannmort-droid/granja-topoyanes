import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzJt2tcsAdbA_xCmNtT72YAWyCc5RTu4o",
  authDomain: "granja-topoyanes.firebaseapp.com",
  projectId: "granja-topoyanes",
  storageBucket: "granja-topoyanes.firebasestorage.app",
  messagingSenderId: "734244939812",
  appId: "1:734244939812:web:774812041a363e904c90b1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);