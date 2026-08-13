// ========================================
// CATÁLOGO AGROFIELD
// APP.JS
// ========================================

let productos = [];

// ========================================
// VISTA ACTUAL
// ========================================

let vistaActual = "tarjetas";

// ========================================
// PAGINACIÓN
// ========================================

const PRODUCTOS_POR_PAGINA = 12;

let paginaActual = 1;

// ========================================
// ELEMENTOS PRINCIPALES
// ========================================

const listaProductos =
    document.getElementById("lista-productos");

const buscador =
    document.getElementById("buscador");

const filtroCategoria =
    document.getElementById("filtro-categoria");

const filtroMarca =
    document.getElementById("filtro-marca");

const ordenProductos =
    document.getElementById("orden-productos");

const limpiarFiltros =
    document.getElementById("limpiar-filtros");

const contadorProductos =
    document.getElementById("contador-productos");

// ========================================
// BOTONES DE VISTA
// ========================================

const vistaTarjetas =
    document.getElementById("vista-tarjetas");

const vistaListado =
    document.getElementById("vista-listado");

// ========================================
// BOTÓN PDF
// ========================================

const generarPdf =
    document.getElementById("generar-pdf");

// ========================================
// ELEMENTOS DEL PDF
// ========================================

const areaPdf =
    document.getElementById("area-pdf");

const pdfProductos =
    document.getElementById("pdf-productos");

const pdfContador =
    document.getElementById("pdf-contador");

// ========================================
// ELEMENTOS DEL MODAL
// ========================================

const modal =
    document.getElementById("modal-producto");

const cerrarModal =
    document.getElementById("cerrar-modal");

const modalImg =
    document.getElementById("modal-img");

const modalMarca =
    document.getElementById("modal-marca");

const modalNombre =
    document.getElementById("modal-producto-nombre");

const modalVariante =
    document.getElementById("modal-variante");

const modalSku =
    document.getElementById("modal-sku");

const modalCategoria =
    document.getElementById("modal-categoria");

const modalSubcategoria =
    document.getElementById("modal-subcategoria");

const modalPrecio =
    document.getElementById("modal-precio");

const modalDescripcion =
    document.getElementById("modal-descripcion");

// ========================================
// MOSTRAR PRODUCTOS
// ========================================

function mostrarProductos(lista) {

    listaProductos.innerHTML = "";

    // ========================================
    // CONTADOR
    // ========================================

    if (contadorProductos) {

        contadorProductos.textContent =
            lista.length === 1
                ? "1 producto"
                : `${lista.length} productos`;

    }

    // ========================================
    // GUARDAR PRODUCTOS FILTRADOS
    // ========================================

    const listaOrdenada =
        ordenarProductos(lista);

    window.productosVisibles =
        listaOrdenada;

    // ========================================
    // SIN RESULTADOS
    // ========================================

    if (listaOrdenada.length === 0) {

        listaProductos.className =
            vistaActual === "listado"
                ? "grid-productos vista-listado"
                : "grid-productos";

        listaProductos.innerHTML = `
            <div class="sin-resultados">
                <p>No se encontraron productos.</p>
            </div>
        `;

        actualizarPaginacion(0);

        return;
    }

    // ========================================
    // CORREGIR PÁGINA ACTUAL
    // ========================================

    const totalPaginas =
        Math.ceil(
            listaOrdenada.length /
            PRODUCTOS_POR_PAGINA
        );

    if (paginaActual > totalPaginas) {

        paginaActual =
            totalPaginas;

    }

    if (paginaActual < 1) {

        paginaActual = 1;

    }

    // ========================================
    // CALCULAR PRODUCTOS DE LA PÁGINA
    // ========================================

    const inicio =
        (paginaActual - 1) *
        PRODUCTOS_POR_PAGINA;

    const fin =
        inicio +
        PRODUCTOS_POR_PAGINA;

    const productosPagina =
        listaOrdenada.slice(
            inicio,
            fin
        );

    // ========================================
    // MOSTRAR VISTA
    // ========================================

    if (vistaActual === "listado") {

        mostrarVistaListado(
            productosPagina
        );

    } else {

        mostrarVistaTarjetas(
            productosPagina
        );

    }

    // ========================================
    // PAGINACIÓN
    // ========================================

    actualizarPaginacion(
        listaOrdenada.length
    );
}

