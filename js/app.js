// ========================================
// CATÁLOGO AGROFIELD
// APP.JS — REDISEÑO 2026
// ----------------------------------------
// Mantiene la misma lógica que la versión anterior
// (productos.json, listas de precio, filtros, vistas,
// paginación, modal con galería y PDF) y agrega:
//   - Panel de filtros deslizante en tablet / móvil
//   - Chips de filtros activos
//   - Búsqueda sin importar tildes ni orden de palabras
//   - Tarjeta completa clickeable
//   - Paginación con "…" y texto "Mostrando X–Y de Z"
//   - PDF en tabla (la cabecera se repite en cada hoja)
// ========================================

"use strict";


// ========================================
// CONFIGURACIÓN
// ========================================

const CONFIG = {

    archivoDatos: "productos.json",

    // Carpeta de imágenes. Se puede sobrescribir con window.CATALOGO_RUTA_IMG
    rutaImagenes:
        typeof window.CATALOGO_RUTA_IMG === "string"
            ? window.CATALOGO_RUTA_IMG
            : "img/",

    productosPorPagina: 12,

    listaPorDefecto: "LISTA_PRECIO2",

    // Clave para recordar la vista elegida (tarjetas / listado)
    claveVista: "agrofield-catalogo-vista",

    // Ancho a partir del cual el panel de filtros es lateral fijo
    anchoEscritorio: 1024
};


// ========================================
// ESTADO
// ========================================

let productos = [];

let vistaActual = leerVistaGuardada();

let paginaActual = 1;

let listaPrecioActual = CONFIG.listaPorDefecto;

let productosPagina = [];

let ultimoFoco = null;

window.productosVisibles = [];


// ========================================
// ELEMENTOS
// ========================================

const $ = id => document.getElementById(id);

const el = {

    lista: $("lista-productos"),
    buscador: $("buscador"),
    limpiarBusqueda: $("limpiar-busqueda"),

    categoria: $("filtro-categoria"),
    marca: $("filtro-marca"),
    orden: $("orden-productos"),
    listaPrecios: $("lista-precios"),

    limpiarFiltros: $("limpiar-filtros"),
    aplicarFiltros: $("aplicar-filtros"),

    contador: $("contador-productos"),
    chips: $("filtros-activos"),

    panel: $("panel-filtros"),
    overlay: $("overlay-filtros"),
    abrirFiltros: $("abrir-filtros"),
    cerrarFiltros: $("cerrar-filtros"),
    badgeFiltros: $("contador-filtros"),

    vistaTarjetas: $("vista-tarjetas"),
    vistaListado: $("vista-listado"),

    generarPdf: $("generar-pdf"),
    areaPdf: $("area-pdf"),
    pdfProductos: $("pdf-productos"),
    pdfContador: $("pdf-contador"),
    pdfFecha: $("pdf-fecha"),
    pdfLista: $("pdf-lista"),

    modal: $("modal-producto"),
    cerrarModal: $("cerrar-modal"),
    modalImg: $("modal-img"),
    modalMarca: $("modal-marca"),
    modalDestacado: $("modal-destacado"),
    modalNombre: $("modal-producto-nombre"),
    modalVariante: $("modal-variante"),
    modalSku: $("modal-sku"),
    modalCategoria: $("modal-categoria"),
    modalSubcategoria: $("modal-subcategoria"),
    modalPrecio: $("modal-precio"),
    modalListaPrecio: $("modal-lista-precio"),
    modalDescripcion: $("modal-descripcion"),
    galeria: $("galeria-miniaturas"),

    aviso: $("aviso")
};


// ========================================
// ÍCONOS (SVG en línea)
// ========================================

const ICONOS = {

    flecha:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',

    estrella:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path></svg>',

    cerrar:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>',

    imagen:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path></svg>',

    vacio:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5M8.5 11h5"></path></svg>',

    anterior:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>',

    siguiente:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>'
};


// ========================================
// UTILIDADES
// ========================================

// Evita que un texto del JSON rompa el HTML
function esc(valor) {

    return String(valor ?? "").replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c]
    );
}

