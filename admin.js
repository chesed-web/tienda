
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc
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

let productos = [];

async function cargarProductos() {

  const snapshot = await getDocs(
    collection(db, "productos")
  );

  productos = [];

  snapshot.forEach(docSnap => {

    productos.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

  mostrarProductos();
generarCategorias();
}

function mostrarProductos(lista = productos) {

  const contenedor =
    document.getElementById("productos");

  contenedor.innerHTML = "";

  lista.forEach(producto => {

    contenedor.innerHTML += `
      <div class="producto">

  <div
    class="cabecera-producto"
    onclick="toggleProducto('${producto.id}')">

    <h3>${producto.nombre}</h3>

  </div>

  <div
    class="contenido-producto"
    id="contenido-${producto.id}"
    style="display:none;">

    <label>Categoría</label>

    <input
      type="text"
      id="categoria-${producto.id}"
      value="${producto.categoria || ''}">

    <label>Precio</label>

    <input
      type="number"
      id="precio-${producto.id}"
      value="${producto.precio}">

    <label>Estado</label>

    <select id="stock-${producto.id}">
      <option
        value="1"
        ${producto.stock > 0 ? "selected" : ""}>
        Disponible
      </option>

      <option
        value="0"
        ${producto.stock <= 0 ? "selected" : ""}>
        Agotado
      </option>
    </select>

    <label>Imagen</label>

    <input
      type="text"
      id="imagen-${producto.id}"
      value="${producto.imagen || ''}">

    <button
      class="eliminar"
      onclick="eliminarProducto('${producto.id}')">

      🗑 Eliminar

    </button>

  </div>

</div>

    `;
  });

}


window.guardarTodo = async function() {

  for (const producto of productos) {

    const precio = Number(
      document.getElementById(`precio-${producto.id}`).value
    );

    const stock = Number(
      document.getElementById(`stock-${producto.id}`).value
    );

    const categoria =
      document.getElementById(`categoria-${producto.id}`).value;

    const imagen =
      document.getElementById(`imagen-${producto.id}`).value;


    await updateDoc(
      doc(db, "productos", producto.id),
      {
        precio,
        stock,
        imagen,
        categoria
      }
    );

    producto.precio = precio;
    producto.stock = stock;
  }

  alert("Todos los cambios fueron guardados");
}

cargarProductos();

window.crearProducto = async function() {

  const nombre =
    document.getElementById("nuevo-nombre").value;

  const precio =
    Number(
      document.getElementById("nuevo-precio").value
    );

  const stock =
    Number(
      document.getElementById("nuevo-stock").value
    );

  const categoria =
    document.getElementById("nuevo-categoria").value;

  const imagen =
    document.getElementById("nuevo-imagen").value;

  if (!nombre) {
    alert("Ingrese un nombre");
    return;
  }

  const id = nombre
    .toLowerCase()
    .replaceAll(" ", "");

  await setDoc(
    doc(db, "productos", id),
    {
      nombre,
      precio,
      stock,
      categoria,
      imagen
    }
  );

  alert("Producto creado");

  cargarProductos();
}

window.eliminarProducto = async function(id) {

  const confirmar =
    confirm("¿Eliminar este producto?");

  if (!confirmar) return;

  await deleteDoc(
    doc(db, "productos", id)
  );

  productos =
    productos.filter(
      p => p.id !== id
    );

  mostrarProductos();
generarCategorias();
  alert("Producto eliminado");
}

function buscarProductos() {

  const texto =
    document
      .getElementById("buscador")
      .value
      .toLowerCase();

  const filtrados =
    productos.filter(producto =>
      producto.nombre
        .toLowerCase()
        .includes(texto)
    );

  mostrarProductos(filtrados);
}

document
  .getElementById("buscador")
  .addEventListener("input", buscarProductos);

let categoriaActual = "todos";

function generarCategorias() {

  const filtros =
    document.getElementById("filtros-admin");

  filtros.innerHTML = "";

  filtros.innerHTML += `
    <button
      class="activo"
      onclick="filtrarCategoria('todos', this)">
      Todos
    </button>
  `;

  const categorias = [
    ...new Set(
      productos.map(
        p => p.categoria
      )
    )
  ];

  categorias.forEach(categoria => {

    filtros.innerHTML += `
      <button
        onclick="filtrarCategoria('${categoria}', this)">
        ${categoria}
      </button>
    `;

  });

}

window.filtrarCategoria = function(categoria, boton) {

  categoriaActual = categoria;

  document
    .querySelectorAll("#filtros-admin button")
    .forEach(btn =>
      btn.classList.remove("activo")
    );

  boton.classList.add("activo");

  if (categoria === "todos") {

    mostrarProductos();

    return;
  }

  const filtrados =
    productos.filter(
      p => p.categoria === categoria
    );

  mostrarProductos(filtrados);

}

function aplicarFiltros() {

  const texto =
    document
      .getElementById("buscador")
      .value
      .toLowerCase();

  let lista = productos;

  if (categoriaActual !== "todos") {

    lista = lista.filter(
      p => p.categoria === categoriaActual
    );

  }

  lista = lista.filter(
    p => p.nombre
      .toLowerCase()
      .includes(texto)
  );

  mostrarProductos(lista);

}

document
  .getElementById("buscador")
  .addEventListener("input", aplicarFiltros);

window.toggleNuevoProducto = function() {

  const panel =
    document.getElementById(
      "nuevo-producto"
    );

  if (panel.style.display === "none") {

    panel.style.display = "block";

  } else {

    panel.style.display = "none";

  }

}

window.toggleProducto = function(id) {

  const contenido =
    document.getElementById(
      `contenido-${id}`
    );

  if (contenido.style.display === "none") {

    contenido.style.display = "block";

  } else {

    contenido.style.display = "none";

  }

}