// ========================================
// MOSTRAR VISTA TARJETAS
// ========================================

function mostrarVistaTarjetas(lista) {

    listaProductos.className =
        "grid-productos";

    lista.forEach(
        producto => {

            const tarjeta =
                document.createElement(
                    "article"
                );

            tarjeta.classList.add(
                "producto"
            );

            // ========================================
            // DESTACADO
            // ========================================

            let etiquetaDestacado = "";

            if (
                esDestacado(
                    producto.DESTACADO
                )
            ) {

                etiquetaDestacado = `
                    <div class="producto-destacado">
                        ⭐ DESTACADO
                    </div>
                `;

            }

            // ========================================
            // IMAGEN
            // ========================================

            const imagenProducto =
                producto.IMAGEN
                    ? `img/${producto.IMAGEN}`
                    : "";

            // ========================================
            // TARJETA
            // ========================================

            tarjeta.innerHTML = `

                ${etiquetaDestacado}

                <div class="producto-imagen">

                    ${
                        imagenProducto
                            ? `
                                <img
                                    src="${imagenProducto}"
                                    alt="${producto.MARCA || ""} ${producto.PRODUCTO || ""}"
                                    loading="lazy"
                                >
                            `
                            : `
                                <div class="imagen-sin-producto">
                                    Sin imagen
                                </div>
                            `
                    }

                </div>

                <div class="producto-info">

                    <p class="producto-marca">
                        ${producto.MARCA || ""}
                    </p>

                    <h3>
                        ${producto.PRODUCTO || ""}
                    </h3>

                    <p class="producto-presentacion">
                        ${producto.VARIANTE || ""}
                    </p>

                    <p class="producto-precio">
                        Gs.
                        ${Number(
                            producto.PRECIO || 0
                        ).toLocaleString("es-PY")}
                    </p>

                    <button
                        class="btn-ver-producto"
                        type="button"
                    >
                        Ver producto
                    </button>

                </div>
            `;

            listaProductos.appendChild(
                tarjeta
            );

            const boton =
                tarjeta.querySelector(
                    ".btn-ver-producto"
                );

            boton.addEventListener(
                "click",
                () => abrirModal(producto)
            );

        }
    );
}

// ========================================
// MOSTRAR VISTA LISTADO
// ========================================

