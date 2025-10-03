// Background service worker for Crunchyroll Sync Extension

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, update, onChildAdded, get, push, off } from 'firebase/database';

// Firebase instances
let app = null;
let db = null;
let currentRoomRef = null;
let currentRoomId = null;
let offscreenDocumentId = null;

function ensureFirebaseInitialized() {
  if (app && db) {
    return;
  }
  try {
    console.log('Crunchyroll Sync: Initializing Firebase for service worker');
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('Crunchyroll Sync: Firebase initialized successfully for service worker');
  } catch (error) {
    console.error('Crunchyroll Sync: Failed to initialize Firebase:', error);
    throw error;
  }
}

console.log('Crunchyroll Sync: Background script loaded');

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

// Initialize Firebase when the service worker starts
chrome.runtime.onStartup.addListener(() => {
  console.log('Crunchyroll Sync: Service worker started');
  // Firebase will be initialized lazily when needed
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Crunchyroll Sync: Extension installed');
  // Firebase will be initialized lazily when needed
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Crunchyroll Sync: Background received message:', message);
  
  switch (message.action) {
    case 'ping':
      // Just respond without initializing Firebase
      sendResponse({ success: true, status: 'ok' });
      break;
    case 'createRoom':
      handleCreateRoom(message, sendResponse);
      break;
    case 'joinRoom':
      handleJoinRoom(message, sendResponse);
      break;
    case 'leaveRoom':
      handleLeaveRoom(message, sendResponse);
      break;
    case 'broadcast':
      handleBroadcast(message, sender, sendResponse);
      break;
    case 'signInWithGoogle':
      handleSignInWithGoogle(sendResponse);
      break;
    case 'signInAnonymously':
      handleSignInAnonymously(sendResponse);
      break;
    case 'signOut':
      handleSignOut(sendResponse);
      break;
    case 'getCurrentUser':
      handleGetCurrentUser(sendResponse);
      break;
    case 'authStateChanged':
      // Handle auth state changes from offscreen document
      handleAuthStateChanged(message, sendResponse);
      break;
    default:
      console.log('Crunchyroll Sync: Unknown action:', message.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
  
  return true; // Keep message channel open for async response
});

async function handleCreateRoom(message, sendResponse) {
  try {
    const roomId = message.roomId;
    console.log('Crunchyroll Sync: Creating room:', roomId);

    // Ensure Firebase initialized
    ensureFirebaseInitialized();

    // Create room directly in Firebase
    const roomRef = ref(db, 'rooms/' + roomId);

    // Set room data
    await set(roomRef, {
      created: Date.now(),
      createdBy: 'extension',
      lastActivity: Date.now()
    });

    // Set up room listener
    currentRoomRef = roomRef;
    currentRoomId = roomId;
    await setupRoomListener(roomRef);

    console.log('Crunchyroll Sync: Room created successfully:', roomId);
    sendResponse({ success: true, roomId: roomId });

  } catch (error) {
    console.error('Crunchyroll Sync: Error creating room:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleJoinRoom(message, sendResponse) {
  try {
    const roomId = message.roomId;
    console.log('Crunchyroll Sync: Joining room:', roomId);

    ensureFirebaseInitialized();

    // Check if room exists
    const roomRef = ref(db, 'rooms/' + roomId);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error('Room does not exist');
    }

    // Update room activity
    await update(roomRef, {
      lastActivity: Date.now()
    });

    // Set up room listener
    currentRoomRef = roomRef;
    currentRoomId = roomId;
    setupRoomListener(roomRef);

    console.log('Crunchyroll Sync: Joined room successfully:', roomId);
    sendResponse({ success: true, roomId: roomId });

  } catch (error) {
    console.error('Crunchyroll Sync: Error joining room:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleLeaveRoom(message, sendResponse) {
  try {
    console.log('Crunchyroll Sync: Leaving room');

    if (currentRoomRef) {
      // Remove room listener
      const eventsRef = ref(db, 'rooms/' + currentRoomId + '/events');
      off(eventsRef, 'child_added');
      currentRoomRef = null;
      currentRoomId = null;
    }

    console.log('Crunchyroll Sync: Left room successfully');
    sendResponse({ success: true });

  } catch (error) {
    console.error('Crunchyroll Sync: Error leaving room:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleBroadcast(message, sender, sendResponse) {
  try {
    if (!currentRoomRef) {
      throw new Error('Not connected to any room');
    }

    const event = message.event;
    console.log('Crunchyroll Sync: Broadcasting event:', event);

    // Add timestamp and broadcast to Firebase
    const eventData = {
      ...event,
      sentAtMs: Date.now(),
      sentBy: 'extension',
      originTabId: sender && sender.tab ? sender.tab.id : null
    };

    const eventsRef = ref(db, 'rooms/' + currentRoomId + '/events');
    await push(eventsRef, eventData);

    // Update room activity
    await update(currentRoomRef, {
      lastActivity: Date.now()
    });

    console.log('Crunchyroll Sync: Event broadcasted successfully');
    sendResponse({ success: true });

  } catch (error) {
    console.error('Crunchyroll Sync: Error broadcasting event:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function setupRoomListener(roomRef) {
  console.log('Crunchyroll Sync: Setting up room listener');

  try {
    // Listen for new events using onChildAdded for real-time updates
    const eventsRef = ref(db, 'rooms/' + currentRoomId + '/events');
    onChildAdded(eventsRef, (snapshot) => {
      const event = snapshot.val();

      console.log('Crunchyroll Sync: Received event:', event);

      // Send event to all Crunchyroll tabs
      chrome.tabs.query({ url: ['https://*.crunchyroll.com/*', 'https://static.crunchyroll.com/*'] }, (tabs) => {
        tabs.forEach(tab => {
          // Send to all frames in the tab, including iframes
          chrome.tabs.sendMessage(tab.id, event, { frameId: undefined }).catch(error => {
            // Ignore errors - tab might not have content script loaded
            console.log('Crunchyroll Sync: Tab', tab.id, 'not ready or no content script');
          });
        });
      });
    });
  } catch (error) {
    console.error('Crunchyroll Sync: Error setting up room listener:', error);
  }
}

// Authentication handlers using offscreen document
async function handleSignInWithGoogle(sendResponse) {
  try {
    console.log('Crunchyroll Sync: Handling Google sign-in');
    
    // Create offscreen document if it doesn't exist
    await createOffscreenDocument();
    
    // For now, just return success - the offscreen document will handle the actual auth
    // The offscreen document will send auth state changes via chrome.runtime.sendMessage
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error handling Google sign-in:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleSignInAnonymously(sendResponse) {
  try {
    console.log('Crunchyroll Sync: Handling anonymous sign-in');
    
    // Create offscreen document if it doesn't exist
    await createOffscreenDocument();
    
    // For now, just return success - the offscreen document will handle the actual auth
    // The offscreen document will send auth state changes via chrome.runtime.sendMessage
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error handling anonymous sign-in:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleSignOut(sendResponse) {
  try {
    console.log('Crunchyroll Sync: Handling sign-out');
    
    // Create offscreen document if it doesn't exist
    await createOffscreenDocument();
    
    // For now, just return success - the offscreen document will handle the actual auth
    // The offscreen document will send auth state changes via chrome.runtime.sendMessage
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error handling sign-out:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetCurrentUser(sendResponse) {
  try {
    console.log('Crunchyroll Sync: Getting current user');
    
    // For now, return no user since auth is handled in offscreen document
    // The offscreen document will send auth state changes via chrome.runtime.sendMessage
    sendResponse({ success: true, user: null });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error getting current user:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle auth state changes from offscreen document
async function handleAuthStateChanged(message, sendResponse) {
  try {
    console.log('Crunchyroll Sync: Auth state changed:', message.user ? 'signed in' : 'signed out');
    
    // Send auth state to content scripts
    chrome.tabs.query({ url: ['https://*.crunchyroll.com/*', 'https://static.crunchyroll.com/*'] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'authStateChanged',
          user: message.user
        }).catch(error => {
          console.error('Crunchyroll Sync: Error sending auth state to tab:', error);
        });
      });
    });
    
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error handling auth state change:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Create offscreen document for authentication
async function createOffscreenDocument() {
  console.log('Crunchyroll Sync: createOffscreenDocument called');
  try {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
      console.log('Crunchyroll Sync: Offscreen document already exists');
      return;
    }

    console.log('Crunchyroll Sync: Creating offscreen document');

    // Create offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['IFRAME_SCRIPTING'],
      justification: 'Authentication UI for Firebase sign-in'
    });

    console.log('Crunchyroll Sync: Offscreen document created successfully');

  } catch (error) {
    console.error('Crunchyroll Sync: Error creating offscreen document:', error);
    // Do not throw to avoid crashing the service worker
  }
}

// Clean up on extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('Crunchyroll Sync: Service worker suspending');
  if (currentRoomRef) {
    currentRoomRef.child('events').off('child_added');
  }
});
