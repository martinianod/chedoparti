# Pruebas locales del frontend

Este proyecto está configurado para funcionar solo con el frontend usando datos mock.

## ¿Cómo probar?

1. Instala dependencias:
   ```sh
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```sh
   npm run dev
   ```
3. Cambia el deporte en el selector para ver las canchas y reservas correspondientes.

## Mock data

- Las canchas y reservas se encuentran en `src/services/api/mockData.js`.
- Puedes editar ese archivo para agregar más ejemplos.

## ¿Cómo volver a usar el backend?

- Descomenta las líneas de `reservationsApi.list()` y `courtsApi.list()` en `Dashboard.jsx`.
- Comenta o elimina las líneas que usan los mocks.

---

Si tienes dudas, revisa los archivos:

- `src/pages/Dashboard.jsx`
- `src/services/api/mockData.js`

¡Listo para probar la grilla y reservas por deporte!
