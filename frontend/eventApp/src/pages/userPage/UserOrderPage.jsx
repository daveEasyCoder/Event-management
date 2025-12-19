// pages/UserOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaDownload,
  FaPrint,
  FaFilter,
  FaSearch,
  FaArrowLeft
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { useEventContext } from '../../context/EventContext';

const UserOrdersPage = () => {
  const { BASE_URL,setUser } = useEventContext()
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
        withCredentials: true
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        console.log(response.data.orders);

      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response) {
        if(err.response.status === 401 || err.response.status === 403){
          setUser(null)
          navigate('/login')
        }
      } else {
        setError('Server not responding. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on status and search
  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.paymentStatus !== filter) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.event?.title?.toLowerCase().includes(searchLower) ||
        order.event?.venue?.name?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        text: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: <FaCheckCircle className="text-green-500" />
      },
      pending: {
        text: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FaSpinner className="text-yellow-500 animate-spin" />
      },
      failed: {
        text: 'Failed',
        color: 'bg-red-100 text-red-800',
        icon: <FaTimesCircle className="text-red-500" />
      },
      cancelled: {
        text: 'Cancelled',
        color: 'bg-gray-100 text-gray-800',
        icon: <FaTimesCircle className="text-gray-500" />
      },
      refunded: {
        text: 'Refunded',
        color: 'bg-blue-100 text-blue-800',
        icon: <FaCheckCircle className="text-blue-500" />
      }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Download tickets

  const downloadAllTickets = async (orderId) => {
    console.log(orderId);

    try {
      const response = await axios.get(`${BASE_URL}/api/tickets/download-tickets/${orderId}`, {
        withCredentials: true,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Tickets-Order-${orderId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download tickets. Please try again.');
    }
  };

  // View order details
  const handleViewOrder = (orderId) => {
    console.log("fuck off");

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <span className="ml-4 text-gray-600 text-lg">Loading your orders...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-4"
          >
            <FaArrowLeft />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">View and manage your event tickets</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, event, or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'paid', 'pending', 'failed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === status
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="text-red-500 text-xl" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchUserOrders}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all'
                ? 'Try changing your search or filter criteria'
                : "You haven't placed any orders yet"}
            </p>
            {!searchTerm && filter === 'all' && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Browse Events
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.paymentStatus);

              return (
                <div key={order._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {order.event?.title || 'Event Not Found'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          Order #{order?.orderNumber} • {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${order?.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order?.quantity} {order.ticketType} ticket(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      {/* Event Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Event Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Date & Time</p>
                              <p className="font-medium">
                                {order.event?.startDate
                                  ? format(parseISO(order.event.startDate), 'MMM dd, yyyy • hh:mm a')
                                  : 'Date not set'
                                }
                              </p>
                            </div>
                          </div>

                          {order.event?.venue && (
                            <div className="flex items-start gap-3">
                              <FaMapMarkerAlt className="text-gray-400 mt-1" />
                              <div>
                                <p className="text-sm text-gray-600">Venue</p>
                                <p className="font-medium">{order.event.venue.name}</p>
                                <p className="text-sm text-gray-600">{order.event.venue.city}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ticket Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Ticket Information</h4>
                        <div className="space-y-3">
                          {order.tickets?.map((ticket, index) => (
                            <div key={ticket._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {ticket.ticketType.toUpperCase()} Ticket #{index + 1}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Code: {ticket.ticketCode}
                                </p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-medium ${ticket.isUsed
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                {ticket.isUsed ? 'Used' : 'Valid'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Payment Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                              ${(order.totalAmount).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between border-t border-gray-200 pt-3">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="text-xl font-bold text-green-600">
                              ${order.totalAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <FaEye />
                        View Details
                      </button>

                      {order.paymentStatus === 'paid' && (
                        <>
                          <button
                            onClick={() => downloadAllTickets(order._id)}
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <FaDownload />
                            Download Tickets
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                          >
                            <FaPrint />
                            Print Receipt
                          </button>
                        </>
                      )}

                      {(order.paymentStatus === 'pending' || order.paymentStatus === 'failed') && (
                        <button
                          onClick={() => navigate(`/events/${order.event?._id}`)}
                          className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                          <FaCreditCard />
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Stats Summary */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Paid Orders</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.flatMap(o => o.tickets || []).filter(t => !t.isUsed).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;