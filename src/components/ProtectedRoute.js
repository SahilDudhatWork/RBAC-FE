import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission, menu }) => {
    const { user, loading, hasPermission } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredPermission && menu && !hasPermission(menu, requiredPermission)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default ProtectedRoute;