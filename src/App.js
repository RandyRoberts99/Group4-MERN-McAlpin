import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from "./utils/firebase.js";
import { onValue, ref, update } from "firebase/database";
import { render } from "react-dom";
import './App.css';

function App() {
  // Constants handling the canvas directly (this will likely turn to database stuff later)
  const [grids, setGrids] = useState({});
  const [canvasSize, setCanvasSize] = useState({width: 512, height: 512});
  const canvasRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({x: 600, y: 600});

  // Constants handling colors and color changes
  const [selectedColor, setSelectedColor] = useState('#000000'); // Init with default to black
  const [highlightedPixel, setHighlightedPixel] = useState(null);
  const colors = [ // Array of all 32 colors available to users
    { name: 'burgandy', hex: '#6d001a' }, { name: 'darkred', hex: '#be0039' },
    { name: 'red', hex: '#ff4500' }, { name: 'orange', hex: '#ffa800' },
    { name: 'yellow', hex: '#ffd635' }, { name: 'cream', hex: '#fff8b8' },
    { name: 'darkgreen', hex: '#00a368' }, { name: 'green', hex: '#00cc78' },
    { name: 'lime', hex: '#7eed56' }, { name: 'darkteal', hex: '#00756f' },
    { name: 'teal', hex: '#009eaa' }, { name: 'lightteal', hex: '#00ccc0' },
    { name: 'darkblue', hex: '#2450a4' }, { name: 'blue', hex: '#3690ea' },
    { name: 'cyan', hex: '#51e9f4' }, { name: 'indigo', hex: '#493ac1' },
    { name: 'periwinkle', hex: '#6a5cff' }, { name: 'lavender', hex: '#94b3ff' },
    { name: 'darkpurple', hex: '#811e9f' }, { name: 'purple', hex: '#b44ac0' },
    { name: 'palepurple', hex: '#e4abff' }, { name: 'magenta', hex: '#de107f' },
    { name: 'pink', hex: '#ff3881' }, { name: 'palepink', hex: '#ff99aa' },
    { name: 'darkbrown', hex: '#6d482f' }, { name: 'brown', hex: '#9c6926' },
    { name: 'beige', hex: '#ffb470' }, { name: 'black', hex: '#000000' },
    { name: 'darkgrey', hex: '#515252' }, { name: 'grey', hex: '#898d90' },
    { name: 'lightgrey', hex: '#d4d7d9' }, { name: 'white', hex: '#ffffff' }
  ]
  const [sendButtonColor, setSendButtonColor] = useState(colors[0].hex);



  // Handle updating the canvas
  const updateLocalCanvas = useCallback((data) => {
    const canvas = canvasRef.current;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      console.error("2D context not found!");
      return;
    }

    // Adjust canvas sizing per zoom level (calculations already made previously)
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Iterate through each grid in the canvas
    Object.keys(data).forEach((gridKey) => {
      const grid = data[gridKey];

      // Iterate through each pixel within the given grid
      Object.keys(grid).forEach((pixelKey) => {
        const pixel = grid[pixelKey];
        context.fillStyle = pixel.color;
        console.log("pan.x: ", pan.x, "pan.y: ", pan.y);
        context.fillRect(
          (pixel.x * zoomLevel + parseInt(gridKey.split('_')[0]) * zoomLevel * 16) - ((pan.x / 512) * ((512 * zoomLevel) - (512))) * zoomLevel,
          (pixel.y * zoomLevel + parseInt(gridKey.split('_')[1]) * zoomLevel * 16) - ((pan.y / 512) * ((512 * zoomLevel) - (512))) * zoomLevel,
          zoomLevel, zoomLevel
        );
      });
    });
    console.log("updateLocalCanvas was run sucessfully.");
  }, [canvasSize, zoomLevel]);



  // Handle pixel highlighting when selected
  const highlightPixel = (context, x, y) => {
    // First check if a pixel is highlighted
    if (!highlightedPixel || highlightedPixel.x !== x || highlightedPixel.y !== y) {
      return; // Exit the function if no pixel is highlighted or if it's a different pixel
    }
  };


  // How to handle pixels being adjusted/rendered
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const gridsRef = ref(db, 'canvas');

    const updateCanvas = (data) => {
      // This adjusts canvas view size based on zoom level
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Iterate through each grid in the canvas
      Object.keys(data).forEach((gridKey) => {
        const grid = data[gridKey];

        // Iterate through each pixel within the given grid
        Object.keys(grid).forEach((pixelKey) => {
          const pixel = grid[pixelKey];
          context.fillStyle = pixel.color;
          context.fillRect(
            (pixel.x * zoomLevel + parseInt(gridKey.split('_')[0]) * zoomLevel * 16) - ((pan.x / 512) * ((512 * zoomLevel) - (512))) * zoomLevel,
            (pixel.y * zoomLevel + parseInt(gridKey.split('_')[1]) * zoomLevel * 16) - ((pan.y / 512) * ((512 * zoomLevel) - (512))) * zoomLevel,
            zoomLevel, zoomLevel
          );
        });
      });
    };

    // Keep canvas pixels updated from the database
    const listener = onValue(gridsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGrids(data);
        updateCanvas(data);
        updateLocalCanvas(data);
      }
    });

    // Cleanup function to detach the listener when the component unmounts
    return () => {
      listener();
    };
  }, [canvasRef, updateLocalCanvas, zoomLevel]);



  // How to handle user clicking on the canvas
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');

    // Scale pixel coordinates based on user zoom level
    const x = Math.floor(((event.clientX - rect.left) / zoomLevel) + ((pan.x / 512) * ((512 * zoomLevel) - 512)));
    const y = Math.floor(((event.clientY - rect.top) / zoomLevel) + ((pan.y / 512) * ((512 * zoomLevel) - 512)));
    console.log("clickX: ", x, "clickY: ", y);

    // Determine what grid needs to be updated in firebase
    const gridX = Math.floor(x / 16);
    const gridY = Math.floor(y / 16);

    // Determine the position within the grid the pixel is in
    const pixelX = x % 16;
    const pixelY = y % 16;

    // Update the state for highlighting
    setHighlightedPixel({
      x: (pixelX + gridX * 16),
      y: (pixelY + gridY * 16)
    });

    // Highlight the clicked pixel
    highlightPixel(context, (pixelX + gridX * 16),
      (pixelY + gridY * 16));
  };



  // Handle sending updates to the database
  const handleSendUpdates = async () => {
    // NOTE: all coords sent here should already account for zooming and panning
    // you should not need to adjust for zoomLevel or pan x/y modifiers
    try {
      // Check if there's a highlighted pixel
      if (highlightedPixel) {
        // Send updates to the database using the highlighted pixel
        const gridX = Math.floor((highlightedPixel.x / 16));
        const gridY = Math.floor((highlightedPixel.y / 16));

        // Get the existing grid or create a new one
        const existingGrid = { ...grids[`${gridX}_${gridY}`] } || {};

        // Update the pixel color
        existingGrid[`${Math.floor(highlightedPixel.x % 16)}_${Math.floor(highlightedPixel.y % 16)}`] = {
          x: Math.floor(highlightedPixel.x % 16),
          y: Math.floor(highlightedPixel.y % 16),
          color: selectedColor,
        };

        // Update local state
        setGrids((prevGrids) => ({
          ...prevGrids,
          [`${gridX}_${gridY}`]: {
            ...prevGrids[`${gridX}_${gridY}`],
            ...existingGrid,
          },
        }));

        // Deselect the highlighted pixel once it is placed
        setHighlightedPixel(null);

        // Send updates to the database for the specific grid
        await update(ref(db, `canvas/${gridX}_${gridY}`), existingGrid);
      }
    } catch (error) {
      console.error("Error sending updates to the database:", error);
    }
  };



  // Handle zooming with scroll wheel
  const handleWheel = (event) => {
    event.preventDefault();

    // Determine the scale factor for next zoom
    const scaleDelta = 0.1
    const scaleFactor = (event.deltaY > 0 ? 1 - scaleDelta : 1 + scaleDelta);

    // Adjust these to set minimum and maximum zoom scales
    const maxZoom = 10;
    const minZoom = 1;

    // Calculate new zoom level
    const newZoomLevel = Math.min(Math.max(zoomLevel * scaleFactor, minZoom), maxZoom);

    // Set pan values based on mouse cursor coords
    const rect = canvasRef.current.getBoundingClientRect();
    if(pan.x === 600 && pan.y === 600){
      const mouseX = (event.clientX - rect.left);
      const mouseY = (event.clientY - rect.top);
      setPan({
        x: mouseX / newZoomLevel,
        y: mouseY / newZoomLevel,
      });
    };

    if(pan.x !== 600 && pan.y !== 600){
      setPan((prevPan) => ({
        x: (prevPan.x * zoomLevel) / newZoomLevel,
        y: (prevPan.y * zoomLevel) / newZoomLevel,
      }));
    };

    if(newZoomLevel === minZoom){
      setPan({
        x: 600,
        y: 600,
      })
    }

    // Update zoom level
    setZoomLevel(newZoomLevel);
  };


  // Handles the user selecting a color button to change their pixel color
  const handleColorChange = (color) => {
    // Console log for debugging
    console.log(`User selected color: ${color.name}`);

    // Update the selected color for the user globally
    setSelectedColor(color.hex);
    setSendButtonColor(color.hex);
  }



  return (
    <div className="App">
      <header className="header">
        <button className="login-button">Login</button>
      </header>
      <canvas ref={canvasRef} id="pixelCanvas"
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      ></canvas>
      <div className="colorBar">
        {colors.map((color) => (
          <div
            key={color.name}
            className={`colorButton ${color.name}`}
            data-color={color.name}
            style={{ backgroundColor: color.hex }}
            onClick={() => handleColorChange(color)}
          ></div>
        ))}
        <button className="sendButton"
          style={{ '--button-color': sendButtonColor }}
          onClick={handleSendUpdates}>
          Place Pixel
        </button>
      </div>
    </div>
  );
}

export default App;