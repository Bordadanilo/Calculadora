// Permitir ingreso desde el teclado físico
document.addEventListener('keydown', function(event) {
  const key = event.key;
  if (!isNaN(key)) {
    agregarNumero(key);
  } else if (key === '.') {
    agregarNumero('.');
  } else if (['+', '-', '*', '/'].includes(key)) {
    operar(key);
  } else if (key === 'Enter' || key === '=') {
    calcular('=');
  } else if (key === 'Backspace') {
    pantalla = pantalla.slice(0, -1);
    actualizarPantalla();
  } else if (key === 'c' || key === 'C') {
    borrarPantalla();
  }
});

let expresionCompleta = '';
let pantalla = '';
let operadorActual = null;
let valorAnterior = null;
let esperandoNuevoValor = false;

function actualizarPantalla() {
  const pantallaElement = document.getElementById('pantalla');
  pantallaElement.value = expresionCompleta || pantalla || '0';
}

function agregarNumero(num) {
  if (esperandoNuevoValor) {
    pantalla = '';
    esperandoNuevoValor = false;
  }

  if (num === '.' && pantalla.includes('.')) return;

  pantalla += num;
  expresionCompleta += num;
  actualizarPantalla();
}

function operar(op) {
  if (pantalla === '') return;

  if (valorAnterior !== null && operadorActual && !esperandoNuevoValor) {
    calcular('=');
  }

  valorAnterior = parseFloat(pantalla);
  operadorActual = op;
  esperandoNuevoValor = true;
  expresionCompleta += ` ${op} `;
  actualizarPantalla();
}

function calcular(op) {
  let resultado = '';

  if (op === 'sqrt') {
    let valor = parseFloat(pantalla);
    resultado = isNaN(valor) ? 'Error' : (valor >= 0 ? Math.sqrt(valor) : 'No se puede calcular la raíz de un número negativo');

    if (!isNaN(resultado)) {
      expresionCompleta = `√(${valor})`;
      agregarAlHistorial(`${expresionCompleta} = ${resultado}`);
    }

    pantalla = resultado.toString();
    expresionCompleta = pantalla;
    actualizarPantalla();
    document.getElementById('resultado').textContent = 'Resultado: ' + pantalla;
    return;
  }

  if (['sin', 'cos', 'tan', 'log', 'ln', 'exp', 'inv', 'fact'].includes(op)) {
    let valor = parseFloat(pantalla);
    if (isNaN(valor)) {
      resultado = 'Error';
    } else {
      switch (op) {
        case 'sin': resultado = Math.sin(valor); break;
        case 'cos': resultado = Math.cos(valor); break;
        case 'tan': resultado = Math.tan(valor); break;
        case 'log': resultado = Math.log10(valor); break;
        case 'ln':  resultado = Math.log(valor); break;
        case 'exp': resultado = Math.exp(valor); break;
        case 'inv': resultado = valor !== 0 ? 1 / valor : 'Error'; break;
        case 'fact': resultado = (valor < 0 || !Number.isInteger(valor)) ? 'Error' : factorial(valor); break;
      }
    }

    if (!isNaN(resultado)) {
      expresionCompleta = `${op}(${valor})`;
      agregarAlHistorial(`${expresionCompleta} = ${resultado}`);
    }

    pantalla = resultado.toString();
    expresionCompleta = pantalla;
    actualizarPantalla();
    document.getElementById('resultado').textContent = 'Resultado: ' + pantalla;
    return;
  }

  if (op === '=') {
    if (operadorActual && valorAnterior !== null && pantalla !== '') {
      let actual = parseFloat(pantalla);
      let expresion = `${valorAnterior} ${operadorActual} ${actual}`;

      switch (operadorActual) {
        case '+': resultado = valorAnterior + actual; break;
        case '-': resultado = valorAnterior - actual; break;
        case '*': resultado = valorAnterior * actual; break;
        case '/': resultado = actual !== 0 ? valorAnterior / actual : 'No se puede dividir por cero'; break;
        case 'mod': resultado = actual !== 0 ? valorAnterior % actual : 'No se puede dividir por cero'; break;
        case '^': resultado = Math.pow(valorAnterior, actual); break;
        default: resultado = 'Error';
      }

      if (!isNaN(resultado)) {
        agregarAlHistorial(`${expresion} = ${resultado}`);
        expresionCompleta = resultado.toString();
      }

      pantalla = resultado.toString();
      valorAnterior = null;
      operadorActual = null;
      esperandoNuevoValor = true;
      actualizarPantalla();
      document.getElementById('resultado').textContent = 'Resultado: ' + pantalla;
    }
    return;
  }

  operar(op);
}

function borrarPantalla() {
  pantalla = '';
  valorAnterior = null;
  operadorActual = null;
  esperandoNuevoValor = false;
  expresionCompleta = '';
  actualizarPantalla();
  document.getElementById('resultado').textContent = '';
  document.getElementById('procedimiento').textContent = '';
}

actualizarPantalla();

function toggleModo() {
  document.body.classList.toggle("oscuro");
  const btn = document.getElementById("toggle-modo");
  if (document.body.classList.contains("oscuro")) {
    btn.textContent = "☀️ Modo Claro";
  } else {
    btn.textContent = "🌙 Modo Oscuro";
  }
}

function agregarAlHistorial(entrada, guardar = true) {
  const historial = document.getElementById("historial");

  const item = document.createElement("li");
  item.textContent = entrada;

  item.addEventListener("click", () => {
    const partes = entrada.split("=");
    pantalla = partes[0].trim();
    esperandoNuevoValor = false;
    actualizarPantalla();
    document.getElementById('resultado').textContent = '';
  });

  historial.prepend(item);

  // Guardar en localStorage solo si no viene desde cargarHistorial
  if (guardar) {
    const historialExistente = JSON.parse(localStorage.getItem("historial")) || [];
    historialExistente.unshift(entrada);
    localStorage.setItem("historial", JSON.stringify(historialExistente));
  }
}


function cargarHistorial() {
  const historialGuardado = JSON.parse(localStorage.getItem("historial")) || [];
  historialGuardado.forEach(entrada => {
    agregarAlHistorial(entrada, false); // false = no volver a guardar en localStorage
  });
}
cargarHistorial();

function limpiarHistorial() {
  localStorage.removeItem("historial");
  document.getElementById("historial").innerHTML = "";
}

function agregarConstante(c) {
  let constante = '';
  if (c === 'pi') {
    constante = Math.PI.toFixed(8);
  } else if (c === 'e') {
    constante = Math.E.toFixed(8);
  }
  pantalla += constante;
  expresionCompleta += constante;
  actualizarPantalla();
}

function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registrado ✅', reg))
      .catch(err => console.error('Error registrando SW ❌', err));
  });
}


