// Configuración de la API
const API_BASE = "http://192.168.1.18:9090";

// Datos para las gráficas
let patientTempData = [];
let ambientTempData = [];
let humidityData = [];

// Referencias a las gráficas
let chartPatient, chartAmbient, chartHumidity;
let patientSeries, ambientSeries, humiditySeries;

// Inicializar gráficas cuando se carga la página
window.addEventListener("load", function () {
  initCharts();
  loadInitialData();
  startRealtimeUpdates();
  updateMonitoringStatus();
});

// Inicializar las tres gráficas
function initCharts() {
  // Gráfica de Temperatura del Paciente
  am5.ready(function () {
    let root1 = am5.Root.new("chartPatient");
    root1.setThemes([am5themes_Animated.new(root1)]);

    chartPatient = root1.container.children.push(
      am5xy.XYChart.new(root1, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    let xAxis1 = chartPatient.xAxes.push(
      am5xy.DateAxis.new(root1, {
        baseInterval: { timeUnit: "second", count: 1 },
        renderer: am5xy.AxisRendererX.new(root1, {}),
      })
    );

    let yAxis1 = chartPatient.yAxes.push(
      am5xy.ValueAxis.new(root1, {
        renderer: am5xy.AxisRendererY.new(root1, {}),
      })
    );

    patientSeries = chartPatient.series.push(
      am5xy.LineSeries.new(root1, {
        name: "Temperatura Paciente",
        xAxis: xAxis1,
        yAxis: yAxis1,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root1, {
          labelText: "{valueY}°C",
        }),
      })
    );

    patientSeries.strokes.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0xff6b6b),
    });

    chartPatient.set("cursor", am5xy.XYCursor.new(root1, {}));
  });

  // Gráfica de Temperatura Ambiente
  am5.ready(function () {
    let root2 = am5.Root.new("chartAmbient");
    root2.setThemes([am5themes_Animated.new(root2)]);

    chartAmbient = root2.container.children.push(
      am5xy.XYChart.new(root2, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    let xAxis2 = chartAmbient.xAxes.push(
      am5xy.DateAxis.new(root2, {
        baseInterval: { timeUnit: "second", count: 1 },
        renderer: am5xy.AxisRendererX.new(root2, {}),
      })
    );

    let yAxis2 = chartAmbient.yAxes.push(
      am5xy.ValueAxis.new(root2, {
        renderer: am5xy.AxisRendererY.new(root2, {}),
      })
    );

    ambientSeries = chartAmbient.series.push(
      am5xy.LineSeries.new(root2, {
        name: "Temperatura Ambiente",
        xAxis: xAxis2,
        yAxis: yAxis2,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root2, {
          labelText: "{valueY}°C",
        }),
      })
    );

    ambientSeries.strokes.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0x4ecdc4),
    });

    chartAmbient.set("cursor", am5xy.XYCursor.new(root2, {}));
  });

  // Gráfica de Humedad
  am5.ready(function () {
    let root3 = am5.Root.new("chartHumidity");
    root3.setThemes([am5themes_Animated.new(root3)]);

    chartHumidity = root3.container.children.push(
      am5xy.XYChart.new(root3, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
      })
    );

    let xAxis3 = chartHumidity.xAxes.push(
      am5xy.DateAxis.new(root3, {
        baseInterval: { timeUnit: "second", count: 1 },
        renderer: am5xy.AxisRendererX.new(root3, {}),
      })
    );

    let yAxis3 = chartHumidity.yAxes.push(
      am5xy.ValueAxis.new(root3, {
        renderer: am5xy.AxisRendererY.new(root3, {}),
        min: 0,
        max: 100,
      })
    );

    humiditySeries = chartHumidity.series.push(
      am5xy.LineSeries.new(root3, {
        name: "Humedad",
        xAxis: xAxis3,
        yAxis: yAxis3,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root3, {
          labelText: "{valueY}%",
        }),
      })
    );

    humiditySeries.strokes.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0x95e1d3),
    });

    chartHumidity.set("cursor", am5xy.XYCursor.new(root3, {}));
  });
}

// Cargar datos iniciales
async function loadInitialData() {
  try {
    // Obtener última temperatura del paciente
    const tempResponse = await fetch(`${API_BASE}/temperature/last`);
    const tempData = await tempResponse.json();
    console.log("🔴 Datos MLX90640:", tempData);

    if (tempData.value) {
      const date = new Date(tempData.created_at).getTime();
      patientTempData.push({ date: date, value: tempData.value });
      patientSeries.data.setAll(patientTempData);
      document.getElementById("current-mlx-temp").textContent =
        tempData.value.toFixed(1) + "°C";
    }

    // Obtener última lectura del DHT11
    const dhtResponse = await fetch(`${API_BASE}/dht11/last`);
    const dhtData = await dhtResponse.json();
    console.log("🔵 Datos DHT11:", dhtData);

    if (dhtData.temperature) {
      const date = new Date(dhtData.created_at).getTime();
      ambientTempData.push({ date: date, value: dhtData.temperature });
      humidityData.push({ date: date, value: dhtData.humidity });

      console.log("📊 Datos para gráfica Ambiente:", ambientTempData);
      console.log("📊 Datos para gráfica Humedad:", humidityData);
      console.log("✅ ambientSeries existe:", !!ambientSeries);
      console.log("✅ humiditySeries existe:", !!humiditySeries);

      ambientSeries.data.setAll(ambientTempData);
      humiditySeries.data.setAll(humidityData);

      document.getElementById("current-dht-temp").textContent =
        dhtData.temperature.toFixed(1) + "°C";
      document.getElementById("current-humidity").textContent =
        dhtData.humidity.toFixed(0) + "%";
    } else {
      console.warn("⚠️ No hay datos de temperatura en dhtData");
    }
  } catch (error) {
    console.error("❌ Error cargando datos iniciales:", error);
  }
}

