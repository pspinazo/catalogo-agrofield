# Estructura técnica – Catálogo Agrofield

## 1. Objetivo

Este documento describe la estructura del repositorio del Catálogo Agrofield y la función de cada archivo y carpeta.

El repositorio contiene únicamente los archivos necesarios para ejecutar y publicar el catálogo.

El archivo Excel utilizado para administrar los productos se mantiene fuera del repositorio.

---

# 2. Ubicación del repositorio

El repositorio se encuentra en:

Z:\Catalogo Comercial\GitHub\catalogo-agrofield

---

# 3. Estructura del repositorio

La estructura actual es:

catalogo-agrofield
│
├── index.html
├── productos.json
│
├── css
│   └── styles.css
│
├── js
│   └── app.js
│
├── img
│   └── imágenes de productos
│
└── docs
    ├── README.md
    ├── manual-actualizacion.md
    └── estructura-catalogo.md

---

# 4. index.html

Archivo principal del catálogo.

Contiene la estructura HTML de la página.

Es el archivo que carga el navegador cuando se accede al catálogo.

No contiene la información completa de los productos.

Los productos se cargan desde:

productos.json

---

# 5. productos.json

Contiene la información utilizada por el catálogo.

Los datos se generan automáticamente desde el archivo Excel mediante la macro VBA:

ActualizarCatalogo

El archivo contiene información como:

- SKU
- Marca
- Producto
- Variante
- Categoría
- Subcategoría
- Descripción corta
- Descripción larga
- Precio
- Imagen principal
- Estado activo
- Producto destacado
- Orden
- Galería de imágenes

No modificar este archivo manualmente.

Si se necesita cambiar información de productos, realizar el cambio en Excel y volver a ejecutar la macro.

---

# 6. Carpeta css

Ubicación:

css

Contiene los archivos relacionados con el diseño visual del catálogo.

Actualmente contiene:

styles.css

Este archivo controla aspectos como:

- Diseño de las tarjetas.
- Tipografías.
- Colores.
- Espaciados.
- Botones.
- Filtros.
- Buscador.
- Paginación.
- Diseño responsive.
- Distribución general de la página.

---

# 7. Carpeta js

Ubicación:

js

Contiene la lógica de funcionamiento del catálogo.

Actualmente contiene:

app.js

Este archivo controla funciones como:

- Carga de productos.
- Buscador.
- Filtros.
- Categorías.
- Marcas.
- Ordenamiento.
- Paginación.
- Visualización de productos.
- Galería de imágenes.
- Información de cada producto.

No modificar este archivo salvo que se esté realizando una modificación al funcionamiento del catálogo.

---

# 8. Carpeta img

Ubicación:

img

Contiene las imágenes utilizadas por los productos del catálogo.

Ejemplo:

img\producto123.jpg

El nombre del archivo debe coincidir con el nombre indicado en el campo:

IMAGEN

de la tabla:

tblProductos

del archivo Excel.

---

# 9. Carpeta docs

Ubicación:

docs

Contiene la documentación interna del proyecto.

Actualmente incluye:

README.md

Información general del proyecto.

manual-actualizacion.md

Procedimiento para actualizar el catálogo.

estructura-catalogo.md

Descripción técnica de la estructura del proyecto.

Los archivos de documentación no son necesarios para que el catálogo funcione.

---

# 10. Archivo Excel

El archivo Excel utilizado como fuente de información es:

Catalogo_Agrofield.xlsm

Este archivo NO forma parte del repositorio.

Su función es almacenar y administrar la información original de los productos.

La macro VBA genera el archivo:

productos.json

---

# 11. Relación entre Excel y catálogo

El flujo de información es:

Catalogo_Agrofield.xlsm
        │
        │
        ▼
Macro ActualizarCatalogo
        │
        │
        ▼
productos.json
        │
        │
        ▼
index.html
        │
        ├──────────────┐
        ▼              ▼
     app.js         styles.css
        │
        ▼
      img
        │
        ▼
Catálogo visual

---

# 12. Archivos administrados por Git

Los siguientes elementos forman parte del repositorio:

- index.html
- productos.json
- css/
- js/
- img/
- docs/

Los cambios realizados sobre estos archivos pueden ser detectados por GitHub Desktop.

---

# 13. Archivo fuera del repositorio

El archivo:

Catalogo_Agrofield.xlsm

se mantiene fuera del repositorio.

Esto es intencional.

El archivo Excel puede modificarse diariamente sin generar cambios innecesarios en GitHub Desktop.

---

# 14. Qué modificar según la necesidad

## Cambiar información de un producto

Modificar:

Catalogo_Agrofield.xlsm

Luego ejecutar:

ActualizarCatalogo

---

## Agregar un producto

1. Agregar el producto en Excel.
2. Agregar su imagen en `img`, si corresponde.
3. Indicar el nombre de la imagen en el campo `IMAGEN`.
4. Ejecutar `ActualizarCatalogo`.
5. Revisar el catálogo.
6. Realizar Commit y Push.

---

## Cambiar una imagen

1. Reemplazar o agregar la imagen correspondiente dentro de `img`.
2. Mantener el mismo nombre indicado en Excel.
3. Revisar el catálogo.
4. Realizar Commit y Push.

---

## Cambiar el diseño

Modificar:

css/styles.css

---

## Cambiar el funcionamiento

Modificar:

js/app.js

---

## Cambiar la estructura de la página

Modificar:

index.html

---

# 15. Archivos que no deben eliminarse

No eliminar sin comprobar previamente:

- index.html
- productos.json
- css/
- js/
- img/

La eliminación o modificación incorrecta de cualquiera de estos elementos puede afectar el funcionamiento del catálogo.

---

# 16. GitHub Pages

GitHub Pages utiliza el contenido del repositorio para publicar el catálogo.

Por lo tanto:

Excel
→ genera productos.json
→ GitHub Desktop detecta cambios
→ Commit
→ Push
→ GitHub Pages publica los cambios

---

# 17. Regla principal del proyecto

El Excel es la fuente de información de los productos.

El JSON es el resultado generado.

El catálogo web utiliza el JSON.

Por lo tanto:

NO modificar productos.json manualmente.

Los cambios de productos deben realizarse primero en Excel.