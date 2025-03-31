import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SelectionBar from "../atoms/SelectionBar"
import NewsList from "../atoms/NewsList";
import Pagination from "../atoms/Pagination";
import Footer from "../atoms/Footer";
import { useAuth } from "../../context/AuthContext"; 

const MyLayouts = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { user } = useAuth(); 

  // Fetch layouts from backend using token from localStorage
  useEffect(() => {
    const fetchLayouts = async () => {
      const token = localStorage.getItem("token");
    
      if (!token) {
        console.error("No token found. Please log in.");
        navigate("/signin");
        return;
      }
    
      try {
        const response = await axios.get("http://localhost:8000/api/my-layouts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log("Fetched layouts:", response.data.layouts);
        setNewsItems(response.data.layouts);
        setFilteredItems(response.data.layouts);
      } catch (error) {
        console.error("Error fetching layouts:", error.response?.data?.error || error.message);
      }
    };
    

    fetchLayouts();
  }, [user, navigate]);

  // Filtering Logic
  const handleSearch = (filters) => {
    const filtered = newsItems.filter((item) => {
      const formattedDueDate = item.duedate
        ? new Date(item.duedate).toISOString().split("T")[0]
        : "";
  
      return (
        (!filters.city || item.city?.toLowerCase() === filters.city.toLowerCase()) &&
        (!filters.dueDate || formattedDueDate === filters.dueDate) &&
        (!filters.taskStatus || item.taskstatus?.toLowerCase() === filters.taskStatus.toLowerCase()) &&
        (!filters.title || item.title?.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.layoutType || item.layouttype?.toLowerCase() === filters.layoutType.toLowerCase()) &&
        (!filters.rows || item.gridSettings?.rows === Number(filters.rows)) &&
        (!filters.cols || item.gridSettings?.columns === Number(filters.cols))
      );
    });
  
    setFilteredItems(filtered);
    setCurrentPage(1);
  };
  
  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="news-container">
      <SelectionBar onSearch={handleSearch} />
      <NewsList newsItems={paginatedItems} />
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      <Footer />
    </div>
  );
};

export default MyLayouts;
