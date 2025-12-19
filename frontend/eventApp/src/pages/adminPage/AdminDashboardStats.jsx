// components/admin/BasicDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers,
  FaCalendarAlt,
  FaShoppingCart,
  FaDollarSign,
  FaTag,
  FaBuilding,
  FaTicketAlt,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaUser,
  FaUserTie,
  FaUserShield,
  FaEye,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';

const BasicDashboard = () => {

  const { BASE_URL } = useEventContext()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalVenues: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    publishedEvents: 0,
    unpublishedEvents: 0,
    totalTicketsSold: 0,
    userRoles: {},
    recentOrders: [],
    recentEvents: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/admin/admin-dashboard-stats`, {
        withCredentials: true
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 ml-65 py-4 px-3 pt-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of your event platform</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FaUser className="text-gray-400" />
              <span className="text-gray-600">{stats.userRoles.user || 0} Users</span>
            </div>
            <div className="flex items-center gap-1">
              <FaUserTie className="text-blue-400" />
              <span className="text-gray-600">{stats.userRoles.organizer || 0} Organizers</span>
            </div>
            <div className="flex items-center gap-1">
              <FaUserShield className="text-red-400" />
              <span className="text-gray-600">{stats.userRoles.admin || 0} Admins</span>
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalEvents.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              <span className="text-gray-600">{stats.publishedEvents} Published</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-yellow-500" />
              <span className="text-gray-600">{stats.unpublishedEvents} Unpublished</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FaShoppingCart className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaDollarSign className="text-green-500" />
              <span className="text-gray-600">Revenue: {formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-yellow-500" />
              <span className="text-gray-600">{stats.pendingOrders} Pending</span>
            </div>
          </div>
        </div>

        {/* Total Tickets */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {stats.totalTicketsSold.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaTicketAlt className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaTag className="text-blue-400" />
              <span className="text-gray-600">{stats.totalCategories} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBuilding className="text-purple-400" />
              <span className="text-gray-600">{stats.totalVenues} Venues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                View All <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent orders
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-800">
                        {order.orderNumber || `ORD-${order._id.substring(18, 24)}`}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{order.user?.name}</span>
                        <span>•</span>
                        <span>{order.event?.title}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Recent Events</h3>
              <button
                onClick={() => navigate('/admin/events')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                View All <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {stats.recentEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent events
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {event.image ? (
                          <img
                            src={`${BASE_URL}/uploads/${event.image}`}
                            alt={event.title}
                            className="w-full h-full rounded-lg object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/Placeholder.png';
                            }}
                          />
                        ) : (
                          <FaCalendarAlt className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <span>{event.organizer?.name}</span>
                          <span>•</span>
                          <span>{event.category?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDate(event.createdAt)}</p>
                      <button
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="mt-1 p-1 text-blue-600 hover:text-blue-800"
                        title="View Event"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <FaUsers className="text-blue-600 text-2xl mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
          <p className="text-blue-600 text-sm">Total Users</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <FaCalendarAlt className="text-green-600 text-2xl mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalEvents}</p>
          <p className="text-green-600 text-sm">Total Events</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <FaShoppingCart className="text-purple-600 text-2xl mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          <p className="text-purple-600 text-sm">Total Orders</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <FaDollarSign className="text-yellow-600 text-2xl mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats.totalRevenue).replace('$', '')}
          </p>
          <p className="text-yellow-600 text-sm">Total Revenue</p>
        </div>
      </div>
    </div>
  );
};

export default BasicDashboard;