import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
  borderTop: '1px solid rgba(92, 141, 110, 0.15)',
  background: '#FFFFFF',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}}>
      <BookOpen size={16} color="#5C8D6E" />
      <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
        Book Buddy · {new Date().getFullYear()}
      </span>
    </footer>
  );
}
