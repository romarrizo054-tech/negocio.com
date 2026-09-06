import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://negocio-com-1.onrender.com/api';

function Inventario() {

  // ==========================================
  // ESTADOS
  // ==========================================

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [gananciasProductos, setGananciasProductos] = useState([]);

  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [productoEditando, setProductoEditando] = useState(null);

  const [cargando, setCargando] = useState(false);

  const productoInicial = {
    id_categoria: '',
    nombre: '',
    costo: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: ''
  };

  const [nuevoProducto, setNuevoProducto] =
    useState(productoInicial);


  // ==========================================
  // CARGAR DATOS
  // ==========================================

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);


  // ==========================================
  // ACTUALIZAR GANANCIAS CUANDO CAMBIA FILTRO
  // ==========================================

  useEffect(() => {
    obtenerGananciasProductos();
  }, [categoriaFiltro]);


  // ==========================================
  // OBTENER PRODUCTOS
  // ==========================================

  const obtenerProductos = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/productos`
      );

      setProductos(res.data);

    } catch (error) {

      console.error(
        'Error obteniendo productos:',
        error
      );

    }

  };


  // ==========================================
  // OBTENER CATEGORÍAS
  // ==========================================

  const obtenerCategorias = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/categorias`
      );

      setCategorias(res.data);

      if (res.data.length > 0) {

        setNuevoProducto(prev => ({
          ...prev,
          id_categoria:
            prev.id_categoria ||
            res.data[0].id_categoria
        }));

      }

    } catch (error) {

      console.error(
        'Error obteniendo categorías:',
        error
      );

    }

  };


  // ==========================================
  // OBTENER GANANCIAS REALES
  // ==========================================

  const obtenerGananciasProductos = async () => {

    try {

      const url = categoriaFiltro
        ? `${API_URL}/ganancias-productos?id_categoria=${categoriaFiltro}`
        : `${API_URL}/ganancias-productos`;

      const res = await axios.get(url);

      setGananciasProductos(res.data);

    } catch (error) {

      console.error(
        'Error obteniendo ganancias:',
        error
      );

      setGananciasProductos([]);

    }

  };


  // ==========================================
  // CAMBIAR CAMPOS
  // ==========================================

  const handleChange = (e) => {

    setNuevoProducto({
      ...nuevoProducto,
      [e.target.name]: e.target.value
    });

  };


  // ==========================================
  // NUEVO PRODUCTO
  // ==========================================

  const abrirNuevoProducto = () => {

    setModoEdicion(false);
    setProductoEditando(null);

    setNuevoProducto({
      id_categoria:
        categorias[0]?.id_categoria || '',
      nombre: '',
      costo: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: ''
    });

    setMostrarFormulario(true);

  };


  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  const editarProducto = (producto) => {

    setModoEdicion(true);

    setProductoEditando(producto);

    setNuevoProducto({
      id_categoria: producto.id_categoria,
      nombre: producto.nombre,
      costo: producto.costo,
      precio_venta: producto.precio_venta,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo
    });

    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  };


  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  const cerrarFormulario = () => {

    setMostrarFormulario(false);

    setModoEdicion(false);

    setProductoEditando(null);

  };


  // ==========================================
  // GUARDAR PRODUCTO
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setCargando(true);

    try {

      if (
        modoEdicion &&
        productoEditando
      ) {

        // ==========================================
        // EDITAR
        // ==========================================

        await axios.put(
          `${API_URL}/productos/${productoEditando.id_producto}`,
          nuevoProducto
        );

        alert(
          '✅ Producto actualizado correctamente'
        );

      } else {

        // ==========================================
        // CREAR
        // ==========================================

        await axios.post(
          `${API_URL}/productos`,
          nuevoProducto
        );

        alert(
          '✅ ¡Producto agregado al inventario!'
        );

      }

      cerrarFormulario();

      await obtenerProductos();

      await obtenerGananciasProductos();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.error ||
        '❌ Hubo un problema al guardar el producto.'
      );

    } finally {

      setCargando(false);

    }

  };


  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  const eliminarProducto = async (id) => {

    if (
      !window.confirm(
        '¿Estás segura de que deseas eliminar este producto?'
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/productos/${id}`
      );

      alert(
        '✅ Producto eliminado correctamente'
      );

      await obtenerProductos();

      await obtenerGananciasProductos();

    } catch (error) {

      alert(
        error.response?.data?.error ||
        'No se pudo eliminar el producto.'
      );

    }

  };


  // ==========================================
  // FILTRO DE PRODUCTOS
  // ==========================================

  const productosFiltrados = categoriaFiltro
    ? productos.filter(
        p =>
          Number(p.id_categoria) ===
          Number(categoriaFiltro)
      )
    : productos;


  // ==========================================
  // TOTAL PRODUCTOS
  // ==========================================

  const totalProductos =
    productosFiltrados.length;


  // ==========================================
  // TOTAL UNIDADES
  // ==========================================

  const totalUnidades =
    productosFiltrados.reduce(
      (total, producto) =>
        total +
        Number(
          producto.stock_actual || 0
        ),
      0
    );


  // ==========================================
  // GANANCIA POTENCIAL DEL STOCK
  // ==========================================

  const gananciaStockTotal =
    productosFiltrados.reduce(
      (total, producto) => {

        const ganancia =
          Number(
            producto.ganancia_unitaria ||
            (
              Number(producto.precio_venta || 0) -
              Number(producto.costo || 0)
            )
          );

        return total +
          (
            ganancia *
            Number(
              producto.stock_actual || 0
            )
          );

      },
      0
    );


  // ==========================================
  // GANANCIA REAL TOTAL
  // ==========================================

  const gananciaTotal =
    gananciasProductos.reduce(
      (total, producto) =>
        total +
        Number(
          producto.ganancia_total || 0
        ),
      0
    );


  // ==========================================
  // UNIDADES VENDIDAS
  // ==========================================

  const unidadesVendidas =
    gananciasProductos.reduce(
      (total, producto) =>
        total +
        Number(
          producto.unidades_vendidas || 0
        ),
      0
    );


  // ==========================================
  // FORMATO MONEDA
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
  // BUSCAR GANANCIA DE UN PRODUCTO
  // ==========================================

  const obtenerGananciaReal = (
    idProducto
  ) => {

    const encontrado =
      gananciasProductos.find(
        p =>
          Number(p.id_producto) ===
          Number(idProducto)
      );

    return encontrado
      ? Number(
          encontrado.ganancia_total || 0
        )
      : 0;

  };


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <div className="max-w-7xl mx-auto p-4">

      {/* ======================================
          ENCABEZADO
      ====================================== */}

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-lg mb-8 text-white">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-5">

          <div>

            <h2 className="text-3xl font-extrabold tracking-wide">
              📦 Control de Inventario
            </h2>

            <p className="text-violet-200 mt-1">
              Gestioná productos, stock, precios y ganancias
            </p>

          </div>


          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

            {/* FILTRO */}

            <select
              value={categoriaFiltro}
              onChange={(e) =>
                setCategoriaFiltro(
                  e.target.value
                )
              }
              className="p-3 border-2 border-white/30 rounded-xl shadow-md font-bold text-indigo-900 bg-white/90 focus:outline-none focus:ring-4 focus:ring-violet-300"
            >

              <option value="">
                🌟 Todos los rubros
              </option>

              {categorias.map(cat => (

                <option
                  key={cat.id_categoria}
                  value={cat.id_categoria}
                >
                  {cat.nombre}
                </option>

              ))}

            </select>


            {/* NUEVO PRODUCTO */}

            <button
              onClick={
                mostrarFormulario
                  ? cerrarFormulario
                  : abrirNuevoProducto
              }
              className={`px-5 py-3 rounded-xl font-extrabold text-white shadow-lg transition-all hover:scale-105 ${
                mostrarFormulario
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >

              {mostrarFormulario
                ? '✕ Cancelar'
                : '+ Nuevo Producto'}

            </button>

          </div>

        </div>

      </div>


      {/* ======================================
          TARJETAS DE RESUMEN
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        {/* PRODUCTOS */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Productos
          </p>

          <p className="text-3xl font-black text-indigo-700 mt-2">
            {totalProductos}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            En inventario
          </p>

        </div>


        {/* UNIDADES */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Unidades en stock
          </p>

          <p className="text-3xl font-black text-violet-700 mt-2">
            {totalUnidades}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Disponibles actualmente
          </p>

        </div>


        {/* GANANCIA POTENCIAL */}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">

          <p className="text-gray-500 font-semibold">
            Ganancia potencial
          </p>

          <p className="text-3xl font-black text-indigo-600 mt-2">
            ${dinero(gananciaStockTotal)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Si vendés todo el stock
          </p>

        </div>


        {/* GANANCIA REAL */}

        <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 p-6">

          <p className="text-gray-500 font-semibold">
            💰 Ganancia total
          </p>

          <p className="text-3xl font-black text-emerald-600 mt-2">
            ${dinero(gananciaTotal)}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {unidadesVendidas} unidades vendidas
          </p>

        </div>

      </div>


      {/* ======================================
          FORMULARIO
      ====================================== */}

      {mostrarFormulario && (

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-white to-violet-50 border-2 border-violet-100 p-8 rounded-2xl shadow-2xl mb-8"
        >

          <h3 className="text-2xl font-black text-violet-900 mb-6">

            {modoEdicion
              ? '✏️ Editar Producto'
              : '➕ Nuevo Producto'}

          </h3>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CATEGORÍA */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Categoría:
              </label>

              <select
                name="id_categoria"
                value={nuevoProducto.id_categoria}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              >

                {categorias.map(cat => (

                  <option
                    key={cat.id_categoria}
                    value={cat.id_categoria}
                  >
                    {cat.nombre}
                  </option>

                ))}

              </select>

            </div>


            {/* NOMBRE */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Nombre del Producto:
              </label>

              <input
                type="text"
                name="nombre"
                value={nuevoProducto.nombre}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              />

            </div>


            {/* COSTO */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Costo ($):
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                name="costo"
                value={nuevoProducto.costo}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              />

            </div>


            {/* PRECIO */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Precio de Venta ($):
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                name="precio_venta"
                value={nuevoProducto.precio_venta}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              />

            </div>


            {/* STOCK */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Stock Actual:
              </label>

              <input
                type="number"
                min="0"
                name="stock_actual"
                value={nuevoProducto.stock_actual}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              />

            </div>


            {/* STOCK MÍNIMO */}

            <div className="flex flex-col">

              <label className="text-violet-900 font-bold mb-2">
                Stock Mínimo:
              </label>

              <input
                type="number"
                min="0"
                name="stock_minimo"
                value={nuevoProducto.stock_minimo}
                onChange={handleChange}
                required
                className="p-3 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-300 focus:outline-none bg-white"
              />

            </div>

          </div>


          <div className="mt-6">

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg transition-all"
            >

              {cargando
                ? '⏳ Guardando...'
                : modoEdicion
                  ? '💾 Guardar Cambios'
                  : '💾 Guardar Producto'}

            </button>

          </div>

        </form>

      )}


      {/* ======================================
          TABLA DE INVENTARIO
      ====================================== */}

      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border border-gray-100">

        <table className="min-w-full text-left border-collapse">

          <thead>

            <tr className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white uppercase text-xs tracking-wider">

              <th className="py-4 px-5">
                Categoría
              </th>

              <th className="py-4 px-5">
                Producto
              </th>

              <th className="py-4 px-5">
                Costo
              </th>

              <th className="py-4 px-5">
                Precio
              </th>

              <th className="py-4 px-5">
                Ganancia
              </th>

              <th className="py-4 px-5">
                Ganancia real
              </th>

              <th className="py-4 px-5">
                Stock
              </th>

              <th className="py-4 px-5 text-center">
                Acciones
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-gray-100">

            {productosFiltrados.length === 0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="py-12 text-center text-gray-500"
                >
                  📦 No hay productos en esta categoría.
                </td>

              </tr>

            ) : (

              productosFiltrados.map(producto => {

                const costo =
                  Number(
                    producto.costo || 0
                  );

                const precio =
                  Number(
                    producto.precio_venta || 0
                  );

                const stock =
                  Number(
                    producto.stock_actual || 0
                  );

                const ganancia =
                  Number(
                    producto.ganancia_unitaria ??
                    (
                      precio - costo
                    )
                  );

                const gananciaStock =
                  Number(
                    producto.ganancia_stock ??
                    (
                      ganancia * stock
                    )
                  );

                const gananciaReal =
                  obtenerGananciaReal(
                    producto.id_producto
                  );

                const stockBajo =
                  stock <=
                  Number(
                    producto.stock_minimo || 0
                  );

                return (

                  <tr
                    key={producto.id_producto}
                    className="hover:bg-violet-50/60 transition-colors"
                  >

                    {/* CATEGORÍA */}

                    <td className="py-4 px-5">

                      <span className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-bold text-xs">

                        {producto.nombre_categoria ||
                          'General'}

                      </span>

                    </td>


                    {/* PRODUCTO */}

                    <td className="py-4 px-5">

                      <p className="font-bold text-gray-800">
                        {producto.nombre}
                      </p>

                    </td>


                    {/* COSTO */}

                    <td className="py-4 px-5 text-gray-500 font-semibold">

                      ${dinero(costo)}

                    </td>


                    {/* PRECIO */}

                    <td className="py-4 px-5 text-emerald-600 font-black">

                      ${dinero(precio)}

                    </td>


                    {/* GANANCIA POR UNIDAD */}

                    <td className="py-4 px-5">

                      <span
                        className={`font-black ${
                          ganancia >= 0
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >

                        ${dinero(ganancia)}

                      </span>

                      <p className="text-xs text-gray-400">
                        por unidad
                      </p>

                    </td>


                    {/* GANANCIA REAL */}

                    <td className="py-4 px-5">

                      <span className="font-black text-emerald-600">

                        ${dinero(gananciaReal)}

                      </span>

                      <p className="text-xs text-gray-400">
                        ventas realizadas
                      </p>

                    </td>


                    {/* STOCK */}

                    <td className="py-4 px-5">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                          stockBajo
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >

                        {stock} un.

                      </span>


                      {stockBajo && (

                        <p className="text-xs text-rose-600 font-bold mt-1">
                          ⚠️ Stock bajo
                        </p>

                      )}

                    </td>


                    {/* ACCIONES */}

                    <td className="py-4 px-5">

                      <div className="flex justify-center gap-2">

                        <button
                          onClick={() =>
                            editarProducto(
                              producto
                            )
                          }
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md hover:scale-105"
                        >
                          ✏️ Editar
                        </button>


                        <button
                          onClick={() =>
                            eliminarProducto(
                              producto.id_producto
                            )
                          }
                          className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-md hover:scale-105"
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default Inventario;