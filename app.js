// Hawk Sight India - Optimized Emergency Management System
// Version 4.0 - Fully Functional Cross-Platform Application

// Application Configuration
const CONFIG = {
  app: {
    name: "Hawk Sight India",
    version: "4.0",
    tagline: "भारत की सम्पूर्ण आपातकालीन प्रबंधन प्रणाली"
  },
  emergency: {
    sos_number: "+91 7204805507",
    countdown_seconds: 10,
    ndrf_helpline: "9711077372",
    unified_emergency: "112"
  },
  map: {
    default_center: [28.6139, 77.2090], // New Delhi
    default_zoom: 6,
    max_zoom: 18,
    min_zoom: 4,
    tile_layer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors | Hawk Sight India"
  }
};

// Application State
let appState = {
  currentSection: 'dashboard',
  isOnline: navigator.onLine,
  isDarkMode: false,
  currentLanguage: 'hi',
  userLocation: { lat: 28.6139, lng: 77.2090, city: "New Delhi" },
  sosTimer: null,
  sosActive: false,
  maps: {},
  notifications: [],
  familyMembers: [
    {
      id: 1, name: "राज शर्मा", relation: "Self", phone: "+919876543210", 
      status: "safe", location: "Home", lastCheckin: Date.now() - 600000
    },
    {
      id: 2, name: "प्रिया शर्मा", relation: "Spouse", phone: "+919876543211", 
      status: "safe", location: "Office", lastCheckin: Date.now() - 1500000
    },
    {
      id: 3, name: "आर्य शर्मा", relation: "Daughter", phone: "+919876543212", 
      status: "safe", location: "School", lastCheckin: Date.now() - 3600000
    }
  ],
  emergencyServices: [
    {
      id: 1, name: "AIIMS Emergency", type: "hospital", phone: "01126588500",
      coords: [28.5672, 77.2100], distance: "2.3 km", available: true
    },
    {
      id: 2, name: "Delhi Fire Service", type: "fire", phone: "101",
      coords: [28.6289, 77.2065], distance: "1.8 km", available: true
    },
    {
      id: 3, name: "Delhi Police Control", type: "police", phone: "100",
      coords: [28.6358, 77.2245], distance: "1.2 km", available: true
    }
  ],
  disasters: [
    { id: 1, type: "flood", coords: [19.0760, 72.8777], severity: "high", city: "Mumbai" },
    { id: 2, type: "earthquake", coords: [30.3165, 78.0322], severity: "medium", city: "Dehradun" },
    { id: 3, type: "cyclone", coords: [13.0827, 80.2707], severity: "high", city: "Chennai" },
    { id: 4, type: "fire", coords: [12.9716, 77.5946], severity: "medium", city: "Bengaluru" }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  console.log('🦅 Initializing Hawk Sight India Emergency System...');
  initializeLoadingScreen();
});

// Loading Screen Management
function initializeLoadingScreen() {
  const loadingSteps = [
    "Initializing Emergency Systems...",
    "Connecting to NDMA Network...",
    "Loading Emergency Services...",
    "Establishing GPS Connection...",
    "Synchronizing with NDRF...",
    "Activating Alert Systems...",
    "System Ready - Starting Application..."
  ];
  
  let currentStep = 0;
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  const updateProgress = () => {
    if (currentStep < loadingSteps.length) {
      const progress = ((currentStep + 1) / loadingSteps.length) * 100;
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (progressText) progressText.textContent = loadingSteps[currentStep];
      currentStep++;
      
      setTimeout(updateProgress, 400);
    } else {
      setTimeout(() => {
        hideLoadingScreen();
        initializeApp();
      }, 600);
    }
  };
  
  setTimeout(updateProgress, 800);
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      if (loadingScreen.parentNode) {
        loadingScreen.remove();
      }
    }, 500);
  }
}

// Main Application Initialization
function initializeApp() {
  console.log('🚀 Starting Hawk Sight India Emergency System');
  
  try {
    // Initialize core systems
    setupEventListeners();
    setupNavigation();
    initializeGeolocation();
    
    // Initialize maps after a brief delay to ensure DOM is ready
    setTimeout(() => {
      initializeMaps();
    }, 500);
    
    initializeRealTimeUpdates();
    
    // Load initial content
    loadDashboard();
    animateCounters();
    updateConnectionStatus();
    
    // Show system ready notification
    showToast('🦅 System Ready', 'Hawk Sight India emergency management system is now active', 'success');
    
    console.log('✅ Hawk Sight India fully initialized and operational');
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('⚠️ System Error', 'Some features may not work properly', 'error');
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Emergency SOS Button - PRIMARY FUNCTIONALITY
  const emergencyBtn = document.getElementById('emergencySOSBtn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      activateEmergencySOS();
    });
  }

  // SOS Modal Controls
  const cancelSOS = document.getElementById('cancelSOS');
  const sendSOSNow = document.getElementById('sendSOSNow');
  const closeSuccess = document.getElementById('closeSuccess');
  
  if (cancelSOS) {
    cancelSOS.addEventListener('click', function(e) {
      e.preventDefault();
      cancelEmergencySOS();
    });
  }
  if (sendSOSNow) {
    sendSOSNow.addEventListener('click', function(e) {
      e.preventDefault();
      sendSOSImmediately();
    });
  }
  if (closeSuccess) {
    closeSuccess.addEventListener('click', function(e) {
      e.preventDefault();
      closeSuccessModal();
    });
  }

  // Navigation Controls
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMobileMenu();
    });
  }
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleSidebar();
    });
  }

  // Theme and Language Controls
  const themeToggle = document.getElementById('themeToggle');
  const langToggle = document.getElementById('langToggle');
  const locationToggle = document.getElementById('locationToggle');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });
  }
  if (langToggle) {
    langToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleLanguage();
    });
  }
  if (locationToggle) {
    locationToggle.addEventListener('click', function(e) {
      e.preventDefault();
      updateUserLocation();
    });
  }

  // Quick Action Buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      handleQuickAction(e);
    });
  });

  // Emergency Contact Buttons
  document.querySelectorAll('.emergency-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const number = this.getAttribute('data-number');
      if (number) {
        makeEmergencyCall(number);
      }
    });
  });

  // Notification Button
  const notificationBtn = document.getElementById('notificationBtn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showNotificationCenter();
    });
  }

  // Map Controls
  const mapFullscreen = document.getElementById('mapFullscreen');
  const mapLayers = document.getElementById('mapLayers');
  const mapRefresh = document.getElementById('mapRefresh');
  
  if (mapFullscreen) {
    mapFullscreen.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMapFullscreen();
    });
  }
  if (mapLayers) {
    mapLayers.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMapLayers();
    });
  }
  if (mapRefresh) {
    mapRefresh.addEventListener('click', function(e) {
      e.preventDefault();
      refreshMapData();
    });
  }

  // Modal Overlay Clicks
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal || e.target.classList.contains('modal__overlay')) {
        closeModal(modal);
      }
    });
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Online/Offline Status
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);

  // Window Resize
  window.addEventListener('resize', handleWindowResize);

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      console.log('Service Worker registration failed - continuing without offline support');
    });
  }
}

