import React, { useState } from 'react';
import NewsList from "../atoms/NewsList";
import Pagination from "../atoms/Pagination";
import Header from "../atoms/Header";
import Footer from "../atoms/Footer";
import '../../styles/WorkBench.css';
import SelectionBar from '../atoms/SelectionBar';

const MyLayouts = () => {
  const newsItems = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    title: `NewsPageName ${index + 1}`,
    dueDate: '02-18-2025', // Adjusted to YYYY-MM-DD format for date filtering
    imageUrl: 'https://via.placeholder.com/300',
    city: ["New York", "Los Angeles", "Chicago"][index % 3],
    taskStatus: ["In Progress", "Pending", "Completed"][index % 3],
    layoutType: ["Page", "Section"][index % 2], // Added Layout Type
    rows: (index % 5) + 1, // Random row value (1 to 5)
    cols: (index % 4) + 1  // Random column value (1 to 4)
  }));

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState(newsItems);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

const handleSearch = (filters) => {
  const filtered = newsItems.filter(item => {
    const formattedDueDate = item.dueDate.split("-").reverse().join("-"); // Convert "YYYY-MM-DD" → "DD-MM-YYYY"

    return (
      (!filters.city || item.city === filters.city) &&
      (!filters.dueDate || formattedDueDate === filters.dueDate) && // Match converted format
      (!filters.taskStatus || item.taskStatus === filters.taskStatus) &&
      (!filters.title || item.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (!filters.layoutType || item.layoutType === filters.layoutType) &&
      (!filters.rows || item.rows === Number(filters.rows)) &&
      (!filters.cols || item.cols === Number(filters.cols))
    );
  });

  setFilteredItems(filtered);
  setCurrentPage(1);
};


  return (
    <div className="news-container">
      <Header />
      <SelectionBar onSearch={handleSearch} />
      <NewsList newsItems={paginatedItems} />
      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      <Footer />
    </div>
  );
};

export default MyLayouts;