// Actualizar en tiempo real
function startRealtimeUpdates() {
  setInterval(async () => {
    try {
      // Actualizar temperatura del paciente
      const tempResponse = await fetch(`${API_BASE}/temperature/last`);
      const tempData = await tempResponse.json();

      if (tempData.value) {
        const date = new Date(tempData.created_at).getTime();
        patientTempData.push({ date: date, value: tempData.value });

        // Mantener solo los últimos 50 datos
        if (patientTempData.length > 50) {
          patientTempData.shift();
        }

        patientSeries.data.setAll(patientTempData);
        document.getElementById("current-mlx-temp").textContent =
          tempData.value.toFixed(1) + "°C";
      }

      // Actualizar DHT11
      const dhtResponse = await fetch(`${API_BASE}/dht11/last`);
      const dhtData = await dhtResponse.json();
      console.log("🔄 Actualización DHT11:", dhtData);

      if (dhtData.temperature) {
        const date = new Date(dhtData.created_at).getTime();

        ambientTempData.push({ date: date, value: dhtData.temperature });
        humidityData.push({ date: date, value: dhtData.humidity });

        // Mantener solo los últimos 50 datos
        if (ambientTempData.length > 50) {
          ambientTempData.shift();
        }
        if (humidityData.length > 50) {
          humidityData.shift();
        }

        console.log("📊 Actualizando gráficas DHT11...");
        ambientSeries.data.setAll(ambientTempData);
        humiditySeries.data.setAll(humidityData);

        document.getElementById("current-dht-temp").textContent =
          dhtData.temperature.toFixed(1) + "°C";
        document.getElementById("current-humidity").textContent =
          dhtData.humidity.toFixed(0) + "%";
      } else {
        console.warn(
          "⚠️ No hay datos de temperatura del DHT11 en la respuesta"
        );
      }
    } catch (error) {
      console.error("❌ Error actualizando datos:", error);
    }
  }, 2000); // Actualizar cada 2 segundos
}

// Funciones de control
async function activateMonitoring() {
  try {
    const response = await fetch(`${API_BASE}/monitoring/on`, {
      method: "POST",
    });
    const data = await response.json();
    console.log(data.message);
    updateMonitoringStatus();
  } catch (error) {
    console.error("Error activando monitoreo:", error);
  }
}

async function deactivateMonitoring() {
  try {
    const response = await fetch(`${API_BASE}/monitoring/off`, {
      method: "POST",
    });
    const data = await response.json();
    console.log(data.message);
    updateMonitoringStatus();
  } catch (error) {
    console.error("Error desactivando monitoreo:", error);
  }
}

let buzzerState = false;
async function toggleBuzzer() {
  try {
    const endpoint = buzzerState ? "/buzzer/off" : "/buzzer/on";
    const response = await fetch(`${API_BASE}${endpoint}`, { method: "POST" });
    const data = await response.json();
    buzzerState = !buzzerState;
    console.log(data.message);
  } catch (error) {
    console.error("Error controlando buzzer:", error);
  }
}

async function updateMonitoringStatus() {
  try {
    const response = await fetch(`${API_BASE}/monitoring/status`);
    const data = await response.json();
    const statusElement = document.getElementById("monitoring-status");

    if (data.active) {
      statusElement.textContent = "✅ Estado: Monitoreo ACTIVO";
      statusElement.className = "monitoring-status monitoring-active";
    } else {
      statusElement.textContent = "⚠️ Estado: Monitoreo INACTIVO";
      statusElement.className = "monitoring-status monitoring-inactive";
    }
  } catch (error) {
    console.error("Error obteniendo estado de monitoreo:", error);
  }
}

// Actualizar estado de monitoreo cada 5 segundos
setInterval(updateMonitoringStatus, 5000);

// ============================================
// WebSocket para Cámara Térmica en Tiempo Real
// ============================================

const wsHost = "192.168.1.18:9090";
let thermalCamera;
let thermalWebSocket;
let wsStatusElement;

// Inicializar WebSocket cuando se carga la página
window.addEventListener("load", function () {
  // Obtener elemento de estado
  wsStatusElement = document.querySelector(".ws-status");

  // Inicializar cámara térmica
  thermalCamera = new ThermalCamera("thermalCanvas");

  // Conectar WebSocket
  connectThermalWebSocket();
});

function connectThermalWebSocket() {
  console.log("Conectando a WebSocket de cámara térmica...");
  updateWsStatus("Conectando...", "connecting");

  thermalWebSocket = new WebSocket(`ws://${wsHost}/thermal`);

  thermalWebSocket.onopen = function (event) {
    console.log("✅ WebSocket conectado");
    updateWsStatus("🟢 Conectado", "connected");
  };

  thermalWebSocket.onmessage = function (event) {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "thermal_frame" && message.data) {
        // Renderizar el frame térmico con interpolación bicúbica
        thermalCamera.renderFrame(message.data);
      }
    } catch (error) {
      console.error("Error procesando frame térmico:", error);
    }
  };

  thermalWebSocket.onerror = function (error) {
    console.error("❌ Error en WebSocket:", error);
    updateWsStatus("🔴 Error", "error");
  };

  thermalWebSocket.onclose = function (event) {
    console.log("WebSocket cerrado. Reconectando en 3 segundos...");
    updateWsStatus("🟡 Desconectado", "disconnected");

    // Intentar reconectar después de 3 segundos
    setTimeout(connectThermalWebSocket, 3000);
  };
}

function updateWsStatus(text, status) {
  if (wsStatusElement) {
    wsStatusElement.textContent = text;
    wsStatusElement.className = `ws-status ws-${status}`;
  }
}