function mostrarVistaListado(lista) {

    listaProductos.className =
        "grid-productos vista-listado";

    // ========================================
    // CABECERA
    // ========================================

    const cabecera =
        document.createElement(
            "div"
        );

    cabecera.className =
        "cabecera-listado";

    cabecera.innerHTML = `

        <div class="cabecera-listado-imagen">
            Imagen
        </div>

        <div>
            Producto
        </div>

        <div>
            Marca
        </div>

        <div>
            Presentación
        </div>

        <div>
            Categoría
        </div>

        <div>
            Precio
        </div>

        <div>
        </div>

    `;

    listaProductos.appendChild(
        cabecera
    );

    // ========================================
    // PRODUCTOS
    // ========================================

    lista.forEach(
        producto => {

            const fila =
                document.createElement(
                    "article"
                );

            fila.className =
                "producto-listado";

            // ========================================
            // IMAGEN
            // ========================================

            const imagenProducto =
                producto.IMAGEN
                    ? `img/${producto.IMAGEN}`
                    : "";

            // ========================================
            // FILA
            // ========================================

            fila.innerHTML = `

                <div class="listado-imagen">

                    ${
                        imagenProducto
                            ? `
                                <img
                                    src="${imagenProducto}"
                                    alt="${producto.PRODUCTO || ""}"
                                    loading="lazy"
                                >
                            `
                            : `
                                <div class="imagen-sin-producto">
                                    —
                                </div>
                            `
                    }

                </div>

                <div class="listado-campo">

                    <span class="listado-label">
                        Producto
                    </span>

                    <div class="listado-producto">
                        ${producto.PRODUCTO || "-"}
                    </div>

                </div>

                <div class="listado-campo">

                    <span class="listado-label">
                        Marca
                    </span>

                    <div class="listado-marca">
                        ${producto.MARCA || "-"}
                    </div>

                </div>

                <div class="listado-campo listado-presentacion">

                    <span class="listado-label">
                        Presentación
                    </span>

                    <div class="listado-valor">
                        ${producto.VARIANTE || "-"}
                    </div>

                </div>

                <div class="listado-campo listado-categoria">

                    <span class="listado-label">
                        Categoría
                    </span>

                    <div class="listado-valor">
                        ${producto.CATEGORIA || "-"}
                    </div>

                </div>

                <div class="listado-campo">

                    <span class="listado-label">
                        Precio
                    </span>

                    <div class="listado-precio">

                        Gs.
                        ${Number(
                            producto.PRECIO || 0
                        ).toLocaleString("es-PY")}

                    </div>

                </div>

                <div class="listado-acciones">

                    <button
                        class="btn-listado"
                        type="button"
                    >
                        Ver
                    </button>

                </div>

            `;

            listaProductos.appendChild(
                fila
            );

            // ========================================
            // BOTÓN VER
            // ========================================

            const boton =
                fila.querySelector(
                    ".btn-listado"
                );

            boton.addEventListener(
                "click",
                () => abrirModal(producto)
            );

        }
    );
}

// ========================================
// PAGINACIÓN
// ========================================

function actualizarPaginacion(totalProductos) {

    let paginacion =
        document.getElementById(
            "paginacion-productos"
        );

    if (!paginacion) {

        paginacion =
            document.createElement(
                "div"
            );

        paginacion.id =
            "paginacion-productos";

        paginacion.className =
            "paginacion-productos";

        listaProductos.parentNode.appendChild(
            paginacion
        );

    }

    paginacion.innerHTML = "";

    const totalPaginas =
        Math.ceil(
            totalProductos /
            PRODUCTOS_POR_PAGINA
        );

    if (totalPaginas <= 1) {

        paginacion.style.display =
            "none";

        return;

    }

    paginacion.style.display =
        "flex";

    // ========================================
    // BOTÓN ANTERIOR
    // ========================================

    const botonAnterior =
        document.createElement(
            "button"
        );

    botonAnterior.type =
        "button";

    botonAnterior.className =
        "pagina-boton pagina-anterior";

    botonAnterior.textContent =
        "‹ Anterior";

    botonAnterior.disabled =
        paginaActual === 1;

    botonAnterior.addEventListener(
        "click",
        function () {

            if (
                paginaActual > 1
            ) {

                paginaActual--;

                mostrarProductos(
                    obtenerProductosFiltrados()
                );

                desplazarArribaProductos();

            }

        }
    );

    paginacion.appendChild(
        botonAnterior
    );

    // ========================================
    // NÚMEROS DE PÁGINA
    // ========================================

    const maxBotones =
        7;

    let inicioPagina =
        Math.max(
            1,
            paginaActual -
            Math.floor(
                maxBotones / 2
            )
        );

    let finPagina =
        Math.min(
            totalPaginas,
            inicioPagina +
            maxBotones -
            1
        );

    if (
        finPagina -
        inicioPagina +
        1 <
        maxBotones
    ) {

        inicioPagina =
            Math.max(
                1,
                finPagina -
                maxBotones +
                1
            );

    }

    for (
        let numero = inicioPagina;
        numero <= finPagina;
        numero++
    ) {

        const botonPagina =
            document.createElement(
                "button"
            );

        botonPagina.type =
            "button";

        botonPagina.className =
            "pagina-boton";

        botonPagina.textContent =
            numero;

        if (
            numero === paginaActual
        ) {

            botonPagina.classList.add(
                "pagina-activa"
            );

        }

        botonPagina.addEventListener(
            "click",
            function () {

                paginaActual =
                    numero;

                mostrarProductos(
                    obtenerProductosFiltrados()
                );

                desplazarArribaProductos();

            }
        );

        paginacion.appendChild(
            botonPagina
        );

    }

    // ========================================
    // BOTÓN SIGUIENTE
    // ========================================

    const botonSiguiente =
        document.createElement(
            "button"
        );

    botonSiguiente.type =
        "button";

    botonSiguiente.className =
        "pagina-boton pagina-siguiente";

    botonSiguiente.textContent =
        "Siguiente ›";

    botonSiguiente.disabled =
        paginaActual === totalPaginas;

    botonSiguiente.addEventListener(
        "click",
        function () {

            if (
                paginaActual <
                totalPaginas
            ) {

                paginaActual++;

                mostrarProductos(
                    obtenerProductosFiltrados()
                );

                desplazarArribaProductos();

            }

        }
    );

    paginacion.appendChild(
        botonSiguiente
    );
}

