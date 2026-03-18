import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('books/statistics/');
      const booksRes = await api.get('books/');
      setStats(statsRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Process genre data for pie chart
  const genreCounts = {};
  books.forEach(b => {
    if (b.genre) {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    }
  });
  const pieData = Object.keys(genreCounts).map(genre => ({
    name: genre,
    value: genreCounts[genre]
  }));
  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '1 1 200px' }}>
          <div className="flex items-center gap-2 mb-2 text-secondary">
            <BookOpen size={20} /> Total Books
          </div>
          <h2>{stats?.total_books || 0}</h2>
        </div>
        <div className="glass-card" style={{ flex: '1 1 200px' }}>
          <div className="flex items-center gap-2 mb-2 text-secondary">
            <CheckCircle size={20} color="var(--success)" /> Completed
          </div>
          <h2>{stats?.completed || 0}</h2>
        </div>
        <div className="glass-card" style={{ flex: '1 1 200px' }}>
          <div className="flex items-center gap-2 mb-2 text-secondary">
            <Clock size={20} color="var(--warning)" /> Reading
          </div>
          <h2>{stats?.reading || 0}</h2>
        </div>
        <div className="glass-card" style={{ flex: '1 1 200px',  }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} color="var(--success)" />
            Finish Rate
          </div>
          <h2>{Math.round(stats?.completion_percentage || 0)}%</h2>
        </div>
      </div>

      <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '1 1 400px', height: 350 }}>
          <h3 className="mb-2">Genre Breakdown</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name }) => name}
                
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-card" style={{ flex: '1 1 400px', height: 350, overflowY: 'auto' }}>
          <h3 className="mb-2">Currently Reading</h3>
          {books.filter(b => b.status === 'reading').map(book => (
            <div key={book.id} className="mb-4" style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <strong>{book.title}</strong>
                <span className="text-secondary text-sm">{book.pages_read} / {book.total_pages || '?'} p</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div 
                  style={{ 
                    width: `${book.total_pages ? (book.pages_read / book.total_pages) * 100 : 0}%`, 
                    height: '100%', 
                    background: 'var(--primary-accent)', 
                    borderRadius: 3 
                  }} 
                />
              </div>
            </div>
          ))}
          {books.filter(b => b.status === 'reading').length === 0 && (
            <p className="text-secondary mt-4">Not currently reading anything.</p>
          )}
        </div>
      </div>
    </div>
  );
}
