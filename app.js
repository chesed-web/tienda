import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUq8Mp5D-RyVXhkqQLpGuthJXYggviUEM",
  authDomain: "chesed-ce52a.firebaseapp.com",
  projectId: "chesed-ce52a",
  storageBucket: "chesed-ce52a.firebasestorage.app",
  messagingSenderId: "631081373301",
  appId: "1:631081373301:web:7e88fd4d2f37ac6de7b23c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todosLosProductos = [];
let carrito = {};
let categoriaActual = "todos";

async function cargarProductos() {

  const snapshot = await getDocs(
    collection(db, "productos")
  );

  todosLosProductos = [];

snapshot.forEach(docSnap => {

  todosLosProductos.push({
  id: docSnap.id,
  ...docSnap.data()
});
});

  mostrarProductos(todosLosProductos);
generarCategorias();
}

function mostrarProductos(lista) {

  const contenedor = document.getElementById("productos");

  contenedor.innerHTML = "";

  lista.forEach(producto => {

    let estadoStock = "";

    console.log(
  producto.nombre,
  producto.stock,
  typeof producto.stock
);
    
  if (producto.stock === 0) {

  estadoStock =
    `<div class="agotado">
      Agotado
    </div>`;
}

let controles;

if (producto.stock <= 0) {

  controles = `
    <div class="agotado">
      Sin stock
    </div>
  `;

} else {

  controles = `
    <div class="controles">

      <button onclick="restarProducto('${producto.nombre}')">
        -
      </button>

      <span id="cantidad-${producto.nombre}">
        0
      </span>

      <button onclick="sumarProducto('${producto.nombre}')">
        +
      </button>

    </div>
  `;
}

    contenedor.innerHTML += `
      <div class="producto">

        <img src="${producto.imagen}" alt="${producto.nombre}">

        <h3>${producto.nombre}</h3>

        <div class="categoria">
          ${producto.categoria}
        </div>

        <p class="precio">
          $${producto.precio}
        </p>
        ${estadoStock}

     ${controles}

    </div>
    `;
  });
}

window.filtrar = function(categoria, boton) {

  categoriaActual = categoria;

  document
    .querySelectorAll("#filtros button")
    .forEach(btn =>
      btn.classList.remove("activo")
    );

  if (boton) {
    boton.classList.add("activo");
  }

  if (categoria === "todos") {

    mostrarProductos(todosLosProductos);

  } else {

    const filtrados =
      todosLosProductos.filter(
        p => p.categoria === categoria
      );

    mostrarProductos(filtrados);

  }

}

cargarProductos();

function generarCategorias() {

  const filtros =
    document.getElementById("filtros");

  filtros.innerHTML = "";

  filtros.innerHTML += `
    <button
      class="activo"
      onclick="filtrar('todos', this)">
      Todos
    </button>
  `;

  const categorias = [
    ...new Set(
      todosLosProductos.map(
        p => p.categoria
      )
    )
  ];

  categorias.forEach(categoria => {

    filtros.innerHTML += `
      <button
        onclick="filtrar('${categoria}', this)">
        ${categoria}
      </button>
    `;

  });

}

function actualizarCarrito() {

  const lista = document.getElementById("lista-carrito");

  lista.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    total += subtotal;
    cantidadTotal += item.cantidad;

    // Actualiza el número que aparece
    // debajo del producto

    const contador =
      document.getElementById(
        `cantidad-${item.producto.nombre}`
      );

    if (contador) {
      contador.textContent = item.cantidad;
    }

    lista.innerHTML += `
    <li>
     ${item.producto.nombre}
     x${item.cantidad}

     <strong>
     $${subtotal}
     </strong>
     </li>
     `;

  });

  // Productos que NO están en el carrito
  // vuelven a mostrar 0

  todosLosProductos.forEach(producto => {

    if (!carrito[producto.nombre]) {

      const contador =
        document.getElementById(
          `cantidad-${producto.nombre}`
        );

      if (contador) {
        contador.textContent = 0;
      }
    }

  });

  document.getElementById("cantidad-carrito")
    .textContent = cantidadTotal;

  document.getElementById("total")
    .textContent = total;
}

