// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMMSmdCaAst_ipeOCISBs2yDCE3p-53_4",
  authDomain: "eclipse-fce67.firebaseapp.com",
  projectId: "eclipse-fce67",
  storageBucket: "eclipse-fce67.appspot.com",
  messagingSenderId: "68694074104",
  appId: "1:68694074104:web:2ac394fb0bd8300971910d",
  measurementId: "G-ZBPEFGMTW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const analytics = getAnalytics(app);