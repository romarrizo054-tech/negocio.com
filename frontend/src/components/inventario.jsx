import { useState, useEffect } from 'react';
import axios from 'axios';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    id_categoria: '', nombre: '', costo: '', precio_venta: '', stock_actual: '', stock_minimo: ''
  });

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get('https://negocio-com-1.onrender.com:3001/api/productos');
      setProductos(res.data);
    } catch (error) { console.error(error); }
  };

  const obtenerCategorias = async () => {
    try {
      const res = await axios.get('https://negocio-com-1.onrender.com:3001/api/categorias');
      setCategorias(res.data);
      if (res.data.length > 0) setNuevoProducto(prev => ({ ...prev, id_categoria: res.data[0].id_categoria }));
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://negocio-com-1.onrender.com:3001/api/productos', nuevoProducto);
      alert('¡Producto agregado al inventario!');
      setMostrarFormulario(false);
      setNuevoProducto({ id_categoria: categorias[0]?.id_categoria || '', nombre: '', costo: '', precio_venta: '', stock_actual: '', stock_minimo: '' });
      obtenerProductos();
    } catch (error) { alert('Hubo un problema al guardar el producto.'); }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm('¿Estás segura de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`https://negocio-com-1.onrender.com:3001/api/productos/${id}`);
        alert('Producto eliminado correctamente');
        obtenerProductos();
      } catch (error) {
        alert(error.response?.data?.error || 'No se pudo eliminar el producto (puede que tenga ventas registradas).');
      }
    }
  };

  const productosFiltrados = categoriaFiltro 
    ? productos.filter(p => p.id_categoria === parseInt(categoriaFiltro))
    : productos;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg mb-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-wide">📦 Control de Inventario</h2>
          <p className="text-violet-200 mt-1">Gestiona tu stock y precios de forma dinámica</p>
        </div>
        
        <div className="flex gap-3 items-center w-full sm:w-auto">
          <select 
            value={categoriaFiltro} 
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="p-3 border-2 border-white/30 rounded-xl shadow-md font-bold text-indigo-900 bg-white/90 backdrop-blur focus:outline-none focus:ring-4 focus:ring-violet-300"
          >
            <option value="">🌟 Todos los rubros</option>
            {categorias.map(cat => (
              <option key={cat.id_categoria} value={cat.id_categoria}>Ver solo {cat.nombre}</option>
            ))}
          </select>

          <button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className={`px-5 py-3 rounded-xl font-extrabold text-white shadow-lg transition-all transform hover:scale-105 ${mostrarFormulario ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
            {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Producto'}
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-violet-50 border-2 border-violet-100 p-8 rounded-2xl shadow-2xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Emprendimiento:</label>
            <select name="id_categoria" value={nuevoProducto.id_categoria} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white">
              {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Nombre del Producto:</label>
            <input type="text" name="nombre" value={nuevoProducto.nombre} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Costo ($):</label>
            <input type="number" step="0.01" name="costo" value={nuevoProducto.costo} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Precio de Venta ($):</label>
            <input type="number" step="0.01" name="precio_venta" value={nuevoProducto.precio_venta} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Stock Actual:</label>
            <input type="number" name="stock_actual" value={nuevoProducto.stock_actual} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white" />
          </div>
          <div className="flex flex-col">
            <label className="text-violet-900 font-bold mb-2">Stock Mínimo (Alerta):</label>
            <input type="number" name="stock_minimo" value={nuevoProducto.stock_minimo} onChange={handleChange} required className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white" />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]">
              💾 Guardar Producto en el Sistema
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border border-gray-100">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white uppercase text-xs tracking-wider">
              <th className="py-4 px-6">Categoría</th>
              <th className="py-4 px-6">Nombre</th>
              <th className="py-4 px-6">Costo</th>
              <th className="py-4 px-6">Precio</th>
              <th className="py-4 px-6">Stock</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productosFiltrados.map(producto => (
              <tr key={producto.id_producto} className="hover:bg-violet-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-indigo-700">{producto.nombre_categoria}</td>
                <td className="py-4 px-6 font-bold text-gray-800">{producto.nombre}</td>
                <td className="py-4 px-6 text-gray-500">${producto.costo}</td>
                <td className="py-4 px-6 font-black text-emerald-600">${producto.precio_venta}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${producto.stock_actual <= producto.stock_minimo ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                    {producto.stock_actual} un.
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => eliminarProducto(producto.id_producto)} 
                    className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md transform hover:scale-105"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Inventario;