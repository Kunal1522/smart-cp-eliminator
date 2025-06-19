// frontend/src/components/ProblemsSolvedBarChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * @desc Displays a bar chart of problems solved per rating bucket.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.data - Formatted data for rating buckets (from chartDataProcessors.js).
 */
function ProblemsSolvedBarChart({ data }) {
  if (!data || data.length === 0 || data.every(d => d.problems === 0)) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No problems solved data for the selected period.
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Problems Solved by Rating</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            angle={-30}
            textAnchor="end"
            height={60}
            interval={0} // Show all labels
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false} // Only show integer counts for problems
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
            itemStyle={{ color: 'var(--color-text-primary)' }}
            labelStyle={{ color: 'var(--color-text-secondary)' }}
            formatter={(value) => `${value} problems`}
          />
          <Bar dataKey="problems" fill="#82ca9d" name="Problems Solved" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProblemsSolvedBarChart;