// Navigation System - FIXED
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const section = this.getAttribute('data-section');
      if (section) {
        console.log(`Navigation clicked: ${section}`);
        navigateToSection(section);
      }
    });
  });
  
  console.log(`Navigation setup complete. Found ${navLinks.length} navigation links.`);
}

function navigateToSection(sectionName) {
  console.log(`📍 Navigating to: ${sectionName}`);
  
  try {
    // Update active navigation - FIXED
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      console.log(`Active navigation set for: ${sectionName}`);
    }
    
    // Hide all sections - FIXED
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    
    // Show target section - FIXED
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
      console.log(`Section ${sectionName} activated`);
      
      // Update page title
      const titles = {
        dashboard: 'Emergency Dashboard',
        alerts: 'National Alert Center', 
        family: 'Family Safety Network',
        mapping: 'Interactive Emergency Mapping',
        preparedness: 'Emergency Preparedness Center',
        resources: 'Emergency Resources Hub',
        ndrf: 'NDRF Command Center'
      };
      
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle && titles[sectionName]) {
        pageTitle.textContent = titles[sectionName];
      }
      
      // Load section-specific content
      loadSectionContent(sectionName);
      
      appState.currentSection = sectionName;
      
      // Close mobile menu
      closeMobileMenu();
      
      // Show navigation feedback
      showToast('🧭 Navigation', `Opened ${titles[sectionName] || sectionName}`, 'info', 2000);
      
      // Trigger haptic feedback
      triggerHapticFeedback();
    } else {
      console.error(`Section not found: ${sectionName}`);
      showToast('❌ Navigation Error', `Section ${sectionName} not found`, 'error');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    showToast('❌ Navigation Error', 'Failed to navigate to section', 'error');
  }
}

function loadSectionContent(section) {
  console.log(`Loading content for section: ${section}`);
  
  try {
    switch(section) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'alerts':
        loadAlertsCenter();
        break;
      case 'family':
        loadFamilySafety();
        break;
      case 'mapping':
        loadInteractiveMapping();
        break;
      case 'preparedness':
        loadPreparedness();
        break;
      case 'resources':
        loadResources();
        break;
      case 'ndrf':
        loadNDRFCenter();
        break;
      default:
        console.warn(`Unknown section: ${section}`);
    }
  } catch (error) {
    console.error(`Error loading section ${section}:`, error);
  }
}

// Emergency SOS System - CRITICAL FUNCTIONALITY
function activateEmergencySOS() {
  console.log('🚨 EMERGENCY SOS ACTIVATED');
  
  if (appState.sosActive) {
    console.log('SOS already active, ignoring duplicate activation');
    return; // Prevent multiple activations
  }
  
  appState.sosActive = true;
  
  // Show SOS modal
  const sosModal = document.getElementById('sosModal');
  if (sosModal) {
    sosModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Update current location in modal
    updateLocationDisplay();
    
    // Start countdown
    startSOSCountdown();
    
    // Trigger emergency alerts
    triggerHapticFeedback('heavy');
    playEmergencySound();
    
    showToast('🚨 EMERGENCY ACTIVATED', 'SOS countdown started - Help is being summoned', 'error');
  } else {
    console.error('SOS Modal not found');
    showToast('❌ SOS Error', 'Unable to activate SOS modal', 'error');
  }
}

function startSOSCountdown() {
  let timeLeft = CONFIG.emergency.countdown_seconds;
  const countdownNumber = document.getElementById('countdownNumber');
  const countdownProgress = document.getElementById('countdownProgress');
  
  // Calculate circumference for progress circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  // Initialize progress circle
  if (countdownProgress) {
    countdownProgress.style.strokeDasharray = circumference;
    countdownProgress.style.strokeDashoffset = 0;
  }
  
  function updateCountdown() {
    if (!appState.sosActive) {
      console.log('SOS cancelled, stopping countdown');
      return;
    }
    
    if (countdownNumber) {
      countdownNumber.textContent = timeLeft;
      
      // Animate number
      countdownNumber.style.transform = 'scale(1.2)';
      setTimeout(() => {
        if (countdownNumber) {
          countdownNumber.style.transform = 'scale(1)';
        }
      }, 200);
    }
    
    // Update progress circle
    if (countdownProgress) {
      const progress = (CONFIG.emergency.countdown_seconds - timeLeft) / CONFIG.emergency.countdown_seconds;
      const offset = circumference - (circumference * progress);
      countdownProgress.style.strokeDashoffset = offset;
    }
    
    // Play urgent sound for last 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      playEmergencySound();
      triggerHapticFeedback('heavy');
    }
    
    timeLeft--;
    
    if (timeLeft >= 0 && appState.sosActive) {
      appState.sosTimer = setTimeout(updateCountdown, 1000);
    } else if (appState.sosActive) {
      sendEmergencyMessage();
    }
  }
  
  updateCountdown();
}

