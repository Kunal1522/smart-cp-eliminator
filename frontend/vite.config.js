
    
    // frontend/vite.config.js
import { defineConfig } from 'vite';
// IMPORT THE -SWC VERSION YOU HAVE INSTALLED
import react from '@vitejs/plugin-react-swc'; // <--- CHANGE THIS LINE
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), // This now refers to the imported @vitejs/plugin-react-swc
    tailwindcss(),
  ],
});
