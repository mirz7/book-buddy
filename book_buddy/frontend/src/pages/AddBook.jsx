import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Save } from 'lucide-react';
import api from '../api';

export default function AddBook() {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    status: 'wishlist',
    isbn: '',
    cover_url: '',
    total_pages: '',
  });

  useEffect(() => {
    if (location.state && location.state.autoFillBook) {
      const book = location.state.autoFillBook;
      if (book.isbn) {
        setIsbn(book.isbn);
        // Automatically trigger the import if arriving from recommendations with an ISBN
        performIsbnImport(book.isbn);
      } else {
        setFormData(prev => ({
          ...prev,
          title: book.title || '',
          author: book.author || '',
          genre: book.genre || '',
          description: book.description || ''
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const performIsbnImport = async (isbnToFetch) => {
    if (!isbnToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('books/import_isbn/', { isbn: isbnToFetch });
      setFormData(prev => ({
        ...prev,
        ...res.data,
        isbn: isbnToFetch
      }));
    } catch (err) {
      setError('Could not fetch book details. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleIsbnImport = () => {
    performIsbnImport(isbn);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.total_pages) delete dataToSubmit.total_pages; // prevent empty string error
      const res = await api.post('books/', dataToSubmit);
      localStorage.setItem('book_buddy_recs_stale', 'true'); // Mark recs as stale instead of deleting them
      navigate(`/books/${res.data.id}`);
    } catch (err) {
      setError('Failed to save book. Please check required fields.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 className="mb-4">Add a New Book</h1>
      
      <div className="glass-card mb-4 flex items-center gap-4" style={{ padding: '16px 24px' }}>
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>Fast Import with ISBN</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. 9780141185064"
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={handleIsbnImport} disabled={loading}>
              <Search size={18} /> {loading ? 'Fetching...' : 'Import'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="glass-card mb-4" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: 12 }}>{error}</div>}

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Genre</label>
              <input type="text" className="form-control" name="genre" value={formData.genre} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Reading Status</label>
              <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                <option value="wishlist">Wishlist</option>
                <option value="reading">Currently Reading</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input type="url" className="form-control" name="cover_url" value={formData.cover_url} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Total Pages</label>
              <input type="number" className="form-control" name="total_pages" value={formData.total_pages} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group mt-2">
            <label className="form-label">Description / Synopsis</label>
            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="4" />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/books')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