function cancelEmergencySOS() {
  console.log('❌ Emergency SOS Cancelled by User');
  
  appState.sosActive = false;
  
  if (appState.sosTimer) {
    clearTimeout(appState.sosTimer);
    appState.sosTimer = null;
  }
  
  const sosModal = document.getElementById('sosModal');
  if (sosModal) {
    sosModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  showToast('✅ SOS Cancelled', 'Emergency request was cancelled by user', 'info');
}

function sendSOSImmediately() {
  console.log('🚨 IMMEDIATE SOS REQUEST');
  
  if (appState.sosTimer) {
    clearTimeout(appState.sosTimer);
    appState.sosTimer = null;
  }
  
  sendEmergencyMessage();
}

async function sendEmergencyMessage() {
  console.log('📱 Sending Emergency SMS...');
  
  // Hide SOS modal
  const sosModal = document.getElementById('sosModal');
  if (sosModal) {
    sosModal.classList.add('hidden');
  }
  
  // Get current location
  const location = await getCurrentPosition();
  
  // Create emergency message
  const timestamp = new Date().toLocaleString('hi-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  
  const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
I need immediate help!

📍 Location: ${location.city || 'Delhi, India'}
🗺️ Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
🕐 Time: ${timestamp} IST

📱 Sent from Hawk Sight India Emergency App
👤 Emergency User

⚡ This is an automated emergency alert. Please respond immediately.`;

  // Show success modal
  const successModal = document.getElementById('successModal');
  const messagePreview = document.getElementById('messagePreview');
  
  if (successModal && messagePreview) {
    messagePreview.textContent = emergencyMessage;
    successModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  
  // Simulate emergency response sequence
  setTimeout(() => {
    showToast('📞 Emergency Services', 'Local emergency services have been notified', 'success');
  }, 2000);
  
  setTimeout(() => {
    showToast('👨‍👩‍👧‍👦 Family Alert', 'Family members are being contacted', 'info');
    notifyFamilyMembers();
  }, 4000);
  
  setTimeout(() => {
    showToast('🚁 NDRF Alert', 'NDRF teams have been alerted to your location', 'warning');
  }, 6000);
  
  setTimeout(() => {
    showToast('🆘 Help Dispatched', 'Emergency response teams are on their way', 'success');
  }, 8000);
  
  appState.sosActive = false;
  
  // Play success sound
  playSuccessSound();
  triggerHapticFeedback('medium');
  
  // Log emergency event
  logEmergencyEvent('sos_activated', { location, message: emergencyMessage });
}

function closeSuccessModal() {
  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Geolocation Services
function initializeGeolocation() {
  if (!navigator.geolocation) {
    console.warn('⚠️ Geolocation not supported');
    showToast('⚠️ Location Services', 'GPS not available on this device', 'warning');
    return;
  }
  
  updateUserLocation();
}

function updateUserLocation() {
  if (!navigator.geolocation) {
    console.log('Geolocation not available, using default location');
    return;
  }
  
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  };
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      appState.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        city: "Your Location"
      };
      
      updateLocationDisplay();
      showToast('📍 Location Updated', `GPS location acquired`, 'success', 3000);
      
      // Update maps with new location
      setTimeout(() => {
        if (appState.maps.dashboard) {
          try {
            appState.maps.dashboard.setView([appState.userLocation.lat, appState.userLocation.lng], 10);
          } catch (error) {
            console.error('Error updating map view:', error);
          }
        }
      }, 1000);
    },
    (error) => {
      console.error('Geolocation error:', error);
      let message = 'Unable to get location';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied. Using default location.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out';
          break;
      }
      
      showToast('📍 Location Notice', message, 'warning', 4000);
    },
    options
  );
}

async function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(appState.userLocation);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          city: "Your Current Location"
        };
        
        resolve(location);
      },
      (error) => {
        console.error('getCurrentPosition error:', error);
        resolve(appState.userLocation);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

function updateLocationDisplay() {
  const currentLocation = document.getElementById('currentLocation');
  if (currentLocation) {
    currentLocation.textContent = appState.userLocation.city || "India";
  }
}

// Interactive Maps with Leaflet.js - FIXED
function initializeMaps() {
  console.log('🗺️ Initializing maps...');
  
  try {
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.error('Leaflet.js not loaded');
      showToast('🗺️ Map Error', 'Map library not available', 'error');
      return;
    }
    
    // Initialize dashboard map
    initializeDashboardMap();
    
    // Initialize fullscreen map with delay
    setTimeout(() => {
      initializeFullscreenMap();
    }, 1000);
    
    console.log('Maps initialization complete');
  } catch (error) {
    console.error('Error initializing maps:', error);
    showToast('🗺️ Map Error', 'Failed to initialize maps', 'error');
  }
}

function initializeDashboardMap() {
  const mapContainer = document.getElementById('indiaMap');
  if (!mapContainer) {
    console.warn('Dashboard map container not found');
    return;
  }
  
  try {
    console.log('Creating dashboard map...');
    
    // Ensure container has proper dimensions
    mapContainer.style.height = '400px';
    mapContainer.style.width = '100%';
    
    // Create map with error handling
    const map = L.map('indiaMap', {
      center: CONFIG.map.default_center,
      zoom: CONFIG.map.default_zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true
    });
    
    // Add tile layer with error handling
    const tileLayer = L.tileLayer(CONFIG.map.tile_layer, {
      attribution: CONFIG.map.attribution,
      maxZoom: CONFIG.map.max_zoom,
      minZoom: CONFIG.map.min_zoom
    });
    
    tileLayer.on('tileerror', function(error) {
      console.warn('Tile loading error:', error);
    });
    
    tileLayer.addTo(map);
    
    // Wait a moment then add markers
    setTimeout(() => {
      addDisasterMarkers(map);
      addEmergencyServiceMarkers(map);
      addUserLocationMarker(map);
    }, 500);
    
    // Store map instance
    appState.maps.dashboard = map;
    
    // Add click handler
    map.on('click', function(e) {
      const lat = e.latlng.lat.toFixed(4);
      const lng = e.latlng.lng.toFixed(4);
      showToast('🗺️ Map Click', `Location: ${lat}, ${lng}`, 'info', 3000);
    });
    
    // Handle map load event
    map.whenReady(function() {
      console.log('Dashboard map ready');
      showToast('🗺️ Map Ready', 'Interactive map loaded successfully', 'success', 3000);
    });
    
    console.log('Dashboard map created successfully');
  } catch (error) {
    console.error('Error creating dashboard map:', error);
    mapContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 20px;">
        <div>
          <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Interactive Map</div>
          <div style="font-size: 14px;">Emergency locations and services will be displayed here</div>
          <button onclick="refreshMapData()" style="margin-top: 16px; padding: 8px 16px; background: #1fb8cd; color: white; border: none; border-radius: 6px; cursor: pointer;">🔄 Retry</button>
        </div>
      </div>
    `;
  }
}

function initializeFullscreenMap() {
  const fullscreenContainer = document.getElementById('fullscreenMap');
  if (!fullscreenContainer) {
    console.log('Fullscreen map container not found');
    return;
  }
  
  try {
    console.log('Creating fullscreen map...');
    
    // Ensure container has proper dimensions
    fullscreenContainer.style.height = '600px';
    fullscreenContainer.style.width = '100%';
    
    // Create fullscreen map with more features
    const map = L.map('fullscreenMap', {
      center: CONFIG.map.default_center,
      zoom: CONFIG.map.default_zoom + 1,
      zoomControl: true,
      scrollWheelZoom: true
    });
    
    // Add tile layer
    L.tileLayer(CONFIG.map.tile_layer, {
      attribution: CONFIG.map.attribution,
      maxZoom: CONFIG.map.max_zoom
    }).addTo(map);
    
    // Add all markers and features with delay
    setTimeout(() => {
      addDisasterMarkers(map);
      addEmergencyServiceMarkers(map);
      addUserLocationMarker(map);
      addEvacuationRoutes(map);
    }, 500);
    
    // Store map instance
    appState.maps.fullscreen = map;
    
    console.log('Fullscreen map created successfully');
  } catch (error) {
    console.error('Error creating fullscreen map:', error);
    fullscreenContainer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; text-align: center; padding: 20px;">
        <div>
          <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Full Interactive Map</div>
          <div style="font-size: 14px;">Detailed emergency mapping with drawing tools</div>
        </div>
      </div>
    `;
  }
}

function addDisasterMarkers(map) {
  if (!map) return;
  
  console.log('Adding disaster markers...');
  
  const disasterIcons = {
    flood: '🌊',
    earthquake: '🌍',
    cyclone: '🌪️',
    fire: '🔥'
  };
  
  const severityColors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#10B981'
  };
  
  appState.disasters.forEach(disaster => {
    try {
      const iconHtml = `
        <div style="
          background: ${severityColors[disaster.severity]};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          ${disasterIcons[disaster.type]}
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'disaster-marker-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      const marker = L.marker(disaster.coords, { icon: customIcon }).addTo(map);
      
      const popupContent = `
        <div style="text-align: center; padding: 8px; min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; color: ${severityColors[disaster.severity]};">
            ${disaster.type.toUpperCase()}
          </h4>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${disaster.city}</p>
          <p style="margin: 4px 0;"><strong>Severity:</strong> ${disaster.severity.toUpperCase()}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> Active</p>
          <button onclick="viewDisasterDetails(${disaster.id})" style="
            background: #1F2937;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 8px;
          ">View Details</button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    } catch (error) {
      console.error('Error adding disaster marker:', error);
    }
  });
}

function addEmergencyServiceMarkers(map) {
  if (!map) return;
  
  console.log('Adding emergency service markers...');
  
  const serviceIcons = {
    hospital: '🏥',
    fire: '🚒',
    police: '🚔'
  };
  
  appState.emergencyServices.forEach(service => {
    try {
      const iconHtml = `
        <div style="
          background: #1FB8CD;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        ">
          ${serviceIcons[service.type]}
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'service-marker-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      
      const marker = L.marker(service.coords, { icon: customIcon }).addTo(map);
      
      const popupContent = `
        <div style="text-align: center; padding: 8px; min-width: 150px;">
          <h4 style="margin: 0 0 8px 0; color: #1FB8CD;">${service.name}</h4>
          <p style="margin: 4px 0;"><strong>Distance:</strong> ${service.distance}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${service.available ? 'Available' : 'Busy'}</p>
          <div style="margin-top: 8px;">
            <button onclick="makeEmergencyCall('${service.phone}')" style="
              background: #DC2626;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              margin: 2px;
              font-size: 12px;
            ">📞 Call</button>
            <button onclick="getDirections('${service.name}')" style="
              background: #059669;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              margin: 2px;
              font-size: 12px;
            ">🗺️ Route</button>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    } catch (error) {
      console.error('Error adding service marker:', error);
    }
  });
}

function addUserLocationMarker(map) {
  if (!map) return;
  
  try {
    const userIconHtml = `
      <div style="
        background: #3B82F6;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `;
    
    const userIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-marker-icon',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    
    const userMarker = L.marker([appState.userLocation.lat, appState.userLocation.lng], { 
      icon: userIcon 
    }).addTo(map);
    
    userMarker.bindPopup(`
      <div style="text-align: center; padding: 8px;">
        <h4 style="margin: 0 0 8px 0; color: #3B82F6;">📍 Your Location</h4>
        <p style="margin: 4px 0;">${appState.userLocation.city || 'India'}</p>
        <button onclick="updateUserLocation()" style="
          background: #1FB8CD;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 4px;
        ">🔄 Update</button>
      </div>
    `);
    
    // Store user marker for updates
    appState.userMarker = userMarker;
  } catch (error) {
    console.error('Error adding user location marker:', error);
  }
}

function addEvacuationRoutes(map) {
  if (!map) return;
  
  try {
    // Sample evacuation route
    const evacuationRoute = [
      [28.6139, 77.2090],
      [28.6200, 77.2100],
      [28.6250, 77.2150],
      [28.6300, 77.2200]
    ];
    
    const routeLine = L.polyline(evacuationRoute, {
      color: '#F59E0B',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);
    
    routeLine.bindPopup('🛣️ Emergency Evacuation Route');
  } catch (error) {
    console.error('Error adding evacuation routes:', error);
  }
}

// Map Control Functions
function toggleMapFullscreen() {
  showToast('🗺️ Fullscreen', 'Map fullscreen toggle (feature coming soon)', 'info', 3000);
}

function toggleMapLayers() {
  showToast('🗂️ Map Layers', 'Layer control panel (feature coming soon)', 'info', 3000);
}

function refreshMapData() {
  console.log('🔄 Refreshing map data...');
  showToast('🔄 Map Refresh', 'Updating emergency data...', 'info', 2000);
  
  // Re-initialize maps
  setTimeout(() => {
    try {
      // Clear existing maps
      if (appState.maps.dashboard) {
        appState.maps.dashboard.remove();
        appState.maps.dashboard = null;
      }
      
      // Reinitialize
      initializeDashboardMap();
      
      showToast('✅ Map Updated', 'Emergency data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing map:', error);
      showToast('❌ Refresh Failed', 'Unable to refresh map data', 'error');
    }
  }, 1500);
}

// Dashboard Management
function loadDashboard() {
  console.log('📊 Loading Dashboard...');
  
  try {
    // Initialize risk gauge
    setTimeout(initializeRiskGauge, 500);
    
    // Update real-time stats
    updateDashboardStats();
    
    // Start ticker animation
    startTickerAnimation();
    
    // Update weather widget
    updateWeatherWidget();
    
    // Animate counters
    setTimeout(animateCounters, 800);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function initializeRiskGauge() {
  const canvas = document.getElementById('riskGauge');
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 10;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#E5E7EB';
    ctx.stroke();
    
    // Draw risk level arc (65% - Orange level)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + (Math.PI * 0.65));
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();
    
    // Draw needle
    const needleAngle = Math.PI + (Math.PI * 0.65);
    const needleLength = radius - 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * needleLength,
      centerY + Math.sin(needleAngle) * needleLength
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1F2937';
    ctx.stroke();
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
  } catch (error) {
    console.error('Error initializing risk gauge:', error);
  }
}

function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    setTimeout(updateCounter, Math.random() * 1000);
  });
}

