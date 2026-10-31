
// FLAREMAP DASHBOARD

const temperatureDisplay = document.getElementById("temperature");
const humidityDisplay = document.getElementById("humidity");
const mq5Display = document.getElementById("mq5");
const mq7Display = document.getElementById("mq7");

const connectionDisplay = document.getElementById("connection");
const alertDisplay = document.getElementById("alert");
const lastUpdateDisplay = document.getElementById("lastUpdate");

const installButton = document.getElementById("installButton");
const installMessage = document.getElementById("installMessage");

const enableNotifications =
  document.getElementById("enableNotifications");

const notificationStatus =
  document.getElementById("notificationStatus");

const notificationList =
  document.getElementById("notificationList");

const soundEnabled =
  document.getElementById("soundEnabled");

const testSoundButton =
  document.getElementById("testSound");


// --------------------------------
// SENSOR DISPLAY
// --------------------------------

// Demo values only. Not actual sensor readings.
function showDemoData() {
  const demoData = {
    temperature: (25 + Math.random() * 5).toFixed(1),
    humidity: Math.round(50 + Math.random() * 15),
    mq5: Math.round(100 + Math.random() * 80),
    mq7: Math.round(100 + Math.random() * 80),

    // Change to true only to test the alert system.
    demoAlert: false
  };

  updateSensorDisplay(demoData);

  connectionDisplay.textContent = "Device: Demo mode";
  lastUpdateDisplay.textContent =
    "Last update: " + new Date().toLocaleTimeString();

  checkSensorAlerts(demoData);
}

function updateSensorDisplay(data) {
  if (data.temperature !== undefined) {
    temperatureDisplay.textContent = data.temperature + " °C";
  }

  if (data.humidity !== undefined) {
    humidityDisplay.textContent = data.humidity + " %";
  }

  if (data.mq5 !== undefined) {
    mq5Display.textContent = data.mq5;
  }

  if (data.mq7 !== undefined) {
    mq7Display.textContent = data.mq7;
  }
}


// --------------------------------
// NOTIFICATION PERMISSION
// --------------------------------

let notificationPermission = "default";

enableNotifications.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    notificationStatus.textContent =
      "This browser does not support notifications.";
    return;
  }

  notificationPermission = await Notification.requestPermission();

  if (notificationPermission === "granted") {
    notificationStatus.textContent =
      "Phone notifications are enabled.";
    enableNotifications.textContent = "Notifications Enabled";
  } else {
    notificationStatus.textContent =
      "Notification permission was not granted.";
  }
});


// --------------------------------
// ALERT SOUND
// --------------------------------

let audioContext = null;
let alertSoundTimer = null;

async function prepareAudio() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return false;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext.state === "running";
}

async function playAlertSound() {
  if (!soundEnabled.checked) return;

  const ready = await prepareAudio();
  if (!ready) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;

  const now = audioContext.currentTime;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.45);
}

function startAlertSound() {
  if (!soundEnabled.checked || alertSoundTimer !== null) return;

  playAlertSound();

  alertSoundTimer = setInterval(() => {
    if (soundEnabled.checked) {
      playAlertSound();
    } else {
      stopAlertSound();
    }
  }, 5000);
}

function stopAlertSound() {
  if (alertSoundTimer !== null) {
    clearInterval(alertSoundTimer);
    alertSoundTimer = null;
  }
}

testSoundButton.addEventListener("click", async () => {
  await playAlertSound();
});

document.addEventListener("pointerdown", () => {
  prepareAudio();
}, { once: true });

soundEnabled.addEventListener("change", () => {
  if (!soundEnabled.checked) {
    stopAlertSound();
  } else if (activeAlerts.size > 0) {
    startAlertSound();
  }
});


// --------------------------------
// ALERT MANAGEMENT
// --------------------------------

let activeAlerts = new Set();
let previousAlerts = new Set();

function addAlert(message) {
  const item = document.createElement("div");
  item.className = "alert-item";
  item.textContent =
    new Date().toLocaleTimeString() + " — " + message;

  notificationList.prepend(item);

  if (notificationList.children.length > 10) {
    notificationList.lastElementChild.remove();
  }

  if (notificationPermission === "granted") {
    new Notification("FlareMap Alert", {
      body: message,
      icon: "./icons/icon-192.png"
    });
  }
}

function checkSensorAlerts(data) {
  const currentAlerts = new Set();

  // DEMONSTRATION ONLY.
  // Do not use raw MQ readings as validated safety thresholds.
  if (data.demoAlert === true) {
    currentAlerts.add("demo");
  }

  for (const alert of currentAlerts) {
    if (!previousAlerts.has(alert)) {
      addAlert("Demonstration alert: sensor reading needs attention.");
    }
  }

  activeAlerts = currentAlerts;
  previousAlerts = new Set(currentAlerts);

  if (activeAlerts.size > 0) {
    alertDisplay.textContent = "Status: Alert active";
    startAlertSound();
  } else {
    alertDisplay.textContent = "Status: No demo alert active";
    stopAlertSound();
  }
}


// --------------------------------
// PWA INSTALLATION
// --------------------------------

let deferredInstallPrompt = null;

const isInstalled =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

if (isInstalled) {
  installButton.hidden = true;
  installMessage.textContent = "FlareMap is installed.";
} else {
  installMessage.textContent =
    "Open in Chrome and wait for installation availability.";

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredInstallPrompt = event;
    installButton.hidden = false;
    installMessage.textContent = "FlareMap is ready to install.";
  });

  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      installMessage.textContent =
        "Install is not available. Try Chrome's menu.";
      return;
    }

    deferredInstallPrompt.prompt();

    const result = await deferredInstallPrompt.userChoice;

    installMessage.textContent =
      result.outcome === "accepted"
        ? "Installation accepted."
        : "Installation cancelled.";

    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    installMessage.textContent = "FlareMap installed.";
    deferredInstallPrompt = null;
  });
}


// --------------------------------
// SERVICE WORKER
// --------------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      console.log("FlareMap service worker registered.");
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}


// --------------------------------
// START DASHBOARD
// --------------------------------

showDemoData();
setInterval(showDemoData, 3000);
