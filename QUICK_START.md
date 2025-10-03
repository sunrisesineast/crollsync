# Quick Start: Sharing Crunchyroll Sync

## ✅ Your Extension is Ready!

The extension is working and you're ready to share it with friends. Here's what to do:

---

## 🎯 Option 1: Share with Friends RIGHT NOW (Easiest)

### For You:
1. **Run the packaging script** (Windows):
   ```bash
   cd crunchyroll-sync-extension
   package-for-sharing.bat
   ```
   
   This will:
   - Build the extension
   - Tell you which files to zip up

2. **Create a ZIP file** with these items:
   - `dist/` folder
   - `icons/` folder  
   - `manifest.json`
   - `popup.html`
   - `offscreen.html`

3. **Share the ZIP** via:
   - Google Drive
   - Dropbox
   - Email
   - Discord/Slack

### For Your Friends:
1. Unzip the file
2. Open Chrome → type `chrome://extensions` in the address bar
3. Turn on "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the unzipped folder
6. Done! ✅

**Everyone uses your Firebase project** - you can all join the same rooms immediately!

---

## 🔒 About Your Firebase Config Being Public

**It's totally fine!** Here's why:

- ✅ Firebase API keys are **meant to be public** in web/mobile apps
- ✅ They only identify your project, they don't grant access
- ✅ Security is controlled by Firebase Database Rules (which you set up)
- ✅ Your current rules are appropriate for a sync extension

**What the API key does:**
- Tells Firebase which project to connect to
- Like a phone number - public, but doesn't let someone into your account

**What protects your data:**
- Database Rules (configured in Firebase Console)
- These control who can read/write data
- Your rules allow anyone to sync in rooms (which is what you want!)

---

## 📦 Making the Repo Public

### Before You Commit:

Your `.gitignore` is already set up to exclude `firebase-config.js`, so you're safe!

### Steps:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add Crunchyroll Sync extension with proper documentation"
   git push
   ```

2. **Make the repo public** on GitHub:
   - Go to your repo on GitHub
   - Settings → General → Danger Zone
   - Click "Change visibility" → "Make public"

3. **Friends can then**:
   - Clone your repo
   - Follow the README to set up their own Firebase (if they want their own)
   - Or just use the packaged version you share

---

## 📊 Firebase Free Tier Limits

For reference, Firebase free tier includes:
- **1 GB stored**: More than enough for room data
- **10 GB/month downloaded**: Plenty for syncing
- **100 simultaneous connections**: Room for many friends

You're very unlikely to hit these limits with normal use!

---

## 🎬 How to Use with Friends

1. **Everyone installs the extension** (either method above)
2. **One person creates a room**:
   - Open a Crunchyroll video
   - Click the extension icon
   - Click "Create New Room"
   - Share the 4-character code (e.g., "AB12")

3. **Everyone else joins**:
   - Open any Crunchyroll video
   - Click the extension icon
   - Enter the room code
   - Click "Join Room"

4. **Watch together!**
   - Play/pause/seek syncs automatically
   - Perfect for watch parties! 🎉

---

## 🐛 Troubleshooting

### "Background not reachable"
- Reload the extension in `chrome://extensions`

### Sync not working
- Make sure everyone is in the same room
- Refresh the Crunchyroll video tab after joining
- Check that everyone's extension is loaded

### More help
- See `crunchyroll-sync-extension/README.md`
- See `crunchyroll-sync-extension/SHARING.md`

---

## 🚀 Next Steps (Optional)

### If you want to publish to Chrome Web Store:
- Most professional option
- Friends can install with one click
- Costs $5 one-time fee
- See `crunchyroll-sync-extension/SHARING.md` for details

### If you want to keep developing:
- Run `npm run dev` for auto-rebuild during development
- Check the webpack config for build options

---

## Summary

**To share NOW:**
1. Zip: `dist/`, `icons/`, `manifest.json`, `popup.html`, `offscreen.html`
2. Share the ZIP with friends
3. They install as "unpacked extension"
4. Everyone can use the same rooms!

**Your Firebase config is safe to share publicly** - it's just a project identifier!

Enjoy your watch parties! 🍿🎉

