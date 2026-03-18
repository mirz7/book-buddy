import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { BookOpen, LogOut, Home, List, PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutConfirm]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!user) return null;

  return (
    <header className="app-header glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="container app-nav">
        <Link to="/books" className="brand" style={{ textDecoration: 'none' }}>
          <BookOpen className="text-gradient" size={28} />
          <span>Book Buddy</span>
        </Link>
        <nav className="flex items-center gap-2">
          
          <Link to="/books" className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}>
            <Home size={18} /> My Books
          </Link>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
             <List size={18} />Dashboard
          </Link>
          
          <Link to="/books/add" className={`nav-link ${location.pathname === '/books/add' ? 'active' : ''}`}>
            <PlusCircle size={18} /> Add Book
          </Link>
          <Link to="/recommendations" className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}>
             <Sparkles size={18} /> Recommendations
          </Link>
          <button onClick={handleLogout} className="nav-link" style={{ marginLeft: 8 }}>
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && createPortal(
        <div 
          onClick={cancelLogout}
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(45,45,45,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '420px', padding: '32px 28px', borderRadius: '16px', background: '#FFFFFF', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(92,141,110,0.15)', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: 700, color: '#1A1A1A' }}>Confirm Logout</h3>
            <p style={{ marginBottom: '24px', fontSize: '15px', fontWeight: 400, color: '#6B7280', lineHeight: 1.6 }}>Are you sure you want to log out of Book Buddy, <strong style={{ color: '#2D2D2D' }}>{user?.username}</strong>?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={cancelLogout} style={{ flex: 1, height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '15px' }}>Cancel</button>
              <button onClick={confirmLogout} style={{ flex: 1, height: '44px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', background: '#BF4B3A', color: '#fff', border: 'none', cursor: 'pointer' }}>Logout</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
