import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/menu';
import Inventario from './components/inventario';
import Caja from './components/caja';
import Dashboard from './components/dashboard';
import Gastos from './components/gastos';
import Ventas from './components/venta';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Control de Emprendimiento</h1>
        
        {/* Aquí renderizamos el menú para que se vea en todas las pantallas */}
        <Menu />
        
        <Routes>
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/" element={<Dashboard />} />
          {/* Aquí conectamos la ruta con el componente que acabamos de crear */}
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;