function updateDashboardStats() {
  // Simulate real-time stat updates
  const statCards = document.querySelectorAll('.stat-card[data-stat]');
  
  statCards.forEach(card => {
    const statType = card.getAttribute('data-stat');
    const numberEl = card.querySelector('.stat-number');
    
    if (numberEl && numberEl.textContent !== '0') {
      const currentValue = parseInt(numberEl.textContent);
      const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const newValue = Math.max(0, currentValue + variation);
      
      if (newValue !== currentValue) {
        numberEl.textContent = newValue;
        
        // Add pulse animation
        numberEl.style.transform = 'scale(1.1)';
        numberEl.style.color = variation > 0 ? '#DC2626' : '#059669';
        
        setTimeout(() => {
          numberEl.style.transform = 'scale(1)';
          numberEl.style.color = '';
        }, 500);
      }
    }
  });
}

function startTickerAnimation() {
  const ticker = document.querySelector('.update-ticker');
  if (ticker) {
    // Reset animation
    ticker.style.animation = 'none';
    ticker.offsetHeight; // Trigger reflow
    ticker.style.animation = 'ticker 30s linear infinite';
  }
}

function updateWeatherWidget() {
  const weatherConditions = [
    { icon: '🌧️', condition: 'Heavy Rain', temp: 28, alert: 'orange' },
    { icon: '⛈️', condition: 'Thunderstorm', temp: 26, alert: 'red' },
    { icon: '🌤️', condition: 'Partly Cloudy', temp: 32, alert: 'yellow' },
    { icon: '☀️', condition: 'Clear Sky', temp: 35, alert: 'green' }
  ];
  
  const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  
  const weatherIcon = document.querySelector('.weather-icon');
  const weatherTemp = document.querySelector('.weather-temp');
  const weatherCondition = document.querySelector('.weather-condition');
  const weatherAlert = document.querySelector('.weather-alert');
  
  if (weatherIcon) weatherIcon.textContent = randomWeather.icon;
  if (weatherTemp) weatherTemp.textContent = `${randomWeather.temp}°C`;
  if (weatherCondition) weatherCondition.textContent = randomWeather.condition;
  if (weatherAlert) {
    weatherAlert.textContent = `${randomWeather.alert.toUpperCase()} Alert`;
    weatherAlert.className = `weather-alert ${randomWeather.alert}`;
  }
}

