/*
  Modified from https://reactbits.dev/tailwind/ to control content scaling.
  The 'size' prop now directly scales dimensions (width, height, offsets)
  instead of using a CSS 'transform: scale()', which prevents internal text from growing.
*/

import { useState } from "react";

const darkenColor = (hex, percent) => {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 0xff) * (1 - percent))));
  let b = Math.max(0, Math.min(255, Math.floor((num & 0xff) * (1 - percent))));
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const Folder = ({
  color = "#5227FF",
  size = 1, // This 'size' will now act as a multiplier for base dimensions
  open: initialOpen = false, // Renamed to avoid conflict with internal state
  items = [],
  className = "",
}) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  // Internal state for open/closed status, initialized from prop
  const [open, setOpen] = useState(initialOpen);
  
  // State to manage paper offsets for mouse interaction
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })),
  );

  const folderBackColor = darkenColor(color, 0.08);
  // All papers now use the exact desired background color
  const paper1 = "#030B2E"; 
  const paper2 = "#030B2E"; 
  const paper3 = "#030B2E"; 

  const handleClick = () => {
    setOpen((prev) => !prev);
    // When closing, reset paper offsets
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e, index) => {
    if (!open) return; // Only apply hover effect when folder is open
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Adjust mouse sensitivity based on original size of the folder to keep movement proportional
    // Divide by size to counteract the larger folder size, making hover effect feel consistent
    const offsetX = (e.clientX - centerX) * 0.15 / size; 
    const offsetY = (e.clientY - centerY) * 0.15 / size;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e, index) => {
    // Reset paper offset when mouse leaves
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle = {
    "--folder-color": color,
    "--folder-back-color": folderBackColor,
    "--paper-1": paper1,
    "--paper-2": paper2,
    "--paper-3": paper3,
  };

  // Base dimensions of the folder and its elements (original sizes from reactbits)
  const baseFolderWidth = 100;
  const baseFolderHeight = 80;
  const baseTabWidth = 30;
  const baseTabHeight = 10;
  const basePaperBorderRadius = 10;
  const basePaperPadding = 10; // Original padding from reactbits 

  // Calculate actual dimensions based on the 'size' prop
  const currentFolderWidth = baseFolderWidth * size;
  const currentFolderHeight = baseFolderHeight * size;
  const currentTabWidth = baseTabWidth * size;
  const currentTabHeight = baseTabHeight * size;
  const currentPaperBorderRadius = basePaperBorderRadius * size;
  // Scale padding by size as well, to maintain consistent appearance with scaled folder
  const currentPaperPadding = basePaperPadding * size; 


  // Calculate open transforms using percentages (relative to the item itself)
  // MODIFIED: Adjusted for closer and more balanced fanning effect
  const getOpenTransform = (index) => {
    if (index === 0) return `translate(-70%, -50%) rotate(-15deg)`; // Left, slightly higher, more rotation
    if (index === 1) return `translate(0%, -65%) rotate(0deg)`;    // Center, highest, no rotation
    // MODIFIED: Made Y-axis translation less negative to move "Profile Management" downwards
    if (index === 2) return `translate(70%, -50%) rotate(15deg)`;   // Right, moved down closer to folder
    return "";
  };

  return (
    // Outer container for the folder, applies the className
    <div className={className}>
      <div
        className={`group relative transition-all duration-200 ease-in cursor-pointer ${
          !open ? "hover:-translate-y-2" : ""
        }`}
        style={{
          ...folderStyle,
          // Apply internal Y translation for open/close animation
          transform: open ? "translateY(-8px)" : undefined,
          // Set explicit dimensions for the main folder container based on 'size'
          width: `${currentFolderWidth}px`,
          height: `${currentFolderHeight}px`,
        }}
        onClick={handleClick}
      >
        {/* Main folder body */}
        <div
          className="relative rounded-tl-0 rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{ 
            backgroundColor: folderBackColor,
            width: '100%', // Fill parent
            height: '100%', // Fill parent
          }}
        >
          {/* Folder tab */}
          <span
            className="absolute z-0 bottom-[98%] left-0 rounded-tl-[5px] rounded-tr-[5px] rounded-bl-0 rounded-br-0"
            style={{ 
              backgroundColor: folderBackColor,
              width: `${currentTabWidth}px`,
              height: `${currentTabHeight}px`,
            }}
          ></span>

          {/* Papers / Items */}
          {papers.map((item, i) => {
            // All papers now have equal width and height percentage
            let paperWidthPercent = 80; 
            let paperHeightPercent = 80; 

            // Define z-index for each paper to control layering
            let zIndex;
            if (i === 0) zIndex = 25; // Left paper
            else if (i === 1) zIndex = 30; // Center paper (should be on top)
            else if (i === 2) zIndex = 20; // Right paper (should be behind center)

            // Calculate combined transform for open state and mouse offset
            const transformStyle = open
              ? `${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`
              : undefined;

            return (
              <div
                key={i}
                onMouseMove={(e) => handlePaperMouseMove(e, i)}
                onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
                className={`absolute left-1/2 transition-all duration-300 ease-in-out transform -translate-x-1/2 ${
                  !open
                    ? "translate-y-[10%] group-hover:translate-y-0"
                    : "hover:scale-105" // Slightly less aggressive hover scale for bigger folders
                }`}
                style={{
                  ...(!open ? {} : { transform: transformStyle }),
                  backgroundColor: i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                  borderRadius: `${currentPaperBorderRadius}px`, // Scaled border radius
                  width: `${paperWidthPercent}%`,
                  height: `${paperHeightPercent}%`,
                  // Add padding relative to size to keep content spaced correctly
                  padding: `${currentPaperPadding}px`, // Use the scaled padding
                  boxSizing: 'border-box', // Ensure padding is included in width/height
                  display: 'flex', // Use flexbox to center content
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  zIndex: open ? zIndex : (30 - i * 5), // Apply custom z-index when open, default stack when closed
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)', // Added subtle shadow
                  // Adjust bottom positioning slightly when open, if needed for visual balance
                  bottom: open ? `5%` : `10%`, // Example: bring slightly up when open
                }}
              >
                {/* Render the item directly. Its font size will now be stable. */}
                {item} 
              </div>
            );
          })}

          {/* Folder front covers */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? "group-hover:[transform:skew(15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              // Maintain fixed border radius here for sharp corners, or scale if desired
              borderRadius: "5px 10px 10px 10px", 
              ...(open && { transform: "skew(15deg) scaleY(0.6)" }),
            }}
          ></div>
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? "group-hover:[transform:skew(-15deg)_scaleY(0.6)]" : ""
            }`}
            style={{
              backgroundColor: color,
              // Maintain fixed border radius here
              borderRadius: "5px 10px 10px 10px", 
              ...(open && { transform: "skew(-15deg) scaleY(0.6)" }),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
