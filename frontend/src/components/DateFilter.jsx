// frontend/src/components/DateFilter.jsx
import React from 'react';

/**
 * @desc A reusable component for filtering data by date ranges.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.filters - An array of filter objects, e.g., [{ label: 'Last 7 Days', value: 7 }].
 * @param {number|string} props.currentFilter - The currently selected filter value.
 * @param {Function} props.onSelectFilter - Callback function when a filter is selected (receives selected value).
 * @param {string} [props.title='Filter by:'] - Optional title for the filter section.
 */
function DateFilter({ filters, currentFilter, onSelectFilter, title = 'Filter by:' }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
      <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">{title}</span>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onSelectFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${currentFilter === filter.value
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DateFilter;
