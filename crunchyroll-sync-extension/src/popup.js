// Popup script for Crunchyroll Sync Extension

document.addEventListener('DOMContentLoaded', function() {
  const createRoomBtn = document.getElementById('createRoomBtn');
  const joinRoomBtn = document.getElementById('joinRoomBtn');
  const leaveRoomBtn = document.getElementById('leaveRoomBtn');
  const roomIdInput = document.getElementById('roomIdInput');
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  const statusDisplay = document.getElementById('statusDisplay');
  const googleAuthBtn = document.getElementById('googleAuthBtn');
  const anonymousAuthBtn = document.getElementById('anonymousAuthBtn');
  const signOutBtn = document.getElementById('signOutBtn');
  const authStatus = document.getElementById('authStatus');
  
  // Ping background to ensure service worker is alive before doing anything
  pingBackground().then((ok) => {
    if (!ok) {
      console.error('Background not reachable. Try reloading the extension.');
    }
    // Load current state and initialize Firebase config
    loadCurrentState();
  });
  async function pingBackground() {
    try {
      const res = await chrome.runtime.sendMessage({ action: 'ping' });
      return !!(res && res.success);
    } catch (e) {
      return false;
    }
  }
  
  // Event listeners
  createRoomBtn.addEventListener('click', createRoom);
  joinRoomBtn.addEventListener('click', joinRoom);
  leaveRoomBtn.addEventListener('click', leaveRoom);
  googleAuthBtn.addEventListener('click', signInWithGoogle);
  anonymousAuthBtn.addEventListener('click', signInAnonymously);
  signOutBtn.addEventListener('click', signOut);
  
  roomIdInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      joinRoom();
    }
  });
  
  // Load current state from storage
  async function loadCurrentState() {
    try {
      const result = await chrome.storage.local.get(['roomId', 'isConnected']);
      if (result.roomId) {
        roomIdDisplay.textContent = result.roomId;
        roomIdDisplay.style.display = 'block';
      }
      updateStatus(result.isConnected || false, result.roomId);
      
      // Load auth state
      await loadAuthState();
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
  
  // Load authentication state
  async function loadAuthState() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCurrentUser' });
      if (response.success) {
        updateAuthStatus(response.user);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }
  
  // Create a new room
  async function createRoom() {
    try {
      createRoomBtn.disabled = true;
      createRoomBtn.textContent = 'Creating...';
      
      // Generate 4-character room ID
      const roomId = Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'createRoom',
        roomId: roomId
      });
      
      if (response.success) {
        // Store room ID and update UI
        await chrome.storage.local.set({ roomId: roomId, isConnected: true });
        roomIdDisplay.textContent = roomId;
        roomIdDisplay.style.display = 'block';
        updateStatus(true, roomId);
        
        console.log('Room created successfully:', roomId);
      } else {
        throw new Error(response.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room: ' + error.message);
    } finally {
      createRoomBtn.disabled = false;
      createRoomBtn.textContent = 'Create New Room';
    }
  }
  
  // Join an existing room
  async function joinRoom() {
    const roomId = roomIdInput.value.trim().toUpperCase();
    
    if (!roomId || roomId.length !== 4) {
      alert('Please enter a valid 4-character room code');
      return;
    }
    
    try {
      joinRoomBtn.disabled = true;
      joinRoomBtn.textContent = 'Joining...';
      
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'joinRoom',
        roomId: roomId
      });
      
      if (response.success) {
        // Store room ID and update UI
        await chrome.storage.local.set({ roomId: roomId, isConnected: true });
        roomIdDisplay.textContent = roomId;
        roomIdDisplay.style.display = 'block';
        updateStatus(true, roomId);
        roomIdInput.value = '';
        
        console.log('Joined room successfully:', roomId);
      } else {
        throw new Error(response.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room: ' + error.message);
    } finally {
      joinRoomBtn.disabled = false;
      joinRoomBtn.textContent = 'Join Room';
    }
  }
  
  // Leave current room
  async function leaveRoom() {
    try {
      leaveRoomBtn.disabled = true;
      leaveRoomBtn.textContent = 'Leaving...';
      
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'leaveRoom'
      });
      
      if (response.success) {
        // Clear storage and update UI
        await chrome.storage.local.remove(['roomId', 'isConnected']);
        roomIdDisplay.style.display = 'none';
        updateStatus(false);
        
        console.log('Left room successfully');
      } else {
        throw new Error(response.error || 'Failed to leave room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      alert('Failed to leave room: ' + error.message);
    } finally {
      leaveRoomBtn.disabled = false;
      leaveRoomBtn.textContent = 'Leave Room';
    }
  }
  
  // Update status display
  function updateStatus(isConnected, roomId = null) {
    if (isConnected && roomId) {
      statusDisplay.textContent = `Connected to room ${roomId}`;
      statusDisplay.className = 'status connected';
      leaveRoomBtn.style.display = 'block';
    } else {
      statusDisplay.textContent = 'Not connected';
      statusDisplay.className = 'status disconnected';
      leaveRoomBtn.style.display = 'none';
    }
  }
  
  // Update authentication status display
  function updateAuthStatus(user) {
    if (user) {
      const displayName = user.displayName || user.email || 'Anonymous';
      authStatus.textContent = `Signed in as ${displayName}`;
      authStatus.className = 'status connected';
      authStatus.style.display = 'block';
      googleAuthBtn.style.display = 'none';
      anonymousAuthBtn.style.display = 'none';
      signOutBtn.style.display = 'block';
    } else {
      authStatus.textContent = 'Not signed in';
      authStatus.className = 'status disconnected';
      authStatus.style.display = 'block';
      googleAuthBtn.style.display = 'block';
      anonymousAuthBtn.style.display = 'block';
      signOutBtn.style.display = 'none';
    }
  }
  
  // Sign in with Google
  async function signInWithGoogle() {
    try {
      googleAuthBtn.disabled = true;
      googleAuthBtn.textContent = 'Signing in...';
      
      const response = await chrome.runtime.sendMessage({ action: 'signInWithGoogle' });
      
      if (response.success) {
        console.log('Google sign-in successful');
        await loadAuthState();
      } else {
        throw new Error(response.error || 'Failed to sign in with Google');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Failed to sign in with Google: ' + error.message);
    } finally {
      googleAuthBtn.disabled = false;
      googleAuthBtn.textContent = 'Sign in with Google';
    }
  }
  
  // Sign in anonymously
  async function signInAnonymously() {
    try {
      anonymousAuthBtn.disabled = true;
      anonymousAuthBtn.textContent = 'Signing in...';
      
      const response = await chrome.runtime.sendMessage({ action: 'signInAnonymously' });
      
      if (response.success) {
        console.log('Anonymous sign-in successful');
        await loadAuthState();
      } else {
        throw new Error(response.error || 'Failed to sign in anonymously');
      }
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      alert('Failed to sign in anonymously: ' + error.message);
    } finally {
      anonymousAuthBtn.disabled = false;
      anonymousAuthBtn.textContent = 'Continue as Guest';
    }
  }
  
  // Sign out
  async function signOut() {
    try {
      signOutBtn.disabled = true;
      signOutBtn.textContent = 'Signing out...';
      
      const response = await chrome.runtime.sendMessage({ action: 'signOut' });
      
      if (response.success) {
        console.log('Sign-out successful');
        await loadAuthState();
      } else {
        throw new Error(response.error || 'Failed to sign out');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out: ' + error.message);
    } finally {
      signOutBtn.disabled = false;
      signOutBtn.textContent = 'Sign Out';
    }
  }
});


