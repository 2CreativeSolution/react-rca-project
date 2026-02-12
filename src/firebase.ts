import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKFkAh86ge9kZ4zb8i-mW7eN1PuhHRbW0",
  authDomain: "creative-react-rca-project.firebaseapp.com",
  projectId: "creative-react-rca-project",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
