const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Valido que el valor sea un numero positivo
function esNumeroPositivo(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

// Calculo de perimetro, superficie y verificacion de cuadrado
function calcularRectangulo(base, altura) {
  const b = Number(base);
  const a = Number(altura);

  const perimetro = 2 * (b + a);
  const superficie = b * a;
  const esCuadrado = b === a;

  return {
    base: b,
    altura: a,
    perimetro,
    superficie,
    esCuadrado
  };
}

// POST: recibe datos por el body
app.post('/rectangulos/calcular', (req, res) => {
  const { base, altura } = req.body;

  if (base === undefined || altura === undefined) {
    return res.status(400).json({
      error: 'Parámetros faltantes',
      mensaje: 'Falta ingresar la base o la altura en el body.'
    });
  }

  if (!esNumeroPositivo(base) || !esNumeroPositivo(altura)) {
    return res.status(400).json({
      error: 'Valores inválidos',
      mensaje: 'La base y la altura tienen que ser números mayores a 0.'
    });
  }

  const resultado = calcularRectangulo(base, altura);

  return res.status(200).json({
    mensaje: 'Cálculo realizado con éxito',
    datos: resultado
  });
});

// GET: recibe datos por query params
app.get('/rectangulos/calcular', (req, res) => {
  const { base, altura } = req.query;

  if (!base || !altura) {
    return res.status(400).json({
      error: 'Parámetros faltantes',
      mensaje: 'Falta pasar los parámetros base y altura por la URL.'
    });
  }

  if (!esNumeroPositivo(base) || !esNumeroPositivo(altura)) {
    return res.status(400).json({
      error: 'Valores inválidos',
      mensaje: 'La base y la altura tienen que ser números mayores a 0.'
    });
  }

  const resultado = calcularRectangulo(base, altura);

  return res.status(200).json({
    mensaje: 'Cálculo realizado con éxito',
    datos: resultado
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});