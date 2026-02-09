import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <FiAlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;