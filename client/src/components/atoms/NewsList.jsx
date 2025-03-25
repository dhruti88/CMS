import NewsCard from "./NewsCard";
const NewsList = ({ newsItems }) => {
  return (
    <div className="news-list">
      {newsItems.map(news => <NewsCard key={news.id} {...news} />)}
    </div>
  );
};
export default NewsList;