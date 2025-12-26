import React from 'react'
import { useEventContext } from '../../context/EventContext'

const Profile = () => {

    const {user,handleLogout} = useEventContext()

    return (
        <div className='px-8 py-8 bg-gray-100 rounded absolute top-14 shadow-sm right-0 '>
            <div className='flex flex-col items-center'>
                <div>
                    <div className="w-14 h-14 bg-green-800 flex items-center justify-center text-white font-bold rounded-full">{user?.name?.slice(0, 1).toUpperCase()}</div>
                </div>
                <p>{user?.name}</p>
                <p className='text-sm text-gray-600'>{user?.email}</p>
                <button type='button' onClick={handleLogout} className='px-7 py-2 rounded bg-red-600 hover:bg-red-700 cursor-pointer mt-4 text-white text-sm'>Logout</button>
            </div>
        </div>
    )
}

export default Profile