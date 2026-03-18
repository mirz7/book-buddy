import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlusCircle } from 'lucide-react';
import api from '../api';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cachedRecs = localStorage.getItem('book_buddy_recs');
    const isStale = localStorage.getItem('book_buddy_recs_stale') === 'true';

    if (cachedRecs) {
      const parsed = JSON.parse(cachedRecs);
      setRecommendations(parsed);
      
      if (isStale) {
        setLoading(true);
        fetchRecommendations(parsed);
      } else {
        setLoading(false);
      }
    } else {
      fetchRecommendations([]);
    }
  }, []);

  const fetchRecommendations = async (existingRecs = []) => {
    try {
      const res = await api.get('books/recommendations/');
      const recs = res.data.recommendations || [];
      if (recs && recs.length > 0 && recs[0].title !== "API Error") {
        setRecommendations(recs);
        localStorage.setItem('book_buddy_recs', JSON.stringify(recs));
        localStorage.removeItem('book_buddy_recs_stale');
        setError(null);
      } else if (existingRecs.length === 0) {
        setError("AI could not generate valid recommendations at this time.");
      }
      // If error occurs but we have existingRecs, we simply do not set the error
      // and keep the UI filled with the old recommendations!
    } catch (err) {
      console.error(err);
      if (existingRecs.length === 0) {
        setError("Failed to fetch AI recommendations. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = (bookData) => {
    // Navigate to AddBook page, passing the recommended book data via state
    navigate('/books/add', { state: { autoFillBook: bookData } });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A' }}>AI Recommendations</h1>
      </div>
      <p className="text-secondary mb-6" style={{ fontSize: '1.1rem' }}>
        Based on your likings and the world's most famous, most accepted picks — discover titles you'll love…
      </p>

      {error && recommendations.length === 0 && (
        <div className="glass-card mb-4" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <Sparkles className="text-gradient" size={48} style={{ animation: 'pulse 2s infinite', marginBottom: 20 }} />
          
          <p className="text-secondary mt-2">Our AI is fetching some perfect book matches for you!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          {recommendations.map((rec, index) => (
            <div key={index} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '20px 24px' }}>
              <div style={{ flex: 1, maxWidth: 'calc(100% - 200px)' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{rec.title}</h3>
                  {rec.isbn && <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>ISBN: {rec.isbn}</span>}
                </div>
                <p className="text-secondary text-sm mb-3">By <span style={{ color: 'var(--text-primary)' }}>{rec.author}</span></p>
                <span className="badge badge-reading" style={{ marginTop: '4px', marginBottom: '8px', display: 'inline-block' }}>{rec.genre}</span>
                {rec.description && (
                  <p className="text-sm text-secondary" style={{ marginTop: '6px', lineHeight: 1.5 }}>
                    "{rec.description}"
                  </p>
                )}
              </div>
              <button 
                className="btn btn-primary" 
                style={{ flexShrink: 0, padding: '10px 18px', borderRadius: 8 }}
                onClick={() => handleAddBook(rec)}
              >
                + Add to My Books
              </button>
            </div>
          ))}

          {recommendations.length === 0 && !loading && !error && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }} className="text-secondary glass-card">
               We couldn't generate recommendations at this time.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
