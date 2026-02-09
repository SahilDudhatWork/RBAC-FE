import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { toast } from 'react-hot-toast';

const Profile = () => {
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        department: '',
        position: '',
        joinDate: '',
        lastLogin: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const data = await authAPI.getMe();
                console.log('data :>> ', data);
                setUserDetails({
                    name: data.name || 'N/A',
                    email: data.email || 'N/A',
                    department: data.department || 'N/A',
                    position: data.position || 'N/A',
                    joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A',
                    lastLogin: data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'N/A'
                });
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    User Profile
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    View and manage your account details
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="px-6 py-6">
                        <div className="md:flex">
                            {/* Left Column - Avatar */}
                            <div className="md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
                                <div className="h-40 w-40 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-5xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                                    {userDetails.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                    {userDetails.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {userDetails.position}
                                </p>
                                <div className="mt-4 text-sm">
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Member since {userDetails.joinDate}
                                    </div>
                                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Last login: {userDetails.lastLogin}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Details */}
                            <div className="md:w-3/4 md:pl-8">
                                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                            Personal Information
                                        </h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                            Your personal details and contact information.
                                        </p>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                        <dl>
                                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Full name
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                                    {userDetails.name}
                                                </dd>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Email address
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                                    {userDetails.email}
                                                </dd>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Account Status
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Active
                                                    </span>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
