// pages/OrganizerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaEye, 
  FaTicketAlt,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaTag
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';
import { format, subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

const OrganizerDashboard = () => {
  const { BASE_URL } = useEventContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalTicketsSold: 0,
    upcomingEvents: 0,
    ongoingEvents: 0
  });
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // month, week, year

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/events/get-all-events`, { withCredentials: true });
      
      if (response.data.success) {
        const events = response.data.data || response.data.events || [];
        calculateStats(events);
        setRecentEvents(getRecentEvents(events));
        setTopEvents(getTopEvents(events));
        setRevenueData(calculateRevenueData(events));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (events) => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.isPublished).length;
    const draftEvents = events.filter(e => !e.isPublished).length;
    
    // Calculate revenue (simplified - you'd have actual ticket sales data)
    const totalRevenue = events.reduce((sum, event) => {
      const normalRevenue = (event.normalPrice?.price || 0) * (event.normalPrice?.quantity || 0);
      const vipRevenue = (event.vipPrice?.price || 0) * (event.vipPrice?.quantity || 0);
      return sum + normalRevenue + vipRevenue;
    }, 0);
    
    // Calculate tickets sold (simplified)
    const totalTicketsSold = events.reduce((sum, event) => {
      const normalSold = Math.floor((event.normalPrice?.quantity || 0) * 0.3); // 30% sold
      const vipSold = Math.floor((event.vipPrice?.quantity || 0) * 0.5); // 50% sold
      return sum + normalSold + vipSold;
    }, 0);
    
    // Calculate upcoming and ongoing events
    const upcomingEvents = events.filter(event => 
      event.isPublished && new Date(event.startDate) > now
    ).length;
    
    const ongoingEvents = events.filter(event => {
      if (!event.isPublished) return false;
      const start = new Date(event.startDate);
      const end = event.endDate ? new Date(event.endDate) : null;
      return start <= now && (!end || end >= now);
    }).length;

    // Calculate views (simplified - would come from analytics)
    const totalViews = events.reduce((sum, event) => 
      sum + (event.views || Math.floor(Math.random() * 1000)), 0
    );

    setStats({
      totalEvents,
      publishedEvents,
      draftEvents,
      totalRevenue,
      totalViews,
      totalTicketsSold,
      upcomingEvents,
      ongoingEvents
    });
  };

  const getRecentEvents = (events) => {
    return events
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(event => ({
        id: event._id || event.id,
        title: event.title,
        date: format(new Date(event.startDate), 'MMM dd'),
        status: getEventStatus(event),
        tickets: calculateTicketsSold(event),
        revenue: calculateEventRevenue(event)
      }));
  };

  const getTopEvents = (events) => {
    return events
      .map(event => ({
        id: event._id || event.id,
        title: event.title,
        views: event.views || Math.floor(Math.random() * 1000),
        tickets: calculateTicketsSold(event),
        revenue: calculateEventRevenue(event)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const calculateRevenueData = (events) => {
    const daysInMonth = 30;
    const data = [];
    
    for (let i = daysInMonth - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      
      const dayEvents = events.filter(event => 
        isWithinInterval(new Date(event.startDate), {
          start: date,
          end: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        })
      );
      
      const dayRevenue = dayEvents.reduce((sum, event) => 
        sum + calculateEventRevenue(event), 0
      );
      
      data.push({ date: dateStr, revenue: dayRevenue });
    }
    
    return data.slice(-7); // Last 7 days
  };

  const calculateEventRevenue = (event) => {
    const normalRevenue = (event.normalPrice?.price || 0) * 50; // Assuming 50 tickets sold
    const vipRevenue = (event.vipPrice?.price || 0) * 20; // Assuming 20 VIP tickets sold
    return normalRevenue + vipRevenue;
  };

  const calculateTicketsSold = (event) => {
    const normalSold = Math.floor((event.normalPrice?.quantity || 0) * 0.3);
    const vipSold = Math.floor((event.vipPrice?.quantity || 0) * 0.5);
    return normalSold + vipSold;
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    
    if (!event.isPublished) return 'Draft';
    if (start > now) return 'Upcoming';
    if (end && end < now) return 'Completed';
    if (start <= now && (!end || end >= now)) return 'Ongoing';
    return 'Published';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Ongoing': 'bg-green-100 text-green-800',
      'Completed': 'bg-purple-100 text-purple-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Published': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors['Draft'];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPercentageChange = () => {
    // Simplified - you'd compare with previous period
    return { value: 15.3, isPositive: true };
  };

  const percentageChange = getPercentageChange();

  return (
    <div className="ml-60 p-8 mt-8 pt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Analytics and insights for your events</p>
          </div>
          
          <div className="flex gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last year</option>
            </select>
            
            <Link
              to="/create-event"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaCalendarAlt />
              New Event
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalEvents}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${percentageChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {percentageChange.isPositive ? <FaArrowUp /> : <FaArrowDown />}
                        {percentageChange.value}%
                      </span>
                      <span className="text-gray-500 text-sm">from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaCalendarAlt className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="text-green-600 text-sm mt-2 font-medium">
                      +12.5% from last month
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaDollarSign className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              {/* Tickets Sold */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Tickets Sold</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalTicketsSold}</p>
                    <div className="text-blue-600 text-sm mt-2 font-medium">
                      {Math.round((stats.totalTicketsSold / 1000) * 100)}% of goal
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FaTicketAlt className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>

              {/* Event Views */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {stats.totalViews.toLocaleString()}
                    </p>
                    <div className="text-yellow-600 text-sm mt-2 font-medium">
                      45% engagement rate
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FaEye className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Published Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Published</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{stats.publishedEvents}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.totalEvents > 0 
                      ? `${Math.round((stats.publishedEvents / stats.totalEvents) * 100)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>

              {/* Draft Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Drafts</p>
                    <p className="text-2xl font-bold text-gray-600 mt-2">{stats.draftEvents}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Needs attention
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{stats.upcomingEvents}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Scheduled
                  </div>
                </div>
              </div>

              {/* Ongoing Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Ongoing</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{stats.ongoingEvents}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Live now
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
                  <FaChartLine className="text-blue-500" />
                </div>
                <div className="h-64 flex items-end gap-2">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:opacity-90"
                        style={{ height: `${(item.revenue / 1000) * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{item.date}</div>
                      <div className="text-xs font-medium text-gray-700">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Top Performing Events</h3>
                  <FaChartBar className="text-green-500" />
                </div>
                <div className="space-y-4">
                  {topEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{event.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaEye /> {event.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaTicketAlt /> {event.tickets}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">
                        {formatCurrency(event.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Events and Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Events */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Events</h3>
                  <Link 
                    to="/events" 
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock /> {event.date}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(event.revenue)}</div>
                        <div className="text-xs text-gray-500">{event.tickets} tickets</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Event Distribution</h3>
                  <FaChartPie className="text-purple-500" />
                </div>
                <div className="space-y-6">
                  {/* Status Distribution */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">By Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Published</span>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(stats.publishedEvents / stats.totalEvents) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.publishedEvents}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Drafts</span>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 rounded-full"
                            style={{ width: `${(stats.draftEvents / stats.totalEvents) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.draftEvents}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/create-event"
                        className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center font-medium hover:bg-blue-100 transition"
                      >
                        Create Event
                      </Link>
                      <Link
                        to="/events"
                        className="bg-green-50 text-green-700 p-3 rounded-lg text-center font-medium hover:bg-green-100 transition"
                      >
                        Manage Events
                      </Link>
                      <Link
                        to="/create-venue"
                        className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center font-medium hover:bg-purple-100 transition"
                      >
                        Add Venue
                      </Link>
                      <Link
                        to="/create-category"
                        className="bg-pink-50 text-pink-700 p-3 rounded-lg text-center font-medium hover:bg-pink-100 transition"
                      >
                        Add Category
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;