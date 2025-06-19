// frontend/src/components/SubmissionHeatmap.jsx
import React from 'react';
import { format } from 'date-fns'; // Import format from date-fns for month names

/**
 * @desc Displays a submission heatmap (like GitHub's contribution graph).
 * Uses a grid of divs with colors based on submission count.
 * This version aims for a calendar-like view for a year.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.data - Array of objects { date: string, count: number } for each day.
 * @param {number} [props.days=365] - Number of days for the heatmap (e.g., 365 for a year).
 */
function SubmissionHeatmap({ data, days = 365 }) {
  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No submission data for the selected period to generate a heatmap.
      </div>
    );
  }

  // Determine the max count to scale colors
  const maxCount = Math.max(...data.map(d => d.count));

  // Function to get color class based on count
  const getColorClass = (count) => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700'; // No submissions
    if (maxCount === 0) return 'bg-gray-200 dark:bg-gray-700'; // Avoid division by zero if all counts are 0

    const normalizedCount = count / maxCount;
    if (normalizedCount <= 0.25) return 'bg-green-100 dark:bg-green-900'; // Changed to green
    if (normalizedCount <= 0.5) return 'bg-green-300 dark:bg-green-800'; // Changed to green
    if (normalizedCount <= 0.75) return 'bg-green-500 dark:bg-green-700'; // Changed to green
    return 'bg-green-700 dark:bg-green-600'; // Changed to green (Highest activity)
  };

  // --- Generate the Calendar Grid Data ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of today

  const calendarDays = [];
  const dataMap = new Map(data.map(d => [d.date, d.count])); // Map for quick lookup

  // Get the date for the start of the heatmap period (e.g., 365 days ago)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));
  startDate.setHours(0,0,0,0); // Ensure start of day

  let currentDate = new Date(startDate);
  // Adjust to the first Sunday before or on the start date to align the grid
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Go back to Sunday (0=Sunday)

  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const dateString = format(currentDate, 'yyyy-MM-dd');
    const count = dataMap.get(dateString) || 0;

    // Only add to calendarDays if it's within the actual 'days' range or is a padding day
    if (currentDate >= startDate || (currentDate < startDate && currentDate.getDay() !== today.getDay())) { // Adjust logic for padding
        calendarDays.push({
            date: dateString,
            count: count,
            dayOfWeek: dayOfWeek,
            // Flag if this day is outside the actual requested `days` range but needed for grid alignment
            isPadding: currentDate < startDate || currentDate > today
        });
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  // Group days by week (7 days per column)
  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < calendarDays.length; i++) {
    const day = calendarDays[i];
    // Start a new week if it's Sunday (dayOfWeek === 0) or the very first day
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Generate month labels for the top
  const monthLabels = [];
  let monthIndex = -1; // To track current month
  // Iterate through weeks to find the first day of each month for labels
  weeks.forEach((week, weekIndex) => {
    week.forEach(day => {
      const dayMonthIndex = new Date(day.date).getMonth();
      if (dayMonthIndex !== monthIndex) {
        monthLabels.push({
          name: format(new Date(day.date), 'MMM'), // e.g., "Jan"
          // Calculate the starting position (column span) for the month label
          // This is rough and might need fine-tuning for perfect alignment
          // A more robust way would involve calculating column indices for each month start
          // For now, simple count of weeks passed since last month
          startWeekIndex: weekIndex,
        });
        monthIndex = dayMonthIndex;
      }
    });
  });


  // Array for day of week labels (vertically on the left)
  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Submission Heatmap (All Submissions)</h3>

      <div className="flex items-start"> {/* Flex container for month labels and grid */}
        {/* Empty column for day labels */}
        <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 mt-5 mr-1 pr-1">
            {dayOfWeekNames.map((name, index) => (
                // Only show labels for Mon, Wed, Fri for less clutter
                <div key={name} className="h-6 flex items-center justify-end pr-1">
                    {index === 1 || index === 3 || index === 5 ? name : ''}
                </div>
            ))}
        </div>

        <div className="flex-grow overflow-x-auto pb-4">
            {/* Month Labels */}
            <div className="flex justify-between items-end mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                {/* This section needs to be more dynamic based on calculated week spans for months */}
                {/* For simplicity, we'll just distribute them roughly for now.
                    A truly accurate alignment requires knowing how many 'blocks' each month occupies. */}
                {monthLabels.map((month, index) => (
                    // This width calculation is an approximation.
                    // For perfect alignment, calculate the number of days in the month and translate to week columns.
                    <div key={month.name + index}
                         className="flex-shrink-0"
                         style={{ minWidth: `${(weeks.length / 12) * 28}px` }} // Approx width per month based on total weeks
                    >
                        {month.name}
                    </div>
                ))}
            </div>

            {/* Heatmap Grid (Columns represent weeks, rows represent days of the week) */}
            <div className="flex">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1 mr-1"> {/* Column for each week */}
                  {dayOfWeekNames.map((dayName, dayIndex) => {
                    const dayData = week.find(d => d.dayOfWeek === dayIndex);
                    const cellDate = dayData ? new Date(dayData.date) : null;
                    // Only render if within filter range (or padding at start/end)
                    const isWithinFilterRange = cellDate && cellDate >= startDate && cellDate <= today;
                    const displayCell = dayData && (isWithinFilterRange || dayData.isPadding);

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-6 h-6 rounded-sm border border-gray-300 dark:border-gray-600
                                    ${displayCell ? getColorClass(dayData.count) : 'bg-transparent border-transparent'}
                                    ${dayData && dayData.isPadding && 'opacity-30'}`} 
                        title={dayData ? `${format(new Date(dayData.date), 'MMM dd, yyyy')}: ${dayData.count} submissions` : ''}
                      >
                        {/* Empty div for visual square */}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
        </div>
      </div>

      <div className="flex justify-end items-center mt-4 text-sm text-gray-700 dark:text-gray-300">
        <span className="mr-2">Less</span>
        <div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mx-0.5"></div>
        <div className="w-4 h-4 rounded-sm bg-green-100 dark:bg-green-900 border border-gray-300 dark:border-gray-600 mx-0.5"></div>
        <div className="w-4 h-4 rounded-sm bg-green-300 dark:bg-green-800 border border-gray-300 dark:border-gray-600 mx-0.5"></div>
        <div className="w-4 h-4 rounded-sm bg-green-500 dark:bg-green-700 border border-gray-300 dark:border-gray-600 mx-0.5"></div>
        <div className="w-4 h-4 rounded-sm bg-green-700 dark:bg-green-600 border border-gray-300 dark:border-gray-600 mx-0.5"></div>
        <span className="ml-2">More</span>
      </div>
    </div>
  );
}

export default SubmissionHeatmap;
