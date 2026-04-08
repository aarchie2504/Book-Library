import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'Lato, sans-serif',
    }}>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>📚</div>
      <h1 style={{ fontSize: '5rem', fontWeight: 800, color: '#B8860B', margin: 0, fontFamily: 'Cinzel, serif' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#2A1F0E', margin: '0.5rem 0 1rem', fontFamily: 'Playfair Display, serif' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#6B5B3E', maxWidth: 400, lineHeight: 1.6, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{
        background: 'linear-gradient(135deg, #B8860B, #DAA520)',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: 8,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: 0.5,
      }}>
        ← Back to Home
      </Link>
    </div>
  );
}