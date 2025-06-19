// frontend/src/components/RatingGraph.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { formatDate } from '../utils/dateUtils';

// Define Codeforces rating tiers and their associated colors for the RATING GRAPH BACKGROUND
// These are the bands visible on the Codeforces profile pages.
const RATING_TIERS_GRAPH = [
  { rating: 0, name: 'Unrated / Newbie', color: '#B0B0B0' }, // Lighter Gray background for <1200
  { rating: 1200, name: 'Pupil', color: '#77ff77' },         // Light Green background
  { rating: 1400, name: 'Specialist', color: '#B7EEF1' },    // Light Cyan background
  { rating: 1600, name: 'Expert', color: '#aaaaff' },        // Light Blue background
  { rating: 1900, name: 'Candidate Master', color: '#EEB7EE' }, // Light Purple background
  { rating: 2100, name: 'Master', color: '#F1E6B7' },       // Light Orange background
  { rating: 2300, name: 'International Master', color: '#F1D5A3' }, // Slightly darker light orange
  { rating: 2400, name: 'Grandmaster', color: '#F1B7B7' },   // Light Red background
  { rating: 2600, name: 'International Grandmaster', color: '#ff3333' }, // Slightly darker light red
  { rating: 3000, name: 'Legendary Grandmaster', color: '#aa0000' }, // Even darker light red
];

// Helper function to get color for a given rating (for line dots, etc.)
// This uses a slightly different set of colors for the actual line/dot
const getRatingColorForLine = (rating) => {
  if (rating === null || rating === undefined) return '#808080'; // Gray
  if (rating < 1200) return '#808080'; // Newbie/Unrated (Gray)
  if (rating < 1400) return '#008000'; // Pupil (Green)
  if (rating < 1600) return '#03A89E'; // Specialist (Cyan)
  if (rating < 1900) return '#0000FF'; // Expert (Blue)
  if (rating < 2100) return '#AA00AA'; // Candidate Master (Purple)
  if (rating < 2300) return '#FF8C00'; // Master (Orange)
  if (rating < 2400) return '#FF8C00'; // International Master (Orange)
  if (rating < 2600) return '#FF0000'; // Grandmaster (Red)
  if (rating < 3000) return '#FF0000'; // International Grandmaster (Red)
  return '#AA0000'; // Legendary Grandmaster (Darker Red)
};


/**
 * @desc Displays a line chart of a student's Codeforces rating history.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.data - Formatted contest history data (from chartDataProcessors.js).
 */
function RatingGraph({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Not enough contest data to display rating graph.
      </div>
    );
  }

  // Determine min/max rating for Y-axis domain from the actual data
  const allRatings = data.flatMap(entry => [entry.oldRating, entry.rating]).filter(r => r !== null && r !== undefined);

  let minRating = 0; // Default min rating
  let maxRating = 2500; // Default max rating

  if (allRatings.length > 0) {
    minRating = Math.min(...allRatings);
    maxRating = Math.max(...allRatings);
  }

  // Ensure a reasonable padding and minimum range for visibility
  const padding = Math.max(50, (maxRating - minRating) * 0.1); // At least 50 padding
  let domainMin = Math.floor((minRating - padding) / 100) * 100;
  let domainMax = Math.ceil((maxRating + padding) / 100) * 100;

  // Ensure minimum range if all ratings are very close or identical
  if (domainMax - domainMin < 200) { // If range is too small, extend it
      const mid = (domainMax + domainMin) / 2;
      domainMin = Math.floor((mid - 100) / 100) * 100;
      domainMax = Math.ceil((mid + 100) / 100) * 100;
  }
  // Ensure domainMin is not negative
  domainMin = Math.max(0, domainMin);


  return (
    <div className="w-full h-80 sm:h-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">Rating Graph</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
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
            tickFormatter={(value) => value.substring(0, 6)} // Show short date (e.g., "Jan 01")
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          />
          <YAxis
            domain={[domainMin, domainMax]} // Dynamically set Y-axis domain
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
            // Custom formatter for tooltip content
            formatter={(value, name, props) => {
              const contestName = props.payload?.contestName || 'N/A';
              const rank = props.payload?.rank || 'N/A';
              const oldRating = props.payload?.oldRating || 'N/A';
              const ratingChange = props.payload?.ratingChange !== undefined ? (props.payload.ratingChange > 0 ? '+' : '') + props.payload.ratingChange : 'N/A';
              const contestLink = props.payload?.contestId ? `https://codeforces.com/contest/${props.payload.contestId}` : null;

              return [
                <span key="rating" style={{ color: getRatingColorForLine(value) }}>Rating: {value}</span>,
                <span key="oldRating">Old Rating: {oldRating}</span>,
                <span key="ratingChange">Change: {ratingChange}</span>,
                <span key="rank">Rank: {rank}</span>,
                <span key="contestName">Contest: {contestName}</span>,
                contestLink && <a key="contestLink" href={contestLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>View Contest</a>
              ];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />

          {/* Add ReferenceAreas for background colors based on rating tiers */}
          {RATING_TIERS_GRAPH.map((tier, index) => {
            // Determine the upper bound for the current tier's ReferenceArea
            const nextTierRating = (index < RATING_TIERS_GRAPH.length - 1)
              ? RATING_TIERS_GRAPH[index + 1].rating
              : domainMax; // Use max domain as upper bound for the last tier

            // Only render if the tier's range overlaps with the current Y-axis domain
            const y1 = Math.max(tier.rating, domainMin);
            const y2 = Math.min(nextTierRating, domainMax);

            if (y2 > y1) { // Only draw if there's a valid range
              return (
                <ReferenceArea
                  key={tier.name}
                  y1={y1}
                  y2={y2}
                  fill={tier.color}
                  fillOpacity={1} // Slightly increased opacity for better visibility of bands
                  ifOverflow="hidden"
                  strokeOpacity={0} // No border for the background areas
                />
              );
            }
            return null;
          })}

          <Line
            type="monotone"
            dataKey="rating"
            stroke="#8884d8" // A single, consistent color for the line itself for clarity
            strokeWidth={2}
            activeDot={(props) => {
              const { cx, cy, stroke, payload } = props;
              const dotColor = getRatingColorForLine(payload.rating); // Use line color helper
              return (
                <circle cx={cx} cy={cy} r={8} fill={dotColor} stroke={stroke} strokeWidth={2} />
              );
            }}
            name="Rating"
          />
          {/* Add ReferenceLines for Codeforces rating tiers with labels */}
          {RATING_TIERS_GRAPH.map((tier, index) => (
            // Only add a reference line if the rating is within the calculated domain and it's a distinct tier boundary
            (tier.rating > 0 && tier.rating >= domainMin && tier.rating <= domainMax && (index === 0 || tier.rating !== RATING_TIERS_GRAPH[index - 1].rating)) ? (
              <ReferenceLine
                key={tier.name + '_line'} // Unique key for lines
                y={tier.rating}
                label={{
                  value: tier.name,
                  position: 'insideTopLeft',
                  fill: getRatingColorForLine(tier.rating), // Use line color for labels
                  fontSize: 12,
                  offset: 5
                }}
                stroke={getRatingColorForLine(tier.rating)} // Use line color for line stroke
                strokeDasharray="3 3"
              />
            ) : null
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RatingGraph;