// Minúsculas y sin tildes, para que "fungicida" encuentre "Fungicída"
function normalizar(texto) {

    return String(texto ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
}

function esVerdadero(valor) {

    if (valor === true) {
        return true;
    }

    const v =
        String(valor ?? "")
            .trim()
            .toUpperCase();

    return ["SI", "SÍ", "1", "TRUE", "VERDADERO"].includes(v);
}

// Mantengo los nombres originales por compatibilidad
const esDestacado = esVerdadero;
const esActivo = esVerdadero;

function rutaImagen(archivo) {

    if (!archivo) {
        return "";
    }

    if (/^(data:|https?:|\/)/i.test(archivo)) {
        return archivo;
    }

    return CONFIG.rutaImagenes + archivo;
}

function obtenerPrecio(producto) {

    if (!producto) {
        return 0;
    }

    const precio = Number(producto[listaPrecioActual] || 0);

    return Number.isFinite(precio) ? precio : 0;
}

function numeroPrecio(producto) {

    return obtenerPrecio(producto).toLocaleString("es-PY");
}

function precioHTML(producto) {

    return `<span class="moneda">Gs.</span>${numeroPrecio(producto)}`;
}

function nombreListaActual() {

    const opcion =
        el.listaPrecios && el.listaPrecios.selectedOptions
            ? el.listaPrecios.selectedOptions[0]
            : null;

    return opcion
        ? opcion.textContent.trim()
        : listaPrecioActual;
}

function textoProductos(n) {

    return n === 1 ? "1 producto" : `${n.toLocaleString("es-PY")} productos`;
}

function esEscritorio() {

    return window.innerWidth >= CONFIG.anchoEscritorio;
}

function debounce(fn, ms) {

    let t;

    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

function leerVistaGuardada() {

    try {
        const v = localStorage.getItem(CONFIG.claveVista);
        return v === "listado" ? "listado" : "tarjetas";
    } catch (e) {
        return "tarjetas";
    }
}

function guardarVista(v) {

    try {
        localStorage.setItem(CONFIG.claveVista, v);
    } catch (e) {
        // Navegador sin almacenamiento: no pasa nada
    }
}

function mostrarAviso(texto) {

    if (!el.aviso) {
        return;
    }

    el.aviso.textContent = texto;
    el.aviso.hidden = false;

    clearTimeout(mostrarAviso.t);

    mostrarAviso.t = setTimeout(() => {
        el.aviso.hidden = true;
    }, 2800);
}


// ========================================
// FILTRAR
// ========================================

function obtenerProductosFiltrados() {

    const palabras =
        normalizar(el.buscador ? el.buscador.value : "")
            .split(/\s+/)
            .filter(Boolean);

    const categoria = el.categoria ? el.categoria.value : "todas";

    const marca = el.marca ? el.marca.value : "todas";

    return productos.filter(producto => {

        const coincideTexto =
            palabras.every(p => producto._busqueda.includes(p));

        const coincideCategoria =
            categoria === "todas" || producto.CATEGORIA === categoria;

        const coincideMarca =
            marca === "todas" || producto.MARCA === marca;

        return coincideTexto && coincideCategoria && coincideMarca;
    });
}


// ========================================
// ORDENAR
// ========================================

function obtenerOrden(producto) {

    const orden = Number(producto.ORDEN);

    return Number.isFinite(orden) && producto.ORDEN !== "" && producto.ORDEN !== null
        ? orden
        : 999999;
}

function ordenarProductos(lista) {

    const tipo = el.orden ? el.orden.value : "recomendados";

    const copia = [...lista];

    const porNombre = (a, b) =>
        String(a.PRODUCTO || "").localeCompare(String(b.PRODUCTO || ""), "es");

    switch (tipo) {

        case "nombre-az":
            return copia.sort(porNombre);

        case "nombre-za":
            return copia.sort((a, b) => porNombre(b, a));

        case "precio-menor":
            return copia.sort((a, b) => obtenerPrecio(a) - obtenerPrecio(b));

        case "precio-mayor":
            return copia.sort((a, b) => obtenerPrecio(b) - obtenerPrecio(a));

        case "recomendados":
        default:
            return copia.sort(
                (a, b) => obtenerOrden(a) - obtenerOrden(b) || porNombre(a, b)
            );
    }
}


// ========================================
// MOSTRAR PRODUCTOS
// ========================================

function mostrarProductos() {

    const lista = ordenarProductos(obtenerProductosFiltrados());

    window.productosVisibles = lista;

    const total = lista.length;

    // Contadores
    if (el.contador) {
        el.contador.textContent = textoProductos(total);
    }

    if (el.aplicarFiltros) {
        el.aplicarFiltros.textContent =
            total === 0 ? "Sin resultados" : `Ver ${textoProductos(total)}`;
    }

    actualizarChips();

    // Clase según vista
    el.lista.className =
        vistaActual === "listado"
            ? "grid-productos vista-listado"
            : "grid-productos";

    // Sin resultados
    if (total === 0) {

        productosPagina = [];

        el.lista.innerHTML = `
            <div class="sin-resultados">
                ${ICONOS.vacio}
                <h3>No encontramos productos</h3>
                <p>Probá con otra palabra o quitá alguno de los filtros aplicados.</p>
                <button class="btn-secundario" type="button" data-accion="limpiar">
                    Limpiar filtros
                </button>
            </div>
        `;

        actualizarPaginacion(0);

        return;
    }

    // Corregir página
    const totalPaginas = Math.ceil(total / CONFIG.productosPorPagina);

    paginaActual = Math.min(Math.max(paginaActual, 1), totalPaginas);

    const inicio = (paginaActual - 1) * CONFIG.productosPorPagina;

    productosPagina = lista.slice(inicio, inicio + CONFIG.productosPorPagina);

    // Dibujar
    el.lista.innerHTML =
        vistaActual === "listado"
            ? htmlListado(productosPagina)
            : htmlTarjetas(productosPagina);

    actualizarPaginacion(total);
}


// ========================================
// VISTA TARJETAS
// ========================================

function htmlImagen(producto, textoVacio) {

    const src = rutaImagen(producto.IMAGEN);

    if (!src) {
        return `
            <div class="imagen-sin-producto">
                ${ICONOS.imagen}
                ${textoVacio ? `<span>${textoVacio}</span>` : ""}
            </div>
        `;
    }

    return `
        <img
            src="${esc(src)}"
            alt="${esc(`${producto.MARCA || ""} ${producto.PRODUCTO || ""}`.trim())}"
            loading="lazy"
        >
    `;
}

function htmlTarjetas(lista) {

    return lista.map((producto, indice) => `

        <article
            class="producto"
            data-indice="${indice}"
            tabindex="0"
            aria-label="${esc(producto.PRODUCTO)}"
        >

            ${esDestacado(producto.DESTACADO)
                ? `<div class="producto-destacado">${ICONOS.estrella}Destacado</div>`
                : ""}

            <div class="producto-imagen">
                ${htmlImagen(producto, "Sin imagen")}
            </div>

            <div class="producto-info">

                <p class="producto-marca">${esc(producto.MARCA)}</p>

                <h3>${esc(producto.PRODUCTO)}</h3>

                <p class="producto-presentacion">${esc(producto.VARIANTE)}</p>

                <div class="producto-pie">

                    <p class="producto-precio">${precioHTML(producto)}</p>

                    <button
                        class="btn-ver-producto"
                        type="button"
                        aria-label="Ver producto ${esc(producto.PRODUCTO)}"
                        tabindex="-1"
                    >
                        ${ICONOS.flecha}
                    </button>

                </div>

            </div>

        </article>

    `).join("");
}


// ========================================
// VISTA LISTADO
// ========================================

function htmlListado(lista) {

    const cabecera = `
        <div class="cabecera-listado" role="row">
            <div class="col-imagen"></div>
            <div class="col-producto">Producto</div>
            <div class="col-marca">Marca</div>
            <div class="col-presentacion">Presentación</div>
            <div class="col-categoria">Categoría</div>
            <div class="col-precio">Precio</div>
            <div class="col-accion"></div>
        </div>
    `;

    const filas = lista.map((producto, indice) => `

        <article
            class="producto-listado"
            data-indice="${indice}"
            tabindex="0"
            aria-label="${esc(producto.PRODUCTO)}"
        >

            <div class="listado-imagen col-imagen">
                ${htmlImagen(producto, "")}
            </div>

            <div class="listado-campo col-producto">

                <div class="listado-producto">
                    ${esc(producto.PRODUCTO || "-")}
                    ${esDestacado(producto.DESTACADO)
                        ? `<span class="listado-estrella" title="Destacado">${ICONOS.estrella}</span>`
                        : ""}
                </div>

                <div class="listado-sku">SKU ${esc(producto.SKU || "-")}</div>

                <div class="listado-meta-movil">
                    <strong>${esc(producto.MARCA)}</strong>
                    ${producto.VARIANTE ? ` · ${esc(producto.VARIANTE)}` : ""}
                </div>

            </div>

            <div class="listado-campo col-marca">
                <div class="listado-marca">${esc(producto.MARCA || "-")}</div>
            </div>

            <div class="listado-campo col-presentacion">
                <div class="listado-valor">${esc(producto.VARIANTE || "-")}</div>
            </div>

            <div class="listado-campo col-categoria">
                <div class="listado-valor">${esc(producto.CATEGORIA || "-")}</div>
            </div>

            <div class="listado-campo col-precio">
                <div class="listado-precio">${precioHTML(producto)}</div>
            </div>

            <div class="listado-acciones col-accion">
                <button
                    class="btn-listado"
                    type="button"
                    aria-label="Ver ${esc(producto.PRODUCTO)}"
                    tabindex="-1"
                >
                    ${ICONOS.siguiente}
                </button>
            </div>

        </article>

    `).join("");

    return cabecera + filas;
}


// ========================================
// CLIC / TECLADO SOBRE LOS PRODUCTOS
// (un solo listener para toda la lista)
// ========================================

el.lista.addEventListener("click", evento => {

    if (evento.target.closest("[data-accion='limpiar']")) {
        limpiarTodo();
        return;
    }

    const item = evento.target.closest("[data-indice]");

    if (item) {
        abrirModal(productosPagina[Number(item.dataset.indice)]);
    }
});

el.lista.addEventListener("keydown", evento => {

    if (evento.key !== "Enter" && evento.key !== " ") {
        return;
    }

    const item = evento.target.closest("[data-indice]");

    if (item && evento.target === item) {
        evento.preventDefault();
        abrirModal(productosPagina[Number(item.dataset.indice)]);
    }
});

// Si una imagen no existe en /img, se muestra el recuadro "Sin imagen"
el.lista.addEventListener("error", evento => {

    const img = evento.target;

    if (img.tagName !== "IMG") {
        return;
    }

    const caja = document.createElement("div");

    caja.className = "imagen-sin-producto";

    caja.innerHTML = ICONOS.imagen;

    img.replaceWith(caja);

}, true);


// ========================================
// PAGINACIÓN
// ========================================

function actualizarPaginacion(totalProductos) {

    let paginacion = $("paginacion-productos");

    if (!paginacion) {

        paginacion = document.createElement("nav");

        paginacion.id = "paginacion-productos";

        paginacion.className = "paginacion-productos";

        paginacion.setAttribute("aria-label", "Paginación");

        el.lista.insertAdjacentElement("afterend", paginacion);

        paginacion.addEventListener("click", evento => {

            const boton = evento.target.closest("[data-pagina]");

            if (boton && !boton.disabled) {
                irAPagina(Number(boton.dataset.pagina));
            }
        });
    }

    const totalPaginas = Math.ceil(totalProductos / CONFIG.productosPorPagina);

    if (totalPaginas <= 1) {
        paginacion.hidden = true;
        paginacion.innerHTML = "";
        return;
    }

    paginacion.hidden = false;

    // Números visibles: 1 … 4 5 [6] 7 8 … 20
    const vecinos = window.innerWidth < 600 ? 1 : 2;

    const paginas = [];

    for (let n = 1; n <= totalPaginas; n++) {

        if (n === 1 || n === totalPaginas || Math.abs(n - paginaActual) <= vecinos) {
            paginas.push(n);
        } else if (paginas[paginas.length - 1] !== "…") {
            paginas.push("…");
        }
    }

    const numeros = paginas.map(n =>
        n === "…"
            ? `<span class="pagina-puntos">…</span>`
            : `<button
                    type="button"
                    class="pagina-boton${n === paginaActual ? " pagina-activa" : ""}"
                    data-pagina="${n}"
                    ${n === paginaActual ? 'aria-current="page"' : ""}
               >${n}</button>`
    ).join("");

    const desde = (paginaActual - 1) * CONFIG.productosPorPagina + 1;

    const hasta = Math.min(paginaActual * CONFIG.productosPorPagina, totalProductos);

    paginacion.innerHTML = `

        <div class="paginacion-controles">

            <button
                type="button"
                class="pagina-boton pagina-anterior"
                data-pagina="${paginaActual - 1}"
                aria-label="Página anterior"
                ${paginaActual === 1 ? "disabled" : ""}
            >
                ${ICONOS.anterior}<span class="pagina-texto">Anterior</span>
            </button>

            ${numeros}

            <button
                type="button"
                class="pagina-boton pagina-siguiente"
                data-pagina="${paginaActual + 1}"
                aria-label="Página siguiente"
                ${paginaActual === totalPaginas ? "disabled" : ""}
            >
                <span class="pagina-texto">Siguiente</span>${ICONOS.siguiente}
            </button>

        </div>

        <p class="paginacion-info">
            Mostrando ${desde}–${hasta} de ${totalProductos.toLocaleString("es-PY")}
        </p>
    `;
}

function irAPagina(numero) {

    paginaActual = numero;

    mostrarProductos();

    desplazarArribaProductos();
}

function desplazarArribaProductos() {

    const barra = document.querySelector(".barra-resultados");

    const header = document.querySelector(".topbar");

    if (!barra) {
        return;
    }

    const alto = header ? header.offsetHeight : 0;

    const posicion =
        barra.getBoundingClientRect().top + window.scrollY - alto - 12;

    window.scrollTo({ top: Math.max(posicion, 0), behavior: "smooth" });
}


// ========================================
// CHIPS DE FILTROS ACTIVOS
// ========================================

function actualizarChips() {

    const chips = [];

    const texto = el.buscador ? el.buscador.value.trim() : "";

    if (texto) {
        chips.push({ tipo: "busqueda", etiqueta: "Búsqueda", valor: `“${texto}”` });
    }

    if (el.categoria && el.categoria.value !== "todas") {
        chips.push({ tipo: "categoria", etiqueta: "Categoría", valor: el.categoria.value });
    }

    if (el.marca && el.marca.value !== "todas") {
        chips.push({ tipo: "marca", etiqueta: "Marca", valor: el.marca.value });
    }

    if (el.listaPrecios && el.listaPrecios.value !== CONFIG.listaPorDefecto) {
        chips.push({ tipo: "lista", etiqueta: "Lista", valor: nombreListaActual() });
    }

    if (el.orden && el.orden.value !== "recomendados") {
        chips.push({
            tipo: "orden",
            etiqueta: "Orden",
            valor: el.orden.selectedOptions[0].textContent.trim()
        });
    }

    // Número en el botón "Filtros" (no cuenta la búsqueda: ya se ve arriba)
    const cantidad = chips.filter(c => c.tipo !== "busqueda").length;

    if (el.badgeFiltros) {
        el.badgeFiltros.textContent = cantidad;
        el.badgeFiltros.hidden = cantidad === 0;
    }

    if (!el.chips) {
        return;
    }

    el.chips.innerHTML =
        chips.map(c => `
            <button class="chip" type="button" data-quitar="${c.tipo}" title="Quitar filtro">
                <span class="chip-texto"><small>${c.etiqueta}:</small> ${esc(c.valor)}</span>
                <span class="chip-quitar">${ICONOS.cerrar}</span>
            </button>
        `).join("") +
        (chips.length >= 2
            ? `<button class="chip-limpiar-todo" type="button" data-quitar="todo">Limpiar todo</button>`
            : "");
}

if (el.chips) {

    el.chips.addEventListener("click", evento => {

        const chip = evento.target.closest("[data-quitar]");

        if (!chip) {
            return;
        }

        switch (chip.dataset.quitar) {

            case "busqueda":
                el.buscador.value = "";
                break;

            case "categoria":
                el.categoria.value = "todas";
                break;

            case "marca":
                el.marca.value = "todas";
                break;

            case "lista":
                el.listaPrecios.value = CONFIG.listaPorDefecto;
                listaPrecioActual = CONFIG.listaPorDefecto;
                break;

            case "orden":
                el.orden.value = "recomendados";
                break;

            case "todo":
                limpiarTodo();
                return;
        }

        filtrarProductos();
    });
}


// ========================================
// PANEL DE FILTROS (tablet / móvil)
// ========================================

function abrirPanel() {

    if (!el.panel || esEscritorio()) {
        return;
    }

    el.panel.classList.add("abierto");

    el.overlay.classList.add("visible");

    document.body.classList.add("sin-scroll");

    if (el.abrirFiltros) {
        el.abrirFiltros.setAttribute("aria-expanded", "true");
    }

    setTimeout(() => el.cerrarFiltros && el.cerrarFiltros.focus(), 50);
}

function cerrarPanel() {

    if (!el.panel || !el.panel.classList.contains("abierto")) {
        return;
    }

    el.panel.classList.remove("abierto");

    el.overlay.classList.remove("visible");

    if (el.modal.classList.contains("oculto")) {
        document.body.classList.remove("sin-scroll");
    }

    if (el.abrirFiltros) {
        el.abrirFiltros.setAttribute("aria-expanded", "false");
        el.abrirFiltros.focus();
    }
}

el.abrirFiltros && el.abrirFiltros.addEventListener("click", abrirPanel);
el.cerrarFiltros && el.cerrarFiltros.addEventListener("click", cerrarPanel);
el.overlay && el.overlay.addEventListener("click", cerrarPanel);

el.aplicarFiltros && el.aplicarFiltros.addEventListener("click", () => {
    cerrarPanel();
    desplazarArribaProductos();
});


// ========================================
// CAMBIAR VISTA
// ========================================

function cambiarVista(vista) {

    vistaActual = vista;

    guardarVista(vista);

    [
        [el.vistaTarjetas, "tarjetas"],
        [el.vistaListado, "listado"]
    ].forEach(([boton, nombre]) => {

        if (!boton) {
            return;
        }

        boton.classList.toggle("activo", vistaActual === nombre);

        boton.setAttribute("aria-pressed", String(vistaActual === nombre));
    });

    mostrarProductos();
}

el.vistaTarjetas && el.vistaTarjetas.addEventListener("click", () => cambiarVista("tarjetas"));
el.vistaListado && el.vistaListado.addEventListener("click", () => cambiarVista("listado"));


// ========================================
// MODAL / FICHA DEL PRODUCTO
// ========================================

function abrirModal(producto) {

    if (!el.modal || !producto) {
        return;
    }

    ultimoFoco = document.activeElement;

    el.modalMarca.textContent = producto.MARCA || "";

    el.modalMarca.hidden = !producto.MARCA;

    if (el.modalDestacado) {
        el.modalDestacado.hidden = !esDestacado(producto.DESTACADO);
    }

    el.modalNombre.textContent = producto.PRODUCTO || "";

    el.modalVariante.textContent = producto.VARIANTE || "-";

    el.modalSku.textContent = producto.SKU || "-";

    el.modalCategoria.textContent = producto.CATEGORIA || "-";

    el.modalSubcategoria.textContent = producto.SUBCATEGORIA || "-";

    el.modalPrecio.innerHTML = precioHTML(producto);

    if (el.modalListaPrecio) {
        el.modalListaPrecio.textContent = nombreListaActual();
    }

    el.modalDescripcion.textContent =
        producto.DESCRIPCION_LARGA ||
        producto.DESCRIPCION_CORTA ||
        "Sin descripción disponible.";

    prepararGaleria(producto);

    el.modal.classList.remove("oculto");

    document.body.classList.add("sin-scroll");

    const contenido = el.modal.querySelector(".modal-contenido");

    if (contenido) {
        contenido.scrollTop = 0;
    }

    setTimeout(() => el.cerrarModal && el.cerrarModal.focus(), 50);
}

function cerrarFichaProducto() {

    if (!el.modal || el.modal.classList.contains("oculto")) {
        return;
    }

    el.modal.classList.add("oculto");

    if (!el.panel || !el.panel.classList.contains("abierto")) {
        document.body.classList.remove("sin-scroll");
    }

    if (ultimoFoco && ultimoFoco.focus) {
        ultimoFoco.focus();
    }
}

el.cerrarModal && el.cerrarModal.addEventListener("click", cerrarFichaProducto);

el.modal && el.modal.addEventListener("click", evento => {

    if (evento.target === el.modal) {
        cerrarFichaProducto();
    }
});

document.addEventListener("keydown", evento => {

    if (evento.key === "Escape") {
        cerrarFichaProducto();
        cerrarPanel();
    }
});


// ========================================
// GALERÍA DEL MODAL
// ========================================

function prepararGaleria(producto) {

    const contenedor = el.modalImg.parentElement;

    let imagenes =
        Array.isArray(producto.IMAGENES) && producto.IMAGENES.length > 0
            ? [...producto.IMAGENES]
            : [];

    imagenes = imagenes
        .filter(img => img && img.ARCHIVO)
        .sort((a, b) => Number(a.ORDEN || 999999) - Number(b.ORDEN || 999999));

    // Respaldo: si no hay galería, uso IMAGEN
    if (imagenes.length === 0 && producto.IMAGEN) {
        imagenes = [{ ARCHIVO: producto.IMAGEN, ORDEN: 1, PRINCIPAL: true }];
    }

    el.galeria.innerHTML = "";

    el.modalImg.alt = producto.PRODUCTO || "Producto";

    // Sin imágenes
    if (imagenes.length === 0) {
        el.modalImg.removeAttribute("src");
        contenedor.classList.add("sin-imagen");
        return;
    }

    contenedor.classList.remove("sin-imagen");

    el.modalImg.onerror = () => contenedor.classList.add("sin-imagen");

    const principal =
        imagenes.find(img => esVerdadero(img.PRINCIPAL)) || imagenes[0];

    el.modalImg.src = rutaImagen(principal.ARCHIVO);

    // Solo muestro miniaturas si hay más de una imagen
    if (imagenes.length < 2) {
        return;
    }

    imagenes.forEach((imagen, indice) => {

        const miniatura = document.createElement("button");

        miniatura.type = "button";

        miniatura.className = "miniatura-producto";

        miniatura.setAttribute("aria-label", `Imagen ${indice + 1}`);

        if (imagen === principal) {
            miniatura.classList.add("miniatura-activa");
        }

        const img = document.createElement("img");

        img.src = rutaImagen(imagen.ARCHIVO);

        img.alt = "";

        img.loading = "lazy";

        miniatura.appendChild(img);

        miniatura.addEventListener("click", () => {

            contenedor.classList.remove("sin-imagen");

            el.modalImg.src = rutaImagen(imagen.ARCHIVO);

            el.galeria
                .querySelectorAll(".miniatura-producto")
                .forEach(m => m.classList.remove("miniatura-activa"));

            miniatura.classList.add("miniatura-activa");
        });

        el.galeria.appendChild(miniatura);
    });
}


// ========================================
// CARGAR OPCIONES DE CATEGORÍA Y MARCA
// ========================================

function cargarOpciones(select, campo, textoTodas) {

    if (!select) {
        return;
    }

    const valores =
        [...new Set(productos.map(p => p[campo]).filter(Boolean))]
            .sort((a, b) => String(a).localeCompare(String(b), "es"));

    select.innerHTML =
        `<option value="todas">${textoTodas}</option>` +
        valores.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
}

function cargarCategorias() {
    cargarOpciones(el.categoria, "CATEGORIA", "Todas las categorías");
}

function cargarMarcas() {
    cargarOpciones(el.marca, "MARCA", "Todas las marcas");
}


// ========================================
// EVENTOS DE FILTROS
// ========================================

function filtrarProductos() {

    paginaActual = 1;

    if (el.limpiarBusqueda && el.buscador) {
        el.limpiarBusqueda.hidden = el.buscador.value === "";
    }

    mostrarProductos();
}

function limpiarTodo() {

    if (el.buscador) el.buscador.value = "";
    if (el.categoria) el.categoria.value = "todas";
    if (el.marca) el.marca.value = "todas";
    if (el.orden) el.orden.value = "recomendados";

    if (el.listaPrecios) {
        el.listaPrecios.value = CONFIG.listaPorDefecto;
    }

    listaPrecioActual = CONFIG.listaPorDefecto;

    filtrarProductos();
}

if (el.buscador) {
    el.buscador.addEventListener("input", debounce(filtrarProductos, 150));
}

if (el.limpiarBusqueda) {

    el.limpiarBusqueda.addEventListener("click", () => {
        el.buscador.value = "";
        filtrarProductos();
        el.buscador.focus();
    });
}

el.categoria && el.categoria.addEventListener("change", filtrarProductos);
el.marca && el.marca.addEventListener("change", filtrarProductos);
el.orden && el.orden.addEventListener("change", filtrarProductos);

if (el.listaPrecios) {

    el.listaPrecios.addEventListener("change", () => {
        listaPrecioActual = el.listaPrecios.value || CONFIG.listaPorDefecto;
        filtrarProductos();
    });
}

el.limpiarFiltros && el.limpiarFiltros.addEventListener("click", limpiarTodo);


// ========================================
// REDIMENSIONAR VENTANA
// ========================================

window.addEventListener("resize", debounce(() => {

    // Si pasa a escritorio con el panel abierto, lo cierro
    if (esEscritorio()) {
        cerrarPanel();
    }

    // Recalcula la cantidad de números de página visibles
    if (productos.length) {
        actualizarPaginacion(window.productosVisibles.length);
    }

}, 200));


// ========================================
// PDF
// ========================================

function prepararPdf() {

    const productosPdf = window.productosVisibles || [];

    if (productosPdf.length === 0) {
        mostrarAviso("No hay productos para generar el PDF.");
        return false;
    }

    // Encabezado
    if (el.pdfContador) {

        const partes = [textoProductos(productosPdf.length)];

        if (el.categoria && el.categoria.value !== "todas") {
            partes.push(`Categoría: ${el.categoria.value}`);
        }

        if (el.marca && el.marca.value !== "todas") {
            partes.push(`Marca: ${el.marca.value}`);
        }

        el.pdfContador.textContent = partes.join("  ·  ");
    }

    if (el.pdfFecha) {
        el.pdfFecha.textContent = new Date().toLocaleDateString("es-PY", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    if (el.pdfLista) {
        el.pdfLista.textContent = nombreListaActual();
    }

    // Tabla
    const filas = productosPdf.map(producto => {

        const src = rutaImagen(producto.IMAGEN);

        return `
            <tr>
                <td>
                    <div class="pdf-imagen">
                        ${src ? `<img src="${esc(src)}" alt="">` : "—"}
                    </div>
                </td>
                <td>
                    <div class="pdf-nombre">${esc(producto.PRODUCTO || "-")}</div>
                    <div class="pdf-sub">
                        ${esc(producto.VARIANTE || "")}
                        ${producto.SKU ? ` · SKU ${esc(producto.SKU)}` : ""}
                    </div>
                </td>
                <td class="pdf-marca">${esc(producto.MARCA || "-")}</td>
                <td>${esc(producto.CATEGORIA || "-")}</td>
                <td class="pdf-precio">Gs. ${numeroPrecio(producto)}</td>
            </tr>
        `;
    }).join("");

    el.pdfProductos.innerHTML = `
        <table class="pdf-tabla">
            <thead>
                <tr>
                    <th class="pdf-col-imagen">Imagen</th>
                    <th>Producto</th>
                    <th class="pdf-col-marca">Marca</th>
                    <th class="pdf-col-categoria">Categoría</th>
                    <th class="pdf-col-precio">Precio</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
    `;

    return true;
}

// Espera a que carguen las imágenes del PDF (máximo 2,5 s)
function esperarImagenes(contenedor, maxMs = 2500) {

    const imagenes = [...contenedor.querySelectorAll("img")];

    const promesas = imagenes.map(img =>
        img.complete
            ? Promise.resolve()
            : new Promise(resolver => {
                img.onload = resolver;
                img.onerror = resolver;
            })
    );

    return Promise.race([
        Promise.all(promesas),
        new Promise(resolver => setTimeout(resolver, maxMs))
    ]);
}

if (el.generarPdf) {

    el.generarPdf.addEventListener("click", async () => {

        if (!prepararPdf()) {
            return;
        }

        el.generarPdf.disabled = true;

        await esperarImagenes(el.areaPdf);

        el.generarPdf.disabled = false;

        window.print();
    });
}


// ========================================
// CARGA INICIAL
// ========================================

function mostrarEsqueleto() {

    el.lista.className = "grid-productos";

    el.lista.innerHTML = Array.from({ length: 8 }, () => `
        <div class="producto esqueleto">
            <div class="producto-imagen"></div>
            <div class="producto-info">
                <div class="esqueleto-linea" style="width:40%"></div>
                <div class="esqueleto-linea" style="width:85%"></div>
                <div class="esqueleto-linea" style="width:55%"></div>
            </div>
        </div>
    `).join("");
}

function iniciarCatalogo(datos) {

    productos =
        (Array.isArray(datos) ? datos : [])
            .filter(producto => esActivo(producto.ACTIVO))
            .map(producto => ({
                ...producto,
                // Texto donde busca el buscador (sin tildes)
                _busqueda: normalizar([
                    producto.SKU,
                    producto.MARCA,
                    producto.PRODUCTO,
                    producto.VARIANTE,
                    producto.CATEGORIA,
                    producto.SUBCATEGORIA
                ].join(" "))
            }));

    console.log("PRODUCTOS ACTIVOS:", productos.length);

    cargarCategorias();

    cargarMarcas();

    if (el.listaPrecios) {
        el.listaPrecios.value = CONFIG.listaPorDefecto;
    }

    listaPrecioActual = CONFIG.listaPorDefecto;

    paginaActual = 1;

    cambiarVista(vistaActual);
}

mostrarEsqueleto();

// Si la página define window.CATALOGO_DATOS (por ejemplo en una demo),
// se usa directamente; si no, se lee productos.json como siempre.
const fuenteDatos =
    Array.isArray(window.CATALOGO_DATOS)
        ? Promise.resolve(window.CATALOGO_DATOS)
        : fetch(CONFIG.archivoDatos).then(respuesta => {

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar productos.json");
            }

            return respuesta.json();
        });

fuenteDatos
    .then(iniciarCatalogo)
    .catch(error => {

        console.error("Error al cargar productos:", error);

        if (el.contador) {
            el.contador.textContent = "Error de carga";
        }

        el.lista.className = "grid-productos";

        el.lista.innerHTML = `
            <div class="sin-resultados">
                ${ICONOS.vacio}
                <h3>No se pudieron cargar los productos</h3>
                <p>Revisá que el archivo productos.json esté en la carpeta del catálogo.</p>
            </div>
        `;
    });
