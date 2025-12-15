import React, { useEffect, useState } from 'react'
import { useEventContext } from '../context/EventContext';
import axios from 'axios';

const Events = () => {

    const { BASE_URL } = useEventContext()
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        category: '',
        dateRange: 'all'
    });

    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                search: searchTerm
            };

            const response = await axios.get(`${BASE_URL}/api/events/get-all-events`, { params, withCredentials: true });

            if (response.data.success) {
                setEvents(response.data.data || []);
                console.log(response.data);
                
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents()
    }, [])
    return (
        <div>Events</div>
    )
}

export default Events