const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Arreglo interno para conservar las tareas
let tareas = [
  { id: 1, nombre: 'Instalar ExpressJS', completada: true },
  { id: 2, nombre: 'Resolver Ejercicio 1', completada: true },
  { id: 3, nombre: 'Resolver Ejercicio 2', completada: true },
  { id: 4, nombre: 'Resolver Ejercicio 3', completada: false },
  { id: 5, nombre: 'Crear Pull Request', completada: false }
];

let proximoId = 6;

// 1. OBTENER TODAS LAS TAREAS (con opción de filtrado ?completada=true/false)
app.get('/tareas', (req, res) => {
  const { completada } = req.query;

  if (completada !== undefined) {
    const valLower = completada.toString().toLowerCase();

    if (valLower !== 'true' && valLower !== 'false') {
      return res.status(400).json({
        status: 'error',
        mensaje: 'El parámetro "completada" debe ser "true" o "false"'
      });
    }

    const esCompletada = valLower === 'true';
    const tareasFiltradas = tareas.filter(t => t.completada === esCompletada);

    return res.json({
      status: 'exito',
      filtro: esCompletada ? 'completadas' : 'pendientes',
      total: tareasFiltradas.length,
      datos: tareasFiltradas
    });
  }

  return res.json({
    status: 'exito',
    total: tareas.length,
    datos: tareas
  });
});

// 2. OBTENER UNA TAREA POR ID
app.get('/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const tarea = tareas.find(t => t.id === id);

  if (!tarea) {
    return res.status(404).json({ status: 'error', mensaje: 'Tarea no encontrada' });
  }

  return res.json({ status: 'exito', datos: tarea });
});

// 3. CREAR UNA NUEVA TAREA
app.post('/tareas', (req, res) => {
  const { nombre, completada } = req.body;

  // Validar que el nombre esté presente y no sea vacío
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ status: 'error', mensaje: 'El nombre de la tarea es obligatorio' });
  }

  const nombreNormalizado = nombre.trim().toLowerCase();

  // Validar que no exista otra tarea con el mismo nombre
  const existe = tareas.some(t => t.nombre.trim().toLowerCase() === nombreNormalizado);
  if (existe) {
    return res.status(400).json({ status: 'error', mensaje: 'Ya existe una tarea con el mismo nombre' });
  }

  // Validar completada si se pasa en el body
  let estadoCompletada = false;
  if (completada !== undefined) {
    if (typeof completada !== 'boolean') {
      return res.status(400).json({ status: 'error', mensaje: 'El campo "completada" debe ser un booleano (true o false)' });
    }
    estadoCompletada = completada;
  }

  const nuevaTarea = {
    id: proximoId++,
    nombre: nombre.trim(),
    completada: estadoCompletada
  };

  tareas.push(nuevaTarea);

  return res.status(201).json({
    status: 'exito',
    mensaje: 'Tarea creada correctamente',
    datos: nuevaTarea
  });
});

// 4. MODIFICAR UNA TAREA EXISTENTE
app.put('/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const tarea = tareas.find(t => t.id === id);
  if (!tarea) {
    return res.status(404).json({ status: 'error', mensaje: 'Tarea no encontrada' });
  }

  const { nombre, completada } = req.body;

  // Modificar nombre si se envió
  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ status: 'error', mensaje: 'El nombre debe ser un texto válido' });
    }

    const nombreNormalizado = nombre.trim().toLowerCase();
    const duplicado = tareas.some(t => t.id !== id && t.nombre.trim().toLowerCase() === nombreNormalizado);
    if (duplicado) {
      return res.status(400).json({ status: 'error', mensaje: 'Ya existe otra tarea con el mismo nombre' });
    }

    tarea.nombre = nombre.trim();
  }

  // Modificar estado completada si se envió
  if (completada !== undefined) {
    if (typeof completada !== 'boolean') {
      return res.status(400).json({ status: 'error', mensaje: 'El campo "completada" debe ser un booleano (true o false)' });
    }
    tarea.completada = completada;
  }

  return res.json({
    status: 'exito',
    mensaje: 'Tarea actualizada correctamente',
    datos: tarea
  });
});

// 5. ELIMINAR UNA TAREA
app.delete('/tareas/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const indice = tareas.findIndex(t => t.id === id);
  if (indice === -1) {
    return res.status(404).json({ status: 'error', mensaje: 'Tarea no encontrada' });
  }

  const tareaEliminada = tareas.splice(indice, 1)[0];

  return res.json({
    status: 'exito',
    mensaje: 'Tarea eliminada correctamente',
    datos: tareaEliminada
  });
});

app.listen(PORT, () => {
  console.log(`Servidor del Ejercicio 3 corriendo en http://localhost:${PORT}`);
});