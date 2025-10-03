// Offscreen script for Crunchyroll Sync Extension Authentication

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

console.log('Crunchyroll Sync: Offscreen script loaded');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPEckKjp8aFmX58uos3MaK873RGuL30Nc",
  authDomain: "crunchysync-fe757.firebaseapp.com",
  databaseURL: "https://crunchysync-fe757-default-rtdb.firebaseio.com",
  projectId: "crunchysync-fe757",
  storageBucket: "crunchysync-fe757.firebasestorage.app",
  messagingSenderId: "891082210535",
  appId: "1:891082210535:web:53225e1bebc5b5d2e03642"
};

// Initialize Firebase
let app = null;
let auth = null;

// DOM elements
let googleAuthBtn = null;
let anonymousAuthBtn = null;
let statusDiv = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Crunchyroll Sync: Offscreen DOM loaded');
  
  // Get DOM elements
  googleAuthBtn = document.getElementById('googleAuthBtn');
  anonymousAuthBtn = document.getElementById('anonymousAuthBtn');
  statusDiv = document.getElementById('status');
  
  // Initialize Firebase
  initializeFirebase();
  
  // Set up event listeners
  googleAuthBtn.addEventListener('click', signInWithGoogle);
  anonymousAuthBtn.addEventListener('click', signInAnonymously);
  
  // Auto-trigger anonymous sign-in for now (can be changed later)
  setTimeout(() => {
    signInAnonymously();
  }, 1000);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Crunchyroll Sync: Offscreen received message:', message);
    
    switch (message.action) {
      case 'signInWithGoogle':
        signInWithGoogle();
        break;
      case 'signInAnonymously':
        signInAnonymously();
        break;
      case 'signOut':
        signOut();
        break;
      case 'getCurrentUser':
        getCurrentUser(sendResponse);
        return true; // Keep message channel open
      default:
        console.log('Crunchyroll Sync: Unknown action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
  });
});

function initializeFirebase() {
  try {
    console.log('Crunchyroll Sync: Initializing Firebase in offscreen');
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      console.log('Crunchyroll Sync: Auth state changed:', user ? 'signed in' : 'signed out');
      
      if (user) {
        showStatus('success', `Signed in as ${user.displayName || user.email || 'Anonymous'}`);
        
        // Send auth state to background script
        chrome.runtime.sendMessage({
          action: 'authStateChanged',
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous
          }
        }).catch(error => {
          console.error('Crunchyroll Sync: Error sending auth state:', error);
        });
      } else {
        showStatus('info', 'Not signed in');
      }
    });
    
    console.log('Crunchyroll Sync: Firebase initialized successfully in offscreen');
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error initializing Firebase:', error);
    showStatus('error', 'Failed to initialize Firebase: ' + error.message);
  }
}

async function signInWithGoogle() {
  try {
    console.log('Crunchyroll Sync: Starting Google sign-in');
    showStatus('info', 'Signing in with Google...');
    
    // Disable buttons during sign-in
    googleAuthBtn.disabled = true;
    anonymousAuthBtn.disabled = true;
    
    // Configure Google provider
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    
    console.log('Crunchyroll Sync: Google sign-in successful:', result.user);
    showStatus('success', 'Successfully signed in with Google');
    
  } catch (error) {
    console.error('Crunchyroll Sync: Google sign-in error:', error);
    
    let errorMessage = 'Failed to sign in with Google';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled by user';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked. Please allow popups for this extension.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showStatus('error', errorMessage);
    
  } finally {
    // Re-enable buttons
    googleAuthBtn.disabled = false;
    anonymousAuthBtn.disabled = false;
  }
}

async function signInAnonymously() {
  try {
    console.log('Crunchyroll Sync: Starting anonymous sign-in');
    showStatus('info', 'Signing in as guest...');
    
    // Disable buttons during sign-in
    googleAuthBtn.disabled = true;
    anonymousAuthBtn.disabled = true;
    
    // Sign in anonymously
    const result = await firebaseSignInAnonymously(auth);
    
    console.log('Crunchyroll Sync: Anonymous sign-in successful:', result.user);
    showStatus('success', 'Successfully signed in as guest');
    
  } catch (error) {
    console.error('Crunchyroll Sync: Anonymous sign-in error:', error);
    showStatus('error', 'Failed to sign in as guest: ' + error.message);
    
  } finally {
    // Re-enable buttons
    googleAuthBtn.disabled = false;
    anonymousAuthBtn.disabled = false;
  }
}

async function signOut() {
  try {
    console.log('Crunchyroll Sync: Signing out');
    showStatus('info', 'Signing out...');
    
    await firebaseSignOut(auth);
    console.log('Crunchyroll Sync: Sign-out successful');
    showStatus('info', 'Signed out successfully');
    
  } catch (error) {
    console.error('Crunchyroll Sync: Sign-out error:', error);
    showStatus('error', 'Failed to sign out: ' + error.message);
  }
}

function getCurrentUser(sendResponse) {
  try {
    const user = auth.currentUser;
    if (user) {
      sendResponse({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAnonymous: user.isAnonymous
        }
      });
    } else {
      sendResponse({
        success: true,
        user: null
      });
    }
  } catch (error) {
    console.error('Crunchyroll Sync: Error getting current user:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

function showStatus(type, message) {
  statusDiv.className = `status ${type}`;
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  
  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}
