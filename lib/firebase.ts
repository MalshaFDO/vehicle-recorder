import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkb2BV2mT9DjB-MI_aXTD8LidujJW4eb0",
  authDomain: "vehicle-recorder.firebaseapp.com",
  projectId: "vehicle-recorder",
  storageBucket: "vehicle-recorder.firebasestorage.app",
  messagingSenderId: "138077112020",
  appId: "1:138077112020:web:0a1a650c068293d3c8dd41",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);