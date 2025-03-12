import React, { useState } from 'react';
import '../../../styles/WorkBench.css'; 

const NewsCard = ({ title, dueDate, imageUrl }) => {
  return (
    <div className="news-card">
      <img src={imageUrl} alt="News" className="news-image" />
      <div className="news-content">
        <h3 className="news-title">{title}</h3>
        <p className="news-task">Assigned task title</p>
        <p className="news-due">Due by: {dueDate}</p>
      </div>
    </div>
  );
};

const NewsPage = () => {
  const newsItems = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    title: `NewsPageName ${index + 1}`,
    dueDate: '18/02/25',
    imageUrl: 'https://via.placeholder.com/300',
  }));

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);

  const paginatedItems = newsItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="news-container">
      <header className="news-header">
        <h2>NewsCMS</h2>
        <button className="view-tasks">View Tasks</button>
      </header>
      <div className="news-list">
        {paginatedItems.map((news) => (
          <NewsCard key={news.id} {...news} />
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled = {currentPage === 1}
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <footer className="news-footer">
        <p>&copy; 2020 News CMS All rights reserved.</p>
        <p>newscms@gmail.com</p>
      </footer>
    </div>
  );
};

export default NewsPage;