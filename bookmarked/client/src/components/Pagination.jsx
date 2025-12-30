import "../style/Search.css"; // Ensure styles are available

const Pagination = ({ page, lastPage, setPage }) => {
  if (lastPage <= 1) return null;

  const buttons = [];
  
  // Helper to create a single button
  const createButton = (pageNumber) => (
    <button 
      key={pageNumber} 
      onClick={() => setPage(pageNumber)} 
      className={pageNumber === page ? "active" : ""}
    >
      {pageNumber}
    </button>
  );

  // "Prev" Button
  buttons.push(
    <button
      key="prev" 
      onClick={() => setPage(page - 1)} 
      disabled={page === 1}
      className="nav-btn"
    >
      Previous
    </button>
  );

  // Logic to determine which page numbers to show
  const pagesToShow = new Set();
  pagesToShow.add(1); 
  if (page > 1) pagesToShow.add(page - 1);
  pagesToShow.add(page); 
  if (page < lastPage) pagesToShow.add(page + 1);
  if (lastPage > 1) pagesToShow.add(lastPage); 

  const sortedPages = [...pagesToShow].sort((a, b) => a - b);
  let prevPage = 0;

  sortedPages.forEach(pageNumber => {
    if (pageNumber > prevPage + 1 && prevPage !== 0) {
      buttons.push(<span key={`ell-${pageNumber}`} className="ellipsis">…</span>);
    }
    buttons.push(createButton(pageNumber));
    prevPage = pageNumber;
  });

  // "Next" Button
  buttons.push(
    <button 
      key="next" 
      onClick={() => setPage(page + 1)} 
      disabled={page === lastPage}
      className="nav-btn"
    >
      Next
    </button>
  );
  
  return <div className="pagination">{buttons}</div>;
};

export default Pagination;