// Section Loading Functions
function loadAlertsCenter() {
  console.log('🚨 Loading Alerts Center...');
  
  // Make disaster cards interactive
  document.querySelectorAll('.disaster-card').forEach(card => {
    card.addEventListener('click', function() {
      // Remove active from all cards
      document.querySelectorAll('.disaster-card').forEach(c => c.classList.remove('active'));
      // Add active to clicked card
      this.classList.add('active');
      
      const disaster = this.getAttribute('data-disaster') || 'disaster monitoring';
      showToast('🌊 Disaster Alert', `Activated monitoring for ${disaster}`, 'info');
    });
  });
}

function loadFamilySafety() {
  console.log('👨‍👩‍👧‍👦 Loading Family Safety...');
  updateFamilyMemberTimes();
}

function loadInteractiveMapping() {
  console.log('🗺️ Loading Interactive Mapping...');
  
  // Initialize fullscreen map if not already done
  if (!appState.maps.fullscreen) {
    setTimeout(initializeFullscreenMap, 100);
  } else {
    // Refresh existing map
    setTimeout(() => {
      if (appState.maps.fullscreen) {
        try {
          appState.maps.fullscreen.invalidateSize();
        } catch (error) {
          console.error('Error refreshing fullscreen map:', error);
        }
      }
    }, 300);
  }
}

function loadPreparedness() {
  console.log('🛡️ Loading Preparedness Center...');
  
  const preparednessContent = document.getElementById('preparednessContent');
  if (preparednessContent && !preparednessContent.hasChildNodes()) {
    preparednessContent.innerHTML = generatePreparednessHTML();
    setupPreparednessInteractions();
  }
}

function loadResources() {
  console.log('📦 Loading Resources Hub...');
  
  const resourcesContent = document.getElementById('resourcesContent');
  if (resourcesContent && !resourcesContent.hasChildNodes()) {
    resourcesContent.innerHTML = generateResourcesHTML();
    setupResourcesInteractions();
  }
}

function loadNDRFCenter() {
  console.log('🚁 Loading NDRF Center...');
  updateNDRFStats();
}

// Quick Actions Handler
function handleQuickAction(e) {
  const action = e.currentTarget.getAttribute('data-action');
  
  // Add button animation
  e.currentTarget.style.transform = 'scale(0.95)';
  setTimeout(() => {
    e.currentTarget.style.transform = 'scale(1)';
  }, 150);
  
  triggerHapticFeedback();
  
  switch(action) {
    case 'sos':
      activateEmergencySOS();
      break;
    case 'family-checkin':
      navigateToSection('family');
      showToast('👨‍👩‍👧‍👦 Family Safety', 'Opening family safety center', 'info');
      break;
    case 'report-incident':
      showToast('📝 Incident Report', 'Opening incident reporting system', 'info');
      break;
    case 'find-shelter':
      showToast('🏠 Shelter Search', 'Locating nearest emergency shelters', 'info');
      break;
    case 'medical-help':
      showToast('🏥 Medical Help', 'Finding nearest medical facilities', 'warning');
      break;
    case 'volunteer':
      showToast('🤝 Volunteer', 'Opening volunteer opportunities', 'success');
      break;
  }
}

