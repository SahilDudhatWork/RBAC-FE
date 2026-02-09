import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

const ForgotPassword = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call
            console.log('Would update password to:', newPassword);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage('Your password has been updated successfully!');
            
            // Clear form
            setNewPassword('');
            setConfirmPassword('');
            
            // Redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Reset Your Password
                    </h2>
                    <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Please enter your new password
                    </p>
                </div>

                {error && (
                    <div className={`${isDarkMode ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-400'} border-l-4 p-4`}>
                        <div className="flex">
                            <div className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {message ? (
                    <div className={`${isDarkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-400'} border-l-4 p-4`}>
                        <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>{message}</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="new-password" className="sr-only">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'} rounded-t-md focus:outline-none focus:ring-1 focus:z-10 sm:text-sm`}
                                    placeholder="New Password"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'} rounded-b-md focus:outline-none focus:ring-1 focus:z-10 sm:text-sm`}
                                    placeholder="Confirm New Password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <Link 
                        to="/login" 
                        className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} text-sm`}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