// ========================================
// OBTENER PRODUCTOS FILTRADOS
// ========================================

function obtenerProductosFiltrados() {

    const texto =
        buscador
            ? buscador.value
                .toLowerCase()
                .trim()
            : "";

    const categoriaSeleccionada =
        filtroCategoria
            ? filtroCategoria.value
            : "todas";

    const marcaSeleccionada =
        filtroMarca
            ? filtroMarca.value
            : "todas";

    return productos.filter(
        producto => {

            const sku =
                String(
                    producto.SKU || ""
                ).toLowerCase();

            const marca =
                String(
                    producto.MARCA || ""
                ).toLowerCase();

            const nombre =
                String(
                    producto.PRODUCTO || ""
                ).toLowerCase();

            const variante =
                String(
                    producto.VARIANTE || ""
                ).toLowerCase();

            const coincideTexto =
                sku.includes(texto) ||
                marca.includes(texto) ||
                nombre.includes(texto) ||
                variante.includes(texto);

            const coincideCategoria =
                categoriaSeleccionada === "todas" ||
                producto.CATEGORIA ===
                    categoriaSeleccionada;

            const coincideMarca =
                marcaSeleccionada === "todas" ||
                producto.MARCA ===
                    marcaSeleccionada;

            return (
                coincideTexto &&
                coincideCategoria &&
                coincideMarca
            );

        }
    );
}

// ========================================
// SUBIR AL INICIO DE PRODUCTOS
// ========================================

function desplazarArribaProductos() {

    if (!listaProductos) {
        return;
    }

    const posicion =
        listaProductos.getBoundingClientRect().top +
        window.scrollY -
        100;

    window.scrollTo({
        top: posicion,
        behavior: "smooth"
    });
}

// ========================================
// CAMBIAR VISTA
// ========================================

function cambiarVista(vista) {

    vistaActual =
        vista;

    if (vistaTarjetas) {

        vistaTarjetas.classList.toggle(
            "activo",
            vistaActual === "tarjetas"
        );

    }

    if (vistaListado) {

        vistaListado.classList.toggle(
            "activo",
            vistaActual === "listado"
        );

    }

    mostrarProductos(
        obtenerProductosFiltrados()
    );
}

// ========================================
// EVENTOS CAMBIO DE VISTA
// ========================================

if (vistaTarjetas) {

    vistaTarjetas.addEventListener(
        "click",
        function () {

            cambiarVista(
                "tarjetas"
            );

        }
    );

}

if (vistaListado) {

    vistaListado.addEventListener(
        "click",
        function () {

            cambiarVista(
                "listado"
            );

        }
    );

}

// ========================================
// ORDENAR PRODUCTOS
// ========================================

