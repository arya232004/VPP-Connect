import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import VPPHeader from "../pages/VPPHeader";

function ZLibrary() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const submissionsPerPage = 5;

  // Load saved query and books from localStorage on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem("zLibraryQuery");
    const savedBooks = localStorage.getItem("zLibraryBooks");
    if (savedQuery) {
      setSearchQuery(savedQuery);
    }
    if (savedBooks) {
      try {
        setBooks(JSON.parse(savedBooks));
      } catch (error) {
        console.error("Error parsing saved books:", error);
      }
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/latest/searchbooks?q=${encodeURIComponent(searchQuery)}`)
      .then((response) => response.json())
      .then((data) => {
        setBooks(data.books);
        setCurrentPaginationPage(1);
        // Save the search query and results to localStorage
        localStorage.setItem("zLibraryQuery", searchQuery);
        localStorage.setItem("zLibraryBooks", JSON.stringify(data.books));
      })
      .catch((error) => console.error("Error fetching books:", error))
      .finally(() => setLoading(false));
  };

  const totalPages = Math.ceil(books.length / submissionsPerPage);
  const paginatedBooks = books.slice(
    (currentPaginationPage - 1) * submissionsPerPage,
    currentPaginationPage * submissionsPerPage
  );

  return (
    <div>
      <VPPHeader text="Z-Library" />

      <div className="bg-white w-full md:w-[100%] rounded-2xl p-6">
        {/* Search Box */}
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="flex border-2 p-3 rounded-lg border-gray-400 opacity-50 gap-3 items-center px-4 w-full mb-4 md:mb-0">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-2 bg-themeblue text-lg text-white rounded-lg cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center opacity-50 justify-end mt-4 px-2">
            <div className="flex items-center gap-3">
              <h1>
                {currentPaginationPage * submissionsPerPage - submissionsPerPage + 1} -{" "}
                {Math.min(currentPaginationPage * submissionsPerPage, books.length)} of {books.length}
              </h1>
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => setCurrentPaginationPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPaginationPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPaginationPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPaginationPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Books List */}
        <div className="flex flex-col gap-2 mt-2">
          {loading ? (
            <p className="text-center opacity-50 mt-4">Loading...</p>
          ) : paginatedBooks.length > 0 ? (
            paginatedBooks.map((book, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center p-3 rounded-xl hover:bg-themegray cursor-pointer justify-between w-full"
              >
                <div className="flex items-center w-full">
                  <img
                    src={
                      book.coverImage !== "N/A"
                        ? book.coverImage
                        : "https://via.placeholder.com/100"
                    }
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-lg mr-4"
                  />
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-neueMedium break-words whitespace-normal">
                      {book.title}
                    </h1>
                    <p className="text-gray-600">{book.author}</p>
                    <div className="md:flex gap-4 text-sm text-gray-500">
                      <p>Year: {book.year}</p>
                      <p>Rating: {book.rating}</p>
                      <p>
                        Language:{" "}
                        {book.language.charAt(0).toUpperCase() +
                          book.language.slice(1).toLowerCase()}
                      </p>
                    </div>
                    <a
                      href={book.bookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-themeblue hover:underline text-sm mt-2"
                    >
                      View Book
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <h1 className="text-center opacity-50 mt-4">No books found.</h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default ZLibrary;
