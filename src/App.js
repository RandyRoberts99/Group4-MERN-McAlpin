import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Constants handling the canvas directly (this will likely turn to database stuff later)
  const [pixels, setPixels] = useState([]);
  const [canvasSize, setCanvasSize] = useState({width: 10000, height: 10000});
  const [zoomLevel, setZoomLevel] = useState(1);

  // Variables/Constants handling colors and color changes
  const [selectedColor, setSelectedColor] = useState('#000000'); // Init with default to black

  // Array of all 32 possible colors to use
  const colors = [
    {name: 'burgandy', hex: '#6d001a'}, {name: 'darkred', hex: '#be0039'},
    {name: 'red', hex: '#ff4500'}, {name: 'orange', hex: '#ffa800'},
    {name: 'yellow', hex: '#ffd635'}, {name: 'cream', hex: '#fff8b8'},
    {name: 'darkgreen', hex: '#00a368'}, {name: 'green', hex: '#00cc78'},
    {name: 'lime', hex: '#7eed56'}, {name: 'darkteal', hex: '#00756f'},
    {name: 'teal', hex: '#009eaa'}, {name: 'lightteal', hex: '#00ccc0'},
    {name: 'darkblue', hex: '#2450a4'}, {name: 'blue', hex: '#3690ea'},
    {name: 'cyan', hex: '#51e9f4'}, {name: 'indigo', hex: '#493ac1'},
    {name: 'periwinkle', hex: '#6a5cff'}, {name: 'lavender', hex: '#94b3ff'},
    {name: 'darkpurple', hex: '#811e9f'}, {name: 'purple', hex: '#b44ac0'},
    {name: 'palepurple', hex: '#e4abff'}, {name: 'magenta', hex: '#de107f'},
    {name: 'pink', hex: '#ff3881'}, {name: 'palepink', hex: '#ff99aa'},
    {name: 'darkbrown', hex: '#6d482f'}, {name: 'brown', hex: '#9c6926'},
    {name: 'beige', hex: '#ffb470'}, {name: 'black', hex: '#000000'},
    {name: 'darkgrey', hex: '#515252'}, {name: 'grey', hex: '#898d90'},
    {name: 'lightgrey', hex: '#d4d7d9'}, {name: 'white', hex: '#ffffff'}
  ]



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
      context.fillStyle = pixel.color;

      // Adjust this to change size per pixel
      context.fillRect(pixel.x * 10 * zoomLevel, pixel.y * 10 * zoomLevel, 10 * zoomLevel, 10 * zoomLevel);
    });
  }, [pixels, canvasSize, zoomLevel]);



  // How to handle user clicking on the canvas
  const handleCanvasClick = (event) => {
    const canvas = document.getElementById('pixelCanvas');
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');

    // Scale pixel coordinates based on user zoom level
    const x = Math.floor((event.clientX - rect.left) / (10 * zoomLevel));
    const y = Math.floor((event.clientY - rect.top) / (10 * zoomLevel));

    // Update pixels array with the new pixel color
    setPixels((prevPixels) => [...prevPixels, {x, y, color: selectedColor}]);

    // Draw the new pixel to the canvas
    context.fillStyle = selectedColor;
    context.fillRect(x, y, 10 * zoomLevel, 10 * zoomLevel);
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



  // Handles the user selecting a color button to change their pixel color
  const handleColorChange = (color) => {
    // Console log for debugging
    console.log('User selected color: ${color.name}');

    // Update the selected color for the user globally
    setSelectedColor(color.hex);
  }



  return (
    <div className="App">
      <canvas id="pixelCanvas" onClick={handleCanvasClick} onWheel={handleWheel}></canvas>
      <div className="colorBar">
        {colors.map((color) => (
          <div
          key={color.name}
          className={'colorButton ${color.name}'}
          data-color={color.name}
          style={{backgroundColor: color.hex}}
          onClick={() => handleColorChange(color)}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default App;