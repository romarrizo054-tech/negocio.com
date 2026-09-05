import { useState, useEffect } from 'react';
import axios from 'axios';

function Caja() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    axios.get('https://negocio-com-1.onrender.com/api/productos')
      .then(res => setProductos(res.data))
      .catch(err => console.error(err));
    
    axios.get('https://negocio-com-1.onrender.com/api/categorias')
      .then(res => setCategorias(res.data))
      .catch(err => console.error(err));
  }, []);

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.id_categoria === parseInt(categoriaSeleccionada))
    : productos;

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return alert('Selecciona un producto primero');
    const productoReal = productos.find(p => p.id_producto === parseInt(productoSeleccionado));
    if (cantidad > productoReal.stock_actual) return alert('¡No tienes suficiente stock!');

    const nuevoItem = {
      id_producto: productoReal.id_producto,
      nombre: productoReal.nombre,
      precio_unitario: productoReal.precio_venta,
      cantidad: parseInt(cantidad),
      subtotal: productoReal.precio_venta * cantidad
    };

    setCarrito([...carrito, nuevoItem]);
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const confirmarVenta = async () => {
    if (carrito.length === 0) return alert('El carrito está vacío');
    try {
      await axios.post('https://negocio-com-1.onrender.com/api/ventas', { metodo_pago: metodoPago, total: totalVenta, detalles: carrito });
      alert('¡Venta registrada con éxito!');
      setCarrito([]);
      const res = await axios.get('https://negocio-com-1.onrender.com/api/productos');
      setProductos(res.data);
    } catch (error) { alert('Hubo un problema al registrar la venta'); }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg mb-8 text-white">
        <h2 className="text-3xl font-extrabold tracking-wide">🛒 Caja Registradora y Ventas</h2>
        <p className="text-cyan-100 mt-1">Arma el carrito de compras y descuenta stock automáticamente</p>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border border-gray-100">
        <div>
          <label className="text-cyan-900 font-bold mb-2 block">Filtrar por Rubro:</label>
          <select value={categoriaSeleccionada} onChange={(e) => { setCategoriaSeleccionada(e.target.value); setProductoSeleccionado(''); }} className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none bg-white font-semibold text-gray-700">
            <option value="">🌟 Todos los rubros</option>
            {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="text-cyan-900 font-bold mb-2 block">Seleccionar Producto:</label>
          <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none bg-white font-semibold text-gray-700">
            <option value="">-- Elige un artículo --</option>
            {productosFiltrados.map(p => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre} (Stock: {p.stock_actual}) - ${p.precio_venta}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="w-28">
            <label className="text-cyan-900 font-bold mb-2 block">Cantidad:</label>
            <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none font-bold text-center" />
          </div>
          <button onClick={agregarAlCarrito} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-105 self-end">
            + Agregar
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto mb-8 border border-gray-100">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900 to-blue-950 text-white uppercase text-xs tracking-wider">
              <th className="py-4 px-6">Producto Seleccionado</th>
              <th className="py-4 px-6 text-center">Cantidad</th>
              <th className="py-4 px-6">Precio Unitario</th>
              <th className="py-4 px-6">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {carrito.map((item, index) => (
              <tr key={index} className="hover:bg-cyan-50/50">
                <td className="py-4 px-6 font-bold text-gray-800">{item.nombre}</td>
                <td className="py-4 px-6 text-center font-black text-cyan-700">{item.cantidad}</td>
                <td className="py-4 px-6 text-gray-500">${item.precio_unitario}</td>
                <td className="py-4 px-6 font-black text-blue-600">${item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <label className="font-extrabold text-blue-900">Método de Pago:</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className="p-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 font-bold text-blue-900 bg-white">
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Transferencia">🏦 Transferencia</option>
            <option value="Mercado Pago">📱 Mercado Pago</option>
          </select>
        </div>
        <div className="flex items-center gap-6">
          <h3 className="text-3xl font-black text-gray-900">Total: <span className="text-blue-600">${totalVenta}</span></h3>
          <button onClick={confirmarVenta} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 px-8 rounded-xl shadow-xl transition-all transform hover:scale-105">
            🚀 Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
export default Caja;