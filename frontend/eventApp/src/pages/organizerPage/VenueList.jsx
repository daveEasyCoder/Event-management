// pages/VenueList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaUsers, FaSpinner, FaPlus, FaImage, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';

const VenueList = () => {
  const { BASE_URL } = useEventContext();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/venues/get-venue`, { withCredentials: true });
        
        if (response.data.success) {
          
          setVenues(response.data.venues || []);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  // Handle delete venue
  const handleDelete = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) {
      return;
    }

    setDeleteLoading(venueId);
    try {
      const response = await axios.delete(`${BASE_URL}/api/venues/delete-venue/${venueId}`, { withCredentials: true });
      
      if (response.data.success) {
        setVenues(venues.filter(venue => venue._id !== venueId));
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Failed to delete venue');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Format capacity number
  const formatCapacity = (capacity) => {
    if (!capacity) return 'N/A';
    if (capacity >= 1000) return `${(capacity / 1000).toFixed(1)}k`;
    return capacity.toString();
  };

  // Get capacity badge
  const getCapacityBadge = (capacity) => {
    if (!capacity) return 'bg-gray-100 text-gray-800';
    if (capacity >= 5000) return 'bg-red-100 text-red-800';
    if (capacity >= 2000) return 'bg-orange-100 text-orange-800';
    if (capacity >= 1000) return 'bg-yellow-100 text-yellow-800';
    if (capacity >= 500) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="ml-60 p-8 pt-20">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Venue Management</h1>
            <p className="text-gray-600 mt-2">Manage all your event venues</p>
          </div>
          <Link
            to="/organizer/create-venue"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <FaPlus />
            Add New Venue
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Loading venues...</span>
          </div>
        ) : venues.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <FaMapMarkerAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first venue</p>
            <Link
              to="/create-venue"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <FaPlus />
              Create Venue
            </Link>
          </div>
        ) : (
          /* Venues Flex Table */
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:flex bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="w-16"></div> {/* Image column */}
              <div className="flex-1 font-medium text-gray-700">Venue Details</div>
              <div className="w-48 font-medium text-gray-700">Location</div>
              <div className="w-32 font-medium text-gray-700 text-right">Capacity</div>
              <div className="w-32 font-medium text-gray-700 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {venues.map((venue) => (
                <div key={venue._id} className="flex flex-col md:flex-row md:items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Venue Image */}
                  <div className="w-16 h-16 shrink-0 mb-4 md:mb-0">
                    {venue.image ? (
                      <img
                        src={`${BASE_URL}/uploads/${venue.image}`}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/Placeholder.png';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <FaImage className="text-white text-xl" />
                      </div>
                    )}
                  </div>

                  {/* Venue Details */}
                  <div className="flex-1 md:pl-4 mb-4 md:mb-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{venue.name}</h3>
                    {venue.address && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {venue.address}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="w-full md:w-48 mb-4 md:mb-0">
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 shrink-0" />
                      <span className="text-sm truncate">
                        {venue.city && venue.country 
                          ? `${venue.city}, ${venue.country}`
                          : venue.city || venue.country || '—'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="w-full md:w-32 mb-4 md:mb-0 md:text-right">
                    <div className="flex items-center md:justify-end">
                      <FaUsers className="mr-2 text-blue-500 shrink-0" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCapacityBadge(venue.capacity)}`}>
                        {formatCapacity(venue.capacity)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-32 flex md:justify-end space-x-2">
                    <Link
                      to={`/organizer/update-venue/${venue._id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Edit venue"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(venue._id)}
                      disabled={deleteLoading === venue._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete venue"
                    >
                      {deleteLoading === venue._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="mb-2 sm:mb-0">
            Showing {venues.length} venue{venues.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-100 mr-2"></div>
              <span>Small (&lt;500)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-100 mr-2"></div>
              <span>Medium (500-1000)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-100 mr-2"></div>
              <span>Large (1k-2k)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-100 mr-2"></div>
              <span>Very Large (&gt;2k)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueList;