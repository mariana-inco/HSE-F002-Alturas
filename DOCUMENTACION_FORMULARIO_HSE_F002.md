# Documentación del formulario HSE-F002

Este documento explica, en lenguaje sencillo, qué hace cada archivo del proyecto y dónde está la parte más compleja de la solución.

## Visión General

El formulario HSE-F002 está construido con Next.js y está dividido en secciones para que sea más fácil de llenar, validar y mantener.

La idea principal del proyecto es:
- mostrar una sola pantalla por paso
- validar la información antes de avanzar
- capturar firmas dibujadas en canvas
- guardar todo en un JSON limpio al enviar

## Qué hace cada archivo

### `app/page.tsx`

Es el archivo principal y funciona como el orquestador del formulario.

Aquí vive la lógica más importante:
- estado del paso actual
- navegación con `Anterior` y `Siguiente`
- validación de campos obligatorios
- control de las declaraciones `DECLARO`
- armado del JSON final
- descarga o impresión del formulario enviado

En pocas palabras, este archivo decide qué se ve, cuándo se puede avanzar y qué datos se envían.

### `app/secciones-formulario.tsx`

Aquí están las secciones visuales del formulario.

Cada bloque importante del formulario vive aquí:
- datos generales
- interventores
- materiales y seguridad
- EPP y accesos
- ATS
- firmas y aprobación final

Este archivo ayuda a que `page.tsx` no se vuelva demasiado largo.  
También contiene pequeños componentes internos que se repiten, como el bloque de horas y la tarjeta de firma.

### `app/componentes-formulario.tsx`

Contiene componentes reutilizables para no repetir el mismo HTML una y otra vez.

Por ejemplo:
- contenedor de sección
- input de texto
- textarea
- select
- grilla de checkboxes

Este archivo hace que el formulario sea más limpio y más fácil de leer.

### `app/firma-canvas.tsx`

Este archivo se encarga de una de las partes más delicadas del proyecto: las firmas.

Aquí se maneja:
- el canvas donde se dibuja la firma
- el guardado del trazo como imagen base64
- el redibujado de la firma al volver a una sección
- el ajuste automático al tamaño del contenedor
- el botón `Limpiar firma`

Es una pieza importante porque conserva la firma incluso cuando el usuario cambia de sección.

### `app/configuracion-formulario.ts`

Aquí está la configuración estática del formulario.

Incluye:
- tipos de trabajo
- tipos de documento
- opciones Sí / No
- horas y minutos
- listas de riesgos
- listas de EPP
- listas de accesos
- títulos de los pasos

Este archivo centraliza los datos que casi no cambian, para que el resto del código no tenga textos repetidos.

### `app/globals.css`

Contiene los estilos globales del proyecto.

Aquí se define:
- tipografía
- espaciado
- estructura del encabezado
- tarjetas
- tabla de interventores
- firmas
- stepper de progreso
- responsive para móvil

Si algo visual cambia en todo el formulario, normalmente se ajusta aquí.

### `app/layout.tsx`

Define la estructura base de la aplicación.

Se encarga de:
- cargar los estilos globales
- definir el idioma
- envolver la página principal

### `README.md`

Es una guía breve para entender el proyecto rápidamente.

Incluye:
- estructura básica
- comandos de desarrollo
- comandos de build y lint

### `AGENTS.md`

Contiene instrucciones para el agente de trabajo.

### `CLAUDE.md`

Apunta a las reglas internas del agente.

## Parte más compleja del proyecto

La parte más compleja está en dos lugares:

### 1. `app/page.tsx`

Porque aquí se coordinan muchas cosas al mismo tiempo:
- estados de cada sección
- validación por paso
- armado del JSON
- separación entre declaración ATS y declaración final
- reinicio de checks al refrescar o al volver atrás

### 2. `app/firma-canvas.tsx`

Porque las firmas no son solo una imagen:
- se dibujan a mano
- se guardan como base64
- se vuelven a pintar al redimensionar
- no deben borrarse al cambiar de sección
- solo deben limpiarse con el botón `Limpiar firma`

## Flujo de uso

1. El usuario llena la sección activa.
2. El formulario valida los campos antes de pasar al siguiente paso.
3. Las firmas se dibujan y se guardan automáticamente.
4. Al final, el formulario construye un JSON limpio con todas las respuestas.
5. Se muestra un mensaje de confirmación y el JSON se imprime en consola.

## Resumen corto

Si necesitas ubicarte rápido:
- `page.tsx` orquesta
- `secciones-formulario.tsx` organiza la UI por pasos
- `firma-canvas.tsx` maneja las firmas
- `configuracion-formulario.ts` guarda listas y pasos
- `componentes-formulario.tsx` evita repetir código
- `globals.css` define el estilo visual

