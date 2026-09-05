import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [metricas, setMetricas] = useState({ ingresos_brutos: 0, ganancia_neta: 0, total_gastos: 0 });
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    axios.get('https://negocio-com-1.onrender.com/api/categorias').then(res => setCategorias(res.data));
  }, []);

  useEffect(() => {
    const params = categoriaFiltro ? `?id_categoria=${categoriaFiltro}` : '';
    
    axios.get(`https://negocio-com-1.onrender.com/api/dashboard${params}`).then(res => {
      setMetricas({
        ingresos_brutos: res.data.ingresos_brutos || 0,
        ganancia_neta: res.data.ganancia_neta || 0,
        total_gastos: res.data.total_gastos || 0
      });
    });

    axios.get(`https://negocio-com-1.onrender.com/api/alertas-stock${params}`).then(res => setAlertas(res.data));
  }, [categoriaFiltro]);

  const balanceFinal = metricas.ganancia_neta - metricas.total_gastos;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 rounded-2xl shadow-lg mb-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-wide">✨ Panel General de Negocio</h2>
          <p className="text-pink-100 mt-1">Control financiero y métricas en tiempo real</p>
        </div>
        <select 
          value={categoriaFiltro} 
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="p-3 border-2 border-white/30 rounded-xl shadow-md font-bold text-purple-900 bg-white/90 backdrop-blur focus:outline-none focus:ring-4 focus:ring-pink-300"
        >
          <option value="">🌟 Todos los emprendimientos</option>
          {categorias.map(cat => (
            <option key={cat.id_categoria} value={cat.id_categoria}>Ver solo {cat.nombre}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-6 rounded-2xl shadow-xl text-white transform hover:-translate-y-1 transition-transform">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-100">Ingresos Brutos</h3>
          <p className="text-4xl font-black mt-3">${metricas.ingresos_brutos}</p>
          <div className="mt-4 bg-white/20 rounded-full h-2 w-full"><div className="bg-white h-2 rounded-full w-3/4"></div></div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-2xl shadow-xl text-white transform hover:-translate-y-1 transition-transform">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100">Ganancia Neta</h3>
          <p className="text-4xl font-black mt-3">${metricas.ganancia_neta}</p>
          <div className="mt-4 bg-white/20 rounded-full h-2 w-full"><div className="bg-white h-2 rounded-full w-4/5"></div></div>
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-red-600 p-6 rounded-2xl shadow-xl text-white transform hover:-translate-y-1 transition-transform">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-100">Gastos y Pérdidas</h3>
          <p className="text-4xl font-black mt-3">${metricas.total_gastos}</p>
          <div className="mt-4 bg-white/20 rounded-full h-2 w-full"><div className="bg-white h-2 rounded-full w-1/2"></div></div>
        </div>
      </div>

      <div className={`p-8 rounded-2xl shadow-xl text-center text-white ${balanceFinal >= 0 ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-700'}`}>
        <h3 className="text-xl font-bold uppercase tracking-widest text-white/90">Balance Final del Mes</h3>
        <p className="text-6xl font-black my-3 drop-shadow-md">${balanceFinal}</p>
        <p className="text-sm text-white/80 font-medium">Dinero libre disponible tras descontar costos y gastos operativos</p>
      </div>

      {alertas.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-2xl shadow-xl text-white">
          <h3 className="text-xl font-extrabold mb-3 flex items-center gap-2">⚠️ Alertas de Reposición Urgente</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alertas.map((item, i) => (
              <li key={i} className="bg-black/15 p-3 rounded-xl backdrop-blur border border-white/20">
                <strong className="text-amber-100">{item.nombre}</strong>: Quedan solo <span className="underline font-bold">{item.stock_actual}</span> (Mín: {item.stock_minimo})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default Dashboard;