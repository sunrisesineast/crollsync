// Content script for Crunchyroll Sync Extension

console.log('Crunchyroll Sync: Content script loaded');

let videoElement = null;
let isVideoHooked = false;
let lastSeekTime = 0;
const SEEK_THROTTLE_MS = 500;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  console.log('Crunchyroll Sync: Initializing content script');
  
  // Watch for video element addition (Crunchyroll loads dynamically)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node is a video element
          if (node.tagName === 'VIDEO') {
            hookVideo(node);
          }
          // Check if the added node contains video elements
          const videos = node.querySelectorAll && node.querySelectorAll('video');
          if (videos && videos.length > 0) {
            videos.forEach(hookVideo);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also check for existing video elements
  const existingVideos = document.querySelectorAll('video');
  existingVideos.forEach(hookVideo);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Crunchyroll Sync: Received message:', message);
    
    // Handle Firebase operations
    if (message.action) {
      handleFirebaseAction(message, sendResponse);
      return true; // Keep message channel open for async response
    }
    
    // Handle video control messages
    switch (message.type) {
      case 'play':
        handleRemotePlay(message);
        break;
      case 'pause':
        handleRemotePause(message);
        break;
      case 'seek':
        handleRemoteSeek(message);
        break;
      case 'sync':
        handleSync(message);
        break;
      default:
        console.log('Crunchyroll Sync: Unknown message type:', message.type);
    }
    
    sendResponse({ success: true });
  });
}

function hookVideo(video) {
  if (isVideoHooked || !video) {
    return;
  }
  
  console.log('Crunchyroll Sync: Hooking video element');
  videoElement = video;
  isVideoHooked = true;
  
  // Add event listeners for video events
  video.addEventListener('play', handleLocalPlay);
  video.addEventListener('pause', handleLocalPause);
  video.addEventListener('seeked', handleLocalSeek);
  video.addEventListener('timeupdate', handleTimeUpdate);
  
  console.log('Crunchyroll Sync: Video element hooked successfully');
}

function handleLocalPlay(event) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Local play event');
  sendToBackground({
    type: 'play',
    timestamp: videoElement.currentTime,
    url: window.location.href
  });
}

function handleLocalPause(event) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Local pause event');
  sendToBackground({
    type: 'pause',
    timestamp: videoElement.currentTime,
    url: window.location.href
  });
}

function handleLocalSeek(event) {
  if (!videoElement) return;
  
  const now = Date.now();
  if (now - lastSeekTime < SEEK_THROTTLE_MS) {
    return; // Throttle seek events
  }
  lastSeekTime = now;
  
  console.log('Crunchyroll Sync: Local seek event to', videoElement.currentTime);
  sendToBackground({
    type: 'seek',
    timestamp: videoElement.currentTime,
    url: window.location.href
  });
}

function handleTimeUpdate(event) {
  // This can be used for periodic sync checks
  // For now, we'll keep it simple
}

function handleRemotePlay(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Remote play command');
  videoElement.currentTime = message.timestamp;
  videoElement.play().catch(error => {
    console.error('Crunchyroll Sync: Error playing video:', error);
  });
}

function handleRemotePause(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Remote pause command');
  videoElement.pause();
}

function handleRemoteSeek(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Remote seek command to', message.timestamp);
  videoElement.currentTime = message.timestamp;
}

function handleSync(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Sync command');
  videoElement.currentTime = message.timestamp;
  
  if (message.shouldPlay) {
    videoElement.play().catch(error => {
      console.error('Crunchyroll Sync: Error playing video during sync:', error);
    });
  } else {
    videoElement.pause();
  }
}

function sendToBackground(event) {
  chrome.runtime.sendMessage({
    action: 'broadcast',
    event: event
  }).catch(error => {
    console.error('Crunchyroll Sync: Error sending message to background:', error);
  });
}

// Utility function to get current video state
function getCurrentVideoState() {
  if (!videoElement) {
    return null;
  }
  
  return {
    currentTime: videoElement.currentTime,
    duration: videoElement.duration,
    paused: videoElement.paused,
    url: window.location.href
  };
}

// Expose for debugging
window.crunchyrollSync = {
  getCurrentVideoState,
  videoElement: () => videoElement,
  isVideoHooked: () => isVideoHooked
};