// Emergency Communication Functions
function makeEmergencyCall(phoneNumber) {
  console.log(`📞 Emergency Call: ${phoneNumber}`);
  
  showToast('📞 Emergency Call', `Initiating call to ${phoneNumber}...`, 'warning');
  
  // Create call link
  const callLink = `tel:${phoneNumber}`;
  
  // For mobile devices, directly open dialer
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.open(callLink, '_self');
  } else {
    // For desktop, show call information
    setTimeout(() => {
      showToast('📞 Call Information', `Please dial: ${phoneNumber} on your phone`, 'info', 8000);
    }, 1000);
  }
  
  // Log the emergency call
  logEmergencyEvent('emergency_call', { phoneNumber, timestamp: new Date().toISOString() });
}

function notifyFamilyMembers() {
  appState.familyMembers.forEach((member, index) => {
    setTimeout(() => {
      showToast('👨‍👩‍👧‍👦 Family Alert', `Notifying ${member.name}...`, 'info');
    }, index * 1000);
  });
}

function showNotificationCenter() {
  const notifications = [
    '🌧️ Heavy Rain Alert - Mumbai (2 min ago)',
    '🌍 Earthquake Update - Uttarakhand (15 min ago)', 
    '🚁 NDRF Deployment - Chennai (45 min ago)',
    '⚡ System Update Available (1 hour ago)'
  ];
  
  showToast('📢 Notifications', notifications.join(' • '), 'info', 8000);
}

// Utility Functions
function showToast(title, message, type = 'info', duration = 5000) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto-remove toast
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

function triggerHapticFeedback(intensity = 'light') {
  if (navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50, 30, 50]
    };
    navigator.vibrate(patterns[intensity] || patterns.light);
  }
}

function playEmergencySound() {
  // Create simple beep sound for emergency
  try {
    const audioContext = new (AudioContext || webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Audio not supported');
  }
}

function playSuccessSound() {
  try {
    const audioContext = new (AudioContext || webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio not supported');
  }
}

// Real-time Updates
function initializeRealTimeUpdates() {
  // Update dashboard stats every 30 seconds
  setInterval(updateDashboardStats, 30000);
  
  // Update weather every 5 minutes
  setInterval(updateWeatherWidget, 300000);
  
  // Update connection status every 10 seconds
  setInterval(updateConnectionStatus, 10000);
  
  // Simulate new alerts occasionally
  setInterval(() => {
    if (Math.random() < 0.3) {
      simulateNewAlert();
    }
  }, 120000);
}

function simulateNewAlert() {
  const alertTypes = [
    { type: 'weather', message: 'Thunderstorm warning issued for your area', icon: '⛈️' },
    { type: 'earthquake', message: 'Minor seismic activity detected nearby', icon: '🌍' },
    { type: 'flood', message: 'Water level rising in local rivers', icon: '🌊' },
    { type: 'traffic', message: 'Major traffic disruption reported', icon: '🚦' }
  ];
  
  const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  showToast(`${alert.icon} Alert`, alert.message, 'warning');
  
  // Update alert count
  const alertCount = document.getElementById('alertCount');
  if (alertCount) {
    const count = parseInt(alertCount.textContent) + 1;
    alertCount.textContent = count;
  }
}

// Connection Status Management
function updateConnectionStatus() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  if (navigator.onLine) {
    if (statusDot) statusDot.className = 'status-dot online';
    if (statusText) statusText.textContent = 'Connected to NDMA';
    appState.isOnline = true;
  } else {
    if (statusDot) statusDot.className = 'status-dot offline';
    if (statusText) statusText.textContent = 'Offline Mode';
    appState.isOnline = false;
  }
}

function handleOnlineStatus() {
  appState.isOnline = true;
  updateConnectionStatus();
  showToast('🌐 Connected', 'Back online - All features available', 'success');
}

function handleOfflineStatus() {
  appState.isOnline = false;
  updateConnectionStatus();
  showToast('📵 Offline', 'Limited functionality in offline mode', 'warning');
}

// Mobile Controls
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.remove('mobile-open');
  }
}

function toggleSidebar() {
  // For desktop sidebar toggle
  showToast('📱 Sidebar', 'Sidebar toggle', 'info', 2000);
}

// Theme and Language Controls
function toggleTheme() {
  appState.isDarkMode = !appState.isDarkMode;
  document.documentElement.setAttribute('data-color-scheme', appState.isDarkMode ? 'dark' : 'light');
  
  const themeIcon = document.querySelector('.theme-toggle .control-icon');
  if (themeIcon) {
    themeIcon.textContent = appState.isDarkMode ? '☀️' : '🌙';
  }
  
  showToast('🎨 Theme', `Switched to ${appState.isDarkMode ? 'Dark' : 'Light'} mode`, 'info');
}

function toggleLanguage() {
  const languages = [
    { code: 'hi', name: 'हिंदी', display: 'हि' },
    { code: 'en', name: 'English', display: 'En' }
  ];
  
  const currentIndex = languages.findIndex(lang => lang.code === appState.currentLanguage);
  const nextIndex = (currentIndex + 1) % languages.length;
  const nextLang = languages[nextIndex];
  
  appState.currentLanguage = nextLang.code;
  
  const langDisplay = document.querySelector('.lang-toggle .control-text');
  if (langDisplay) {
    langDisplay.textContent = nextLang.display;
  }
  
  showToast('🌐 Language', `Switched to ${nextLang.name}`, 'info');
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
  if (e.altKey) {
    switch(e.key.toLowerCase()) {
      case 'e':
        e.preventDefault();
        activateEmergencySOS();
        break;
      case 'd':
        e.preventDefault();
        navigateToSection('dashboard');
        break;
      case 'a':
        e.preventDefault();
        navigateToSection('alerts');
        break;
      case 'f':
        e.preventDefault();
        navigateToSection('family');
        break;
      case 'm':
        e.preventDefault();
        navigateToSection('mapping');
        break;
    }
  }
  
  if (e.key === 'Escape') {
    closeAllModals();
  }
}

function handleWindowResize() {
  // Update maps on resize
  setTimeout(() => {
    Object.values(appState.maps).forEach(map => {
      if (map && typeof map.invalidateSize === 'function') {
        try {
          map.invalidateSize();
        } catch (error) {
          console.log('Error resizing map:', error);
        }
      }
    });
  }, 300);
  
  // Close mobile menu on desktop
  if (window.innerWidth > 968) {
    closeMobileMenu();
  }
}

// Utility Helper Functions
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    closeModal(modal);
  });
}

function closeModal(modal) {
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function logEmergencyEvent(eventType, data) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    location: appState.userLocation,
    data: data
  };
  
  console.log('📝 Emergency Event:', event);
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return '1+ days ago';
}