function ordenarProductos(lista) {

    const tipoOrden =
        ordenProductos
            ? ordenProductos.value
            : "recomendados";

    const copia =
        [...lista];

    switch (tipoOrden) {

        case "nombre-az":

            return copia.sort(
                (a, b) =>
                    String(
                        a.PRODUCTO || ""
                    ).localeCompare(
                        String(
                            b.PRODUCTO || ""
                        ),
                        "es"
                    )
            );

        case "nombre-za":

            return copia.sort(
                (a, b) =>
                    String(
                        b.PRODUCTO || ""
                    ).localeCompare(
                        String(
                            a.PRODUCTO || ""
                        ),
                        "es"
                    )
            );

        case "precio-menor":

            return copia.sort(
                (a, b) =>
                    Number(
                        a.PRECIO || 0
                    ) -
                    Number(
                        b.PRECIO || 0
                    )
            );

        case "precio-mayor":

            return copia.sort(
                (a, b) =>
                    Number(
                        b.PRECIO || 0
                    ) -
                    Number(
                        a.PRECIO || 0
                    )
            );

        case "recomendados":

        default:

            return copia.sort(
                (a, b) =>
                    obtenerOrden(a) -
                    obtenerOrden(b)
            );

    }
}

// ========================================
// OBTENER ORDEN
// ========================================

function obtenerOrden(producto) {

    const orden =
        Number(
            producto.ORDEN
        );

    if (
        isNaN(orden)
    ) {

        return 999999;

    }

    return orden;
}

// ========================================
// DESTACADO
// ========================================

function esDestacado(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return false;

    }

    const valorNormalizado =
        String(valor)
            .trim()
            .toUpperCase();

    return (
        valorNormalizado === "SI" ||
        valorNormalizado === "SÍ" ||
        valorNormalizado === "1" ||
        valorNormalizado === "TRUE" ||
        valorNormalizado === "VERDADERO"
    );
}

// ========================================
// ACTIVO
// ========================================

function esActivo(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return false;

    }

    const valorNormalizado =
        String(valor)
            .trim()
            .toUpperCase();

    return (
        valorNormalizado === "SI" ||
        valorNormalizado === "SÍ" ||
        valorNormalizado === "1" ||
        valorNormalizado === "TRUE" ||
        valorNormalizado === "VERDADERO"
    );
}

// ========================================
// ABRIR MODAL
// ========================================

function abrirModal(producto) {

    if (!modal) {
        return;
    }

    if (modalMarca) {

        modalMarca.textContent =
            producto.MARCA || "";

    }

    if (modalNombre) {

        modalNombre.textContent =
            producto.PRODUCTO || "";

    }

    if (modalVariante) {

        modalVariante.textContent =
            producto.VARIANTE || "-";

    }

    if (modalSku) {

        modalSku.textContent =
            producto.SKU || "-";

    }

    if (modalCategoria) {

        modalCategoria.textContent =
            producto.CATEGORIA || "-";

    }

    if (modalSubcategoria) {

        modalSubcategoria.textContent =
            producto.SUBCATEGORIA || "-";

    }

    if (modalPrecio) {

        modalPrecio.textContent =
            "Gs. " +
            Number(
                producto.PRECIO || 0
            ).toLocaleString(
                "es-PY"
            );

    }

    if (modalDescripcion) {

        modalDescripcion.textContent =
            producto.DESCRIPCION_LARGA ||
            producto.DESCRIPCION_CORTA ||
            "Sin descripción disponible.";

    }

    prepararGaleria(
        producto
    );

    modal.classList.remove(
        "oculto"
    );
}

// ========================================
// PREPARAR GALERÍA
// ========================================

