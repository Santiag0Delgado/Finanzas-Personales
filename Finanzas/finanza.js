// Guardar y recuperar datos del LocalStorage
let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
let deudas = JSON.parse(localStorage.getItem("deudas")) || [];

// Función para formatear moneda en pesos colombianos
function formatoCOP(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valor);
}

// Función para mostrar el selector de deudas cuando se elige "Gasto"
function mostrarSelectorDeuda() {
    const tipo = document.getElementById("tipo").value;
    const deudaSelector = document.getElementById("deudaSelector");
    
    if (tipo === "gasto") {
        deudaSelector.style.display = "block"; // Mostrar selector
        cargarDeudasPendientes(); // Cargar opciones en el select
    } else {
        deudaSelector.style.display = "none"; // Ocultar selector
        document.getElementById("deudaAsociada").value = ""; // Reiniciar select
    }
}

// Función para cargar las deudas pendientes en el selector
function cargarDeudasPendientes() {
    const deudaAsociada = document.getElementById("deudaAsociada");
    deudaAsociada.innerHTML = `<option value="">Ninguna</option>`; // Limpiar opciones

    deudas.forEach((deuda, index) => {
        if (deuda.estado === "Pendiente") {
            const option = document.createElement("option");
            option.value = index; // Guardamos el índice
            option.textContent = `${deuda.descripcion} - ${formatoCOP(deuda.monto)}`;
            deudaAsociada.appendChild(option);
        }
    });
}

// Función para agregar una transacción
function agregarTransaccion() {
    const fecha = document.getElementById('fecha').value;
    const descripcion = document.getElementById('descripcion').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const tipo = document.getElementById('tipo').value.toLowerCase();
    const deudaSeleccionada = document.getElementById('deudaAsociada').value; // Índice de la deuda

    if (!fecha || !descripcion || isNaN(monto) || !tipo) {
        alert("Por favor, ingrese todos los datos correctamente.");
        return;
    }

    if (tipo === "gasto" && deudaSeleccionada !== "") {
        deudas[deudaSeleccionada].estado = "Pagada";
        localStorage.setItem("deudas", JSON.stringify(deudas)); // Guardar cambios
    }

    const nuevaTransaccion = { fecha, descripcion, monto, tipo };
    transacciones.push(nuevaTransaccion);
    localStorage.setItem("transacciones", JSON.stringify(transacciones));

    document.getElementById('fecha').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('monto').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('deudaSelector').style.display = 'none'; // Ocultar selector
    document.getElementById('deudaAsociada').value = '';

    mostrarTransacciones();
    mostrarDeudas();
    mostrarBalance();
}

// Función para mostrar las transacciones
function mostrarTransacciones() {
    const tableBody = document.getElementById('transaccionesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    transacciones.forEach(transaccion => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${transaccion.fecha}</td>
            <td>${transaccion.descripcion}</td>
            <td>${formatoCOP(transaccion.monto)}</td>
            <td>${transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}</td>
        `;
    });
}

// Función para mostrar el balance
function mostrarBalance() {
    const ingresos = transacciones.filter(t => t.tipo === "ingreso").reduce((acc, t) => acc + t.monto, 0);
    const gastos = transacciones.filter(t => t.tipo === "gasto").reduce((acc, t) => acc + t.monto, 0);
    const totalDeudas = deudas.filter(d => d.estado === "Pendiente").reduce((acc, d) => acc + d.monto, 0);
    const balance = ingresos - gastos - totalDeudas;

    document.getElementById('balanceInfo').innerText = `Ingresos: ${formatoCOP(ingresos)} | Gastos: ${formatoCOP(gastos)} | Deudas Pendientes: ${formatoCOP(totalDeudas)} | Balance: ${formatoCOP(balance)}`;
}

// Función para mostrar las deudas
function mostrarDeudas() {
    const tableBody = document.getElementById('deudasTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    deudas.forEach((deuda, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${deuda.fecha}</td>
            <td>${deuda.descripcion}</td>
            <td>${formatoCOP(deuda.monto)}</td>
            <td class="${deuda.estado === 'Pendiente' ? 'pendiente' : 'pagada'}">${deuda.estado}</td>
            <td>
                <button onclick="marcarDeudaPagada(${index})" ${deuda.estado === "Pagada" ? "disabled" : ""}>
                    ${deuda.estado === "Pendiente" ? "Pagar" : "Pagada"}
                </button>
            </td>
        `;
    });
}
function agregarDeuda() {
  const fecha = document.getElementById('fechaDeuda').value;
  const descripcion = document.getElementById('descripcionDeuda').value;
  const monto = parseFloat(document.getElementById('montoDeuda').value);

  if (!fecha || !descripcion || isNaN(monto)) {
    alert("Por favor, ingrese todos los datos correctamente.");
    return;
  }

  const nuevaDeuda = { fecha, descripcion, monto, estado: "Pendiente" };
  deudas.push(nuevaDeuda);
  localStorage.setItem("deudas", JSON.stringify(deudas));

  document.getElementById('fechaDeuda').value = '';
  document.getElementById('descripcionDeuda').value = '';
  document.getElementById('montoDeuda').value = '';

  mostrarDeudas();
  mostrarBalance(); // Asegurar que el balance se actualiza correctamente
}

// Función para generar el gráfico de ingresos vs gastos
let grafico = null;
function generarGrafico() {
    const ingresos = transacciones.filter(t => t.tipo === "ingreso").reduce((acc, t) => acc + t.monto, 0);
    const gastos = transacciones.filter(t => t.tipo === "gasto").reduce((acc, t) => acc + t.monto, 0);

    const ctx = document.getElementById('graficoCanvas').getContext('2d');
    if (grafico) grafico.destroy();

    grafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                label: 'Monto en COP',
                data: [ingresos, gastos],
                backgroundColor: ['green', 'red'],
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Agregar eventos a los botones
document.getElementById('agregarDeudaBtn').addEventListener('click', agregarDeuda);
document.getElementById('agregarBtn').addEventListener('click', agregarTransaccion);
document.getElementById('tipo').addEventListener('change', mostrarSelectorDeuda);
document.getElementById('graficoBtn').addEventListener('click', generarGrafico);
mostrarTransacciones();
mostrarDeudas();
