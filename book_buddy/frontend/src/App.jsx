import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/AddBook';
import Recommendations from './pages/Recommendations';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './pages/Register';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '40px', paddingTop: 0 }}>
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/books" element={<PrivateRoute><BookList /></PrivateRoute>} />
              <Route path="/books/add" element={<PrivateRoute><AddBook /></PrivateRoute>} />
              <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
              <Route path="/books/:id" element={<PrivateRoute><BookDetail /></PrivateRoute>} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
