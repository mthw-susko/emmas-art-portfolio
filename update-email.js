// Script to update email in Firebase
// Run with: node update-email.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAL8hB_W_wZjMNxcbXrVeza4HSRkeiBtRE",
  authDomain: "emmas-art-portfolio.firebaseapp.com",
  projectId: "emmas-art-portfolio",
  storageBucket: "emmas-art-portfolio.firebasestorage.app",
  messagingSenderId: "85845530953",
  appId: "1:85845530953:web:5e2dc24f537bf33182e298"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateEmail() {
  try {
    const aboutDoc = doc(db, 'about', 'content');
    await updateDoc(aboutDoc, {
      email: 'emmafleming@icloud.com'
    });
    console.log('Email updated successfully!');
  } catch (error) {
    console.error('Error updating email:', error);
  }
}

updateEmail();
