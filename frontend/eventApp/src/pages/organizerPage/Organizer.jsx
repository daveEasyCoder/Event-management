import React from 'react'
import { useState } from 'react'
import { FaCalendarAlt, FaFolder, FaList, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

const Organizer = () => {

    const [activeLink, setActiveLink] = useState(0);
    const sidebarLinks = [
        { name: "Create Venue", path: "create-venue", icon: <FaMapMarkerAlt className="w-5 h-5" /> },
        { name: "Venue List", path: "venue-list", icon: <FaList className="w-5 h-5" /> },
        { name: "Create Category", path: "create-category", icon: <FaFolder className="w-5 h-5" /> },
        { name: "Category List", path: "category-list", icon: <FaFolder className="w-5 h-5" /> },
        { name: "Create Event", path: "create-event", icon: <FaCalendarAlt className="w-5 h-5" /> },
        { name: "Event List", path: "event-list", icon: <FaCalendarAlt className="w-5 h-5" /> }
    ];
    return (
        <>
            <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
                <div className="p-6 border-b border-b-gray-400">
                    <h1 className="text-xl font-bold text-blue-600">Organizer Dashboard</h1>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {
                            sidebarLinks.map((link,index) => (
                                <li key={index}>
                                    <Link
                                        onClick={() => setActiveLink(index)}
                                        to={`/organizer/${link.path}`}
                                        className={`flex ${index === activeLink ? 'bg-blue-50 text-blue-600' : 'text-gray-700'} items-center gap-3 p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors`}
                                    >
                                        {link.icon}
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </nav>
            </div>
            <Outlet />
        </>
    )
}

export default Organizer