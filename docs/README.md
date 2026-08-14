# Catálogo Agrofield

Catálogo comercial interactivo de productos Agrofield.

## Objetivo

Este proyecto permite consultar el catálogo de productos desde un navegador web, incluyendo información comercial, precios e imágenes.

## Componentes principales

- `index.html`: estructura principal del catálogo.
- `productos.json`: información de los productos.
- `css/styles.css`: diseño y estilos.
- `js/app.js`: funcionamiento del catálogo.
- `img/`: imágenes de los productos.
- `docs/`: documentación para el mantenimiento del proyecto.

## Archivo maestro

Los datos originales se mantienen en:

`Z:\Catalogo Comercial\GitHub\Catalogo_Agrofield.xlsm`

El archivo Excel está fuera del repositorio para evitar que sus modificaciones sean registradas por Git.

## Actualización

Los productos se mantienen desde Excel.

El archivo `productos.json` se genera mediante la macro `ActualizarCatalogo`.

Después de generar el JSON, GitHub Desktop debe utilizarse para revisar, confirmar y publicar los cambios.