# Manual de actualización – Catálogo Agrofield

## 1. Objetivo

Este documento explica el procedimiento para actualizar el Catálogo Agrofield.

El proceso utiliza:

- Un archivo Excel XLSM como fuente de información.
- Una macro VBA para generar el archivo `productos.json`.
- Una carpeta `img` para almacenar las imágenes.
- GitHub Desktop para publicar los cambios.
- GitHub Pages para visualizar el catálogo.

---

# 2. Ubicación de los archivos

La estructura principal es:

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


El repositorio se encuentra en:

Z:\Catalogo Comercial\GitHub\catalogo-agrofield

El archivo Excel XLSM se mantiene FUERA del repositorio para evitar que sus modificaciones sean registradas por GitHub.

La ubicación del Excel es:

Z:\Catalogo Comercial\GitHub\Catalogo_Agrofield.xlsm

---

# 3. Antes de realizar una actualización

Antes de modificar información:

1. Verificar que la unidad de red `Z:` esté disponible.
2. Verificar que el repositorio esté accesible.
3. Abrir el archivo `Catalogo_Agrofield.xlsm`.
4. Confirmar que no haya otra persona modificando el archivo simultáneamente.

---

# 4. Actualizar productos

Abrir:

`Catalogo_Agrofield.xlsm`

La información de productos se encuentra en:

- Hoja: `PRODUCTOS`
- Tabla: `tblProductos`

Los principales campos utilizados son:

- SKU
- MARCA
- PRODUCTO
- VARIANTE
- CATEGORIA
- SUBCATEGORIA
- DESCRIPCION_CORTA
- DESCRIPCION_LARGA
- PRECIO
- IMAGEN
- ACTIVO
- DESTACADO
- ORDEN

Modificar la información necesaria directamente en la tabla.

---

# 5. Actualizar imágenes

Las imágenes utilizadas por el catálogo se encuentran en:

`Z:\Catalogo Comercial\GitHub\catalogo-agrofield\img`

El nombre indicado en la columna `IMAGEN` del Excel debe coincidir con el nombre del archivo existente dentro de `img`.

Ejemplo:

Excel:

`IMAGEN = producto123.jpg`

Carpeta:

`img\producto123.jpg`

El nombre debe coincidir exactamente.

---

# 6. Revisar imágenes

Antes de publicar una actualización se recomienda ejecutar el script de comparación de imágenes.

Este script permite identificar:

- Productos que tienen imagen.
- Productos que no tienen imagen.
- Imágenes existentes en `img` que no están asociadas a ningún producto.
- Posibles imágenes innecesarias.

Esto ayuda a evitar que la carpeta `img` acumule archivos que ya no son utilizados.

---

# 7. Generar productos.json

Una vez actualizada la información del Excel:

1. Guardar el archivo Excel.
2. Ejecutar la macro:

`ActualizarCatalogo`

La macro genera automáticamente:

`productos.json`

El archivo se genera directamente dentro del repositorio:

`Z:\Catalogo Comercial\GitHub\catalogo-agrofield\productos.json`

No modificar manualmente `productos.json`.

El archivo debe ser generado siempre mediante la macro.

---

# 8. Verificar el catálogo

Después de generar `productos.json`:

1. Abrir el catálogo.
2. Verificar que los productos aparezcan correctamente.
3. Utilizar el buscador.
4. Revisar las categorías y marcas.
5. Abrir algunos productos.
6. Verificar las imágenes.
7. Verificar los precios.
8. Verificar que no existan errores visibles.

Si se detecta un problema, corregir primero el Excel o las imágenes y volver a ejecutar la macro.

---

# 9. GitHub Desktop

Una vez comprobado que el catálogo funciona:

1. Abrir GitHub Desktop.
2. Seleccionar el repositorio:

`catalogo-agrofield`

3. Verificar los archivos modificados.
4. Revisar especialmente:

`productos.json`

y cualquier imagen nueva o eliminada dentro de:

`img`

5. Escribir un mensaje descriptivo en el campo de commit.

Ejemplos:

`Actualización de precios`

`Alta de nuevos productos`

`Actualización de productos e imágenes`

`Corrección de imágenes`

6. Realizar el Commit.
7. Ejecutar:

`Push origin`

---

# 10. Publicación en GitHub Pages

Después de realizar el Push, GitHub Pages actualizará el catálogo publicado.

La actualización puede demorar algunos momentos.

Una vez realizada la publicación:

1. Abrir el enlace del catálogo.
2. Actualizar la página.
3. Comprobar nuevamente algunos productos.
4. Verificar imágenes y precios.

---

# 11. Archivos que NO deben modificarse manualmente

No modificar directamente:

`productos.json`

El archivo debe ser generado mediante la macro VBA.

Tampoco modificar:

`app.js`

o

`styles.css`

salvo que se esté realizando una modificación específica al funcionamiento o diseño del catálogo.

---

# 12. Archivos que NO deben subirse al repositorio

El archivo:

`Catalogo_Agrofield.xlsm`

debe permanecer fuera del repositorio.

No copiar el XLSM dentro de:

`catalogo-agrofield`

Esto evita que GitHub Desktop registre las modificaciones realizadas en Excel.

---

# 13. Flujo resumido

El proceso normal de actualización es:

Excel
↓
Actualizar información
↓
Guardar XLSM
↓
Ejecutar macro ActualizarCatalogo
↓
Se genera productos.json
↓
Revisar imágenes
↓
Probar catálogo
↓
GitHub Desktop
↓
Commit
↓
Push origin
↓
GitHub Pages
↓
Catálogo actualizado

---

# 14. Recomendaciones

Siempre realizar una prueba del catálogo antes de publicar.

No eliminar imágenes sin comprobar primero si están siendo utilizadas.

No modificar manualmente `productos.json`.

No mover las carpetas `css`, `js` o `img`.

No cambiar los nombres de los archivos principales sin verificar previamente las referencias existentes.

Mantener una copia de seguridad del archivo Excel.

---

# 15. Responsable de actualización

Responsable actual:

Catálogo Agrofield

Este documento debe actualizarse si cambia el procedimiento de generación, publicación o mantenimiento del catálogo.