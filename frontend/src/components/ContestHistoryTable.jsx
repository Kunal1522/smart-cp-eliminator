// frontend/src/components/ContestHistoryTable.jsx
import React from 'react';
import { formatDate } from '../utils/dateUtils'; // Import date utility

/**
 * @desc Displays a table of a student's Codeforces contest history.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.contestHistory - Array of contest history objects.
 */
function ContestHistoryTable({ contestHistory }) {
  if (!contestHistory || contestHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No contest history available for the selected period.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Contest Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rank
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Old Rating
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              New Rating
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rating Change
            </th>
            {/* problemsUnsolvedCount is not directly in model, can be derived */}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Problems Solved
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {contestHistory.map((contest) => (
            <tr key={contest._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                <a href={`https://codeforces.com/contest/${contest.contestId}`} target="_blank" rel="noopener noreferrer">
                  {contest.contestName}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {formatDate(contest.contestTime)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {contest.rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {contest.oldRating}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {contest.newRating}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${contest.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                {contest.problemsSolved}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContestHistoryTable;
