// VenueList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useEventContext } from '../context/EventContext';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VenueList = () => {

    const { BASE_URL } = useEventContext()
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

   const scrollRef = useRef()

   const navigate = useNavigate()



    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/api/venues/get-venue`, { withCredentials: true });
                if (response.data.success) {
                    setVenues(response.data.venues);
                }
                setError(null);
            } catch (err) {
                setError('Failed to fetch venues');
                console.log('Error fetching venues:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);


    let displayedVenues;
    if (venues && venues.length) {
        displayedVenues = showAll ? venues : venues?.slice(0, 4);

    }


    const handleScroll = (direction) => {
        const { current } = scrollRef;
        if (direction === "left") {
            current.scrollBy({ left: 200, behavior: "smooth" })
        } else {
            current.scrollBy({ left: -200, behavior: "smooth" })
        }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-8">Popular Venue</h2>
                <div className="text-center py-12 text-gray-500">Loading venues...</div>
            </div>
        );
    }

    return (
        <section className="max-w-6xl mx-auto px-4 py-10">

            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-3xl font-semibold mb-5'>Popular Venues</h1>
                <div className='flex gap-3 items-center'>
                    <FaArrowLeft onClick={() => handleScroll("right")} className='cursor-pointer' size={15} />
                    <FaArrowRight onClick={() => handleScroll("left")} className='cursor-pointer' size={15} />
                </div>
            </div>

            <div ref={scrollRef} className="category-container w-full flex gap-3 overflow-x-scroll">
                {
                    venues && venues.length ?
                        venues.map((venue, index) => (
                            <div
                                key={index}
                                className="group flex-none rounded-md overflow-hidden bg-white transition"
                            >
                                <div className="relative h-60 w-60 overflow-hidden">
                                    <img
                                        src={`${BASE_URL}/uploads/${venue.image}`}
                                        alt={venue.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span onClick={() => navigate(`/events-by-venue/${venue._id}`)} className="absolute cursor-pointer bottom-3 right-3 text-sm font-semibold text-white bg-black/60 px-3 py-1 rounded-lg">
                                        Explore
                                    </span>
                                </div>


                                {/* Info */}
                                <div className="p-4 overflow-hidden">
                                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                                        {venue.name?.length > 20 ? venue.name.substring(0, 20) + '...' : venue.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{venue.address}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-500">No venues available.</p>
                }
            </div>
        </section>
    );
};

export default VenueList;