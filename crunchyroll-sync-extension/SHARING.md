# How to Share Crunchyroll Sync with Friends

You have three options for sharing this extension with friends:

## Option 1: Share the Built Extension (Recommended for Small Groups)

This is the easiest way to share with a few friends who you trust.

### Steps:

1. **Make sure you've built the extension** with your Firebase config:
   ```bash
   npm run build
   ```

2. **Create a distribution package**:
   - Zip the entire `crunchyroll-sync-extension` folder
   - Name it something like `crunchyroll-sync-v1.0.zip`

3. **Share with friends**:
   - Upload to Google Drive, Dropbox, or send directly
   - Share the link with your friends

4. **Friends install it**:
   - Unzip the folder
   - Open Chrome → `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the unzipped `crunchyroll-sync-extension` folder

### ✅ Pros:
- Quick and easy
- No extra setup needed
- Friends use your Firebase project (all on same database)

### ⚠️ Cons:
- Friends can see your Firebase config (though it's not a security risk)
- Manual updates (need to send new zip when you update)
- Everyone shares same Firebase usage quota

---

## Option 2: Each Friend Sets Up Their Own Firebase (Most Secure)

For friends who are technical or if you want each group isolated.

### Steps:

1. **Push to GitHub** (without firebase-config.js):
   ```bash
   git add .
   git commit -m "Add Crunchyroll Sync extension"
   git push
   ```

2. **Share the repo** with friends

3. **Each friend follows the README** to:
   - Clone the repo
   - Set up their own Firebase project
   - Configure their own `firebase-config.js`
   - Build the extension

### ✅ Pros:
- Each user has their own Firebase project
- More secure/isolated
- Good for open source

### ⚠️ Cons:
- More setup work for friends
- Each person needs their own Firebase project
- Can't share rooms across different Firebase projects

---

## Option 3: Publish to Chrome Web Store (Best for Wide Distribution)

For the most professional distribution.

### Steps:

1. **Prepare for publishing**:
   - Create promotional images (128x128, 440x280, etc.)
   - Write a clear description
   - Create screenshots

2. **Register as Chrome Web Store developer**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay one-time $5 registration fee

3. **Upload your extension**:
   - Zip the `crunchyroll-sync-extension` folder
   - Upload to dashboard
   - Fill out listing information
   - Submit for review (usually takes a few days)

4. **Share the listing link** with friends:
   - Friends can install with one click
   - Automatic updates

### ✅ Pros:
- Professional
- One-click install for friends
- Automatic updates
- Trusted by Chrome

### ⚠️ Cons:
- $5 fee
- Review process takes time
- Your Firebase config is public (see note below)

---

## Important: About Firebase Security

**Don't worry about your Firebase config being public!** Here's why:

1. **API keys in web/mobile apps are meant to be public** - they identify your project, not authenticate users
2. **Security is handled by Firebase Database Rules** - these control who can read/write
3. **Your current rules** allow anyone to read/write rooms (which is fine for a sync extension)

### To make it more secure for public use:

Update your Firebase Database Rules to add rate limiting:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["created", "lastActivity"],
        "$event": {
          ".validate": "newData.hasChildren(['type', 'sentAtMs'])"
        }
      }
    }
  }
}
```

Or add authentication if you want only signed-in users to create rooms.

---

## Quick Start: Share with Friends NOW

**For immediate use with friends:**

1. Run `npm run build` (if you haven't already)
2. Zip the `crunchyroll-sync-extension` folder
3. Share via Google Drive/Dropbox
4. Friends: Unzip → `chrome://extensions` → Enable Developer Mode → Load unpacked

You can all use the same rooms immediately! 🎉

---

## Need Help?

If you or your friends run into issues, check the [README.md](README.md) troubleshooting section.

