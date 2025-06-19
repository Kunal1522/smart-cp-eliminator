// frontend/src/components/Table.jsx
import React from 'react';

/**
 * @desc Generic table component for displaying data.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.data - Array of data objects to display in the table.
 * @param {Array<Object>} props.columns - Array defining table columns. Each object should have { header: string, accessor: string, render?: (row) => JSX.Element }.
 * @param {string} [props.keyField='_id'] - The field in `data` objects to use as the unique key.
 * @param {Function} [props.onRowClick] - Optional callback function when a row is clicked (receives row data).
 */
function Table({ data, columns, keyField = '_id', onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No data available to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.accessor || index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row) => (
            <tr
              key={row[keyField]}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, index) => (
                <td
                  key={col.accessor ? `${row[keyField]}-${col.accessor}` : index}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                >
                  {/* If a custom render function is provided, use it */}
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
