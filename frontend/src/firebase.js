
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIz.....xxx",
  authDomain: "personal-gemini-journal-507016.firebaseapp.com",
  projectId: "personal-gemini-journal-507016",
  storageBucket: "personal-gemini-journal-507016.firebasestorage.app",
  messagingSenderId: "73670327451",
  appId: "1:736703....."
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;