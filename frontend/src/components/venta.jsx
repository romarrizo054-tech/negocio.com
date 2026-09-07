import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://negocio-com-1.onrender.com/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [ventaEditando, setVentaEditando] = useState(null);

  // ==========================================
  // OBTENER VENTAS
  // ==========================================

  const obtenerVentas = async () => {
  try {
    setCargando(true);

    const res = await axios.get(`${API_URL}/ventas`);

    const ventasBase = res.data;

    // Obtener los productos de cada venta
    const ventasConProductos = await Promise.all(
      ventasBase.map(async (venta) => {
        try {
          const detalleRes = await axios.get(
            `${API_URL}/ventas/${venta.id_venta}`
          );

          const productos = detalleRes.data
            .map((item) => item.nombre_producto)
            .filter(Boolean);

          return {
            ...venta,
            productos
          };
        } catch (error) {
          console.error(
            `Error obteniendo productos de la venta #${venta.id_venta}:`,
            error
          );

          return {
            ...venta,
            productos: []
          };
        }
      })
    );

    setVentas(ventasConProductos);


  } catch (error) {
    console.error('Error obteniendo ventas:', error);

    alert('No se pudieron obtener las ventas.');
  } finally {
    setCargando(false);
  }
};

// ==========================================
// CARGAR VENTAS AL INICIAR
// ==========================================

