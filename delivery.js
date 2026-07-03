import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

let pedidos = [];

let negocios = [];

async function cargarNegocios() {

  const snapshot =
    await getDocs(
      collection(db, "negocios")
    );

  negocios = [];

  snapshot.forEach(docSnap => {

    negocios.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

}

function escucharPedidos() {

  onSnapshot(
    collection(db, "pedidos"),
    (snapshot) => {

      pedidos = [];

      snapshot.forEach(docSnap => {

        pedidos.push({
          id: docSnap.id,
          ...docSnap.data()
        });

      });

      mostrarPedidos();

    }
  );

}

function mostrarPedidos() {

const miNombre =
  localStorage.getItem(
    "nombreDelivery"
  );

const misPedidos =
  pedidos.filter(
    p =>
      p.delivery === miNombre &&
      p.estado !== "entregado"
  );

const entregados =
  pedidos.filter(
    p =>
      p.delivery === miNombre &&
      p.estado === "entregado"
  );

  const contenedorMisPedidos =
  document.getElementById(
    "mis-pedidos"
  );

  const contenedorEntregados =
  document.getElementById(
    "pedidos-entregados"
  );

contenedorEntregados.innerHTML = "";

contenedorMisPedidos.innerHTML = "";

  const contenedor =
    document.getElementById("pedidos");

  contenedor.innerHTML = "";

  const pendientes =
  pedidos.filter(
    p => p.estado === "pendiente" &&
         !p.delivery
  );

document.getElementById(
  "contador-pedidos"
).textContent = pendientes.length;


  pendientes.forEach(pedido => {

    let productosHTML = "";

    pedido.productos.forEach(producto => {

      productosHTML += `
        <li>
          ${producto.nombre}
          x${producto.cantidad}
        </li>
      `;

    });

    contenedor.innerHTML += `
      <div class="pedido">

        <h2>
          Pedido ${pedido.id}
        </h2>

        <p>
          👤 ${pedido.nombre}
        </p>

        <p>
          🏠 ${pedido.direccion}
        </p>

        <ul>
          ${productosHTML}
        </ul>

        <p>
          💰 $${pedido.total}
        </p>

        <button
  class="aceptar-pedido"
  onclick="tomarPedido('${pedido.id}')">

  Aceptar pedido

</button>

      </div>
    `;

  });

misPedidos.forEach(pedido => {

  let productosHTML = "";

  pedido.productos.forEach(producto => {

    productosHTML += `
      <li>
        ${producto.nombre}
        x${producto.cantidad}
      </li>
    `;

  }
 );

 let opcionesNegocios = "";

negocios.forEach(negocio => {

  opcionesNegocios += `
    <option value="${negocio.nombre}">
      ${negocio.nombre}
    </option>
  `;

});

const tieneComidas =
  pedido.productos.some(
    producto =>
      producto.categoria === "Comidas"
  );

  contenedorMisPedidos.innerHTML += `

    <div class="pedido">

      <h2>
        Pedido ${pedido.id}
      </h2>

      <p>
        Estado: ${pedido.estado}
      </p>

${tieneComidas ? `

<label>Negocio</label>

<select id="negocio-${pedido.id}">
  ${opcionesNegocios}
</select>

<button
  onclick="guardarNegocio('${pedido.id}')">

  Guardar negocio

</button>

` : ""}

      <ul>
        ${productosHTML}
      </ul>

      <button
  class="estado-comprando"
  onclick="cambiarEstado('${pedido.id}','comprando')">

  Comprando

</button>

<button
  class="estado-camino"
  onclick="cambiarEstado('${pedido.id}','en_camino')">

  En camino

</button>

<button
  class="estado-entregado"
  onclick="cambiarEstado('${pedido.id}','entregado')">

  Entregado

</button>

    </div>

  `;

});



entregados.forEach(pedido => {

  let productosHTML = "";

  pedido.productos.forEach(producto => {

    productosHTML += `
      <li>
        ${producto.nombre}
        x${producto.cantidad}
      </li>
    `;

  }
 );

  contenedorEntregados.innerHTML += `

    <div class="pedido">

      <h2>
        Pedido ${pedido.id}
      </h2>

      <p>
        ✅ Entregado
      </p>

      <ul>
        ${productosHTML}
      </ul>

      <p>
        💰 $${pedido.total}
      </p>

    </div>

  `;

})
}

window.tomarPedido = async function(id) {

  const nombreDelivery =
    localStorage.getItem(
      "nombreDelivery"
    );

  if (!nombreDelivery) {

    alert(
      "Primero guardá tu nombre"
    );

    return;
  }

  const pedidoRef =
    doc(db, "pedidos", id);

  const pedidoSnap =
    await getDoc(pedidoRef);

  if (!pedidoSnap.exists()) {

    alert("Pedido no encontrado");
    return;
  }

  const pedido =
    pedidoSnap.data();

  if (pedido.delivery) {

    alert(
      "Este pedido ya fue tomado por otro delivery"
    );

    return;
  }

  await updateDoc(
    pedidoRef,
    {
      estado: "tomado",
      delivery: nombreDelivery
    }
  );

}

async function iniciar() {

  await cargarNegocios();

  escucharPedidos();

}

iniciar();

window.guardarNombreDelivery = function() {

  const nombre =
    document.getElementById(
      "nombre-delivery"
    ).value;

  if (!nombre) return;

  localStorage.setItem(
    "nombreDelivery",
    nombre
  );

  alert("Nombre guardado");

}

const nombreGuardado =
  localStorage.getItem(
    "nombreDelivery"
  );

if (nombreGuardado) {

  document.getElementById(
    "nombre-delivery"
  ).value = nombreGuardado;

}

window.cambiarEstado =
async function(id, estado) {

  await updateDoc(
    doc(db, "pedidos", id),
    {
      estado
    }
  );

}