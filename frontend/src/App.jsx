// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage'; // Will be created in next part
import AddStudentPage from './pages/AddStudentPage'; // Will be created in next part
import EditStudentPage from './pages/EditStudentPage'; // Will be created in next part
import StudentProfilePage from './pages/StudentProfilePage'; // Will be created in next part
import SettingsPage from './pages/SettingsPage'; // Will be created in next part
import { useAuth } from './context/AuthContext'; // Import useAuth hook
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner

/**
 * @desc PrivateRoute component to protect routes.
 * Renders children if authenticated, otherwise navigates to login.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while authentication status is being checked
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};


function App() {
  return (
    <BrowserRouter>
      {/* The main App container. No background color here as pages will handle their own. */}
      {/* min-h-screen and flex-col ensure vertical layout */}
      <div className="App min-h-screen flex flex-col transition-colors duration-300">
        <Navbar /> {/* Render the navigation bar */}
        {/* Main content area. flex-grow makes it take remaining vertical space. */}
        {/* pt-16 (64px) pushes content down by the height of the Navbar. */}
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-student"
              element={
                <PrivateRoute>
                  <AddStudentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-student/:id"
              element={
                <PrivateRoute>
                  <EditStudentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/student-profile/:id"
              element={
                <PrivateRoute>
                  <StudentProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            {/* Catch-all for undefined routes */}
            <Route path="*" element={
              <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-2xl text-gray-700 dark:text-gray-300">
                404 - Page Not Found
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
