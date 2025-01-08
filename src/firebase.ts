import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDZRIA-71yocsJmia2tJr0Qxj1akzV2qIE',
  authDomain: 'feedbackapp-a9394.firebaseapp.com',
  projectId: 'feedbackapp-a9394',
  storageBucket: 'feedbackapp-a9394.firebasestorage.app',
  messagingSenderId: '777203849239',
  appId: '1:777203849239:web:2c9e09a8f782c473856452',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
