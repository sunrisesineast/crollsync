// Firebase configuration for Crunchyroll Sync Extension
// Replace these placeholder values with your actual Firebase project configuration

// Instructions for setup:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing project
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" section
// 5. Click "Add app" > Web app
// 6. Copy the configuration object and replace the values above
// 7. Enable Realtime Database in the Firebase console
// 8. Set up database rules (see README.md for security rules)
// 9. Add your extension ID to Auth > Settings > Authorized Domains
//    Format: gehahbdldjjbhecllphpghggnicemchm.googleusercontent.com

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPEckKjp8aFmX58uos3MaK873RGuL30Nc",
  authDomain: "crunchysync-fe757.firebaseapp.com",
  databaseURL: "https://crunchysync-fe757-default-rtdb.firebaseio.com",
  projectId: "crunchysync-fe757",
  storageBucket: "crunchysync-fe757.firebasestorage.app",
  messagingSenderId: "891082210535",
  appId: "1:891082210535:web:53225e1bebc5b5d2e03642"
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig };
} else if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}