import { Link } from 'react-router-dom';

function Menu() {
  const navStyle = {
    display: 'flex',
    gap: '20px',
    background: '#333',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px'
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Dashboard</Link>
      <Link to="/inventario" style={linkStyle}>📦 Inventario</Link>
      <Link to="/caja" style={linkStyle}>🛒 Caja / Ventas</Link>
      <Link to="/gastos" style={linkStyle}>💸 Gastos</Link>
      <Link to="/ventas" style={linkStyle}>📊 Ventas</Link>
    </nav>
  );
}

export default Menu;