// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAk2HotJqwtoL2hgp2jM0EwaGO4LWzRA9A",
  authDomain: "ja-lens.firebaseapp.com",
  projectId: "ja-lens",
  storageBucket: "ja-lens.firebasestorage.app",
  messagingSenderId: "1011947131856",
  appId: "1:1011947131856:web:1ebbcc0adaa13df24b5fd5",
  measurementId: "G-CYKQ4V7JCZ"
};

// INICIALIZAR O FIREBASE
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };