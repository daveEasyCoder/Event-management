import React from 'react'
import { useState } from 'react'
import { FaList, FaUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import axios from 'axios'
import {useEventContext} from '../../context/EventContext'

const Admin = () => {


    const {BASE_URL} = useEventContext()
    const [activeLink, setActiveLink] = useState(0);
    const sidebarLinks = [
        { name: "Dashboard", path: "", icon: <FaUser className="w-5 h-5" /> },
        { name: "Users", path: "users", icon: <FaUser className="w-5 h-5" /> },
        { name: "Events", path: "events", icon: <FaList className="w-5 h-5" /> },
        { name: "Orders", path: "admin-orders", icon: <FaList className="w-5 h-5" /> },
    ];

    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/users/logout`, {
                withCredentials: true
            });
            if(response.data.success){
                navigate("/admin-login")
            }
        } catch (error) {
            console.log(error);

        }
    }
    return (
        <>
            <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0">
                <div className="p-6 border-b border-b-gray-400">
                    <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {
                            sidebarLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        onClick={() => setActiveLink(index)}
                                        to={`/admin/${link.path}`}
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

            <div className='flex items-center justify-end fixed top-0 left-64 right-0 px-4 py-3 border-b bg-white border-b-gray-200'>
                <div>
                    <button onClick={handleLogout} className='bg-blue-700 text-sm text-white rounded-sm px-4 py-1.5 hover:bg-blue-800 cursor-pointer'>Logout</button>
                </div>
            </div>
            <Outlet />
        </>
    )
}

export default Admin