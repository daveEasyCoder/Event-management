import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom'
import { useEventContext } from '../context/EventContext';
import axios from 'axios';

const Category = () => {

  const {BASE_URL} = useEventContext()
  const scrollRef = useRef()

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/categories/get-category`, { withCredentials: true });
      if (res.data.success) {
        setCategories(res.data.categories || []);
        
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories()
  },[])

  const handleScroll = (direction) => {
    const { current } = scrollRef;
    if (direction === "left") {
      current.scrollBy({ left: 200, behavior: "smooth" })
    } else {
      current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  return (
    <div className=''>
      <div className='max-w-6xl mx-auto py-14 px-3 lg:px-0'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className=' text-3xl font-semibold mb-5'>Browse By Category</h1>
          <div className='text-gray-600 flex gap-3 items-center'>
            <FaArrowLeft onClick={() => handleScroll("right")} className='cursor-pointer' size={15} />
            <FaArrowRight onClick={() => handleScroll("left")} className='cursor-pointer' size={15} />
          </div>
        </div>
        <div ref={scrollRef} className='category-container w-full flex gap-3 overflow-x-scroll'>
          {
           categories && categories.length ? 
            categories.map((cat, index) => (
              <div key={index} className='relative rounded-sm overflow-hidden flex-none'>
                <img className='w-70 h-70 object-cover' src={`${BASE_URL}/uploads/${cat.image}`} alt="Image" />
                <div className='absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex items-center justify-center'>
                  <p className='font-medium text-2xl text-gray-200 mt-3'>{cat.name}</p>
                  <Link to={`/events-by-category/${cat._id}`} className='text-white border text-sm absolute bottom-5 right-6 cursor-pointer px-3 rounded-full '>View</Link>
                </div>
              </div>
            )) : ''
          }
        </div>
      </div>
    </div>
  )
}

export default Category