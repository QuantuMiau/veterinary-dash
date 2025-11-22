// thermal-camera.js - Visualización de cámara térmica con interpolación bicúbica

class ThermalCamera {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Dimensiones del sensor MLX90640
    this.sensorWidth = 32;
    this.sensorHeight = 24;

    // Factor de escalado para interpolación
    this.scaleX = this.width / this.sensorWidth;
    this.scaleY = this.height / this.sensorHeight;

    // Último frame recibido
    this.lastFrame = null;

    // Rango de temperatura para el mapa de colores
    this.minTemp = 20;
    this.maxTemp = 40;
  }

  // Mapa de colores térmico (Iron/Rainbow)
  getThermalColor(temperature) {
    // Normalizar temperatura entre 0 y 1
    let normalized =
      (temperature - this.minTemp) / (this.maxTemp - this.minTemp);
    normalized = Math.max(0, Math.min(1, normalized)); // Clamp entre 0-1

    let r, g, b;

    // Gradiente de colores térmico mejorado
    if (normalized < 0.25) {
      // Azul oscuro -> Azul
      let t = normalized / 0.25;
      r = 0;
      g = 0;
      b = Math.floor(100 + 155 * t);
    } else if (normalized < 0.5) {
      // Azul -> Cian -> Verde
      let t = (normalized - 0.25) / 0.25;
      r = 0;
      g = Math.floor(255 * t);
      b = Math.floor(255 * (1 - t));
    } else if (normalized < 0.75) {
      // Verde -> Amarillo
      let t = (normalized - 0.5) / 0.25;
      r = Math.floor(255 * t);
      g = 255;
      b = 0;
    } else {
      // Amarillo -> Rojo
      let t = (normalized - 0.75) / 0.25;
      r = 255;
      g = Math.floor(255 * (1 - t));
      b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Interpolación bicúbica
  cubicInterpolate(p, x) {
    return (
      p[1] +
      0.5 *
        x *
        (p[2] -
          p[0] +
          x *
            (2.0 * p[0] -
              5.0 * p[1] +
              4.0 * p[2] -
              p[3] +
              x * (3.0 * (p[1] - p[2]) + p[3] - p[0])))
    );
  }

  bicubicInterpolate(p, x, y) {
    let arr = [];
    arr[0] = this.cubicInterpolate([p[0][0], p[0][1], p[0][2], p[0][3]], y);
    arr[1] = this.cubicInterpolate([p[1][0], p[1][1], p[1][2], p[1][3]], y);
    arr[2] = this.cubicInterpolate([p[2][0], p[2][1], p[2][2], p[2][3]], y);
    arr[3] = this.cubicInterpolate([p[3][0], p[3][1], p[3][2], p[3][3]], y);
    return this.cubicInterpolate(arr, x);
  }

  // Obtener valor del frame con manejo de bordes
  getFrameValue(frame, x, y) {
    x = Math.max(0, Math.min(this.sensorWidth - 1, x));
    y = Math.max(0, Math.min(this.sensorHeight - 1, y));
    return frame[y * this.sensorWidth + x];
  }

  // Renderizar frame con interpolación bicúbica
  renderFrame(frameData) {
    if (!frameData || frameData.length !== 768) {
      console.error("Frame inválido");
      return;
    }

    this.lastFrame = frameData;

    // Calcular rango dinámico de temperatura
    this.minTemp = Math.min(...frameData);
    this.maxTemp = Math.max(...frameData);

    // Crear ImageData para renderizado rápido
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;

    // Renderizar cada píxel con interpolación
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Coordenadas en el espacio del sensor
        let sensorX = x / this.scaleX;
        let sensorY = y / this.scaleY;

        let ix = Math.floor(sensorX);
        let iy = Math.floor(sensorY);

        let fx = sensorX - ix;
        let fy = sensorY - iy;

        // Obtener valores 4x4 para interpolación bicúbica
        let p = [];
        for (let dy = -1; dy <= 2; dy++) {
          p[dy + 1] = [];
          for (let dx = -1; dx <= 2; dx++) {
            p[dy + 1][dx + 1] = this.getFrameValue(frameData, ix + dx, iy + dy);
          }
        }

        // Interpolar temperatura
        let temp = this.bicubicInterpolate(p, fx, fy);

        // Convertir a color
        let color = this.getThermalColor(temp);
        let rgb = color.match(/\d+/g);

        // Establecer píxel en ImageData
        let idx = (y * this.width + x) * 4;
        data[idx] = parseInt(rgb[0]); // R
        data[idx + 1] = parseInt(rgb[1]); // G
        data[idx + 2] = parseInt(rgb[2]); // B
        data[idx + 3] = 255; // A
      }
    }

    // Renderizar imagen
    this.ctx.putImageData(imageData, 0, 0);

    // Agregar información de temperatura
    this.drawOverlay();
  }

  // Dibujar overlay con información
  drawOverlay() {
    // Escala de colores
    this.drawColorScale();

    // Temperatura mínima y máxima
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 3;
    this.ctx.font = "bold 14px Arial";

    let maxText = `Max: ${this.maxTemp.toFixed(1)}°C`;
    let minText = `Min: ${this.minTemp.toFixed(1)}°C`;

    this.ctx.strokeText(maxText, 10, 25);
    this.ctx.fillText(maxText, 10, 25);

    this.ctx.strokeText(minText, 10, 45);
    this.ctx.fillText(minText, 10, 45);
  }

  // Dibujar escala de colores
  drawColorScale() {
    const scaleWidth = 20;
    const scaleHeight = 150;
    const scaleX = this.width - scaleWidth - 10;
    const scaleY = 10;

    for (let i = 0; i < scaleHeight; i++) {
      let normalized = i / scaleHeight;
      let temp =
        this.minTemp + (this.maxTemp - this.minTemp) * (1 - normalized);
      this.ctx.fillStyle = this.getThermalColor(temp);
      this.ctx.fillRect(scaleX, scaleY + i, scaleWidth, 1);
    }

    // Borde de la escala
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(scaleX, scaleY, scaleWidth, scaleHeight);
  }

  // Limpiar canvas
  clear() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Exportar para usar en otros archivos
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThermalCamera;
}
