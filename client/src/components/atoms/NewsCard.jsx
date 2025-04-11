const NewsCard = ({ title, dueDate, imageUrl, city }) => {
  return (
    <div className="news-card">
      <img src={imageUrl} alt="News" className="news-image" />
      <div className="news-content">
        <h3 className="news-title">{title}</h3>
        <h3>City: {city}</h3>
        <p className="news-task">Assigned task title</p>
        <p className="news-due">Due by: {dueDate}</p>
      </div>
    </div>
  );
};
export default NewsCard;