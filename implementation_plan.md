Implementation Plan for Crunchyroll Sync Extension
This plan breaks down the build into phased steps for your coding agent. It's based on the high-level design we discussed: a Chrome-compatible browser extension (Manifest V3) with a simple Firebase backend for real-time sync of play/pause/seek events. Focus on MVP—keep it minimal, testable at each stage. Assume the agent is proficient in JavaScript, browser extensions, and Firebase setup. Total estimated effort: 8-12 hours.
Phase 1: Project Setup (1-2 hours)

Initialize Extension Structure:

Create a new directory: crunchyroll-sync-extension.
Set up manifest.json with Manifest V3:

Include permissions: activeTab, storage, and https://*.firebaseio.com/* (for backend).
Declare content scripts for matches: ["https://www.crunchyroll.com/*"].
Add a browser action (popup) and background service worker.


Boilerplate files: popup.html, popup.js, content.js, background.js.


Backend Setup:

Create a free Firebase project via console.firebase.google.com.
Enable Realtime Database.
Install Firebase SDK via npm (for local dev): npm init -y && npm install firebase.
In background.js, import Firebase and configure with your project's credentials (apiKey, etc.—keep secure, don't commit).


Testing Setup:

Load unpacked extension in Chrome (chrome://extensions/).
Set up basic logging: Use console.log in all scripts; ensure communication via chrome.runtime.sendMessage.



Phase 2: Room Management (Popup & Basic Backend) (2-3 hours)

Build Popup UI:

In popup.html: Simple form with "Create Room" button (generates 4-char random ID, e.g., via Math.random().toString(36).substr(2,4)), input for "Join Room" code, and status display (e.g., "Connected to room ABCD").
In popup.js: Handle button clicks → Send messages to background: {action: 'createRoom'} or {action: 'joinRoom', roomId: code}.
Store roomId in chrome.storage.local for persistence.


Backend Integration in Background:

In background.js: On receiving 'createRoom', generate ID, init Firebase ref: const roomRef = firebase.database().ref('rooms/' + roomId); roomRef.set({created: Date.now()});.
For 'joinRoom': Validate room exists via roomRef.once('value'), then listen: roomRef.child('events').on('child_added', (snap) => { chrome.tabs.sendMessage(tabId, snap.val()); });.
Broadcast function: function broadcast(event) { roomRef.child('events').push(event); } (events auto-expire or clean up periodically).


Test Milestone:

Create/join room from popup.
Simulate broadcast: Manually push an event via Firebase console; check if background receives and logs it.



Phase 3: Content Script for Video Hooking (2-3 hours)

Detect Crunchyroll Player:

In content.js: Use MutationObserver to watch document.body for video element addition (Crunchyroll loads dynamically).

Example: const observer = new MutationObserver(() => { const video = document.querySelector('video'); if (video) { hookVideo(video); } }); observer.observe(document.body, {childList: true, subtree: true});.




Hook Events:

Function hookVideo(video): Add listeners:

video.addEventListener('play', () => sendToBackground({type: 'play', timestamp: video.currentTime}));
Similarly for 'pause' and 'seeked' (throttle seek with lodash.throttle or simple debounce).


Receive remote commands: chrome.runtime.onMessage.addListener((msg) => { if (msg.type === 'play') { video.currentTime = msg.timestamp; video.play(); } else if (msg.type === 'pause') { video.pause(); } else if (msg.type === 'seek') { video.currentTime = msg.timestamp; } });.


Integrate with Background:

In content.js: function sendToBackground(event) { chrome.runtime.sendMessage({action: 'broadcast', event}); }
In background.js: On 'broadcast', push to Firebase: broadcast(event);.


Test Milestone:

Load a free Crunchyroll episode.
Play/pause locally → Check Firebase for event push.
Simulate remote: Push event in Firebase → Video reacts in browser.



Phase 4: Sync Enhancements & Polish (2-3 hours)

Desync Handling:

In content script: Periodically (every 10s) check vs. room's last timestamp (broadcast 'syncRequest'; backend responds with median).
Add a "Resync" button in popup if drift >5s.


Episode Validation:

On join: Broadcast current URL; if mismatch, alert in popup.
Store in room metadata: roomRef.update({episodeUrl: location.href});.


Error Handling & Cleanup:

Handle offline: Queue events in localStorage, sync on reconnect.
Room expiration: Use Firebase rules to delete inactive rooms (>2 hours).
Secure: No auth, but advise users to share codes privately.


Cross-Browser Tweaks:

Test in Firefox: Replace chrome with browser API where needed.



Phase 5: Final Testing & Deployment (1 hour)

End-to-End Test:

Multi-browser setup: You and a "friend" (second browser/profile) join room, load same episode.
Verify play/pause/seek syncs within 1-2s.
Edge cases: Seek large jumps, pause during load, disconnect/reconnect.


Package & Share:

Zip extension for Chrome Web Store submission (optional).
Document: README with install instructions, known issues (e.g., premium episodes untested).



Follow this sequentially; after each phase, commit to Git and test. If issues arise (e.g., player selector changes), inspect Crunchyroll's DOM. Let me know progress or tweaks!