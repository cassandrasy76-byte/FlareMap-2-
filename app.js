
// FlareMap - Pink Dashboard Demo

const temperatureDisplay = document.getElementById("temperature");
const humidityDisplay = document.getElementById("humidity");
const smokeDisplay = document.getElementById("smoke");
const gasDisplay = document.getElementById("gas");
const connectionDisplay = document.getElementById("connection");
const alertDisplay = document.getElementById("alert");

function updateDashboard() {
  // SIMULATED DATA ONLY
  const temperature = (25 + Math.random() * 5).toFixed(1);
  const humidity = Math.round(50 + Math.random() * 15);
  const smoke = Math.round(100 + Math.random() * 80);
  const gas = Math.round(100 + Math.random() * 80);

  temperatureDisplay.textContent = temperature + " °C";
  humidityDisplay.textContent = humidity + " %";
  smokeDisplay.textContent = smoke;
  gasDisplay.textContent = gas;

  connectionDisplay.textContent = "ESP32: Demo mode";
  alertDisplay.textContent = "Demo mode: Sample readings only";
}

// Start dashboard
updateDashboard();
setInterval(updateDashboard, 3000);

// Register service worker
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
