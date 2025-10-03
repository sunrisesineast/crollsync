# Pre-Publishing Checklist

Before sharing your extension or making the repo public, go through this checklist:

## ✅ Security & Privacy

- [x] `firebase-config.js` is in `.gitignore`
- [x] `.gitignore` is configured properly
- [ ] Verify your Firebase config is NOT in git:
  ```bash
  git status
  # Should NOT show firebase-config.js as tracked
  ```
- [ ] Firebase Database Rules are set up in Firebase Console
- [ ] No personal information in code comments

## ✅ Code Quality

- [x] Extension is built and tested:
  ```bash
  cd crunchyroll-sync-extension
  npm run build
  ```
- [x] Syncing works between two browsers/computers
- [x] Room creation works
- [x] Room joining works
- [ ] Tested in a fresh browser profile (incognito won't work due to extension loading)

## ✅ Documentation

- [x] README.md explains setup
- [x] SHARING.md explains distribution options  
- [x] firebase-config.template.js has clear instructions
- [ ] Update any TODOs or placeholder text in docs

## ✅ For Sharing with Friends

### Option A: Direct ZIP Distribution
- [ ] Run `npm run build`
- [ ] Create ZIP with: dist/, icons/, manifest.json, popup.html, offscreen.html
- [ ] Test: Unzip and load in fresh Chrome profile
- [ ] Share via Google Drive/Dropbox/etc

### Option B: GitHub + Self-Setup
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Make repo public (if desired)
- [ ] Friends follow README to set up their own Firebase

### Option C: Chrome Web Store
- [ ] Create promotional images
- [ ] Register as Chrome Web Store developer ($5)
- [ ] Submit for review
- [ ] Wait for approval

## ✅ Post-Share Support

- [ ] Create a Discord/Slack channel for support
- [ ] Or: Enable GitHub Issues for bug reports
- [ ] Share room codes with friends for testing
- [ ] Have a backup room code ready

## 📝 Notes

### Firebase API Key - Why It's Safe:
- Firebase API keys for web are **meant to be public**
- They identify your project, not authenticate users
- Security is handled by Database Rules
- It's like a phone number - public, but doesn't grant access

### What Friends Need:
- Chrome or Chromium-based browser
- Basic tech skills (loading unpacked extension)
- Crunchyroll subscription (for watching)
- Your extension files

### Support Quick Answers:
**Q: Extension not working?**
A: Reload extension at chrome://extensions, then refresh Crunchyroll tab

**Q: Not syncing?**
A: Make sure both are in same room, both on Crunchyroll video

**Q: Room code not working?**
A: Codes are case-sensitive, try Create New Room instead

---

## Ready to Share? 🚀

Once all checkboxes above are complete, you're ready!

**Quick command to package for sharing:**
```bash
cd crunchyroll-sync-extension
npm run build
# Then manually zip: dist/, icons/, manifest.json, popup.html, offscreen.html
```

**Or just share the whole folder** (if friends trust you with Firebase access).

Good luck and enjoy your watch parties! 🎉

