import { useState, useEffect } from 'react';
import axios from 'axios';

function Gastos() {
  const [categorias, setCategorias] = useState([]);
  const [listaGastos, setListaGastos] = useState([]);
  const [gasto, setGasto] = useState({
    id_categoria: '', tipo: 'Gasto Operativo', descripcion: '', monto: ''
  });

  // Cargar categorías e historial de gastos al iniciar
  useEffect(() => {
    axios.get('https://negocio-com-1.onrender.com/api/categorias')
      .then(res => {
        setCategorias(res.data);
        if(res.data.length > 0) setGasto(prev => ({ ...prev, id_categoria: res.data[0].id_categoria }));
      });

    obtenerGastos();
  }, []);

  const obtenerGastos = () => {
    axios.get('https://negocio-com-1.onrender.com/api/gastos')
      .then(res => setListaGastos(res.data))
      .catch(err => console.error("Error al obtener historial de gastos:", err));
  };

  const handleChange = (e) => setGasto({ ...gasto, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://negocio-com-1.onrender.com/api/gastos', gasto);
      alert('¡Gasto registrado correctamente!');
      setGasto({ id_categoria: categorias[0]?.id_categoria || '', tipo: 'Gasto Operativo', descripcion: '', monto: '' });
      obtenerGastos(); // Recargar la tabla automáticamente
    } catch (error) {
      alert('Hubo un error al registrar el gasto.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 rounded-2xl shadow-lg mb-8 text-white text-center">
        <h2 className="text-3xl font-extrabold tracking-wide">💸 Registro y Control de Egresos</h2>
        <p className="text-amber-100 mt-1">Lleva el control exacto de tus costos operativos y pérdidas</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl grid gap-6 border border-gray-100 mb-12">
        <div className="flex flex-col">
          <label className="font-bold text-gray-700 mb-2">Emprendimiento Afectado:</label>
          <select name="id_categoria" value={gasto.id_categoria} onChange={handleChange} required className="p-3 border-2 border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-200 focus:outline-none bg-white font-semibold text-gray-700">
            {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-gray-700 mb-2">Tipo de Movimiento:</label>
          <select name="tipo" value={gasto.tipo} onChange={handleChange} className="p-3 border-2 border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-200 focus:outline-none bg-white font-semibold text-gray-700">
            <option value="Gasto Operativo">📦 Gasto Operativo (Envío, Packaging)</option>
            <option value="Compra Mercadería">🛍️ Compra de Mercadería / Insumos</option>
            <option value="Pérdida">⚠️ Pérdida (Roturas, Vencimientos)</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-gray-700 mb-2">Descripción Detallada:</label>
          <input type="text" name="descripcion" value={gasto.descripcion} onChange={handleChange} required placeholder="Ej: Bolsitas de papel impresas" className="p-3 border-2 border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-200 focus:outline-none font-medium" />
        </div>

        <div className="flex flex-col">
          <label className="font-bold text-gray-700 mb-2">Monto Gastado ($):</label>
          <input type="number" step="0.01" name="monto" value={gasto.monto} onChange={handleChange} required className="p-3 border-2 border-orange-100 rounded-xl focus:ring-4 focus:ring-orange-200 focus:outline-none font-bold text-orange-600 text-lg" />
        </div>

        <button type="submit" className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold py-4 rounded-xl shadow-lg mt-2 transition-all transform hover:scale-[1.01]">
          🔥 Registrar Salida de Dinero
        </button>
      </form>

      {/* Historial de Gastos */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Historial de Movimientos y Gastos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="p-3">Fecha</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descripción</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {listaGastos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No hay gastos registrados todavía.</td>
                </tr>
              ) : (
                listaGastos.map(item => (
                  <tr key={item.id_gasto} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700">
                    <td className="p-3 text-sm">{new Date(item.fecha).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold">{item.nombre_categoria || 'General'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-3">{item.descripcion}</td>
                    <td className="p-3 text-right font-bold text-rose-600">${Number(item.monto).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Gastos;