import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pixels, setPixels] = useState([]);
  const [canvasSize, setCanvasSize] = useState({width: 10000, height: 10000});
  const [zoomLevel, setZoomLevel] = useState(1);

  // How to handle pixels being adjusted/rendered
  useEffect(() => {
    const canvas = document.getElementById('pixelCanvas');
    const context = canvas.getContext('2d');

    // This adjusts canvas view size based on zoom level
    canvas.width = canvasSize.width * zoomLevel;
    canvas.height = canvasSize.height * zoomLevel;

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    pixels.forEach((pixel) =>{
      // Set pixel color
      context.fillStyle = '#000000';

      // Adjust this to change size per pixel
      context.fillRect(pixel.x * 10 * zoomLevel, pixel.y * 10 * zoomLevel, 10 * zoomLevel, 10 * zoomLevel);
    });
  }, [pixels, canvasSize, zoomLevel]);

  // How to handle user clicking on the canvas
  const handleCanvasClick = (event) => {
    const canvas = document.getElementById('pixelCanvas');
    const rect = canvas.getBoundingClientRect();

    // Scale pixel coordinates based on user zoom level
    const x = Math.floor((event.clientX - rect.left) / (10 * zoomLevel));
    const y = Math.floor((event.clientY - rect.top) / (10 * zoomLevel));

    // Send pixel updates through
    const updatedPixels = [...pixels];
    updatedPixels.push({x, y});

    setPixels(updatedPixels);
  };

  // How to handle user scroll wheel for zoom level
  const handleWheel = (event) => {
    event.preventDefault();
    const delta = event.deltaY;

    setZoomLevel((prevZoom) => {
      // This line can be adjusted to change zoom incrementing
      const newZoom = prevZoom + (delta > 0 ? -0.1 : 0.1);

      return Math.max(0.1, Math.min(3, newZoom));
    });
  };

  return (
    <div className="App">
      <canvas id="pixelCanvas" onClick={handleCanvasClick} onWheel={handleWheel}></canvas>
    </div>
  );
}

export default App;
