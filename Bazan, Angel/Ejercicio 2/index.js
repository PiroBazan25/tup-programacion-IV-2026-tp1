const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Arreglo interno para conservar la información de los alumnos
let alumnos = [
  { id: 1, nombre: 'Juan Perez', notas: [8, 9, 7] },
  { id: 2, nombre: 'Maria Gomez', notas: [5, 6, 4] },
  { id: 3, nombre: 'Carlos Lopez', notas: [6, 7, 6] }
];

let proximoId = 4;

// Función auxiliar para calcular promedio y condición académica
function calcularEstadoAcademico(notas) {
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  const promedio = Number((suma / notas.length).toFixed(2));

  let condicion = '';
  if (promedio < 6) {
    condicion = 'reprobado';
  } else if (promedio <= 7) {
    condicion = 'aprobado';
  } else {
    condicion = 'promocionado';
  }

  return { promedio, condicion };
}

// 1. OBTENER TODOS LOS ALUMNOS
app.get('/alumnos', (req, res) => {
  const resultado = alumnos.map(alumno => {
    const estado = calcularEstadoAcademico(alumno.notas);
    return {
      id: alumno.id,
      nombre: alumno.nombre,
      notas: alumno.notas,
      promedio: estado.promedio,
      condicion: estado.condicion
    };
  });

  return res.json({ status: 'exito', datos: resultado });
});

// 2. OBTENER UN ALUMNO POR ID (Consulta de notas, promedio y condición)
app.get('/alumnos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) {
    return res.status(404).json({ status: 'error', mensaje: 'Alumno no encontrado' });
  }

  const estado = calcularEstadoAcademico(alumno.notas);

  return res.json({
    status: 'exito',
    datos: {
      id: alumno.id,
      nombre: alumno.nombre,
      notas: alumno.notas,
      promedio: estado.promedio,
      condicion: estado.condicion
    }
  });
});

// 3. CREAR UN NUEVO ALUMNO
app.post('/alumnos', (req, res) => {
  const { nombre, notas } = req.body;

  // Validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ status: 'error', mensaje: 'El nombre es obligatorio y debe ser un texto válido' });
  }

  const nombreNormalizado = nombre.trim().toLowerCase();

  // Verificar que no exista otro alumno con el mismo nombre
  const existe = alumnos.some(a => a.nombre.trim().toLowerCase() === nombreNormalizado);
  if (existe) {
    return res.status(400).json({ status: 'error', mensaje: 'Ya existe un alumno con ese nombre' });
  }

  // Validar notas
  if (!Array.isArray(notas) || notas.length !== 3) {
    return res.status(400).json({ status: 'error', mensaje: 'El campo "notas" debe ser un arreglo con exactamente 3 notas' });
  }

  const notasValidas = notas.every(n => typeof n === 'number' && !isNaN(n) && n >= 1 && n <= 10);
  if (!notasValidas) {
    return res.status(400).json({ status: 'error', mensaje: 'Todas las notas deben ser números entre 1 y 10' });
  }

  const nuevoAlumno = {
    id: proximoId++,
    nombre: nombre.trim(),
    notas
  };

  alumnos.push(nuevoAlumno);

  const estado = calcularEstadoAcademico(nuevoAlumno.notas);

  return res.status(201).json({
    status: 'exito',
    mensaje: 'Alumno creado correctamente',
    datos: {
      id: nuevoAlumno.id,
      nombre: nuevoAlumno.nombre,
      notas: nuevoAlumno.notas,
      promedio: estado.promedio,
      condicion: estado.condicion
    }
  });
});

// 4. MODIFICAR REGISTRO DE UN ALUMNO
app.put('/alumnos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const alumno = alumnos.find(a => a.id === id);
  if (!alumno) {
    return res.status(404).json({ status: 'error', mensaje: 'Alumno no encontrado' });
  }

  const { nombre, notas } = req.body;

  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ status: 'error', mensaje: 'El nombre debe ser un texto válido' });
    }

    const nombreNormalizado = nombre.trim().toLowerCase();
    const duplicado = alumnos.some(a => a.id !== id && a.nombre.trim().toLowerCase() === nombreNormalizado);
    if (duplicado) {
      return res.status(400).json({ status: 'error', mensaje: 'Ya existe otro alumno con ese nombre' });
    }

    alumno.nombre = nombre.trim();
  }

  if (notas !== undefined) {
    if (!Array.isArray(notas) || notas.length !== 3) {
      return res.status(400).json({ status: 'error', mensaje: 'El campo "notas" debe ser un arreglo con exactamente 3 notas' });
    }

    const notasValidas = notas.every(n => typeof n === 'number' && !isNaN(n) && n >= 1 && n <= 10);
    if (!notasValidas) {
      return res.status(400).json({ status: 'error', mensaje: 'Todas las notas deben ser números entre 1 y 10' });
    }

    alumno.notas = notas;
  }

  const estado = calcularEstadoAcademico(alumno.notas);

  return res.json({
    status: 'exito',
    mensaje: 'Alumno actualizado correctamente',
    datos: {
      id: alumno.id,
      nombre: alumno.nombre,
      notas: alumno.notas,
      promedio: estado.promedio,
      condicion: estado.condicion
    }
  });
});

// 5. ELIMINAR UN ALUMNO
app.delete('/alumnos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ status: 'error', mensaje: 'El ID debe ser un número entero válido' });
  }

  const indice = alumnos.findIndex(a => a.id === id);
  if (indice === -1) {
    return res.status(404).json({ status: 'error', mensaje: 'Alumno no encontrado' });
  }

  const alumnoEliminado = alumnos.splice(indice, 1)[0];

  return res.json({
    status: 'exito',
    mensaje: 'Alumno eliminado correctamente',
    datos: alumnoEliminado
  });
});

app.listen(PORT, () => {
  console.log(`Servidor del Ejercicio 2 corriendo en http://localhost:${PORT}`);
});