useEffect(() => {
  obtenerVentas();
}, []);
  // ==========================================
  // VER DETALLE
  // ==========================================

  const verDetalle = async (idVenta) => {
    try {
      const res = await axios.get(
        `${API_URL}/ventas/${idVenta}`
      );

      setDetalleVenta(res.data);
      setVentaSeleccionada(idVenta);
    } catch (error) {
      console.error('Error obteniendo detalle:', error);

      alert('No se pudo obtener el detalle de la venta.');
    }
  };

  // ==========================================
  // CERRAR DETALLE
  // ==========================================

  const cerrarDetalle = () => {
    setVentaSeleccionada(null);
    setDetalleVenta([]);
  };

  // ==========================================
  // EDITAR VENTA
  // ==========================================

  const abrirEditar = async (venta) => {
    try {
      const res = await axios.get(
        `${API_URL}/ventas/${venta.id_venta}`
      );

      const detalles = res.data;

      setVentaEditando({
        ...venta,

        cliente_fiado: venta.cliente_fiado || '',

        estado_fiado:
          venta.estado_fiado || 'pendiente',

        detalles: detalles.map((item) => ({
          id_detalle: item.id_detalle,
          id_producto: item.id_producto,
          nombre_producto: item.nombre_producto,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario)
        }))
      });

      setMostrarEditar(true);
    } catch (error) {
      console.error(
        'Error preparando edición:',
        error
      );

      alert(
        'No se pudo cargar la venta para editar.'
      );
    }
  };

  // ==========================================
  // CERRAR EDICIÓN
  // ==========================================

  const cerrarEditar = () => {
    setMostrarEditar(false);
    setVentaEditando(null);
  };

  // ==========================================
  // CAMBIAR CANTIDAD
  // ==========================================

  const cambiarCantidad = (index, cantidad) => {
    if (!ventaEditando) return;

    const nuevosDetalles = [
      ...ventaEditando.detalles
    ];

    nuevosDetalles[index].cantidad =
      Math.max(1, Number(cantidad) || 1);

    setVentaEditando({
      ...ventaEditando,
      detalles: nuevosDetalles
    });
  };

  // ==========================================
  // CALCULAR TOTAL
  // ==========================================

  const calcularTotalEdicion = () => {
    if (!ventaEditando) return 0;

    return ventaEditando.detalles.reduce(
      (total, item) =>
        total +
        Number(item.precio_unitario || 0) *
          Number(item.cantidad || 0),
      0
    );
  };

  // ==========================================
  // GUARDAR EDICIÓN
  // ==========================================

  const guardarEdicion = async () => {
    if (!ventaEditando) return;

    try {
      const nuevoTotal =
        calcularTotalEdicion();

      const datos = {
        metodo_pago:
          ventaEditando.metodo_pago,

        total: nuevoTotal,

        cliente_fiado:
          ventaEditando.metodo_pago === 'Fiado'
            ? ventaEditando.cliente_fiado
            : null,

        estado_fiado:
          ventaEditando.metodo_pago === 'Fiado'
            ? ventaEditando.estado_fiado
            : null,

        detalles:
          ventaEditando.detalles.map((item) => ({
            id_detalle: item.id_detalle,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario:
              item.precio_unitario
          }))
      };

      await axios.put(
        `${API_URL}/ventas/${ventaEditando.id_venta}`,
        datos
      );

      alert(
        '✅ Venta actualizada correctamente.'
      );

      cerrarEditar();

      await obtenerVentas();
    } catch (error) {
      console.error(
        'ERROR COMPLETO AL ACTUALIZAR VENTA:',
        error
      );

      console.error(
        'RESPUESTA DEL SERVIDOR:',
        error.response?.data
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.sqlMessage ||
          error.message ||
          'No se pudo actualizar la venta.'
      );
    }
  };

  // ==========================================
  // MARCAR FIADO COMO PAGADO
  // ==========================================

  const marcarComoPagado = async (venta) => {
    if (
      !window.confirm(
        `¿Confirmás que ${
          venta.cliente_fiado || 'el cliente'
        } pagó esta venta?`
      )
    ) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/ventas/${venta.id_venta}/pagar`
      );

      alert(
        '✅ Venta marcada como pagada.'
      );

      await obtenerVentas();
    } catch (error) {
      console.error(
        'Error marcando venta como pagada:',
        error
      );

      alert(
        error.response?.data?.error ||
          'No se pudo marcar la venta como pagada.'
      );
    }
  };

  // ==========================================
  // FORMATO DINERO
  // ==========================================

  const dinero = (valor) => {
    return Number(valor || 0).toLocaleString(
      'es-AR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  };

  // ==========================================
  // FORMATO FECHA
  // ==========================================

  const fecha = (valor) => {
    if (!valor) return '-';

    return new Date(valor).toLocaleString(
      'es-AR',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );
  };

  // ==========================================
  // TOTALES
  // ==========================================

  const totalVentas = ventas.length;

  const dineroTotal = ventas.reduce(
    (total, venta) =>
      total + Number(venta.total || 0),
    0
  );

  const unidadesTotales = ventas.reduce(
    (total, venta) =>
      total +
      Number(
        venta.unidades_vendidas || 0
      ),
    0
  );

  const totalFiado = ventas
    .filter(
      (venta) =>
        venta.metodo_pago === 'Fiado' &&
        venta.estado_fiado !== 'pagado'
    )
    .reduce(
      (total, venta) =>
        total + Number(venta.total || 0),
      0
    );

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto p-4">

      {/* ======================================
          ENCABEZADO
      ====================================== */}

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg mb-8 text-white">

        <h2 className="text-3xl font-extrabold tracking-wide">
          🧾 Historial de Ventas
        </h2>

        <p className="text-violet-200 mt-1">
          Consultá, editá y controlá todas las ventas
        </p>

      </div>

      {/* ======================================
          RESUMEN
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {/* VENTAS */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Ventas realizadas
          </p>

          <p className="text-3xl font-black text-indigo-700 mt-2">
            {totalVentas}
          </p>

        </div>

        {/* DINERO */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Dinero vendido
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-2">
            ${dinero(dineroTotal)}
          </p>

        </div>

        {/* UNIDADES */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Unidades vendidas
          </p>

          <p className="text-3xl font-black text-violet-700 mt-2">
            {unidadesTotales}
          </p>

        </div>

        {/* FIADO */}

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">

          <p className="text-gray-500 font-semibold">
            💰 Dinero fiado pendiente
          </p>

          <p className="text-3xl font-black text-red-600 mt-2">
            ${dinero(totalFiado)}
          </p>

        </div>

      </div>

      {/* ======================================
          TABLA
      ====================================== */}

      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border border-gray-100">

        {cargando ? (

          <div className="p-12 text-center">

            <p className="text-gray-500 font-semibold">
              ⏳ Cargando ventas...
            </p>

          </div>

        ) : ventas.length === 0 ? (

          <div className="p-12 text-center">

            <p className="text-5xl mb-4">
              🧾
            </p>

            <p className="text-gray-500 font-bold">
              Todavía no hay ventas registradas.
            </p>

          </div>

        ) : (

          <table className="min-w-full text-left border-collapse">

            <thead>

              <tr className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white uppercase text-xs tracking-wider">

                <th className="py-4 px-6">
                  Venta
                </th>

                <th className="py-4 px-6">
                  Fecha
                </th>

                <th className="py-4 px-6">
                  Método
                </th>

                <th className="py-4 px-6">
                  Cliente
                </th>

                <th className="py-4 px-6">
                  Productos
                </th>

                <th className="py-4 px-6">
                  Unidades
                </th>

                <th className="py-4 px-6">
                  Total
                </th>

                <th className="py-4 px-6 text-center">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {ventas.map((venta) => (

                <tr
                  key={venta.id_venta}
                  className="hover:bg-violet-50/60 transition-colors"
                >

                  {/* VENTA */}

                  <td className="py-4 px-6">

                    <span className="font-black text-indigo-700">
                      #{venta.id_venta}
                    </span>

                  </td>

                  {/* FECHA */}

                  <td className="py-4 px-6 text-gray-600">
                    {fecha(venta.fecha)}
                  </td>

                  {/* MÉTODO */}

                  <td className="py-4 px-6">

                    {venta.metodo_pago === 'Fiado' ? (

                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                        💳 Fiado
                      </span>

                    ) : (

                      <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-bold text-xs">
                        💵 {venta.metodo_pago}
                      </span>

                    )}

                  </td>

                  {/* CLIENTE */}

                  <td className="py-4 px-6">

                    {venta.metodo_pago === 'Fiado' ? (

                      <div>

                        <p className="font-bold text-gray-800">
                          {venta.cliente_fiado || 'Sin nombre'}
                        </p>

                        {venta.estado_fiado === 'pagado' ? (

                          <span className="text-xs font-bold text-emerald-600">
                            ✓ Pagado
                          </span>

                        ) : (

                          <span className="text-xs font-bold text-red-600">
                            ⚠ Pendiente
                          </span>

                        )}

                      </div>

                    ) : (

                      <span className="text-gray-400">
                        -
                      </span>

                    )}

                  </td>

                 {/* PRODUCTOS */}

<td className="py-4 px-6">

  <div className="flex flex-col gap-1">

    {venta.productos && venta.productos.length > 0 ? (

      venta.productos.map((producto, index) => (

        <span
          key={`${venta.id_venta}-${index}`}
          className="font-semibold text-gray-800"
        >
          🛍️ {producto}
        </span>

      ))

    ) : (

      <span className="text-gray-400">
        Sin productos
      </span>

    )}

  </div>

</td>

                  {/* UNIDADES */}

                  <td className="py-4 px-6 font-semibold">
                    {venta.unidades_vendidas}
                  </td>

                  {/* TOTAL */}

                  <td className="py-4 px-6">

                    <span className="font-black text-emerald-600 text-lg">
                      ${dinero(venta.total)}
                    </span>

                  </td>

                  {/* ACCIONES */}

                  <td className="py-4 px-6">

                    <div className="flex flex-wrap justify-center gap-2">

                      <button
                        onClick={() =>
                          verDetalle(venta.id_venta)
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all"
                      >
                        👁️ Detalle
                      </button>

                      <button
                        onClick={() =>
                          abrirEditar(venta)
                        }
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all"
                      >
                        ✏️ Editar
                      </button>

                      {venta.metodo_pago === 'Fiado' &&
                        venta.estado_fiado !== 'pagado' && (

                          <button
                            onClick={() =>
                              marcarComoPagado(venta)
                            }
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-md transition-all"
                          >
                            ✓ Pagó
                          </button>

                        )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      {/* ======================================
          MODAL DETALLE
      ====================================== */}

      {ventaSeleccionada && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-center">

              <div>

                <h3 className="text-2xl font-black">
                  🧾 Venta #{ventaSeleccionada}
                </h3>

                {detalleVenta.length > 0 && (

                  <p className="text-violet-200 mt-1">
                    {fecha(detalleVenta[0].fecha)}
                  </p>

                )}

              </div>

              <button
                onClick={cerrarDetalle}
                className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 font-bold"
              >
                ✕
              </button>

            </div>

            <div className="p-6">

              {detalleVenta.length > 0 && (

                <div className="mb-6 flex flex-wrap gap-3">

                  <span className="px-4 py-2 rounded-xl bg-violet-100 text-violet-700 font-bold">
                    💳 {detalleVenta[0].metodo_pago}
                  </span>

                  {detalleVenta[0].metodo_pago === 'Fiado' && (

                    <span className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold">
                      👤 {detalleVenta[0].cliente_fiado || 'Sin nombre'}
                    </span>

                  )}

                </div>

              )}

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead>

                    <tr className="border-b-2 border-gray-100 text-gray-500 text-xs uppercase">

                      <th className="text-left py-3">
                        Producto
                      </th>

                      <th className="text-center py-3">
                        Cantidad
                      </th>

                      <th className="text-right py-3">
                        Precio
                      </th>

                      <th className="text-right py-3">
                        Subtotal
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {detalleVenta.map((detalle) => (

                      <tr
                        key={detalle.id_detalle}
                        className="border-b border-gray-100"
                      >

                        <td className="py-4 font-bold text-gray-800">
                          {detalle.nombre_producto}
                        </td>

                        <td className="py-4 text-center">
                          {detalle.cantidad}
                        </td>

                        <td className="py-4 text-right">
                          ${dinero(detalle.precio_unitario)}
                        </td>

                        <td className="py-4 text-right font-black text-emerald-600">
                          ${dinero(detalle.subtotal)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {detalleVenta.length > 0 && (

                <div className="mt-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 flex justify-between items-center">

                  <span className="font-black text-gray-700">
                    TOTAL DE LA VENTA
                  </span>

                  <span className="text-2xl font-black text-emerald-600">
                    ${dinero(detalleVenta[0].total)}
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* ======================================
          MODAL EDITAR VENTA
      ====================================== */}

      {mostrarEditar && ventaEditando && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex justify-between items-center">

              <div>

                <h3 className="text-2xl font-black">
                  ✏️ Editar Venta #{ventaEditando.id_venta}
                </h3>

                <p className="text-orange-100 mt-1">
                  Modificá los datos de la venta
                </p>

              </div>

              <button
                onClick={cerrarEditar}
                className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 font-bold"
              >
                ✕
              </button>

            </div>

            <div className="p-6">

              {/* MÉTODO DE PAGO */}

              <div className="mb-6">

                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Método de pago
                </label>

                <select
                  value={ventaEditando.metodo_pago}
                  onChange={(e) =>
                    setVentaEditando({
                      ...ventaEditando,

                      metodo_pago:
                        e.target.value,

                      cliente_fiado:
                        e.target.value === 'Fiado'
                          ? ventaEditando.cliente_fiado
                          : '',

                      estado_fiado:
                        e.target.value === 'Fiado'
                          ? ventaEditando.estado_fiado
                          : null
                    })
                  }
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500"
                >

                  <option value="Efectivo">
                    💵 Efectivo
                  </option>

                  <option value="Transferencia">
                    🏦 Transferencia
                  </option>

                  <option value="Tarjeta">
                    💳 Tarjeta
                  </option>

                  <option value="Fiado">
                    📒 Fiado
                  </option>

                </select>

              </div>

              {/* CLIENTE FIADO */}

              {ventaEditando.metodo_pago === 'Fiado' && (

                <div className="mb-6 bg-red-50 border-2 border-red-100 rounded-2xl p-5">

                  <label className="block text-sm font-bold text-red-700 mb-2">
                    👤 Nombre del cliente
                  </label>

                  <input
                    type="text"
                    value={ventaEditando.cliente_fiado}
                    onChange={(e) =>
                      setVentaEditando({
                        ...ventaEditando,
                        cliente_fiado:
                          e.target.value
                      })
                    }
                    placeholder="Ej: María, Juan, etc."
                    className="w-full border-2 border-red-200 rounded-xl p-3 focus:outline-none focus:border-red-500"
                  />

                </div>

              )}

              {/* PRODUCTOS */}

              <div className="mb-6">

                <h4 className="text-lg font-black text-gray-800 mb-4">
                  🛍️ Productos
                </h4>

                <div className="space-y-3">

                  {ventaEditando.detalles.map(
                    (item, index) => (

                      <div
                        key={item.id_detalle}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4"
                      >

                        <div>

                          <p className="font-black text-gray-800">
                            {item.nombre_producto}
                          </p>

                          <p className="text-sm text-gray-500">
                            ${dinero(item.precio_unitario)} por unidad
                          </p>

                        </div>

                        <div className="flex items-center gap-3">

                          <label className="text-sm font-bold text-gray-600">
                            Cantidad
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) =>
                              cambiarCantidad(
                                index,
                                e.target.value
                              )
                            }
                            className="w-24 border-2 border-gray-200 rounded-xl p-2 text-center font-bold"
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* TOTAL */}

              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 flex justify-between items-center mb-6">

                <span className="font-black text-gray-700">
                  NUEVO TOTAL
                </span>

                <span className="text-2xl font-black text-emerald-600">
                  ${dinero(calcularTotalEdicion())}
                </span>

              </div>

              {/* BOTONES */}

              <div className="flex justify-end gap-3">

                <button
                  onClick={cerrarEditar}
                  className="px-5 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarEdicion}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-md"
                >
                  💾 Guardar cambios
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Ventas;