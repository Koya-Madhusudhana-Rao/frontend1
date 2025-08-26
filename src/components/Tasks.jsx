import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Target,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';

function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    if (user?.role !== 'Employee') {
      fetchAssignedTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/my');
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const response = await axios.get('/api/tasks/assigned');
      setAssignedTasks(response.data);
    } catch (error) {
      console.error('Assigned tasks error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'Employee' 
            ? 'View and update your assigned tasks'
            : 'Manage and assign tasks to your team'
          }
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Tasks</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Create Task Button - Only for Admin/Manager */}
          {user?.role !== 'Employee' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Assign Task
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* My Tasks Section */}
      {user?.role === 'Employee' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onUpdateProgress={() => {
                  setSelectedTask(task);
                  setShowProgressModal(true);
                }}
                isEmployee={true}
              />
            ))}
          </div>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Tasks Assigned by Me - For Admin/Manager */}
      {user?.role !== 'Employee' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks I've Assigned</h2>
          <div className="grid grid-cols-1 gap-4">
            {assignedTasks.map((task) => (
              <AssignedTaskCard key={task._id} task={task} />
            ))}
          </div>
          {assignedTasks.length === 0 && (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAssignedTasks();
          }}
        />
      )}

      {/* Update Progress Modal */}
      {showProgressModal && selectedTask && (
        <UpdateProgressModal
          task={selectedTask}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setShowProgressModal(false);
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onUpdateProgress, isEmployee }) {
  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
            {task.description}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{task.completion_percent || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${task.completion_percent || 0}%` }}
          />
        </div>
      </div>

      {/* Task Info */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Assigned by: {task.assigned_by}</span>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Assigned: {new Date(task.assigned_on).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Button */}
      {isEmployee && task.status !== 'Completed' && (
        <button
          onClick={onUpdateProgress}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Update Progress
        </button>
      )}
    </div>
  );
}

function AssignedTaskCard({ task }) {
  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{task.description}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Assigned to: {task.assigned_to}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {task.completion_percent || 0}%
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.completion_percent || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assigned_to: '',
    description: '',
    due_date: '',
    priority: 'Medium'
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // For Admin: get Managers, For Manager: get Employees
      const response = await axios.get('/api/users');
      let filteredUsers = response.data;
      
      if (user?.role === 'Admin') {
        filteredUsers = response.data.filter(u => u.role === 'Manager');
      } else if (user?.role === 'Manager') {
        filteredUsers = response.data.filter(u => u.role === 'Employee');
      }
      
      setUsers(filteredUsers);
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/tasks', formData);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Assign New Task</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to {user?.role === 'Admin' ? 'Manager' : 'Employee'}
            </label>
            <select
              required
              value={formData.assigned_to}
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select user...</option>
              {users.map((u) => (
                <option key={u.username} value={u.username}>{u.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateProgressModal({ task, onClose, onSuccess }) {
  const [percentAdded, setPercentAdded] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.put(`/api/tasks/${task._id}/progress`, {
        percent_added: parseInt(percentAdded),
        note: note
      });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Update Task Progress</h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Task:</p>
          <p className="font-medium text-gray-900">{task.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Current Progress: {task.completion_percent || 0}%
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Added Today (0-100%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={percentAdded}
              onChange={(e) => setPercentAdded(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter percentage completed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about your progress..."
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function moved outside component
function getStatusColor(status) {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Pending': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50';
    case 'Medium': return 'text-yellow-600 bg-yellow-50';
    case 'Low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export default Tasks;