// Firebase handling functions
let firebaseApp = null;
let firebaseDatabase = null;

async function handleFirebaseAction(message, sendResponse) {
  try {
    console.log('Crunchyroll Sync: Handling Firebase action:', message.action);
    
    switch (message.action) {
      case 'firebaseCreateRoom':
        await handleFirebaseCreateRoom(message, sendResponse);
        break;
      case 'firebaseJoinRoom':
        await handleFirebaseJoinRoom(message, sendResponse);
        break;
      case 'firebaseBroadcast':
        await handleFirebaseBroadcast(message, sendResponse);
        break;
      default:
        console.log('Crunchyroll Sync: Unknown Firebase action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Crunchyroll Sync: Error handling Firebase action:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function initializeFirebase(firebaseConfig) {
  if (firebaseApp && firebaseDatabase) {
    return; // Already initialized
  }
  
  try {
    console.log('Crunchyroll Sync: Initializing Firebase in content script');
    
    // Load Firebase modules using script injection
    await loadFirebaseModules();
    
    // Initialize Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseDatabase = firebaseApp.database();
    
    console.log('Crunchyroll Sync: Firebase initialized successfully in content script');
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error initializing Firebase in content script:', error);
    throw error;
  }
}

function loadFirebaseModules() {
  return new Promise((resolve, reject) => {
    // Check if Firebase is already loaded
    if (typeof firebase !== 'undefined') {
      resolve();
      return;
    }
    
    // Get the extension URL for local modules
    const extensionUrl = chrome.runtime.getURL('libs/firebase-app-compat.js');
    
    // Load Firebase App
    const appScript = document.createElement('script');
    appScript.src = extensionUrl;
    appScript.onload = () => {
      // Load Firebase Database
      const dbScript = document.createElement('script');
      dbScript.src = chrome.runtime.getURL('libs/firebase-database-compat.js');
      dbScript.onload = () => {
        resolve();
      };
      dbScript.onerror = () => {
        reject(new Error('Failed to load Firebase Database module'));
      };
      document.head.appendChild(dbScript);
    };
    appScript.onerror = () => {
      reject(new Error('Failed to load Firebase App module'));
    };
    document.head.appendChild(appScript);
  });
}

async function handleFirebaseCreateRoom(message, sendResponse) {
  try {
    await initializeFirebase(message.firebaseConfig);
    
    const roomId = message.roomId;
    const roomRef = firebaseDatabase.ref('rooms/' + roomId);
    
    // Set room data
    await roomRef.set({
      created: Date.now(),
      createdBy: 'extension',
      episodeUrl: window.location.href,
      lastActivity: Date.now()
    });
    
    console.log('Crunchyroll Sync: Room created in Firebase:', roomId);
    sendResponse({ success: true, roomId: roomId });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error creating room in Firebase:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleFirebaseJoinRoom(message, sendResponse) {
  try {
    await initializeFirebase(message.firebaseConfig);
    
    const roomId = message.roomId;
    const roomRef = firebaseDatabase.ref('rooms/' + roomId);
    
    // Check if room exists
    const snapshot = await roomRef.once('value');
    if (!snapshot.exists()) {
      throw new Error('Room does not exist');
    }
    
    // Update room activity
    await roomRef.update({
      lastActivity: Date.now()
    });
    
    console.log('Crunchyroll Sync: Joined room in Firebase:', roomId);
    sendResponse({ success: true, roomId: roomId });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error joining room in Firebase:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleFirebaseBroadcast(message, sendResponse) {
  try {
    if (!firebaseDatabase) {
      throw new Error('Firebase not initialized');
    }
    
    const event = message.event;
    const roomId = message.roomId;
    
    // Add timestamp and broadcast to Firebase
    const eventData = {
      ...event,
      timestamp: Date.now(),
      sentBy: 'extension'
    };
    
    const roomRef = firebaseDatabase.ref('rooms/' + roomId);
    await roomRef.child('events').push(eventData);
    
    console.log('Crunchyroll Sync: Event broadcasted to Firebase:', eventData);
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Crunchyroll Sync: Error broadcasting to Firebase:', error);
    sendResponse({ success: false, error: error.message });
  }
}
