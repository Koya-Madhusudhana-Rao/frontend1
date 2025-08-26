import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Shield,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Activity,
  Award,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

function Profile() {
  const { user } = useAuth();
  const [profileStats, setProfileStats] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchAuditLogs();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setProfileStats(response.data);
    } catch (error) {
      console.error('Profile stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get('/api/audit');
      setAuditLogs(response.data.slice(0, 10)); // Show last 10 activities
    } catch (error) {
      console.error('Audit logs error:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Employee': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your account information and view your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(user?.role)}`}>
                    <Shield className="h-4 w-4 mr-1" />
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm">{user?.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>

                {user?.manager && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Reports To</p>
                      <p className="text-sm">{user.manager}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600 mb-3">
                    <Activity className="h-4 w-4 mr-3" />
                    <p className="text-sm font-medium">Account Status</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {user?.role === 'Employee' && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{profileStats.total_tasks || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{profileStats.completed_tasks || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{profileStats.in_progress_tasks || 0}</span>
                </div>

                {/* Completion Rate */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {profileStats.total_tasks > 0 
                        ? Math.round((profileStats.completed_tasks / profileStats.total_tasks) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${profileStats.total_tasks > 0 
                          ? (profileStats.completed_tasks / profileStats.total_tasks) * 100
                          : 0
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <time className="text-xs text-gray-500">
                            {formatDateTime(log.timestamp)}
                          </time>
                        </div>
                        {log.extra && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600">
                              {JSON.stringify(log.extra, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Security Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Password</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Two-Factor Auth</span>
                  <span className="text-sm text-gray-500">Not enabled</span>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                System Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Role</span>
                  <span className="text-sm font-medium text-gray-900">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-500">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;