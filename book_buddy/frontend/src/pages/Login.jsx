import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered')) {
      setSuccessMsg(<>
        Account created successfully!
        <br />
        Please log in.
      </>);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/books');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-4" style={{ textAlign: 'center' }}>Welcome to Book Buddy</h2>
        <p className="text-secondary mb-4" style={{ textAlign: 'center' }}>Sign in to continue your reading journey.</p>
        
        {successMsg && <div className="glass-card mb-4" style={{ padding: 10, borderColor: 'var(--success)', color: 'var(--success)', textAlign: 'center' }}>{successMsg}</div>}
        {error && <div className="glass-card mb-4 text-gradient" style={{ padding: 10, borderColor: 'var(--danger)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Login
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-secondary">
          Don't have an account? <Link to="/register" className="text-gradient" style={{ textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
