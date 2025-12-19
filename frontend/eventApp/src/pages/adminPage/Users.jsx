// pages/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, 
  FaUser, 
  FaUserTie, 
  FaUserShield, 
  FaSpinner, 
  FaEdit, 
  FaSearch,
  FaFilter,
  FaEye,
  FaEnvelope,
  FaCalendarAlt
} from 'react-icons/fa';
import { useEventContext } from '../../context/EventContext';
import { toastError, toastSuccess } from '../../../utility/toast';


const AdminUsers = () => {
  const { BASE_URL } = useEventContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/users/get-users`, { 
        withCredentials: true 
      });
      
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toastError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const changeUserRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/change-role/${userId}`,
        { role: newRole },
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        toastSuccess(`Role changed to ${newRole}`);
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toastError('Failed to change role');
    } finally {
      setUpdatingRole(null);
    }
  };

  // Get role badge color
  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800', icon: FaUserShield },
      organizer: { label: 'Organizer', color: 'bg-blue-100 text-blue-800', icon: FaUserTie },
      user: { label: 'User', color: 'bg-green-100 text-green-800', icon: FaUser }
    };
    return badges[role] || badges.user;
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get stats
  const getStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const organizerCount = users.filter(u => u.role === 'organizer').length;
    const userCount = users.filter(u => u.role === 'user').length;
    
    return { totalUsers, adminCount, organizerCount, userCount };
  };

  const stats = getStats();

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="ml-60 p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage all user accounts and permissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Admins</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.adminCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaUserShield className="text-red-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Organizers</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{stats.organizerCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUserTie className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Regular Users</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.userCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUser className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="relative md:w-64">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="user">User</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : (
          /* Users Table */
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">User</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Current Role</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Join Date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);
                    const RoleIcon = roleBadge.icon;
                    
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        {/* User Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{user.name || 'No Name'}</h4>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-gray-700">{user.email}</span>
                          </div>
                        </td>

                        {/* Current Role */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <RoleIcon />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                        </td>

                        {/* Join Date */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Change Role */}
                        <td className="py-4 px-6">
                          <div className="relative w-48">
                            <select
                              value={user.role}
                              onChange={(e) => changeUserRole(user._id, e.target.value)}
                              disabled={updatingRole === user._id}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed bg-white appearance-none"
                            >
                              <option value="user">User</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                            {updatingRole === user._id && (
                              <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-600" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                
                return (
                  <div key={user._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{user.name || 'No Name'}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                        {roleBadge.label}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt />
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Change Role
                        </label>
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => changeUserRole(user._id, e.target.value)}
                            disabled={updatingRole === user._id}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <option value="user">User</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                          </select>
                          {updatingRole === user._id && (
                            <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <FaUsers className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Stats */}
        {filteredUsers.length > 0 && (
          <div className="mt-8 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="text-xs">
              Click on role dropdown to change permissions
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;