/*
 * Installed from https://reactbits.dev/tailwind/
 * Modified to accept 'data' and 'renderItem' props dynamically.
 */

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false }); // Use triggerOnce: false to allow re-animation on scroll

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      // Re-animate based on inView status
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer" // Keep base styling
    >
      {children}
    </motion.div>
  );
};

// Modified AnimatedList component to accept 'data' and 'renderItem' props
const AnimatedList = ({
  data = [], // Changed from 'items' to 'data', and default to empty array
  renderItem, // New prop: a function to render each item
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, data.length - 1)); // Use data.length
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < data.length) { // Use data.length
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(data[selectedIndex], selectedIndex); // Use data[selectedIndex]
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedIndex, onItemSelect, enableArrowNavigation]); // Add data to dependencies

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (
        itemBottom >
        containerScrollTop + containerHeight - extraMargin
      ) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);


  return (
    // The width should be determined by parent for flexibility, or made `w-full`
    // Removed fixed w-[500px] here to allow DashboardPage to control width
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[600px] overflow-y-auto p-4 ${ // Increased max-height for more visible items
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
            : "scrollbar-hide"
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? "thin" : "none",
          scrollbarColor: "#222 #060010",
        }}
      >
        {/* Iterate over 'data' prop and use 'renderItem' prop */}
        {data.map((item, index) => (
          <AnimatedItem
            key={item._id || index} // Use item._id for a stable key if available, otherwise index
            delay={0.1 * index} // Apply delay based on index for staggered animation
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) {
                onItemSelect(item, index);
              }
            }}
          >
            {/* THIS IS THE KEY CHANGE: Render the item using the renderItem function */}
            {renderItem ? renderItem(item, index) : (
                <div className={`p-4 bg-[#111] rounded-lg ${selectedIndex === index ? "bg-[#222]" : ""} ${itemClassName}`}>
                    <p className="text-white m-0">No renderItem function provided or item is not an object.</p>
                </div>
            )}
          </AnimatedItem>
        ))}
        {/* If no data, display a message */}
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No students found. Add a new student to get started!
          </div>
        )}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;
