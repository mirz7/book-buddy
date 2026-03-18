import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import api from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create user
      await api.post('register/', { username, email, password });
      // Redirect to login page
      navigate('/login?registered=true');
    } catch (err) {
      if (err.response && err.response.data) {
        // Simple error formatting for django validation
        const msgs = Object.values(err.response.data).flat().join(', ');
        setError(msgs || 'Failed to register account.');
      } else {
        setError('Failed to register account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="mb-4" style={{ textAlign: 'center' }}>Create Account</h2>
        <p className="text-secondary mb-4" style={{ textAlign: 'center' }}>Join Book Buddy today!</p>
        
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
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
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
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-secondary">
          Already have an account? <Link to="/login" className="text-gradient" style={{ textDecoration: 'none', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
