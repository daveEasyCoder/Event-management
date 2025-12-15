import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div className='flex items-center justify-center'>
            <div className='fixed z-20 top-2 bg-green-700 rounded-lg w-[95%] flex items-center justify-between px-6 py-3 text-white'>
                <div>
                    <p className='text-2xl font-semibold'>Chillux Event </p>
                </div>
                <ul className='flex items-center gap-8'>
                    <li><Link to=''>Home</Link> </li>
                    <li><Link to=''>Event</Link> </li>
                    <li><Link to=''>Suppliers</Link> </li>
                    <li><Link to=''>About</Link> </li>
                    <li><Link to=''>Contact Us</Link> </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar