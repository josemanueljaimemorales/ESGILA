# ESGILA — PLATAFORMA WHITE LABEL

Repositorio autónomo para un gimnasio cliente.

## Cambiar identidad
Editar solamente `cliente/config.js` y sustituir `cliente/logo.png`.

Los módulos están dentro de `modulos/` y ya no dependen de URLs de los repositorios AKC para abrirse desde el portal.

## Importante
Los módulos están contenidos físicamente dentro de este repositorio y conservan sus archivos de datos/Excel. El módulo de Fuerza y Prevención conserva su integración técnica actual; para una venta real debe asignarse una configuración independiente por gimnasio.


## Módulos incluidos
Básicos · Sistemas · Fuerza · Rutinas · Cargas · GAV Training · Normativos · Enlace a archivos de planificación y horarios

El módulo Normativos está físicamente dentro de `modulos/normativos/` y no enlaza al repositorio de Normativos AKC. Su Excel y `database.json` están dentro del módulo.


### Enlace a archivos de planificación y horarios
El botón usa `cliente/config.js` → `onedrive` para abrir el enlace externo de OneDrive en una nueva pestaña.
