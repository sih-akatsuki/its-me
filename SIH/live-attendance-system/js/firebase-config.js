// Firebase Configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk4xN4mLNimsneepSdTXG0lW-tQ6P95aM",
  authDomain: "me-db-935fe.firebaseapp.com",
  projectId: "me-db-935fe",
  storageBucket: "me-db-935fe.firebasestorage.app",
  messagingSenderId: "68235812298",
  appId: "1:68235812298:web:8eaae3c5c109514e8a8333"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Collections
const ATTENDANCE_SESSION_COLLECTION = 'attendance_sessions';
const ATTENDANCE_RECORDS_COLLECTION = 'attendance_records';