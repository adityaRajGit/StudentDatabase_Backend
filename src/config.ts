import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA11QGu0-q0fUkJKykLtbCLyRP3Wzqnu2E",
  authDomain: "type-player.firebaseapp.com",
  projectId: "type-player",
  storageBucket: "type-player.appspot.com",
  messagingSenderId: "1019284704362",
  appId: "1:1019284704362:web:7d73171038c5d27a5a8e13",
  measurementId: "G-6G2JH1CG8V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);