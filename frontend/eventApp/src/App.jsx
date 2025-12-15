
import './App.css'
import { Routes, Route } from 'react-router-dom'
import CreateVenue from './pages/organizerPage/CreateVenue'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router-dom'
import CreateCategory from './pages/organizerPage/CreateCategory'
import Organizer from './pages/organizerPage/Organizer'
import CreateEvent from './pages/organizerPage/CreateEvent'
import EventList from './pages/organizerPage/EventList'
import EventDetail from './pages/organizerPage/EventDetail'
import EditEvent from './pages/organizerPage/EventEdit'
import UserLogin from './pages/userPage/UserLogin'
import HomePage from './pages/userPage/HomePage'
import VenueList from './pages/organizerPage/VenueList'
import UpdateVenue from './pages/organizerPage/UpdateVenue'
import CategoryList from './pages/organizerPage/CategoryList'
import EditCategory from './pages/organizerPage/EditCategory'

function AppContent() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />

        <Route path='/organizer' element={<Organizer />}>
          <Route path="create-venue" element={<CreateVenue />} />
          <Route path="venue-list" element={<VenueList />} />
          <Route path="update-venue/:id" element={<UpdateVenue />} />
          <Route path="create-category" element={<CreateCategory />} />
          <Route path="category-list" element={<CategoryList />} />
          <Route path="edit-category/:id" element={<EditCategory />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="event-list" element={<EventList />} />
          <Route path="event-detail/:id" element={<EventDetail />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
        </Route>

      </Routes>

    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppContent />
    </BrowserRouter>
  );
}

export default App
