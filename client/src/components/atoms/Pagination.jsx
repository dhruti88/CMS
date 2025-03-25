const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
    const getPageNumbers = () => {
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, startPage + 3);
        
        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - 3);
        }
        
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    return (
        <div className="pagination">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Previous
            </button>
            {getPageNumbers().map((num) => (
                <button 
                    key={num} 
                    className={currentPage === num ? 'active' : ''} 
                    onClick={() => setCurrentPage(num)}
                >
                    {num}
                </button>
            ))}
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                Next
            </button>
        </div>
    );
};

export default Pagination;