
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
import Admin from './pages/adminPage/Admin'
import Users from './pages/adminPage/Users'
import EventAnalytics from './pages/organizerPage/EventAnalytics'
import AdminEvents from './pages/adminPage/AdminEvents'
import UserEventDetailPage from './pages/userPage/UserEventDetailPage'
import UserOrdersPage from './pages/userPage/UserOrderPage'
import CategoryEventsPage from './pages/userPage/CategoryEventsPage'
import VenueEventsPage from './pages/userPage/VenueEventsPage'
import AdminDashboardStats from './pages/adminPage/AdminDashboardStats'
import RegisterPage from './pages/userPage/RegisterPage'
import { ApiProvider } from './context/EventContext'
import AdminOrderListPage from './pages/adminPage/AdminOrderListPage'
import EventFilterPage from './pages/userPage/EventFilterPage'

function AppContent() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="login" element={<UserLogin />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="user-event-detail/:id" element={<UserEventDetailPage />} />
        <Route path="my-order" element={<UserOrdersPage />} />
        <Route path="events-by-category/:categoryId" element={<CategoryEventsPage />} />
        <Route path="events-by-venue/:venueId" element={<VenueEventsPage />} />
        <Route path="events-filter" element={<EventFilterPage />} />

        {/* ORGANIZER ROUTES */}
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
          <Route path="event-analytics" element={<EventAnalytics />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path='/admin' element={<Admin />}>
          <Route path="users" element={<Users />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="admin-orders" element={<AdminOrderListPage />} />
          <Route path="" element={<AdminDashboardStats />} />
        </Route>



      </Routes>

    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
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
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App
