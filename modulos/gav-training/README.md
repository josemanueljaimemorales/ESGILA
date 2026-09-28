# GAV Training — ESGILA

Este módulo está contenido físicamente dentro del repositorio del cliente.

- `index.html`: interfaz del módulo.
- `trabajo_gav.xlsx`: **fuente principal de datos** que lee la aplicación al cargar.
- `data.json`: respaldo histórico; la aplicación ya no lo usa como fuente principal.
- `../../cliente/xlsx-reader.js`: lector XLSX local, sin dependencia externa.
- Si modificas nombres, niveles, grupos o ejercicios en `trabajo_gav.xlsx` y reemplazas el archivo en GitHub, GAV Training leerá los nuevos datos al volver a cargar.
