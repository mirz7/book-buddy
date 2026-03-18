import React, { useState, useEffect } from 'react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In day 2, we just try to fetch from our local django backend.
    fetch('http://localhost:8000/api/books/')
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching books:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading books...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Books</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
          No books found. Add some from the backend!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{book.title}</h3>
                <p className="mt-1 text-sm text-gray-500">by {book.author}</p>
              </div>
              <div className="px-4 py-4 sm:px-6">
                <p className="text-sm text-gray-700">{book.description || "No description provided."}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
