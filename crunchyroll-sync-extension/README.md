# Crunchyroll Sync Extension

A Chrome extension that allows synchronized video playback across multiple browsers for Crunchyroll.

## Phase 1 Setup Complete ✅

The basic extension structure has been created with:
- Manifest V3 configuration
- Popup UI for room management
- Content script for video detection
- Background service worker
- Firebase integration setup

## Setup Instructions

### 1. Create Extension Icons
1. Open `create-icons.html` in your browser
2. Right-click on each canvas and save as:
   - `icons/icon16.png` (16x16)
   - `icons/icon48.png` (48x48) 
   - `icons/icon128.png` (128x128)

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" > Web app
6. Copy the configuration object
7. Replace the placeholder values in `firebase-config.js`
8. Enable Realtime Database in the Firebase console
9. Set up database rules (see below)

### 3. Firebase Database Rules
Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['created', 'lastActivity'])",
        "events": {
          ".read": true,
          ".write": true,
          "$eventId": {
            ".validate": "newData.hasChildren(['type', 'timestamp'])"
          }
        }
      }
    }
  }
}
```

### 4. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `crunchyroll-sync-extension` folder
5. The extension should now appear in your extensions list

### 5. Test the Extension
1. Click the extension icon in the toolbar
2. Try creating a room - you should see a 4-character room code
3. Try joining a room with the code
4. Navigate to a Crunchyroll video page
5. Check the browser console for logs

## File Structure

```
crunchyroll-sync-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── content.js             # Content script for video detection
├── background.js          # Service worker for Firebase
├── firebase-config.js     # Firebase configuration
├── create-icons.html      # Icon generator
├── icons/                 # Extension icons
├── package.json           # npm configuration
├── node_modules/          # Firebase SDK
└── README.md              # This file
```

## Next Steps (Phase 2)

The next phase will implement:
- Room creation and joining functionality
- Firebase integration for real-time sync
- Basic event broadcasting
- Testing with multiple browser instances

## Troubleshooting

- **Extension not loading**: Check that all required files are present and manifest.json is valid
- **Firebase errors**: Verify your Firebase configuration and database rules
- **Icons not showing**: Make sure you've created the icon files in the `icons/` directory
- **Console errors**: Check browser console for detailed error messages

## Development Notes

- The extension uses Manifest V3 (latest Chrome extension standard)
- Firebase Realtime Database is used for real-time synchronization
- Content script uses MutationObserver to detect dynamically loaded video elements
- All communication between scripts uses Chrome's message passing API
