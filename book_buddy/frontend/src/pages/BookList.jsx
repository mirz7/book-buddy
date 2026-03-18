import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Search, Filter, Book, Trash2, Play, Star } from 'lucide-react';
import api from '../api';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (bookToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [bookToDelete]);

  const fetchBooks = async () => {
    try {
      const res = await api.get('books/');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      await api.delete(`books/${bookToDelete.id}/`);
      setBooks(books.filter(b => b.id !== bookToDelete.id));
      localStorage.setItem('book_buddy_recs_stale', 'true');
      setBookToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelDelete = () => {
    setBookToDelete(null);
  };

  const handleStatusChange = async (book, newStatus) => {
    try {
      await api.patch(`books/${book.id}/`, { status: newStatus });
      setBooks(books.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>My Library</h1>
      </div>

      <div className="glass-card mb-4 flex justify-between items-center" style={{ padding: '16px 24px' }}>
        <div className="flex items-center gap-2" style={{ flex: 1, maxWidth: 400 }}>
          <Search className="text-secondary" />
          <input 
            type="text" 
            placeholder="Search books or authors..." 
            className="form-control" 
            style={{ margin: 0, padding: '8px 12px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn ${filter === 'reading' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('reading')}>Reading</button>
          <button className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('completed')}>Completed</button>
          <button className={`btn ${filter === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('wishlist')}>Wishlist</button>
        </div>
      </div>

      {loading ? (
        <div className="text-secondary" style={{ textAlign: 'center', padding: 40 }}>Loading library...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredBooks.map(book => (
            <div key={book.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '200px', justifyContent: 'space-between' }}>
              <div className="flex gap-4 mb-4">
                {book.cover_image || book.cover_url ? (
                  <img src={book.cover_image || book.cover_url} alt={book.title} style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 80, height: 110, background: 'rgba(255,255,255,0.05)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Book className="text-secondary" size={32} />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{book.title}</h3>
                  <p className="text-secondary text-sm mb-2">{book.author}</p>
                  <span className={`badge badge-${book.status}`}>{book.status}</span>
                  {book.genre && <p className="text-sm mt-2 font-display" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{book.genre}</p>}
                </div>
              </div>

              {book.status === 'reading' ? (
                <div className="mb-4">
                  {book.total_pages ? (
                    <>
                      <div className="flex justify-between text-sm mb-1 text-secondary">
                        <span>Progress</span>
                        <span>{Math.round((book.pages_read / book.total_pages) * 100)}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#E0DDD8', borderRadius: 999 }}>
                        <div style={{ width: `${(book.pages_read / book.total_pages) * 100}%`, height: '100%', background: '#5C8D6E', borderRadius: 999 }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ minHeight: 24 }} />
                  )}
                </div>
              ) : book.status === 'completed' ? (
                <div className="mb-4" style={{ minHeight: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
                   {[1, 2, 3, 4, 5].map(star => (
                     <Star 
                       key={star} 
                       size={16} 
                       fill={book.rating >= star ? "#E8A000" : "transparent"}
                       color={book.rating >= star ? "#E8A000" : "#D1CCC4"}
                     />
                   ))}
                </div>
              ) : (
                <div className="mb-4" style={{ minHeight: 24 }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', borderTop: '1px solid rgba(92,141,110,0.12)', paddingTop: 16 }}>
                <Link to={`/books/${book.id}`} style={{ flex: 1, padding: '8px', textAlign: 'center', border: '1px solid #D0CCC4', borderRadius: 8, background: 'transparent', color: '#444', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.2s' }}>Details</Link>
                <button onClick={() => setBookToDelete(book)} className="btn btn-secondary" style={{ color: 'var(--danger)', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredBooks.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }} className="text-secondary glass-card">
              No books found in this category.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && createPortal(
        <div 
          onClick={cancelDelete}
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(45,45,45,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '420px', padding: '32px 28px', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(92,141,110,0.15)', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>Delete "{bookToDelete.title}"?</h3>
            <p style={{ marginBottom: '24px', fontSize: '15px', fontWeight: 400, color: '#6B7280', lineHeight: 1.6 }}>
              Are you sure you want to permanently remove this book from your library? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={cancelDelete} style={{ flex: 1, height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '15px' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', background: '#BF4B3A', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
