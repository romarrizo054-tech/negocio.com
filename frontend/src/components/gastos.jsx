import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://negocio-com-1.onrender.com/api';

function Gastos() {
  const [categorias, setCategorias] = useState([]);
  const [listaGastos, setListaGastos] = useState([]);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [gastoDetalle, setGastoDetalle] = useState(null);
  const [gasto, setGasto] = useState({
    id_categoria: '', tipo: 'Gasto Operativo', descripcion: '', monto: ''
  });

  async function obtenerGastos() {
    try {
      const res = await axios.get(`${API_URL}/gastos`);
      setListaGastos(res.data);
    } catch (error) {
      console.error('Error al obtener historial de gastos:', error);
      alert(error.response?.data?.error || 'No se pudo actualizar el historial de gastos.');
    }
  }

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/categorias`),
      axios.get(`${API_URL}/gastos`)
    ])
      .then(([categoriasRes, gastosRes]) => {
        setCategorias(categoriasRes.data);
        setListaGastos(gastosRes.data);
        setGasto(prev => ({
          ...prev,
          id_categoria: prev.id_categoria || categoriasRes.data[0]?.id_categoria || ''
        }));
      })
      .catch(error => {
        console.error('Error cargando datos de gastos:', error);
        alert(error.response?.data?.error || 'No se pudieron cargar las categorías y los gastos.');
      });
  }, []);

  const limpiarFormulario = () => {
    setGastoEditando(null);
    setGasto({
      id_categoria: categorias[0]?.id_categoria || '',
      tipo: 'Gasto Operativo',
      descripcion: '',
      monto: ''
    });
  };

  const handleChange = (e) => setGasto({ ...gasto, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (gastoEditando) {
        await axios.put(`${API_URL}/gastos/${gastoEditando}`, gasto);
        alert('¡Gasto actualizado correctamente!');
      } else {
        await axios.post(`${API_URL}/gastos`, gasto);
        alert('¡Gasto registrado correctamente!');
      }
      limpiarFormulario();
      await obtenerGastos();
    } catch (error) {
      console.error('Error guardando el gasto:', error);
      alert(error.response?.data?.error || 'Hubo un error al guardar el gasto.');
    }
  };

  const editarGasto = (item) => {
    setGastoEditando(item.id_gasto);
    setGasto({
      id_categoria: item.id_categoria || '',
      tipo: item.tipo,
      descripcion: item.descripcion,
      monto: item.monto
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarGasto = async (item) => {
    if (!window.confirm(`¿Querés eliminar el gasto "${item.descripcion}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/gastos/${item.id_gasto}`);
      alert('Gasto eliminado correctamente.');
      await obtenerGastos();
    } catch (error) {
      console.error('Error eliminando el gasto:', error);
      alert(error.response?.data?.error || 'No se pudo eliminar el gasto.');
    }
  };

  const formatoFecha = (fecha) => new Date(fecha).toLocaleString('es-AR');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 rounded-2xl shadow-lg mb-8 text-white text-center">
        <h2 className="text-3xl font-extrabold tracking-wide">💸 Registro y Control de Egresos</h2>
        <p className="text-amber-100 mt-1">Lleva el control exacto de tus costos operativos y pérdidas</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl grid gap-6 border border-gray-100 mb-12">
        <h3 className="text-2xl font-bold text-gray-800">
          {gastoEditando ? '✏️ Editar gasto' : '➕ Registrar gasto'}
        </h3>
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

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-extrabold py-4 rounded-xl shadow-lg mt-2 transition-all transform hover:scale-[1.01]">
            {gastoEditando ? '💾 Guardar cambios' : '🔥 Registrar Salida de Dinero'}
          </button>
          {gastoEditando && (
            <button type="button" onClick={limpiarFormulario} className="px-6 py-4 mt-2 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50">
              Cancelar edición
            </button>
          )}
        </div>
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
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaGastos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No hay gastos registrados todavía.</td>
                </tr>
              ) : (
                listaGastos.map(item => (
                  <tr key={item.id_gasto} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700">
                    <td className="p-3 text-sm">{formatoFecha(item.fecha)}</td>
                    <td className="p-3 font-semibold">{item.nombre_categoria || 'General'}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-3">{item.descripcion}</td>
                    <td className="p-3 text-right font-bold text-rose-600">${Number(item.monto).toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => setGastoDetalle(item)} className="rounded-lg bg-sky-100 px-3 py-2 text-sm font-bold text-sky-800 hover:bg-sky-200">
                          Ver
                        </button>
                        <button type="button" onClick={() => editarGasto(item)} className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-200">
                          Editar
                        </button>
                        <button type="button" onClick={() => eliminarGasto(item)} className="rounded-lg bg-rose-100 px-3 py-2 text-sm font-bold text-rose-800 hover:bg-rose-200">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {gastoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setGastoDetalle(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-gasto-titulo"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 id="detalle-gasto-titulo" className="text-2xl font-extrabold text-gray-800">Detalle del gasto</h3>
              <button type="button" onClick={() => setGastoDetalle(null)} aria-label="Cerrar detalle" className="rounded-lg px-3 py-2 font-bold text-gray-500 hover:bg-gray-100">
                ✕
              </button>
            </div>
            <dl className="grid gap-4 text-gray-700">
              <div><dt className="text-sm font-bold text-gray-500">Fecha</dt><dd>{formatoFecha(gastoDetalle.fecha)}</dd></div>
              <div><dt className="text-sm font-bold text-gray-500">Categoría</dt><dd>{gastoDetalle.nombre_categoria || 'General'}</dd></div>
              <div><dt className="text-sm font-bold text-gray-500">Tipo</dt><dd>{gastoDetalle.tipo}</dd></div>
              <div><dt className="text-sm font-bold text-gray-500">Descripción</dt><dd>{gastoDetalle.descripcion}</dd></div>
              <div><dt className="text-sm font-bold text-gray-500">Monto</dt><dd className="text-xl font-extrabold text-rose-600">${Number(gastoDetalle.monto).toFixed(2)}</dd></div>
            </dl>
            <button type="button" onClick={() => setGastoDetalle(null)} className="mt-6 w-full rounded-xl bg-gray-800 py-3 font-bold text-white hover:bg-gray-700">
              Cerrar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default Gastos;