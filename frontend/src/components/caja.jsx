import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://negocio-com-1.onrender.com/api';

function Caja() {

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [carrito, setCarrito] = useState([]);

  const [metodoPago, setMetodoPago] = useState('Efectivo');

  const [clienteFiado, setClienteFiado] = useState('');

  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // ==========================================
  // CARGAR PRODUCTOS Y CATEGORÍAS
  // ==========================================

  useEffect(() => {

    cargarDatos();

  }, []);

  const cargarDatos = async () => {

    try {

      const productosRes = await axios.get(
        `${API_URL}/productos`
      );

      const categoriasRes = await axios.get(
        `${API_URL}/categorias`
      );

      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);

    } catch (error) {

      console.error(
        'Error cargando datos:',
        error
      );

    }

  };

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(
        p =>
          p.id_categoria ===
          parseInt(categoriaSeleccionada)
      )
    : productos;

  // ==========================================
  // AGREGAR PRODUCTO AL CARRITO
  // ==========================================

  const agregarAlCarrito = () => {

    if (!productoSeleccionado) {

      alert(
        'Seleccioná un producto primero.'
      );

      return;

    }

    const productoReal = productos.find(
      p =>
        p.id_producto ===
        parseInt(productoSeleccionado)
    );

    if (!productoReal) {

      alert(
        'No se encontró el producto.'
      );

      return;

    }

    const cantidadNumerica =
      parseInt(cantidad);

    if (
      !cantidadNumerica ||
      cantidadNumerica <= 0
    ) {

      alert(
        'La cantidad debe ser mayor a 0.'
      );

      return;

    }

    // ==========================================
    // VERIFICAR SI YA ESTÁ EN EL CARRITO
    // ==========================================

    const itemExistente =
      carrito.find(
        item =>
          item.id_producto ===
          productoReal.id_producto
      );

    const cantidadEnCarrito =
      itemExistente
        ? itemExistente.cantidad
        : 0;

    if (
      cantidadEnCarrito +
        cantidadNumerica >
      productoReal.stock_actual
    ) {

      alert(
        `No hay suficiente stock. Stock disponible: ${productoReal.stock_actual}`
      );

      return;

    }

    // ==========================================
    // SI YA EXISTE, SUMAR CANTIDAD
    // ==========================================

    if (itemExistente) {

      setCarrito(
        carrito.map(item => {

          if (
            item.id_producto ===
            productoReal.id_producto
          ) {

            const nuevaCantidad =
              item.cantidad +
              cantidadNumerica;

            return {

              ...item,

              cantidad:
                nuevaCantidad,

              subtotal:
                Number(
                  productoReal.precio_venta
                ) *
                nuevaCantidad

            };

          }

          return item;

        })
      );

    } else {

      // ==========================================
      // NUEVO PRODUCTO
      // ==========================================

      const nuevoItem = {

        id_producto:
          productoReal.id_producto,

        nombre:
          productoReal.nombre,

        precio_unitario:
          Number(
            productoReal.precio_venta
          ),

        cantidad:
          cantidadNumerica,

        subtotal:
          Number(
            productoReal.precio_venta
          ) *
          cantidadNumerica

      };

      setCarrito([
        ...carrito,
        nuevoItem
      ]);

    }

    setProductoSeleccionado('');
    setCantidad(1);

  };

  // ==========================================
  // ELIMINAR PRODUCTO DEL CARRITO
  // ==========================================

  const eliminarDelCarrito = (
    index
  ) => {

    setCarrito(
      carrito.filter(
        (_, i) => i !== index
      )
    );

  };

  // ==========================================
  // CAMBIAR CANTIDAD
  // ==========================================

  const cambiarCantidad = (
    index,
    nuevaCantidad
  ) => {

    const cantidadNueva =
      parseInt(nuevaCantidad);

    if (
      !cantidadNueva ||
      cantidadNueva <= 0
    ) {

      return;

    }

    const item =
      carrito[index];

    const producto =
      productos.find(
        p =>
          p.id_producto ===
          item.id_producto
      );

    if (
      producto &&
      cantidadNueva >
        producto.stock_actual
    ) {

      alert(
        `Stock disponible: ${producto.stock_actual}`
      );

      return;

    }

    const nuevoCarrito =
      [...carrito];

    nuevoCarrito[index] = {

      ...item,

      cantidad:
        cantidadNueva,

      subtotal:
        Number(
          item.precio_unitario
        ) *
        cantidadNueva

    };

    setCarrito(
      nuevoCarrito
    );

  };

  // ==========================================
  // TOTAL
  // ==========================================

  const totalVenta =
    carrito.reduce(
      (total, item) =>
        total +
        Number(item.subtotal || 0),
      0
    );

  // ==========================================
  // CONFIRMAR VENTA
  // ==========================================

  const confirmarVenta =
    async () => {

      if (
        carrito.length === 0
      ) {

        alert(
          'El carrito está vacío.'
        );

        return;

      }

      // ==========================================
      // VALIDAR FIADO
      // ==========================================

      if (
        metodoPago === 'Fiado' &&
        !clienteFiado.trim()
      ) {

        alert(
          'Ingresá el nombre del cliente para registrar el fiado.'
        );

        return;

      }

      try {

        await axios.post(
          `${API_URL}/ventas`,
          {

            metodo_pago:
              metodoPago,

            total:
              totalVenta,

            cliente_fiado:
              metodoPago === 'Fiado'
                ? clienteFiado.trim()
                : null,

            estado_fiado:
              metodoPago === 'Fiado'
                ? 'pendiente'
                : null,

            detalles:
              carrito

          }
        );

        alert(
          metodoPago === 'Fiado'
            ? `✅ Fiado registrado para ${clienteFiado}`
            : '✅ ¡Venta registrada con éxito!'
        );

        // ==========================================
        // LIMPIAR
        // ==========================================

        setCarrito([]);

        setClienteFiado('');

        setMetodoPago(
          'Efectivo'
        );

        setProductoSeleccionado('');

        setCantidad(1);

        // ==========================================
        // ACTUALIZAR PRODUCTOS
        // ==========================================

        const res =
          await axios.get(
            `${API_URL}/productos`
          );

        setProductos(
          res.data
        );

      } catch (error) {

        console.error(
          'Error registrando venta:',
          error
        );

        alert(
          error.response?.data?.error ||
          'Hubo un problema al registrar la venta.'
        );

      }

    };

  // ==========================================
  // FORMATO DINERO
  // ==========================================

  const dinero = (
    valor
  ) => {

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
  // INTERFAZ
  // ==========================================

  return (

    <div className="max-w-5xl mx-auto p-4">

      {/* ======================================
          ENCABEZADO
      ====================================== */}

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg mb-8 text-white">

        <h2 className="text-3xl font-extrabold tracking-wide">

          🛒 Caja Registradora y Ventas

        </h2>

        <p className="text-cyan-100 mt-1">

          Armá el carrito y registrá tus ventas

        </p>

      </div>


      {/* ======================================
          SELECCIÓN DE PRODUCTOS
      ====================================== */}

      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border border-gray-100">

        {/* CATEGORÍA */}

        <div>

          <label className="text-cyan-900 font-bold mb-2 block">

            Filtrar por Rubro:

          </label>

          <select

            value={
              categoriaSeleccionada
            }

            onChange={(e) => {

              setCategoriaSeleccionada(
                e.target.value
              );

              setProductoSeleccionado('');

            }}

            className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none bg-white font-semibold text-gray-700"

          >

            <option value="">

              🌟 Todos los rubros

            </option>

            {categorias.map(
              cat => (

                <option
                  key={
                    cat.id_categoria
                  }
                  value={
                    cat.id_categoria
                  }
                >

                  {cat.nombre}

                </option>

              )
            )}

          </select>

        </div>


        {/* PRODUCTO */}

        <div>

          <label className="text-cyan-900 font-bold mb-2 block">

            Seleccionar Producto:

          </label>

          <select

            value={
              productoSeleccionado
            }

            onChange={(e) =>
              setProductoSeleccionado(
                e.target.value
              )
            }

            className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none bg-white font-semibold text-gray-700"

          >

            <option value="">

              -- Elegí un artículo --

            </option>

            {productosFiltrados.map(
              p => (

                <option
                  key={
                    p.id_producto
                  }
                  value={
                    p.id_producto
                  }
                >

                  {p.nombre}
                  {' '}
                  (Stock:
                  {' '}
                  {p.stock_actual})
                  {' '}
                  -
                  {' '}
                  ${dinero(
                    p.precio_venta
                  )}

                </option>

              )
            )}

          </select>

        </div>


        {/* CANTIDAD */}

        <div className="flex gap-3">

          <div className="w-28">

            <label className="text-cyan-900 font-bold mb-2 block">

              Cantidad:

            </label>

            <input

              type="number"

              min="1"

              value={
                cantidad
              }

              onChange={(e) =>
                setCantidad(
                  e.target.value
                )
              }

              className="w-full p-3 border-2 border-cyan-100 rounded-xl focus:ring-4 focus:ring-cyan-200 focus:outline-none font-bold text-center"

            />

          </div>

          <button

            onClick={
              agregarAlCarrito
            }

            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all transform hover:scale-105 self-end"

          >

            + Agregar

          </button>

        </div>

      </div>


      {/* ======================================
          CARRITO
      ====================================== */}

      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto mb-8 border border-gray-100">

        <table className="min-w-full text-left border-collapse">

          <thead>

            <tr className="bg-gradient-to-r from-gray-900 to-blue-950 text-white uppercase text-xs tracking-wider">

              <th className="py-4 px-6">

                Producto

              </th>

              <th className="py-4 px-6 text-center">

                Cantidad

              </th>

              <th className="py-4 px-6">

                Precio Unitario

              </th>

              <th className="py-4 px-6">

                Subtotal

              </th>

              <th className="py-4 px-6 text-center">

                Acción

              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-gray-100">

            {carrito.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="py-10 text-center text-gray-400 font-semibold"
                >

                  🛒 El carrito está vacío

                </td>

              </tr>

            ) : (

              carrito.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="hover:bg-cyan-50/50"
                  >

                    <td className="py-4 px-6 font-bold text-gray-800">

                      {item.nombre}

                    </td>

                    <td className="py-4 px-6 text-center">

                      <input

                        type="number"

                        min="1"

                        value={
                          item.cantidad
                        }

                        onChange={(e) =>
                          cambiarCantidad(
                            index,
                            e.target.value
                          )
                        }

                        className="w-20 p-2 border-2 border-cyan-100 rounded-lg text-center font-bold"

                      />

                    </td>

                    <td className="py-4 px-6 text-gray-500">

                      $
                      {dinero(
                        item.precio_unitario
                      )}

                    </td>

                    <td className="py-4 px-6 font-black text-blue-600">

                      $
                      {dinero(
                        item.subtotal
                      )}

                    </td>

                    <td className="py-4 px-6 text-center">

                      <button

                        onClick={() =>
                          eliminarDelCarrito(
                            index
                          )
                        }

                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg"

                      >

                        🗑️

                      </button>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          PAGO
      ====================================== */}

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border-2 border-blue-200 shadow-xl">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* MÉTODO DE PAGO */}

          <div>

            <label className="font-extrabold text-blue-900 mb-2 block">

              Método de Pago:

            </label>

            <select

              value={
                metodoPago
              }

              onChange={(e) => {

                setMetodoPago(
                  e.target.value
                );

                if (
                  e.target.value !==
                  'Fiado'
                ) {

                  setClienteFiado('');

                }

              }}

              className="w-full p-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 font-bold text-blue-900 bg-white"

            >

              <option value="Efectivo">

                💵 Efectivo

              </option>

              <option value="Transferencia">

                🏦 Transferencia

              </option>

              <option value="Mercado Pago">

                📱 Mercado Pago

              </option>

              <option value="Tarjeta">

                💳 Tarjeta

              </option>

              <option value="Fiado">

                📝 Fiado

              </option>

            </select>

          </div>


          {/* CLIENTE FIADO */}

          {metodoPago === 'Fiado' && (

            <div>

              <label className="font-extrabold text-orange-900 mb-2 block">

                👤 Cliente:

              </label>

              <input

                type="text"

                value={
                  clienteFiado
                }

                onChange={(e) =>
                  setClienteFiado(
                    e.target.value
                  )
                }

                placeholder="Nombre del cliente"

                className="w-full p-3 border-2 border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:outline-none bg-white font-semibold"

              />

            </div>

          )}

        </div>


        {/* AVISO FIADO */}

        {metodoPago === 'Fiado' && (

          <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">

            <p className="text-orange-800 font-bold">

              📝 Esta venta quedará registrada como
              <span className="font-black">
                {' '}FIADO
              </span>
              {' '}y pendiente de pago.

            </p>

          </div>

        )}


        {/* TOTAL Y BOTÓN */}

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          <h3 className="text-3xl font-black text-gray-900">

            Total:

            <span className="text-blue-600 ml-2">

              $
              {dinero(
                totalVenta
              )}

            </span>

          </h3>


          <button

            onClick={
              confirmarVenta
            }

            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 px-8 rounded-xl shadow-xl transition-all transform hover:scale-105"

          >

            🚀 Confirmar Venta

          </button>

        </div>

      </div>

    </div>

  );

}

export default Caja;