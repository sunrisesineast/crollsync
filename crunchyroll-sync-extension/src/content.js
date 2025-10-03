// Content script for Crunchyroll Sync Extension

console.log('Crunchyroll Sync: Content script loaded on', window.location.href);

let videoElement = null;
let isVideoHooked = false;
let lastSeekTime = 0;
const SEEK_THROTTLE_MS = 500;
let isApplyingRemote = false;
let recentlySentEvents = new Set(); // Track recently sent event timestamps to avoid loops

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
    
    // Check if this is an event we recently sent (avoid feedback loop)
    if (message.sentAtMs && recentlySentEvents.has(message.sentAtMs)) {
      console.log('Crunchyroll Sync: Ignoring own event from', message.sentAtMs);
      sendResponse({ success: true });
      return;
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
  if (isApplyingRemote) {
    console.log('Crunchyroll Sync: Ignoring local play (applying remote)');
    return;
  }
  
  console.log('Crunchyroll Sync: Local play event');
  sendToBackground({
    type: 'play',
    positionSec: videoElement.currentTime,
    url: window.location.href
  });
}

function handleLocalPause(event) {
  if (!videoElement) return;
  if (isApplyingRemote) {
    console.log('Crunchyroll Sync: Ignoring local pause (applying remote)');
    return;
  }
  
  console.log('Crunchyroll Sync: Local pause event');
  sendToBackground({
    type: 'pause',
    positionSec: videoElement.currentTime,
    url: window.location.href
  });
}

function handleLocalSeek(event) {
  if (!videoElement) return;
  if (isApplyingRemote) {
    console.log('Crunchyroll Sync: Ignoring local seek (applying remote)');
    return;
  }
  
  const now = Date.now();
  if (now - lastSeekTime < SEEK_THROTTLE_MS) {
    return; // Throttle seek events
  }
  lastSeekTime = now;
  
  console.log('Crunchyroll Sync: Local seek event to', videoElement.currentTime);
  sendToBackground({
    type: 'seek',
    positionSec: videoElement.currentTime,
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
  isApplyingRemote = true;
  videoElement.currentTime = message.positionSec ?? message.timestamp ?? videoElement.currentTime;
  videoElement.play().catch(error => {
    console.error('Crunchyroll Sync: Error playing video:', error);
  }).finally(() => {
    setTimeout(() => { isApplyingRemote = false; }, 250);
  });
}

function handleRemotePause(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Remote pause command');
  isApplyingRemote = true;
  videoElement.pause();
  setTimeout(() => { isApplyingRemote = false; }, 250);
}

function handleRemoteSeek(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Remote seek command to', message.timestamp);
  isApplyingRemote = true;
  videoElement.currentTime = message.positionSec ?? message.timestamp ?? videoElement.currentTime;
  setTimeout(() => { isApplyingRemote = false; }, 250);
}

function handleSync(message) {
  if (!videoElement) return;
  
  console.log('Crunchyroll Sync: Sync command');
  isApplyingRemote = true;
  videoElement.currentTime = message.timestamp;
  
  if (message.shouldPlay) {
    videoElement.play().catch(error => {
      console.error('Crunchyroll Sync: Error playing video during sync:', error);
    }).finally(() => {
      setTimeout(() => { isApplyingRemote = false; }, 250);
    });
  } else {
    videoElement.pause();
    setTimeout(() => { isApplyingRemote = false; }, 250);
  }
}

function sendToBackground(event) {
  const timestamp = Date.now();
  
  // Track this event to avoid receiving it back
  recentlySentEvents.add(timestamp);
  
  // Clean up old timestamps after 5 seconds
  setTimeout(() => {
    recentlySentEvents.delete(timestamp);
  }, 5000);
  
  // Add timestamp to event
  const eventWithTimestamp = {
    ...event,
    localSentAt: timestamp
  };
  
  chrome.runtime.sendMessage({
    action: 'broadcast',
    event: eventWithTimestamp
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

// Firebase handling functions removed from content script.
// All Firebase work is handled by the background service worker using the modular SDK.
function handleFirebaseAction(message, sendResponse) {
  console.warn('Crunchyroll Sync: Firebase actions are no longer handled in content script');
  sendResponse({ success: false, error: 'Unsupported in content script' });
}
