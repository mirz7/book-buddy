import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, Edit3, Sparkles, TrendingUp, Save, Play, Star, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // AI & Progress states
  const [aiSummary, setAiSummary] = useState('');
  const [aiReview, setAiReview] = useState('');
  const [predictedDate, setPredictedDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const hasGeneratedReview = useRef(false);

  // Forms
  const [pagesRead, setPagesRead] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchBookData();
  }, [id]);

  useEffect(() => {
    if (book && book.status === 'completed' && book.rating > 0 && !aiReview && !generating && !hasGeneratedReview.current) {
      hasGeneratedReview.current = true;
      handleGenerateReview();
    }
  }, [book?.status, book?.rating, aiReview, generating]);

  const fetchBookData = async () => {
    try {
      const bookRes = await api.get(`books/${id}/`);
      const notesRes = await api.get('notes/');
      setBook(bookRes.data);
      setPagesRead(bookRes.data.pages_read || '');
      setNotes(notesRes.data.filter(n => n.book === parseInt(id)));

      if (bookRes.data.status === 'reading') {
        const predRes = await api.get(`books/${id}/predict_completion/`);
        setPredictedDate(predRes.data.predicted_date);
      }

      const historyRes = await api.get('history/');
      setHistory(historyRes.data.filter(h => h.book === parseInt(id)));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      const updatedBook = { ...book, pages_read: parseInt(pagesRead) };
      if (book.total_pages && parseInt(pagesRead) >= book.total_pages) {
        updatedBook.status = 'completed';
      }
      await api.patch(`books/${id}/`, updatedBook);

      const lastPagesRead = book.pages_read || 0;
      if (parseInt(pagesRead) > lastPagesRead) {
        await api.post('sessions/', {
          book: id,
          pages_read: parseInt(pagesRead) - lastPagesRead
        });
      }

      await api.post('history/', {
        book: id,
        page_number: parseInt(pagesRead)
      });

      fetchBookData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRating = async (newRating) => {
    try {
      await api.patch(`books/${id}/`, { rating: newRating });
      setBook({ ...book, rating: newRating });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`books/${id}/`, { status: newStatus });
      fetchBookData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await api.post('notes/', { book: id, content: newNote });
      setNewNote('');
      fetchBookData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await api.get(`books/${id}/summarize_notes/`);
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateReview = async () => {
    setGenerating(true);
    try {
      const res = await api.get(`books/${id}/generate_review/`);
      setAiReview(res.data.review);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (!book) return <div>Book not found.</div>;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '5px 5px 5px', marginTop: '1px' }}>
      <button
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
        onClick={() => navigate('/books')}
      >
        &larr; Back to Library
      </button>

      {/* Two-column grid layout — aligns columns at the top with even gutters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        alignItems: 'start',    /* keeps columns top-aligned regardless of height */
      }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Book Info Card */}
          <div className="glass-card">
            {/* Cover + meta row */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {book.cover_image || book.cover_url ? (
                <img
                  src={book.cover_image || book.cover_url}
                  alt={book.title}
                  style={{ width: 110, height: 165, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 110, height: 165, flexShrink: 0,
                  background: 'rgba(255,255,255,0.05)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Book className="text-secondary" size={40} />
                </div>
              )}

              {/* Title / author / badges stacked cleanly */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                <h1 style={{ fontSize: '1.6rem', lineHeight: 1.2, margin: 0 }}>{book.title}</h1>
                <p className="text-secondary" style={{ fontSize: '1rem', margin: 0 }}>{book.author}</p>

                {/* Badge + genre on the same row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: 2 }}>
                  <span className={`badge badge-${book.status}`}>{book.status}</span>
                  {book.genre && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                      {book.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description below the cover row */}
            {book.description && (
              <p className="text-secondary" style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: '16px 0 0 0' }}>
                {book.description}
              </p>
            )}
          </div>

          {/* Notes Card */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
              <Edit3 size={20} /> My Notes
            </h3>

            <div
              className="custom-scrollbar"
              style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}
            >
              {notes.length > 0 ? notes.map(note => (
                <div
                  key={note.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap' }}>
                    {note.content}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
                    {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )) : (
                <p className="text-secondary" style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.875rem', margin: 0 }}>
                  No notes added yet.
                </p>
              )}
            </div>

            <form onSubmit={handleAddNote}>
              <textarea
                className="form-control"
                placeholder="Write a thought or quote..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                rows="3"
                style={{ width: '100%', marginBottom: 8, boxSizing: 'border-box' }}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={!newNote.trim()}
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Reading Progress Card */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
              <TrendingUp size={20} /> Reading Progress
            </h3>

            {book.status === 'reading' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <span>{book.pages_read} pages read</span>
                  <span>{book.total_pages ? `${book.total_pages} total` : 'Unknown total'}</span>
                </div>

                {book.total_pages && (
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginBottom: 16 }}>
                    <div style={{
                      width: `${Math.min((book.pages_read / book.total_pages) * 100, 100)}%`,
                      height: '100%',
                      background: 'var(--primary-accent)',
                      borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                )}

                <form onSubmit={handleUpdateProgress} style={{ marginBottom: predictedDate ? 16 : 0 }}>
                  <div style={{
                    display: 'flex', width: '100%',
                    background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <input
                      type="number"
                      className="form-control"
                      value={pagesRead}
                      onChange={e => setPagesRead(e.target.value)}
                      placeholder="Page number"
                      style={{ flex: 1, border: 'none', background: 'transparent', borderRadius: 0 }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 0, padding: '8px 16px', border: 'none' }}
                    >
                      <Save size={16} /> Update
                    </button>
                  </div>
                </form>

                {predictedDate && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(206,147,216,0.1))',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8,
                  }}>
                    <div style={{ padding: 10, background: 'rgba(99,102,241,0.2)', borderRadius: '50%', flexShrink: 0 }}>
                      <Sparkles size={20} className="text-gradient" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px', color: 'var(--text-secondary)' }}>AI Prediction</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        You're on track to finish around{' '}
                        <strong>{new Date(predictedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p style={{ margin: '0 0 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Book is marked as <strong>{book.status}</strong>.
                </p>

                {book.status === 'wishlist' && (
                  <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => handleStatusChange('reading')}>
                    <Play size={18} /> Start Reading
                  </button>
                )}

                {book.status === 'completed' && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginTop: 4 }}>
                    <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 600 }}>My Rating</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={24}
                          onClick={() => handleRating(star)}
                          fill={book.rating >= star ? '#E8A000' : 'transparent'}
                          color={book.rating >= star ? '#E8A000' : '#D1CCC4'}
                          style={{ cursor: 'pointer', transition: 'transform 0.15s', }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reading History Graph Card */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              <History size={20} /> Reading Over Time
            </h3>
            <div style={{ width: '100%', height: 200 }}>
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={str => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'white', border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11,
                      }}
                      labelFormatter={label => new Date(label).toLocaleDateString()}
                    />
                    <Line
                      type="monotone" dataKey="page_number"
                      stroke="var(--primary-accent)" strokeWidth={3}
                      dot={{ r: 4, fill: 'var(--primary-accent)', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No history yet</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0' }}>
              <Sparkles size={20} className="text-gradient" /> AI Insights
            </h3>

            {/* Notes Summary */}
            <div style={{ marginBottom: 20 }}>
              <button
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  borderRadius: aiSummary ? '8px 8px 0 0' : 8,
                  borderBottom: aiSummary ? 'none' : undefined,
                }}
                onClick={handleGenerateSummary}
                disabled={generatingSummary || notes.length === 0}
              >
                {generatingSummary ? 'Summarizing…' : 'Generate Summary from Notes'}
              </button>

              {aiSummary && (
                <div
                  className="custom-scrollbar text-sm"
                  style={{
                    padding: 16, lineHeight: 1.6, maxHeight: 140, overflowY: 'auto',
                    background: 'rgba(99,102,241,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderTop: 'none',
                    borderRadius: '0 0 8px 8px', boxSizing: 'border-box',
                    borderLeft: '3px solid var(--primary-accent)',
                  }}
                >
                  {aiSummary}
                </div>
              )}
            </div>

            {/* Auto Review (completed + rated) */}
            {book.status === 'completed' && book.rating > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                {!aiReview && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 12 }}
                    onClick={handleGenerateReview}
                    disabled={generating}
                  >
                    {generating ? 'Drafting review…' : 'Generate Automatic Review'}
                  </button>
                )}

                {aiReview && (
                  <div style={{
                    padding: 16, borderRadius: 8,
                    background: 'rgba(206,147,216,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: '3px solid var(--secondary-accent)',
                    boxSizing: 'border-box',
                  }}>
                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 10px', color: 'var(--text-secondary)' }}>
                      Auto Review Based on Notes and Rating
                    </p>
                    <div className="custom-scrollbar" style={{ fontSize: '0.8125rem', maxHeight: 160, overflowY: 'auto', lineHeight: 1.6 }}>
                      {aiReview}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}