function prepararGaleria(producto) {

    if (!modalImg) {
        return;
    }

    let imagenes = [];

    // ========================================
    // LEER IMÁGENES JSON
    // ========================================

    if (
        Array.isArray(
            producto.IMAGENES
        ) &&
        producto.IMAGENES.length > 0
    ) {

        imagenes =
            [...producto.IMAGENES];

    }

    // ========================================
    // ORDENAR IMÁGENES
    // ========================================

    imagenes.sort(
        (a, b) =>
            Number(
                a.ORDEN || 999999
            ) -
            Number(
                b.ORDEN || 999999
            )
    );

    // ========================================
    // RESPALDO
    // ========================================

    if (
        imagenes.length === 0
    ) {

        if (
            producto.IMAGEN
        ) {

            imagenes = [
                {
                    ARCHIVO:
                        producto.IMAGEN,
                    ORDEN: 1,
                    PRINCIPAL: true
                }
            ];

        }

    }

    // ========================================
    // SI NO HAY IMAGEN
    // ========================================

    if (
        imagenes.length === 0
    ) {

        modalImg.removeAttribute(
            "src"
        );

        modalImg.alt =
            producto.PRODUCTO ||
            "Producto";

        crearContenedorGaleria();

        const galeria =
            document.getElementById(
                "galeria-miniaturas"
            );

        if (galeria) {

            galeria.innerHTML =
                "";

        }

        return;

    }

    // ========================================
    // PRINCIPAL
    // ========================================

    let principal =
        imagenes.find(
            imagen =>
                imagen.PRINCIPAL === true ||
                String(
                    imagen.PRINCIPAL || ""
                ).toUpperCase() ===
                    "TRUE" ||
                String(
                    imagen.PRINCIPAL || ""
                ).toUpperCase() ===
                    "SI" ||
                String(
                    imagen.PRINCIPAL || ""
                ).toUpperCase() ===
                    "SÍ"
        );

    if (!principal) {

        principal =
            imagenes[0];

    }

    // ========================================
    // IMAGEN PRINCIPAL
    // ========================================

    if (
        principal.ARCHIVO
    ) {

        modalImg.src =
            "img/" +
            principal.ARCHIVO;

    }

    modalImg.alt =
        producto.PRODUCTO ||
        "Producto";

    // ========================================
    // CREAR GALERÍA
    // ========================================

    crearContenedorGaleria();

    const galeria =
        document.getElementById(
            "galeria-miniaturas"
        );

    if (!galeria) {
        return;
    }

    galeria.innerHTML =
        "";

    // ========================================
    // MINIATURAS
    // ========================================

    imagenes.forEach(
        (imagen, indice) => {

            if (
                !imagen.ARCHIVO
            ) {

                return;

            }

            const miniatura =
                document.createElement(
                    "button"
                );

            miniatura.type =
                "button";

            miniatura.className =
                "miniatura-producto";

            if (
                imagen.ARCHIVO ===
                principal.ARCHIVO
            ) {

                miniatura.classList.add(
                    "miniatura-activa"
                );

            }

            const imagenMiniatura =
                document.createElement(
                    "img"
                );

            imagenMiniatura.src =
                "img/" +
                imagen.ARCHIVO;

            imagenMiniatura.alt =
                "Imagen " +
                (indice + 1);

            imagenMiniatura.loading =
                "lazy";

            miniatura.appendChild(
                imagenMiniatura
            );

            miniatura.addEventListener(
                "click",
                function () {

                    modalImg.src =
                        "img/" +
                        imagen.ARCHIVO;

                    document
                        .querySelectorAll(
                            ".miniatura-producto"
                        )
                        .forEach(
                            elemento => {

                                elemento.classList.remove(
                                    "miniatura-activa"
                                );

                            }
                        );

                    miniatura.classList.add(
                        "miniatura-activa"
                    );

                }
            );

            galeria.appendChild(
                miniatura
            );

        }
    );
}

// ========================================
// CREAR CONTENEDOR GALERÍA
// ========================================

function crearContenedorGaleria() {

    let galeria =
        document.getElementById(
            "galeria-miniaturas"
        );

    if (galeria) {

        return;

    }

    galeria =
        document.createElement(
            "div"
        );

    galeria.id =
        "galeria-miniaturas";

    galeria.className =
        "galeria-miniaturas";

    const contenedorImagen =
        document.querySelector(
            ".modal-imagen"
        );

    if (!contenedorImagen) {

        return;

    }

    contenedorImagen.appendChild(
        galeria
    );
}

// ========================================
// CERRAR MODAL
// ========================================

