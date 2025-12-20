import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const BASE_URL = "https://event-management-server-br57.onrender.com";
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const [isSidebarVisible, setIsSidebarVisible] = useState(false)


  const navigate = useNavigate()

  const getUserProfile = async () => {
    try {

      const res = await axios.get(`${BASE_URL}/api/users/user-profile`, { withCredentials: true });
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.log(err);
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setUser(null)
          navigate('/login')
        }
      } else {
        console.log("Server is not responding");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <ApiContext.Provider value={{ BASE_URL, user, setUser, isSidebarVisible, getUserProfile, setIsSidebarVisible }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useEventContext = () => useContext(ApiContext);
