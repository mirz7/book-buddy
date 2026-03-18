import React from 'react';
import Navbar from './components/Navbar';
import BookList from './components/BookList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BookList />
        </div>
      </main>
    </div>
  );
}

export default App;
