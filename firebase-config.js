
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS0cy0pmEdPR0oZF_rERs_HKS4rCJgdUw",
    authDomain: "my-lyf-efa0d.firebaseapp.com",
    projectId: "my-lyf-efa0d",
    storageBucket: "my-lyf-efa0d.firebasestorage.app",
    messagingSenderId: "230178951574",
    appId: "1:230178951574:web:6f3ce8026c34ffa25a0db7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the firestore instance
export { db };
