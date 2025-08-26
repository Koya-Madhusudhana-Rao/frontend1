import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CheckSquare,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderEmployeeDashboard = () => {
    const taskData = [
      { name: 'Completed', value: stats.completed_tasks, color: '#10B981' },
      { name: 'In Progress', value: stats.in_progress_tasks, color: '#F59E0B' },
      { name: 'Pending', value: stats.pending_tasks, color: '#EF4444' }
    ];

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            {getWelcomeMessage()}, {user.username}!
          </h1>
          <p className="text-blue-100">Here's your productivity overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats.total_tasks}
            icon={CheckSquare}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completed_tasks}
            icon={Target}
            color="green"
          />
          <StatCard
            title="In Progress"
            value={stats.in_progress_tasks}
            icon={Activity}
            color="yellow"
          />
          <StatCard
            title="Completed Today"
            value={stats.completed_today}
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Check-in Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Check-in Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stats.is_checked_in ? 'You are currently checked in' : 'You are not checked in'}
              </p>
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              stats.is_checked_in 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              {stats.is_checked_in ? 'Checked In' : 'Not Checked In'}
            </div>
          </div>
        </div>

        {/* Task Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {taskData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderManagerDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            {getWelcomeMessage()}, Manager {user.username}!
          </h1>
          <p className="text-purple-100">Monitor your team's performance and task progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            value={stats.team_members}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Assigned Tasks"
            value={stats.assigned_tasks}
            icon={CheckSquare}
            color="green"
          />
          <StatCard
            title="Completed"
            value={stats.completed_tasks}
            icon={Target}
            color="purple"
          />
          <StatCard
            title="Pending"
            value={stats.pending_tasks}
            icon={AlertCircle}
            color="yellow"
          />
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            {getWelcomeMessage()}, Admin {user.username}!
          </h1>
          <p className="text-red-100">System overview and management dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats.active_users}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Total Tasks"
            value={stats.total_tasks}
            icon={CheckSquare}
            color="purple"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completed_tasks}
            icon={Target}
            color="yellow"
          />
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Employee':
        return renderEmployeeDashboard();
      case 'Manager':
        return renderManagerDashboard();
      case 'Admin':
        return renderAdminDashboard();
      default:
        return <div>Role not recognized</div>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {renderDashboard()}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;