import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  Play,
  Square,
  Calendar,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  FileText,
  Target,
  Activity
} from 'lucide-react';
import axios from 'axios';

function Timesheet() {
  const { user } = useAuth();
  const [todayTimesheet, setTodayTimesheet] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    fetchTodayTimesheet();
    fetchMyTasks();
  }, []);

  const fetchTodayTimesheet = async () => {
    try {
      const response = await axios.get('/api/timesheet/today');
      setTodayTimesheet(response.data);
      setIsCheckedIn(response.data.some(record => !record.check_out));
    } catch (error) {
      setError('Failed to fetch timesheet data');
      console.error('Timesheet error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/my');
      setMyTasks(response.data.filter(task => task.status !== 'Completed'));
    } catch (error) {
      console.error('Tasks error:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('/api/checkin');
      fetchTodayTimesheet();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check in');
    }
  };

  const handleCheckOut = () => {
    setShowCheckoutModal(true);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkOut) return 'In Progress';
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (user?.role !== 'Employee') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Timesheet management is only available for employees.</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
        <p className="mt-2 text-gray-600">Track your daily work hours and task progress</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Check-in/Check-out Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Clock className={`h-6 w-6 ${isCheckedIn ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isCheckedIn ? 'Currently Checked In' : 'Ready to Check In'}
              </h3>
              <p className="text-gray-600">
                {isCheckedIn 
                  ? `Checked in at ${formatTime(todayTimesheet.find(r => !r.check_out)?.check_in)}`
                  : 'Click the button to start your work day'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <Play className="h-5 w-5" />
                Check In
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <Square className="h-5 w-5" />
                Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Sessions"
          value={todayTimesheet.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={todayTimesheet.reduce((sum, record) => sum + (record.completed_today || 0), 0)}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Active Tasks"
          value={myTasks.length}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Today's Timesheet Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Records
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {todayTimesheet.length > 0 ? (
            todayTimesheet.map((record, index) => (
              <TimesheetRecord key={index} record={record} />
            ))
          ) : (
            <div className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No timesheet records for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <CheckoutModal
          tasks={myTasks}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false);
            fetchTodayTimesheet();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TimesheetRecord({ record }) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Play className="h-4 w-4 text-green-600" />
              <span>Check-in: {formatTime(record.check_in)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Square className="h-4 w-4 text-red-600" />
              <span>
                Check-out: {record.check_out ? formatTime(record.check_out) : 'In Progress'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Duration: {calculateWorkHours(record.check_in, record.check_out)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-green-600" />
              <span>Completed: {record.completed_today || 0} tasks</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            !record.check_out 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {!record.check_out ? 'Active' : 'Completed'}
          </div>
        </div>
      </div>

      {/* Notes */}
      {record.notes && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{record.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Worked On */}
      {record.tasks_worked && record.tasks_worked.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks Worked On
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {record.tasks_worked.map((task, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Task {task.task_id}</span>
                  <span className="text-sm font-semibold text-green-600">+{task.percent_added}%</span>
                </div>
                {task.note && (
                  <p className="text-xs text-gray-600">{task.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutModal({ tasks, onClose, onSuccess }) {
  const [tasksWorked, setTasksWorked] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTaskWork = () => {
    setTasksWorked([...tasksWorked, { task_id: '', percent_added: '', note: '' }]);
  };

  const updateTaskWork = (index, field, value) => {
    const updated = tasksWorked.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    );
    setTasksWorked(updated);
  };

  const removeTaskWork = (index) => {
    setTasksWorked(tasksWorked.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        tasks_worked: tasksWorked.filter(task => task.task_id && task.percent_added),
        notes: notes
      };

      await axios.post('/api/checkout', payload);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Check Out</h3>
          <p className="text-sm text-gray-600 mt-1">Record your task progress for today</p>
        </div>
        
        {error && (
          <div className="p-6 pb-0">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tasks Worked */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Tasks Worked On Today
              </label>
              <button
                type="button"
                onClick={addTaskWork}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <TrendingUp className="h-4 w-4" />
                Add Task
              </button>
            </div>
            
            <div className="space-y-4">
              {tasksWorked.map((taskWork, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Task
                      </label>
                      <select
                        value={taskWork.task_id}
                        onChange={(e) => updateTaskWork(index, 'task_id', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select task...</option>
                        {tasks.map((task) => (
                          <option key={task._id} value={task._id}>
                            {task.description.substring(0, 50)}...
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Progress Added (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taskWork.percent_added}
                        onChange={(e) => updateTaskWork(index, 'percent_added', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0-100"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeTaskWork(index)}
                        className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={taskWork.note}
                      onChange={(e) => updateTaskWork(index, 'note', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any notes about this task..."
                    />
                  </div>
                </div>
              ))}
              
              {tasksWorked.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No tasks added yet. Click "Add Task" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Overall Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Notes for Today (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any general notes about your work today..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Checking Out...' : 'Check Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function
function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export default Timesheet;