import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaChevronDown, FaCalendarAlt, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa";
import Category from "../../components/Category";
import Events from "../../components/Events";
import VenueList from "../../components/Venues";

// Custom Select Component with better styling
const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon }) => {
  return (
    <div className="relative w-full md:w-auto flex-1">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
        <Icon />
      </div>
      <select
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-4 rounded-xl text-gray-700 bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all appearance-none cursor-pointer shadow-sm hover:border-green-400"
      >
        <option value="" className="text-gray-400">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="py-2">
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
        <FaChevronDown />
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-3 flex items-center justify-center left-0 right-0 z-50  shadow-lg">
      <div className="w-[95%] rounded-3xl px-4 bg-white">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Chillux
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Extraordinary Events</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group">
              Events
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/suppliers" className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group">
              Suppliers
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-green-600 p-2"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-green-600 font-medium py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                Home
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-green-600 font-medium py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                Events
              </Link>
              <Link to="/suppliers" className="text-gray-700 hover:text-green-600 font-medium py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                Suppliers
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-600 font-medium py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-green-600 font-medium py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Hero = () => {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const categories = [
    { value: "music", label: "Music Concerts" },
    { value: "sports", label: "Sports Events" },
    { value: "conference", label: "Conferences" },
    { value: "workshop", label: "Workshops" },
    { value: "festival", label: "Festivals" },
    { value: "exhibition", label: "Exhibitions" },
    { value: "theater", label: "Theater & Arts" },
    { value: "charity", label: "Charity Events" }
  ];

  const locations = [
    { value: "new-york", label: "New York, NY" },
    { value: "los-angeles", label: "Los Angeles, CA" },
    { value: "chicago", label: "Chicago, IL" },
    { value: "miami", label: "Miami, FL" },
    { value: "las-vegas", label: "Las Vegas, NV" },
    { value: "boston", label: "Boston, MA" },
    { value: "san-francisco", label: "San Francisco, CA" },
    { value: "seattle", label: "Seattle, WA" }
  ];

  const handleSearch = () => {
    console.log("Searching with:", { category, location });
    // Add your search logic here
  };

  return (
    <>
      <Navbar />
      
      <div
        className="relative h-screen bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), url(bgImg.jpg)`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto w-full pt-20">
            {/* Hero Text */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Discover <span className="text-green-400">Extraordinary</span> <br />
                Events Near You
              </h1>
              {/* <p className="text-xl md:text-2xl text-gray-200 max-w-3xl leading-relaxed">
                Your premier destination for unforgettable experiences. From concerts to conferences, 
                find events that inspire, entertain, and connect.
              </p> */}
            </div>

            {/* Search Container */}
            <div className=" rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Find Your Perfect Event</h2>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-end">
               
                <CustomSelect
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={categories}
                  placeholder="Select Event Category"
                  icon={FaCalendarAlt}
                />

          
                <CustomSelect
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  options={locations}
                  placeholder="Select Location"
                  icon={FaMapMarkerAlt}
                />

                
                <button
                  onClick={handleSearch}
                  className="group w-full md:w-auto bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center gap-3 shadow-lg"
                >
                  <FaSearch className="text-xl" />
                  Search Events
                  <span className="inline-block group-hover:translate-x-2 transition-transform duration-300">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <Category />
      <VenueList />
      {/* <Events /> */}
    </>
  );
};

export default Hero;