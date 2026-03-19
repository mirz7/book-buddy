import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Save, Image, Upload, X } from 'lucide-react';
import api from '../api';

export default function AddBook() {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
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
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'

  useEffect(() => {
    if (location.state && location.state.autoFillBook) {
      const book = location.state.autoFillBook;
      if (book.isbn) {
        setIsbn(book.isbn);
        // Automatically trigger the import; pass the book as fallback in case ISBN lookup fails
        performIsbnImport(book.isbn, book);
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

  const performIsbnImport = async (isbnToFetch, fallbackBook = null) => {
    if (!isbnToFetch) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await api.post('books/import_isbn/', { isbn: isbnToFetch });
      setFormData(prev => ({
        ...prev,
        ...res.data,
        isbn: isbnToFetch
      }));
    } catch (err) {
      if (fallbackBook) {
        // ISBN lookup failed — fall back to the recommendation data we already have
        setFormData(prev => ({
          ...prev,
          title: fallbackBook.title || '',
          author: fallbackBook.author || '',
          genre: fallbackBook.genre || '',
          description: fallbackBook.description || '',
          isbn: isbnToFetch,
        }));
        setNotice('ISBN lookup issue — details from the recommendation have been pre-filled. You can edit them below.');
      } else {
        setError('Could not fetch book details. Please enter manually.');
      }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadMode('file');
      setFormData(prev => ({ ...prev, cover_url: '' })); // Clear URL if file is selected
    }
  };

  const clearFile = () => {
    setCoverFile(null);
    setPreviewUrl(null);
    setUploadMode('url');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });
      
      if (coverFile) {
        data.append('cover_image', coverFile);
      }

      const res = await api.post('books/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('book_buddy_recs_stale', 'true');
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
      {notice && <div className="glass-card mb-4" style={{ borderColor: '#3b82f6', color: '#1e3a8a', backgroundColor: '#eff6ff', padding: 12 }}>{notice}</div>}

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          {/* Two-column layout: left = text fields, right = cover image */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* LEFT COLUMN — all text inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Author *</label>
                <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Genre</label>
                <input type="text" className="form-control" name="genre" value={formData.genre} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reading Status</label>
                <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
                  <option value="wishlist">Wishlist</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Total Pages</label>
                <input type="number" className="form-control" name="total_pages" value={formData.total_pages} onChange={handleChange} />
              </div>
            </div>

            {/* RIGHT COLUMN — cover image upload */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cover Image</label>
              <div style={{
                padding: '24px',
                borderRadius: 12,
                border: '1px dashed rgba(0,0,0,0.15)',
                background: 'rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
              }}>
                {/* Preview */}
                <div style={{
                  width: 120,
                  height: 168,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {previewUrl || formData.cover_url ? (
                    <img src={previewUrl || formData.cover_url} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image size={40} style={{ opacity: 0.3 }} />
                  )}
                </div>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setUploadMode('url')}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setUploadMode('file')}
                  >
                    Upload File
                  </button>
                </div>

                {/* Input */}
                <div style={{ width: '100%' }}>
                  {uploadMode === 'url' ? (
                    <input
                      type="url"
                      className="form-control"
                      name="cover_url"
                      placeholder="https://example.com/cover.jpg"
                      value={formData.cover_url}
                      onChange={handleChange}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <label className="btn btn-secondary flex items-center gap-2 cursor-pointer" style={{ margin: 0, width: '100%', justifyContent: 'center' }}>
                        <Upload size={16} /> Choose Image
                        <input type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                      </label>
                      {coverFile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.7 }}>
                          <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coverFile.name}</span>
                          <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}><X size={14} /></button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 12, opacity: 0.5, margin: 0, textAlign: 'center' }}>Recommended: 300×450px · Max 2MB</p>
              </div>
            </div>
          </div>

          {/* Description - full width below */}
          <div className="form-group" style={{ marginTop: 24 }}>
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
