# Crunchyroll Sync Extension

A Chrome extension that synchronizes video playback across multiple browsers for Crunchyroll, perfect for watch parties with friends!

## Features

- 🎬 **Real-time sync**: Play, pause, and seek events sync instantly across all connected browsers
- 🔐 **Room-based**: Create or join rooms with simple 4-character codes
- 🌐 **Cross-browser**: Works across different computers and browsers
- 🚀 **Easy to use**: Simple popup interface to create/join rooms

## Setup Instructions

### 1. Firebase Setup

This extension uses Firebase Realtime Database for syncing. You'll need to set up your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Realtime Database**:
   - In your Firebase project, go to **Build** > **Realtime Database**
   - Click **Create Database**
   - Choose your region
   - Start in **test mode** (we'll set up proper rules next)

4. Set up **Database Security Rules**:
   - Go to the **Rules** tab in Realtime Database
   - Replace the default rules with:
   ```json
   {
     "rules": {
       "rooms": {
         "$roomId": {
           ".read": true,
           ".write": true,
           ".indexOn": ["created", "lastActivity"]
         }
       }
     }
   }
   ```
   - Click **Publish**

5. Get your Firebase config:
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll to **Your apps** section
   - Click **Add app** > **Web app** (</> icon)
   - Give it a name (e.g., "Crunchyroll Sync")
   - Copy the `firebaseConfig` object

### 2. Extension Setup

1. **Clone this repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/crollsync.git
   cd crollsync/crunchyroll-sync-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Copy `firebase-config.template.js` to `firebase-config.js`:
     ```bash
     cp firebase-config.template.js firebase-config.js
     ```
   - Open `firebase-config.js` and replace the placeholder values with your Firebase config from step 1

4. **Update the source files** with your config:
   - Open `src/background.js` and update the `firebaseConfig` object (around line 26)
   - Open `src/offscreen.js` and update the `firebaseConfig` object (around line 9)

5. **Build the extension**:
   ```bash
   npm run build
   ```

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `crunchyroll-sync-extension` folder
5. The extension should now appear in your extensions list!

## Usage

### Creating a Room

1. Open a Crunchyroll video
2. Click the Crunchyroll Sync extension icon
3. Click **Create New Room**
4. Share the 4-character room code with your friends

### Joining a Room

1. Open the same Crunchyroll video (or any video)
2. Click the Crunchyroll Sync extension icon
3. Enter the room code
4. Click **Join Room**

### Syncing

Once everyone is in the same room:
- When anyone plays/pauses the video, it syncs for everyone
- When anyone seeks to a different timestamp, everyone jumps to that time
- Perfect sync for watch parties! 🎉

## For Your Friends

If you want to share this with friends without them setting up Firebase:

### Option 1: Share Your Built Extension (Easiest)

1. Build the extension with your Firebase config
2. Zip the entire `crunchyroll-sync-extension` folder
3. Share the zip file with friends
4. They just need to:
   - Unzip the folder
   - Load it in Chrome as described above

### Option 2: Publish to Chrome Web Store (Most Convenient)

To publish for easy installation:
1. Follow [Chrome Web Store publishing guide](https://developer.chrome.com/docs/webstore/publish/)
2. One-time $5 developer fee
3. Friends can install with one click

## Development

- **Build for production**: `npm run build`
- **Build for development** (with watch): `npm run dev`

## Project Structure

```
crunchyroll-sync-extension/
├── src/
│   ├── background.js      # Service worker, Firebase sync logic
│   ├── content.js         # Content script, video player hooks
│   ├── popup.js           # Popup UI logic
│   └── offscreen.js       # Authentication helper
├── dist/                  # Built files (generated)
├── icons/                 # Extension icons
├── manifest.json          # Extension manifest
├── popup.html            # Popup UI
├── offscreen.html        # Offscreen document
└── webpack.config.js     # Build configuration
```

## Troubleshooting

### "Background not reachable" error
- Reload the extension in `chrome://extensions`
- Click the reload icon on the extension card

### Video not syncing
- Make sure both browsers have the extension installed and loaded
- Both users must be in the same room
- Both users should be watching a Crunchyroll video
- Try refreshing the Crunchyroll tab after joining the room

### Content script not loading
- Make sure you've reloaded both the extension AND the Crunchyroll tab
- Check the browser console (F12) for any errors

## Security Notes

- **Firebase API keys are public by design** - they identify your Firebase project but don't grant access
- Security is handled by Firebase Database Rules (configured in setup)
- The current rules allow anyone to read/write to rooms (fine for private use)
- For public deployment, consider adding authentication or more restrictive rules

## License

See [LICENSE](../LICENSE) file for details.

## Contributing

Contributions welcome! Feel free to open issues or submit pull requests.

---

Made with ❤️ for Crunchyroll watch parties