window.enviarWhatsApp = async function() {

  if (Object.keys(carrito).length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  let mensaje = "Hola, quiero pedir:%0A%0A";

  const nombre =
  document.getElementById("nombre").value;

  const direccion =
  document.getElementById("direccion").value;

  const observaciones =
  document.getElementById("observaciones").value;

  const ubicacion =
  document.getElementById("ubicacion").value;

  let total = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    mensaje +=
      `• ${item.producto.nombre} x${item.cantidad} - $${subtotal}%0A`;

    total += subtotal;
  });

  mensaje += `%0A💰 Total: $${total}`;

if (nombre.trim() !== "") {

  mensaje += `%0A👤 Nombre:%0A${nombre}%0A`;

}

  if (direccion.trim() !== "") {

  mensaje += `%0A🏠 Dirección:%0A${direccion}%0A`;

}

if (observaciones.trim() !== "") {

  mensaje += `%0A📝 Observaciones:%0A${observaciones}%0A`;

}

if (ubicacion !== "") {

  mensaje += `%0A📍 Ubicación:%0A${ubicacion}%0A`;

}

const productosPedido = [];

Object.values(carrito).forEach(item => {

  productosPedido.push({
    id: item.producto.id,
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precio: item.producto.precio,
    categoria: item.producto.categoria
  });

});

  const telefono = "5493731558574";

  const url =
    `https://wa.me/${telefono}?text=${mensaje}`;

await addDoc(
  collection(db, "pedidos"),
  {
    nombre,
    direccion,
    observaciones,
    ubicacion,

    productos: productosPedido,

    total,

    estado: "pendiente",

    delivery: "",

    fecha: new Date().toISOString()
  }
);

  window.open(url, "_blank");
}
window.sumarProducto = function(nombreProducto) {

  const producto = todosLosProductos.find(
    p => p.nombre === nombreProducto
  );

  if (carrito[nombreProducto]) {

    carrito[nombreProducto].cantidad++;

  } else {

    carrito[nombreProducto] = {
      producto,
      cantidad: 1
    };

  }

  actualizarCarrito();
}

window.restarProducto = function(nombreProducto) {

  if (!carrito[nombreProducto]) return;

  carrito[nombreProducto].cantidad--;

  if (carrito[nombreProducto].cantidad <= 0) {
    delete carrito[nombreProducto];
  }

  actualizarCarrito();
}
window.vaciarCarrito = function() {

  if (!confirm("¿Vaciar carrito?")) {
    return;
  }

  carrito = {};

  actualizarCarrito();

}
window.obtenerUbicacion = function() {

  if (!navigator.geolocation) {
    alert("Tu dispositivo no soporta ubicación");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(posicion) {

      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;

      const link =
        `https://maps.google.com/?q=${lat},${lng}`;

      document.getElementById("ubicacion").value =
        link;

      alert("Ubicación guardada correctamente");

    },
    function() {
      alert("No se pudo obtener la ubicación");
    }
  );
}
window.buscarProductos = function() {

  const texto =
    document.getElementById("buscador")
      .value
      .toLowerCase();

  const filtrados =
    todosLosProductos.filter(producto =>
      producto.nombre
        .toLowerCase()
        .includes(texto)
    );

  mostrarProductos(filtrados);
}

window.toggleCarrito = function() {

  const carrito =
    document.getElementById(
      "detalle-carrito"
    );

  const flecha =
    document.getElementById(
      "flecha-carrito"
    );

  if (carrito.style.display === "none") {

    carrito.style.display = "block";
    flecha.textContent = "▲";

  } else {

    carrito.style.display = "none";
    flecha.textContent = "▼";

  }

}