
// FlareMap - Dashboard Demo

const temperatureDisplay = document.getElementById("temperature");
const humidityDisplay = document.getElementById("humidity");
const smokeDisplay = document.getElementById("smoke");
const connectionDisplay = document.getElementById("connection");
const alertDisplay = document.getElementById("alert");

// Demo readings only — not real sensor data.
function updateDashboard() {
  const temperature = (25 + Math.random() * 5).toFixed(1);
  const humidity = Math.round(50 + Math.random() * 15);
  const smoke = Math.round(100 + Math.random() * 80);

  temperatureDisplay.textContent = temperature + " °C";
  humidityDisplay.textContent = humidity + " %";
  smokeDisplay.textContent = smoke;

  connectionDisplay.textContent = "ESP32: Demo mode";
  alertDisplay.textContent = "Status: Sample readings only";
}

// Update sample values every 3 seconds.
updateDashboard();
setInterval(updateDashboard, 3000);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}