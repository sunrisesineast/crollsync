// Firebase configuration template for Crunchyroll Sync Extension
// 
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to 'firebase-config.js'
// 2. Go to https://console.firebase.google.com/
// 3. Create a new project or select your existing project
// 4. Go to Project Settings > General
// 5. Scroll down to "Your apps" section
// 6. Click "Add app" > Web app
// 7. Copy the configuration values and replace the placeholders below
// 8. Enable Realtime Database in the Firebase console
// 9. Set up database rules (see README.md for security rules)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig };
} else if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}