function cerrarFichaProducto() {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "oculto"
    );
}

// ========================================
// EVENTO CERRAR
// ========================================

if (cerrarModal) {

    cerrarModal.addEventListener(
        "click",
        cerrarFichaProducto
    );

}

// ========================================
// CERRAR FUERA DEL MODAL
// ========================================

if (modal) {

    modal.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target === modal
            ) {

                cerrarFichaProducto();

            }

        }
    );

}

// ========================================
// CERRAR CON ESC
// ========================================

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            evento.key === "Escape"
        ) {

            cerrarFichaProducto();

        }

    }
);

// ========================================
// CARGAR CATEGORÍAS
// ========================================

function cargarCategorias() {

    if (!filtroCategoria) {
        return;
    }

    const categorias = [
        ...new Set(
            productos
                .map(
                    producto =>
                        producto.CATEGORIA
                )
                .filter(
                    categoria =>
                        categoria
                )
        )
    ];

    categorias.sort(
        (a, b) =>
            String(a).localeCompare(
                String(b),
                "es"
            )
    );

    filtroCategoria.innerHTML = `
        <option value="todas">
            Todas las categorías
        </option>
    `;

    categorias.forEach(
        categoria => {

            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                categoria;

            opcion.textContent =
                categoria;

            filtroCategoria.appendChild(
                opcion
            );

        }
    );
}

// ========================================
// CARGAR MARCAS
// ========================================

function cargarMarcas() {

    if (!filtroMarca) {
        return;
    }

    const marcas = [
        ...new Set(
            productos
                .map(
                    producto =>
                        producto.MARCA
                )
                .filter(
                    marca =>
                        marca
                )
        )
    ];

    marcas.sort(
        (a, b) =>
            String(a).localeCompare(
                String(b),
                "es"
            )
    );

    filtroMarca.innerHTML = `
        <option value="todas">
            Todas las marcas
        </option>
    `;

    marcas.forEach(
        marca => {

            const opcion =
                document.createElement(
                    "option"
                );

            opcion.value =
                marca;

            opcion.textContent =
                marca;

            filtroMarca.appendChild(
                opcion
            );

        }
    );
}

// ========================================
// FILTRAR PRODUCTOS
// ========================================

function filtrarProductos() {

    paginaActual = 1;

    mostrarProductos(
        obtenerProductosFiltrados()
    );
}

// ========================================
// EVENTOS
// ========================================

if (buscador) {

    buscador.addEventListener(
        "input",
        filtrarProductos
    );

}

if (filtroCategoria) {

    filtroCategoria.addEventListener(
        "change",
        filtrarProductos
    );

}

if (filtroMarca) {

    filtroMarca.addEventListener(
        "change",
        filtrarProductos
    );

}

if (ordenProductos) {

    ordenProductos.addEventListener(
        "change",
        filtrarProductos
    );

}

// ========================================
// LIMPIAR FILTROS
// ========================================

if (limpiarFiltros) {

    limpiarFiltros.addEventListener(
        "click",
        function () {

            if (buscador) {

                buscador.value =
                    "";

            }

            if (filtroCategoria) {

                filtroCategoria.value =
                    "todas";

            }

            if (filtroMarca) {

                filtroMarca.value =
                    "todas";

            }

            if (ordenProductos) {

                ordenProductos.value =
                    "recomendados";

            }

            paginaActual =
                1;

            mostrarProductos(
                productos
            );

        }
    );
}

// ========================================
// GENERAR CONTENIDO PDF
// ========================================

