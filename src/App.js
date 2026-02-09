import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Menus from './pages/Menus';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Workspace from './pages/Workspace';
import Products from './pages/Products';
import Unauthorized from './pages/Unauthorized';

// Layout component for protected routes
const ProtectedLayout = () => (
    <Layout>
        <Outlet />
    </Layout>
);

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--toast-bg, #363636)',
                                color: 'var(--toast-text, #fff)',
                            },
                            success: {
                                duration: 3000,
                                style: {
                                    background: 'var(--toast-success, #10b981)',
                                },
                            },
                            error: {
                                duration: 4000,
                                style: {
                                    background: 'var(--toast-error, #ef4444)',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected routes with layout */}
                        <Route element={
                            <ProtectedRoute>
                                <ProtectedLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/users" element={
                                <ProtectedRoute menu="Users" requiredPermission="read">
                                    <Users />
                                </ProtectedRoute>
                            } />
                            <Route path="/roles" element={
                                <ProtectedRoute menu="Roles" requiredPermission="read">
                                    <Roles />
                                </ProtectedRoute>
                            } />
                            <Route path="/menus" element={
                                <ProtectedRoute menu="Menu Management" requiredPermission="read">
                                    <Menus />
                                </ProtectedRoute>
                            } />
                            <Route path="/settings" element={
                                <ProtectedRoute menu="Settings" requiredPermission="read">
                                    <Settings />
                                </ProtectedRoute>
                            } />
                            <Route path="/workspace" element={
                                <ProtectedRoute menu="Workspace" requiredPermission="read">
                                    <Workspace />
                                </ProtectedRoute>
                            } />
                            <Route path="/products/*" element={
                                <ProtectedRoute menu="Products" requiredPermission="read">
                                    <Products />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Route>

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;