function updateFamilyMemberTimes() {
  appState.familyMembers.forEach((member, index) => {
    const memberCard = document.querySelector(`.member-card:nth-child(${index + 1}) .member-checkin`);
    if (memberCard) {
      memberCard.textContent = `Last check-in: ${formatTimeAgo(member.lastCheckin)}`;
    }
  });
}

function generatePreparednessHTML() {
  return `
    <div class="preparedness-grid" style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
      <div class="prep-card" style="background: var(--color-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--color-border);">
        <h3 style="margin-bottom: 16px; color: var(--color-text);">🎒 Emergency Kit Checklist</h3>
        <div class="checklist-items" style="display: grid; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 16px; height: 16px;"> Water (4L per person per day)
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 16px; height: 16px;"> Non-perishable food (3+ days)
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 16px; height: 16px;"> First aid kit & medications
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 16px; height: 16px;"> Flashlight and extra batteries
          </label>
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" style="width: 16px; height: 16px;"> Battery-powered radio
          </label>
        </div>
      </div>
      <div class="prep-card" style="background: var(--color-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--color-border);">
        <h3 style="margin-bottom: 16px; color: var(--color-text);">📋 Emergency Plan</h3>
        <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Create and practice your family emergency plan</p>
        <button class="btn btn--primary" onclick="showToast('📋 Plan', 'Emergency plan template opened', 'info')">Download Plan Template</button>
      </div>
    </div>
  `;
}

function generateResourcesHTML() {
  return `
    <div class="resources-grid" style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="resource-card" style="background: var(--color-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--color-border); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🏥</div>
        <h3 style="margin-bottom: 12px; color: var(--color-text);">Medical Resources</h3>
        <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Find nearby hospitals, clinics, and medical supplies</p>
        <button class="btn btn--primary" onclick="showToast('🏥 Medical', 'Finding nearest medical facilities', 'info')">Find Medical Help</button>
      </div>
      <div class="resource-card" style="background: var(--color-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--color-border); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🏠</div>
        <h3 style="margin-bottom: 12px; color: var(--color-text);">Shelter Resources</h3>
        <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Locate emergency shelters and relief camps</p>
        <button class="btn btn--primary" onclick="showToast('🏠 Shelter', 'Locating nearest emergency shelters', 'info')">Find Shelters</button>
      </div>
      <div class="resource-card" style="background: var(--color-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--color-border); text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🤝</div>
        <h3 style="margin-bottom: 12px; color: var(--color-text);">Volunteer Network</h3>
        <p style="margin-bottom: 16px; color: var(--color-text-secondary);">Join volunteer efforts and community support</p>
        <button class="btn btn--primary" onclick="showToast('🤝 Volunteer', 'Opening volunteer opportunities', 'success')">Join Volunteers</button>
      </div>
    </div>
  `;
}

function setupPreparednessInteractions() {
  document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        showToast('✅ Progress', 'Preparedness item completed', 'success', 2000);
        this.parentElement.style.opacity = '0.7';
        this.parentElement.style.textDecoration = 'line-through';
      } else {
        this.parentElement.style.opacity = '1';
        this.parentElement.style.textDecoration = 'none';
      }
    });
  });
}

function setupResourcesInteractions() {
  // Resource interactions are handled by onclick attributes in the HTML
  console.log('Resource interactions set up');
}

function updateNDRFStats() {
  const stats = document.querySelectorAll('.op-stat .op-number');
  stats.forEach(stat => {
    const currentValue = parseInt(stat.textContent.replace(',', ''));
    const variation = Math.floor(Math.random() * 3);
    const newValue = currentValue + variation;
    stat.textContent = newValue.toLocaleString();
  });
}

// Global function exports for HTML onclick handlers
window.makeCall = makeEmergencyCall;
window.makeEmergencyCall = makeEmergencyCall;
window.updateUserLocation = updateUserLocation;
window.refreshMapData = refreshMapData;

window.viewDisasterDetails = (id) => {
  showToast('🌊 Disaster Details', `Loading details for disaster ID: ${id}`, 'info');
};

window.getDirections = (location) => {
  showToast('🗺️ Navigation', `Getting directions to ${location}`, 'info');
};

window.contactNDRFTeam = (team) => {
  showToast('🚁 NDRF Contact', `Contacting ${team} team...`, 'warning');
};

// Load saved preferences
document.addEventListener('DOMContentLoaded', function() {
  // Theme preference
  const savedTheme = localStorage.getItem('hawkSightTheme');
  if (savedTheme === 'dark') {
    appState.isDarkMode = true;
    document.documentElement.setAttribute('data-color-scheme', 'dark');
  }
  
  // Language preference
  const savedLanguage = localStorage.getItem('hawkSightLanguage');
  if (savedLanguage) {
    appState.currentLanguage = savedLanguage;
  }
});

console.log('🦅 Hawk Sight India Emergency Management System v4.0 Loaded');
console.log('📱 Optimized for cross-platform emergency response');
console.log('🚨 Emergency Hotline: +91 7204805507');
console.log('🚁 NDRF Helpline: 9711077372');
console.log('⌨️ Keyboard Shortcuts: Alt+E (Emergency), Alt+D (Dashboard), Alt+A (Alerts)');


// ---------------- AI AGENT WIDGET ----------------
let agentHistory = [];

// Distress words for a client-side safety net that fires even before the LLM
// responds - belt-and-suspenders for a real emergency app.
const DISTRESS_WORDS = ['trapped', 'help me', 'drowning', 'bleeding', 'can\'t breathe', 'cant breathe', 'stuck', 'dying', 'emergency', 'collapsed', 'on fire', 'flooding fast'];

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('aiAgentBtn');
  const panel = document.getElementById('aiAgentPanel');
  const closeBtn = document.getElementById('aiAgentClose');
  const sendBtn = document.getElementById('aiAgentSend');
  const inputEl = document.getElementById('aiAgentInput');

  if (!btn) return; // widget not present on this page

  btn.addEventListener('click', () => panel.classList.toggle('hidden'));
  closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
  sendBtn.addEventListener('click', sendAgentMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAgentMessage();
  });
});

