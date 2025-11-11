// PWA Install Handler
let deferredPrompt;
let installButton;

// Check if app is already installed
function isAppInstalled() {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  // Check iOS standalone
  if (window.navigator.standalone === true) {
    return true;
  }
  return false;
}

// Initialize install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[PWA] Install prompt available');
  
  // Prevent the default install prompt
  e.preventDefault();
  
  // Store the event for later use
  deferredPrompt = e;
  
  // Show custom install button if not already installed
  if (!isAppInstalled()) {
    showInstallButton();
  }
});

function showInstallButton() {
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-btn';
    installButton.innerHTML = '📱 Install App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      transition: transform 0.2s ease;
    `;
    
    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'scale(1.05)';
    });
    
    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'scale(1)';
    });
    
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        console.log('[PWA] No install prompt available');
        return;
      }
      
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('[PWA] App installed');
      } else {
        console.log('[PWA] App installation declined');
      }
      
      // Clear the prompt
      deferredPrompt = null;
      
      // Hide the button
      hideInstallButton();
    });
    
    document.body.appendChild(installButton);
  }
  
  installButton.style.display = 'block';
}

function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Handle successful installation
window.addEventListener('appinstalled', (e) => {
  console.log('[PWA] App successfully installed');
  hideInstallButton();
  
  // Optional: Show success message
  alert('✅ TimeSync has been installed successfully!');
});

// Check if already installed on load
if (isAppInstalled()) {
  console.log('[PWA] App is already installed');
} else {
  console.log('[PWA] App is not installed');
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// Handle service worker updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] New service worker activated');
    
    // Optional: Show update notification
    if (confirm('A new version of TimeSync is available. Reload to update?')) {
      window.location.reload();
    }
  });

}
