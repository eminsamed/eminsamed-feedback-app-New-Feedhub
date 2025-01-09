// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC77TgfF78JTUHywKOer-0C8riM8sr029s',
  authDomain: 'feedback-app-new-feedhub.firebaseapp.com',
  projectId: 'feedback-app-new-feedhub',
  storageBucket: 'feedback-app-new-feedhub.firebasestorage.app',
  messagingSenderId: '720405211140',
  appId: '1:720405211140:web:c0ba257236dbfdb4972d51',
  measurementId: 'G-J4Y5VEQ8XC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