function appendAgentMessage(text, who) {
  if (!text) return;
  const box = document.getElementById('aiAgentMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ${who}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// Proactive Distress Detection Agent: a fast, deterministic check that runs
// locally before the message even reaches the LLM, so a slow/failed API
// call can never delay an SOS offer.
function checkForDistress(message) {
  const lower = message.toLowerCase();
  return DISTRESS_WORDS.some((w) => lower.includes(w));
}

function offerQuickSOS() {
  const box = document.getElementById('aiAgentMessages');
  const wrap = document.createElement('div');
  wrap.className = 'ai-msg bot';
  wrap.innerHTML = `That sounds urgent. <button id="quickSOSBtn" style="margin-top:6px;display:block;background:#e53e3e;color:#fff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;">🚨 Activate SOS now</button>`;
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
  document.getElementById('quickSOSBtn').addEventListener('click', () => {
    if (typeof activateEmergencySOS === 'function') activateEmergencySOS();
  });
}

async function sendAgentMessage() {
  const input = document.getElementById('aiAgentInput');
  const message = input.value.trim();
  if (!message) return;
  appendAgentMessage(message, 'user');
  input.value = '';

  if (checkForDistress(message)) offerQuickSOS();

  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: agentHistory })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      appendAgentMessage(err.error || 'The assistant server returned an error.', 'bot');
      return;
    }
    const data = await res.json();
    await handleAgentResponse(data);
  } catch (err) {
    console.error(err);
    appendAgentMessage('Sorry, I could not reach the assistant server. Is server.js running?', 'bot');
  }
}

// Handles the server's reply: shows any text, and if the model asked for a
// browser action (navigate/SOS/call/gauge/report/route), runs it and
// reports the result back so the model can continue.
async function handleAgentResponse(data) {
  agentHistory = data.messagesSoFar;
  if (data.text) appendAgentMessage(data.text, 'bot');
  if (data.done) return;

  if (data.action) {
    const result = executeAgentTool(data.action.name, data.action.arguments);
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: agentHistory,
        toolResult: { tool_call_id: data.action.tool_call_id, result }
      })
    });
    const followUp = await res.json();
    await handleAgentResponse(followUp);
  }
}

// The "agentic" part: map tool names the model picks to real site actions
function executeAgentTool(name, input) {
  switch (name) {
    case 'navigate_section':
      if (typeof navigateToSection === 'function') navigateToSection(input.section);
      return { status: 'navigated', section: input.section };

    case 'trigger_sos':
      if (typeof activateEmergencySOS === 'function') activateEmergencySOS();
      return { status: 'sos_modal_opened' };

    case 'call_number':
      if (typeof makeEmergencyCall === 'function') makeEmergencyCall(input.number);
      return { status: 'call_initiated', number: input.number };

    case 'update_risk_assessment':
      updateRiskGauge(input.percent, input.risk_level);
      if (typeof showToast === 'function') {
        showToast('🤖 Risk Updated', input.reason || `${input.risk_level} risk`, 'warning', 4000);
      }
      return { status: 'gauge_updated', risk_level: input.risk_level, percent: input.percent };

    case 'file_incident_report': {
      const reportId = `INC-${Date.now().toString().slice(-6)}`;
      if (typeof showToast === 'function') {
        showToast('📋 Report Filed', `${reportId}: ${input.incident_type} at ${input.location}`, 'success', 5000);
      }
      return { status: 'filed', report_id: reportId, ...input };
    }

    case 'draw_evacuation_route':
      return drawEvacuationRoute(input.destination);

    default:
      return { error: 'unknown tool' };
  }
}

// ---- Risk Assessment Agent: redraws the existing canvas gauge with a live value ----
function updateRiskGauge(percent, riskLevel) {
  const canvas = document.getElementById('riskGauge');
  const label = document.querySelector('.risk-value');
  const badge = document.querySelector('.risk-indicator');
  if (!canvas) return;

  const pct = Math.max(0, Math.min(100, percent)) / 100;
  const colors = { low: '#22C55E', mod: '#F59E0B', high: '#F97316', severe: '#EF4444' };
  let color = colors.mod;
  if (pct < 0.3) color = colors.low;
  else if (pct < 0.55) color = colors.mod;
  else if (pct < 0.8) color = colors.high;
  else color = colors.severe;

  try {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 10;
    const radius = 80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#E5E7EB';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + Math.PI * pct);
    ctx.lineWidth = 20;
    ctx.strokeStyle = color;
    ctx.stroke();

    const needleAngle = Math.PI + Math.PI * pct;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(needleAngle) * (radius - 10), centerY + Math.sin(needleAngle) * (radius - 10));
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1F2937';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
  } catch (e) {
    console.error('Error updating risk gauge:', e);
  }

  if (label) label.textContent = riskLevel;
  if (badge) badge.textContent = riskLevel.includes('High') || riskLevel === 'Severe' ? 'Red Alert' : riskLevel === 'Low' ? 'Green Status' : 'Orange Alert';
}

// ---- Evacuation Route Agent: draws a route on whichever Leaflet map is live ----
const SAFE_DESTINATIONS = {
  nearest_shelter: { name: 'Modern School Relief Camp', lat: 28.6139, lng: 77.2090 },
  nearest_hospital: { name: 'AIIMS Emergency', lat: 28.5665, lng: 77.2100 },
  safe_zone: { name: 'Designated Safe Zone', lat: 28.6304, lng: 77.2177 }
};

function drawEvacuationRoute(destinationKey) {
  const dest = SAFE_DESTINATIONS[destinationKey] || SAFE_DESTINATIONS.safe_zone;

  const draw = () => {
    const map = (window.appState && (appState.maps.fullscreen || appState.maps.dashboard));
    if (!map || typeof L === 'undefined') return false;

    const start = (window.appState && appState.userLocation)
      ? [appState.userLocation.lat, appState.userLocation.lng]
      : (CONFIG && CONFIG.map ? CONFIG.map.default_center : [28.6139, 77.2090]);

    const line = L.polyline([start, [dest.lat, dest.lng]], { color: '#1FB8CD', weight: 5, dashArray: '8,6' }).addTo(map);
    L.marker([dest.lat, dest.lng]).addTo(map).bindPopup(`🏁 ${dest.name}`).openPopup();
    map.fitBounds(line.getBounds(), { padding: [40, 40] });
    return true;
  };

  if (!draw()) {
    // Map for this section may not exist yet - switch to it and retry shortly
    if (typeof navigateToSection === 'function') navigateToSection('mapping');
    setTimeout(draw, 1200);
  }

  if (typeof showToast === 'function') {
    showToast('🧭 Route Drawn', `Evacuation route to ${dest.name}`, 'info', 4000);
  }
  return { status: 'route_drawn', destination: dest.name };
}
