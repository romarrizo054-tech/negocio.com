import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://negocio-com-1.onrender.com/api';

function Ventas() {

  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ==========================================
  // OBTENER VENTAS
  // ==========================================

  const obtenerVentas = async () => {

    try {

      setCargando(true);

      const res = await axios.get(
        `${API_URL}/ventas`
      );

      setVentas(res.data);

    } catch (error) {

      console.error(
        'Error obteniendo ventas:',
        error
      );

    } finally {

      setCargando(false);

    }

  };


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

      console.error(
        'Error obteniendo detalle:',
        error
      );

      alert(
        'No se pudo obtener el detalle de la venta.'
      );

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
  // FORMATO DINERO
  // ==========================================

  const dinero = (valor) => {

    return Number(
      valor || 0
    ).toLocaleString(
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
      total +
      Number(venta.total || 0),
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
          Consultá todas las ventas realizadas
        </p>

      </div>


      {/* ======================================
          RESUMEN
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Ventas realizadas
          </p>

          <p className="text-3xl font-black text-indigo-700 mt-2">
            {totalVentas}
          </p>

        </div>


        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Dinero vendido
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-2">
            ${dinero(dineroTotal)}
          </p>

        </div>


        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Unidades vendidas
          </p>

          <p className="text-3xl font-black text-violet-700 mt-2">
            {unidadesTotales}
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
                  Método de pago
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
                  Detalle
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {ventas.map(venta => (

                <tr
                  key={venta.id_venta}
                  className="hover:bg-violet-50/60 transition-colors"
                >

                  <td className="py-4 px-6">

                    <span className="font-black text-indigo-700">
                      #{venta.id_venta}
                    </span>

                  </td>


                  <td className="py-4 px-6 text-gray-600">

                    {fecha(venta.fecha)}

                  </td>


                  <td className="py-4 px-6">

                    <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-bold text-xs">

                      {venta.metodo_pago}

                    </span>

                  </td>


                  <td className="py-4 px-6 font-semibold">

                    {venta.cantidad_productos}

                  </td>


                  <td className="py-4 px-6 font-semibold">

                    {venta.unidades_vendidas}

                  </td>


                  <td className="py-4 px-6">

                    <span className="font-black text-emerald-600 text-lg">

                      ${dinero(venta.total)}

                    </span>

                  </td>


                  <td className="py-4 px-6 text-center">

                    <button
                      onClick={() =>
                        verDetalle(
                          venta.id_venta
                        )
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md hover:scale-105 transition-all"
                    >
                      👁️ Ver detalle
                    </button>

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

            {/* HEADER MODAL */}

            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-center">

              <div>

                <h3 className="text-2xl font-black">
                  🧾 Venta #{ventaSeleccionada}
                </h3>

                {detalleVenta.length > 0 && (

                  <p className="text-violet-200 mt-1">
                    {fecha(
                      detalleVenta[0].fecha
                    )}
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


            {/* PRODUCTOS */}

            <div className="p-6">

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

                    {detalleVenta.map(
                      detalle => (

                        <tr
                          key={
                            detalle.id_detalle
                          }
                          className="border-b border-gray-100"
                        >

                          <td className="py-4 font-bold text-gray-800">

                            {detalle.nombre_producto}

                          </td>


                          <td className="py-4 text-center">

                            {detalle.cantidad}

                          </td>


                          <td className="py-4 text-right">

                            ${dinero(
                              detalle.precio_unitario
                            )}

                          </td>


                          <td className="py-4 text-right font-black text-emerald-600">

                            ${dinero(
                              detalle.subtotal
                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* TOTAL */}

              {detalleVenta.length > 0 && (

                <div className="mt-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-5 flex justify-between items-center">

                  <span className="font-black text-gray-700">
                    TOTAL DE LA VENTA
                  </span>

                  <span className="text-2xl font-black text-emerald-600">

                    ${dinero(
                      detalleVenta[0].total
                    )}

                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Ventas;