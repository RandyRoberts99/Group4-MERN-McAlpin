import React, { useState, useEffect, useRef } from 'react';
import { db } from "./utils/firebase.js";
import { onValue, ref, getDatabase, update, push } from "firebase/database";
import './App.css';

function App() {
  // Constants handling the canvas directly (this will likely turn to database stuff later)
  const [grids, setGrids] = useState({});
  const [pixels, setPixels] = useState([]);
  const [canvasSize, setCanvasSize] = useState({width: 512, height: 512});
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

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
    // Relevant canvas-based constants
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const gridsRef = ref(db, 'canvas');

    // Keep canvas pixels updated from database
    onValue(gridsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGrids(data);
      }
    });

    // This adjusts canvas view size based on zoom level
    canvas.width = canvasSize.width * zoomLevel;
    canvas.height = canvasSize.height * zoomLevel;

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Iterate through each grid in the canvas
  Object.keys(grids).forEach((gridKey) => {
    const grid = grids[gridKey];

    // Iterate through each pixel within the given grid
    Object.keys(grid).forEach((pixelKey) => {
      const pixel = grid[pixelKey];
      context.fillStyle = pixel.color;
      context.fillRect(
        pixel.x * zoomLevel + parseInt(gridKey.split('_')[0]) * 16 * zoomLevel,
        pixel.y * zoomLevel + parseInt(gridKey.split('_')[1]) * 16 * zoomLevel,
        zoomLevel, zoomLevel
      );
    });
  });
  }, [grids, canvasSize, zoomLevel]);



  // How to handle user clicking on the canvas
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');

    // Scale pixel coordinates based on user zoom level
    const x = Math.floor((event.clientX - rect.left) / zoomLevel);
    const y = Math.floor((event.clientY - rect.top) / zoomLevel);

    // Determine what grid needs to be updated in firebase
    const gridX = Math.floor(x / 16);
    const gridY = Math.floor(y / 16);

    // Determine the position within the grid the pixel is in
    const pixelX = x % 16;
    const pixelY = y % 16;

    // Get the existing grid or create a new one
    const updatedGrid = grids[`${gridX}_${gridY}`] || {};

    // Update the pixel color
    updatedGrid[`${pixelX}_${pixelY}`] = { x: pixelX, y: pixelY, color: selectedColor };

    // Update firebase with new grid
    update(ref(db, `canvas/${gridX}_${gridY}`), updatedGrid);

    // Draw the new pixel to the canvas
    context.fillStyle = selectedColor;
    context.fillRect(
      pixelX * 10 * zoomLevel + gridX * 16 * 10 * zoomLevel,
      pixelY * 10 * zoomLevel + gridY * 16 * 10 * zoomLevel,
      10 * zoomLevel, 10 * zoomLevel
    );
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
      <canvas ref={canvasRef} id="pixelCanvas" onClick={handleCanvasClick} onWheel={handleWheel}></canvas>
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