function prepararPdf() {

    // ========================================
    // UTILIZAR TODOS LOS PRODUCTOS FILTRADOS
    // ========================================

    const productosPdf =
        window.productosVisibles || [];

    if (productosPdf.length === 0) {

        alert(
            "No hay productos para generar el PDF."
        );

        return false;
    }

    // ========================================
    // CONTADOR
    // ========================================

    if (pdfContador) {

        pdfContador.textContent =
            productosPdf.length === 1
                ? "1 producto"
                : `${productosPdf.length} productos`;

    }

    // ========================================
    // LIMPIAR PDF ANTERIOR
    // ========================================

    if (!pdfProductos) {
        return false;
    }

    pdfProductos.innerHTML = "";

    pdfProductos.style.display =
        "block";

    pdfProductos.style.width =
        "100%";

    pdfProductos.style.boxSizing =
        "border-box";

    // ========================================
    // CABECERA DEL PDF
    // ========================================

    const cabecera =
        document.createElement(
            "div"
        );

    cabecera.className =
        "pdf-listado-cabecera";

    cabecera.innerHTML = `

        <div class="pdf-col-imagen">
            Imagen
        </div>

        <div>
            Producto
        </div>

        <div>
            Marca
        </div>

        <div>
            Categoria
        </div>

        <div>
            Precio
        </div>

    `;

    pdfProductos.appendChild(
        cabecera
    );

    // ========================================
    // PRODUCTOS
    // ========================================

    productosPdf.forEach(
        producto => {

            const fila =
                document.createElement(
                    "article"
                );

            fila.className =
                "pdf-listado-fila";

            // ========================================
            // IMAGEN
            // ========================================

            const imagenProducto =
                producto.IMAGEN
                    ? `img/${producto.IMAGEN}`
                    : "";

            // ========================================
            // PRECIO
            // ========================================

            const precio =
                Number(
                    producto.PRECIO || 0
                ).toLocaleString(
                    "es-PY"
                );

            // ========================================
            // CONTENIDO
            // ========================================

            fila.innerHTML = `

                <div class="pdf-listado-imagen">

                    ${
                        imagenProducto
                            ? `
                                <img
                                    src="${imagenProducto}"
                                    alt="${producto.PRODUCTO || ""}"
                                >
                            `
                            : `
                                <span>
                                    —
                                </span>
                            `
                    }

                </div>


                <div class="pdf-listado-campo">

                    <strong>
                        ${producto.PRODUCTO || "-"}
                    </strong>

                </div>


                <div class="pdf-listado-campo">

                    ${producto.MARCA || "-"}

                </div>


                <div class="pdf-listado-campo">

                    ${producto.CATEGORIA || "-"}

                </div>


                <div class="pdf-listado-campo pdf-listado-precio">

                    <strong>
                        Gs. ${precio}
                    </strong>

                </div>

            `;

            pdfProductos.appendChild(
                fila
            );

        }
    );

    // ========================================
    // ÁREA PDF
    // ========================================

    if (areaPdf) {

        areaPdf.style.width =
            "100%";

        areaPdf.style.boxSizing =
            "border-box";

    }

    return true;
}

// ========================================
// BOTÓN GENERAR PDF
// ========================================

if (generarPdf) {

    generarPdf.addEventListener(
        "click",
        function () {

            const preparado =
                prepararPdf();

            if (!preparado) {

                return;

            }

            setTimeout(
                function () {

                    window.print();

                },
                300
            );

        }
    );

}

// ========================================
// CARGAR PRODUCTOS
// ========================================

fetch(
    "productos.json"
)

    .then(
        respuesta => {

            if (!respuesta.ok) {

                throw new Error(
                    "No se pudo cargar productos.json"
                );

            }

            return respuesta.json();

        }
    )

    .then(
        datos => {

            console.log("PRODUCTOS CARGADOS:", datos);
            console.log("CANTIDAD:", datos.length);

            productos = datos.filter(
                producto => esActivo(producto.ACTIVO)
            );

            console.log(
                "PRODUCTOS ACTIVOS:",
                productos.length
            );

            cargarCategorias();

            cargarMarcas();

            paginaActual = 1;

            mostrarProductos(
                productos
            );

        }
    )

    .catch(
        error => {

            console.error(
                "Error al cargar productos:",
                error
            );

            listaProductos.innerHTML = `

                <div class="sin-resultados">

                    <p>
                        No se pudieron cargar
                        los productos.
                    </p>

                </div>

            `;

        }
    );