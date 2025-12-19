// pages/admin/OrderListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaArrowLeft,
  FaEllipsisV,
  FaReceipt,
  FaTicketAlt,
  FaArrowDown,
} from 'react-icons/fa';
import { useEventContext } from '../../context/EventContext';
import { toastSuccess } from '../../../utility/toast';

const AdminOrderListPage = () => {

  const {BASE_URL} = useEventContext()
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    ticketType: 'all',
    sortBy: 'newest'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, allOrders]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${BASE_URL}/api/admin/get-orders`, {
        withCredentials: true
      });

      if (response.data.success) {
        setAllOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

   
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order.event?.title?.toLowerCase().includes(term) ||
        order._id.toLowerCase().includes(term)
      );
    }

   
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === filters.status);
    }

    if (filters.ticketType !== 'all') {
      filtered = filtered.filter(order => order.ticketType === filters.ticketType);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch(filters.dateRange) {
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return orderDate >= today && orderDate < tomorrow;
            
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
            
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
            
          case 'past':
            return orderDate < now;
            
          case 'future':
            return orderDate > now;
            
          default:
            return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch(filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
          
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
          
        case 'highest':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
          
        case 'lowest':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
          
        default:
          return 0;
      }
    });

    setOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {

      const response = await axios.put(
        `${BASE_URL}/api/admin/update-order-status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.success) {
        const updatedAllOrders = allOrders.map(order => 
          order._id === orderId 
            ? { ...order, paymentStatus: newStatus }
            : order
        );
        setAllOrders(updatedAllOrders);
        toastSuccess(response.data?.message)
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}/api/admin/delete-order/${orderId}`, {
        withCredentials: true
      });

      if (response.data.success) {
        const updatedAllOrders = allOrders.filter(order => order._id !== orderId);
        setAllOrders(updatedAllOrders);
        toastSuccess(response.data?.message)
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { text: 'Paid', color: 'bg-green-100 text-green-800', icon: <FaCheckCircle /> },
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <FaClock /> },
      failed: { text: 'Failed', color: 'bg-red-100 text-red-800', icon: <FaTimesCircle /> }
    };
    return badges[status] || badges.pending;
  };

  const getTicketTypeBadge = (type) => {
    const badges = {
      normal: { text: 'Normal', color: 'bg-blue-100 text-blue-800', icon: <FaTicketAlt /> },
      vip: { text: 'VIP', color: 'bg-purple-100 text-purple-800', icon: <FaTicketAlt /> }
    };
    return badges[type] || badges.normal;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      dateRange: 'all',
      ticketType: 'all',
      sortBy: 'newest'
    });
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalRevenue = allOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const paidOrders = allOrders.filter(order => order.paymentStatus === 'paid').length;
    const pendingOrders = allOrders.filter(order => order.paymentStatus === 'pending').length;
    const failedOrders = allOrders.filter(order => order.paymentStatus === 'failed').length;
    
    const normalTickets = allOrders
      .filter(order => order.ticketType === 'normal')
      .reduce((sum, order) => sum + (order.quantity || 0), 0);
    
    const vipTickets = allOrders
      .filter(order => order.ticketType === 'vip')
      .reduce((sum, order) => sum + (order.quantity || 0), 0);

    return {
      totalRevenue,
      paidOrders,
      pendingOrders,
      failedOrders,
      normalTickets,
      vipTickets,
      totalOrders: allOrders.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 ml-60 pt-20 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
        >
          <FaArrowLeft />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Order Management</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {orders.length} orders found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 md:hidden"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
            <button
              onClick={fetchAllOrders}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FaArrowDown className="text-sm" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <FaShoppingCart className="text-blue-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <FaDollarSign className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.paidOrders}</p>
              <p className="text-sm text-gray-600">Paid Orders</p>
            </div>
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </div>
            <FaClock className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Ticket Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Type
              </label>
              <select
                value={filters.ticketType}
                onChange={(e) => setFilters({...filters, ticketType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="normal">Normal</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="past">Past Orders</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Order #, Customer, Event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Ticket Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Type
            </label>
            <select
              value={filters.ticketType}
              onChange={(e) => setFilters({...filters, ticketType: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="normal">Normal</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="past">Past Orders</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaShoppingCart className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
            {(searchTerm || filters.status !== 'all' || filters.ticketType !== 'all' || filters.dateRange !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters to see all orders
              </button>
            )}
          </div>
        ) : (
          orders.map((order) => {
            const statusBadge = getStatusBadge(order.paymentStatus);
            const ticketTypeBadge = getTicketTypeBadge(order.ticketType);
            
            return (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block">
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Order Info */}
                      <div className="col-span-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaReceipt className="text-gray-400" />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {order.orderNumber || `ORD-${order._id.substring(18, 24)}`}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendarAlt className="text-xs" />
                                <span>{formatDate(order.createdAt)}</span>
                                <span>•</span>
                                <span>{formatTime(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400 text-xs" />
                              <span className="text-sm text-gray-600">{order.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400 text-xs" />
                              <span className="text-sm text-gray-600">{order.event?.title}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="col-span-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="font-medium">{order.quantity || 1}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Ticket Type:</span>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${ticketTypeBadge.color}`}>
                              {ticketTypeBadge.icon}
                              {ticketTypeBadge.text}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Price per:</span>
                            <span className="font-medium">{formatCurrency(order.price || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="ml-8 col-span-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-2xl font-bold text-gray-800">
                              {formatCurrency(order.totalAmount || 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                              {statusBadge.icon}
                              {statusBadge.text}
                            </div>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className={`px-2 py-1 rounded text-sm border ${
                                order.paymentStatus === 'paid' ? 'border-green-200' :
                                order.paymentStatus === 'pending' ? 'border-yellow-200' :
                                'border-red-200'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">failed</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center gap-5 justify-end">
                          <button
                           
                            className=" text-blue-700 rounded-lg"
                          >
                            <FaEye />
                            {/* <span>View</span> */}
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id)}
                            className=" text-red-600 rounded-lg"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="p-4">
                    {/* Header with order number and menu */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaReceipt className="text-gray-400" />
                          <h3 className="font-semibold text-gray-900">
                            {order.orderNumber || `ORD-${order._id.substring(18, 24)}`}
                          </h3>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                        </div>
                      </div>
                      
                      {/* Mobile Menu Button */}
                      <button
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === order._id ? null : order._id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>

                    {/* Customer and Event Info */}
                    <div className="mb-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-800">{order.user?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span className="text-sm text-gray-800 line-clamp-1">{order.event?.title}</span>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-semibold text-gray-800">{order.quantity || 1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ticket Type</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${ticketTypeBadge.color}`}>
                            {ticketTypeBadge.icon}
                            {ticketTypeBadge.text}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price Each</p>
                          <p className="font-semibold text-gray-800">{formatCurrency(order.price || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-gray-800">{formatCurrency(order.totalAmount || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {statusBadge.text}
                        </div>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="px-2 py-1 rounded text-xs border border-gray-300"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen === order._id && (
                      <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            navigate(`/orders/${order._id}`);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                        >
                          <FaEye className="text-blue-600" />
                          View Order Details
                        </button>
                        <button
                          onClick={() => {
                            deleteOrder(order._id);
                            setMobileMenuOpen(null);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600"
                        >
                          <FaTrash />
                          Delete Order
                        </button>
                      </div>
                    )}

                    {/* Action Buttons (when menu is closed) */}
                    {mobileMenuOpen !== order._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <FaEye />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.normalTickets}</div>
            <div className="text-sm text-gray-600">Normal Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.vipTickets}</div>
            <div className="text-sm text-gray-600">VIP Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failedOrders}</div>
            <div className="text-sm text-gray-600">Failed Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {allOrders.length > 0 ? Math.round((stats.paidOrders / allOrders.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderListPage;