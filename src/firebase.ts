import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAIz_u0A65vCI8_A4poP5a7RXtT1jiBpB4",
  authDomain: "walkalert-5b03c.firebaseapp.com",
  projectId: "walkalert-5b03c",
  storageBucket: "walkalert-5b03c.firebasestorage.app",
  messagingSenderId: "708181946118",
  appId: "1:708181946118:web:db3a8b1418a0d92c6b7887",
  measurementId: "G-B5X1DBH5CY"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)