// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'bey-scout.firebaseapp.com',
  projectId: 'bey-scout',
  storageBucket: 'bey-scout.firebasestorage.app',
  messagingSenderId: '779189389844',
  appId: '1:779189389844:web:7c16d2c24f567f042ef501',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
