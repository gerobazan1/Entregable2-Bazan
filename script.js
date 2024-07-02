class Producto {
    constructor(nombre, categoria, cantidad, precio) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.cantidad = cantidad;
        this.precio = precio;
    }
}

const productos = JSON.parse(localStorage.getItem('productos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('agregar').addEventListener('click', () => mostrarFormulario('agregar'));
    document.getElementById('buscar-producto').addEventListener('click', buscarProducto);
    document.getElementById('mostrarInventario').addEventListener('click', () => {
        document.getElementById('formulario').innerHTML = '';
        mostrarInventario();
    });

    document.getElementById('cerrarModal').addEventListener('click', cerrarModal);
    window.onclick = function(event) {
        if (event.target === document.getElementById('modal')) {
            cerrarModal();
        }
    };
});

const mostrarModal = (mensaje) => {
    document.getElementById('modal-mensaje').textContent = mensaje;
    document.getElementById('modal').style.display = "block";
};

const cerrarModal = () => {
    document.getElementById('modal').style.display = "none";
};

const guardarProductos = () => {
    localStorage.setItem('productos', JSON.stringify(productos));
};

const mostrarFormulario = (accion, titulo = '') => {
    document.getElementById('resultado').innerHTML = '';

    let formularioHTML = '';
    switch (accion) {
        case 'agregar':
            formularioHTML = `
                ${titulo}
                <h3>Agregar Producto</h3>
                <form id="form-agregar">
                    <label>Categoría: <input type="text" id="categoria"></label><br>
                    <label>Nombre: <input type="text" id="nombre"></label><br>
                    <label>Cantidad: <input type="number" id="cantidad" min="0"></label><br>
                    <label>Precio: <input type="number" step="0.01" id="precio"></label><br>
                    <button type="button" id="btn-agregar">Agregar</button>
                </form>
            `;
            break;
        case 'editar':
            formularioHTML = `
                ${titulo}
                <form id="form-editar">
                    <label>Cantidad: <input type="number" id="editar-cantidad" min="0"></label><br>
                    <label>Precio: <input type="number" step="0.01" id="editar-precio"></label><br>
                    <button type="submit">Editar</button>
                </form>
            `;
            break;
        default:
            formularioHTML = '';
    }
    document.getElementById('formulario').innerHTML = formularioHTML;
    
    if (accion === 'agregar') {
        document.getElementById('btn-agregar').addEventListener('click', function() {
            mostrarModalConfirmacion(
                `¿Estás seguro que deseas agregar el producto "${document.getElementById('nombre').value}"?`,
                () => {
                    agregarProducto();
                }
            );
        });
    }
};

const validarInt = (numero) => !isNaN(numero) && parseInt(numero) > 0;
const validarFloat = (numero) => !isNaN(numero) && parseFloat(numero) > 0;
const validarString = (texto) => typeof texto === 'string' && isNaN(texto) && texto.trim().length > 0;

const validarCampos = (categoria, nombre, cantidad, precio) => {
    if (!categoria || !nombre || !cantidad || !precio) {
        mostrarModal('Todos los campos son obligatorios.');
        return false;
    }
    if (!validarString(categoria)) {
        mostrarModal('La categoría debe ser un texto y no debe contener números.');
        return false;
    }
    if (!validarInt(cantidad)) {
        mostrarModal('La cantidad debe ser un número entero positivo.');
        return false;
    }
    if (!validarFloat(precio)) {
        mostrarModal('El precio debe ser un número positivo.');
        return false;
    }
    return true;
};

const agregarProducto = () => {
    const categoria = document.getElementById('categoria').value;
    const nombre = document.getElementById('nombre').value;
    let cantidad = document.getElementById('cantidad').value;
    let precio = document.getElementById('precio').value;

    if (!validarCampos(categoria, nombre, cantidad, precio)) return;

    cantidad = parseInt(cantidad);
    precio = parseFloat(precio);

    const nuevoProducto = new Producto(nombre, categoria, cantidad, precio);
    productos.push(nuevoProducto);
    guardarProductos();

    mostrarModal(`Producto "${nombre}" agregado con éxito.`);
    
    document.getElementById('form-agregar').reset();

    mostrarInventario();
};

const buscarProducto = () => {
    const categoria = document.getElementById('buscar-categoria').value.toLowerCase();
    const nombre = document.getElementById('buscar-nombre').value.toLowerCase();
    const cantidad = document.getElementById('buscar-cantidad').value;

    let productosFiltrados = productos;

    if (categoria) {
        productosFiltrados = productosFiltrados.filter(p => p.categoria.toLowerCase().includes(categoria));
    }

    if (nombre) {
        productosFiltrados = productosFiltrados.filter(p => p.nombre.toLowerCase().includes(nombre));
    }

    if (cantidad) {
        const cantidadInt = parseInt(cantidad);
        if (cantidadInt >= 0) {
            productosFiltrados = productosFiltrados.filter(p => p.cantidad === cantidadInt);
        } else {
            mostrarModal('La cantidad de búsqueda no puede ser menor que 0.');
            return;
        }
    }

    document.getElementById('formulario').innerHTML = '';
    document.getElementById('resultado').innerHTML = '';

    mostrarResultados(productosFiltrados);
};

const mostrarResultados = (productos) => {
    productos.sort((a, b) => {
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;
        if (a.nombre < b.nombre) return -1;
        if (a.nombre > b.nombre) return 1;
        if (a.precio < b.precio) return -1;
        if (a.precio > b.precio) return 1;
        return a.cantidad - b.cantidad;
    });

    let resultadosHTML = '<h2>Resultados de Búsqueda</h2>';
    if (productos.length === 0) {
        resultadosHTML += '<p>No se encontraron resultados.</p>';
    } else {
        resultadosHTML += '<ul>';
        productos.forEach(p => {
            resultadosHTML += `<li><strong>Categoría:</strong> ${p.categoria}</li>`;
            resultadosHTML += `<li><strong>Nombre:</strong> ${p.nombre}</li>`;
            resultadosHTML += `<li><strong>Cantidad:</strong> ${p.cantidad}</li>`;
            resultadosHTML += `<li><strong>Precio:</strong> ${p.precio}</li>`;
            resultadosHTML += `<button onclick="editarProductoForm('${p.nombre}')">
                                    <i class="bi bi-pencil-square"></i> Editar
                                </button>`;
            resultadosHTML += `<button onclick="eliminarProductoForm('${p.nombre}')">
                                    <i class="bi bi-trash"></i> Eliminar
                                </button>`;
            resultadosHTML += `<hr>`; 
        });
        resultadosHTML += '</ul>';
    }
    document.getElementById('resultado').innerHTML = resultadosHTML;
};

const mostrarInventario = () => {
    document.getElementById('formulario').innerHTML = '';
    document.getElementById('resultado').innerHTML = '';

    let inventarioHTML = '<h2>Inventario</h2>';
    if (productos.length === 0) {
        inventarioHTML += '<p>No hay productos en el inventario.</p>';
    } else {
        inventarioHTML += '<ul>';
        productos.forEach(p => {
            inventarioHTML += `<li><strong>Categoría:</strong> ${p.categoria}</li>`;
            inventarioHTML += `<li><strong>Nombre:</strong> ${p.nombre}</li>`;
            inventarioHTML += `<li><strong>Cantidad:</strong> ${p.cantidad}</li>`;
            inventarioHTML += `<li><strong>Precio:</strong> ${p.precio}</li>`;
            inventarioHTML += `<hr>`; 
        });
        inventarioHTML += '</ul>';
    }
    document.getElementById('resultado').innerHTML = inventarioHTML;
};

const editarProductoForm = (nombre) => {
    const producto = productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());

    if (!producto) {
        mostrarModal('No se encontró el producto con el nombre ingresado.');
        return;
    }

    const titulo = `<h3>Editando Producto: ${producto.nombre}</h3>`;

    mostrarFormulario('editar', titulo);

    document.getElementById('editar-cantidad').value = producto.cantidad;
    document.getElementById('editar-precio').value = producto.precio;

    document.getElementById('form-editar').addEventListener('submit', function(event) {
        event.preventDefault();
        mostrarModalConfirmacion(
            `¿Estás seguro que deseas editar el producto "${nombre}"?`,
            () => {
                editarProducto(nombre); 
            }
        );
    });
};

const eliminarProductoForm = (nombre) => {
    mostrarModalConfirmacion(
        `¿Estás seguro que deseas eliminar el producto "${nombre}"?`,
        () => {
            eliminarProducto(nombre);
        }
    );
};

const editarProducto = (nombre) => {
    const index = productos.findIndex(p => p.nombre.toLowerCase() === nombre.toLowerCase());

    if (index === -1) {
        mostrarModal('No se encontró el producto con el nombre ingresado.');
        return;
    }

    let nuevaCantidad = document.getElementById('editar-cantidad').value;
    let nuevoPrecio = document.getElementById('editar-precio').value;

    if (!nuevaCantidad) {
        nuevaCantidad = productos[index].cantidad;
    } else if (!validarInt(nuevaCantidad)) {
        mostrarModal('La cantidad debe ser un número entero positivo.');
        return;
    } else {
        nuevaCantidad = parseInt(nuevaCantidad);
    }

    if (!nuevoPrecio) {
        nuevoPrecio = productos[index].precio;
    } else if (!validarFloat(nuevoPrecio)) {
        mostrarModal('El precio debe ser un número positivo.');
        return;
    } else {
        nuevoPrecio = parseFloat(nuevoPrecio);
    }

    productos[index].cantidad = nuevaCantidad;
    productos[index].precio = nuevoPrecio;
    guardarProductos();
    mostrarModal(`Producto "${nombre}" editado con éxito.`);
    mostrarInventario();
};

const eliminarProducto = (nombre) => {
    const index = productos.findIndex(p => p.nombre.toLowerCase() === nombre.toLowerCase());

    if (index === -1) {
        mostrarModal('No se encontró el producto con el nombre ingresado.');
        return;
    }

    productos.splice(index, 1);
    guardarProductos();
    mostrarModal(`Producto "${nombre}" eliminado con éxito.`);
    mostrarInventario();
};

const mostrarModalConfirmacion = (mensaje, callbackAceptar) => {
    mostrarModal(mensaje);
    const btnAceptar = document.createElement('button');
    btnAceptar.textContent = 'Aceptar';
    btnAceptar.addEventListener('click', () => {
        callbackAceptar();
        cerrarModal();
    });
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.addEventListener('click', cerrarModal);

    document.getElementById('modal-botones').innerHTML = '';
    document.getElementById('modal-botones').appendChild(btnAceptar);
    document.getElementById('modal-botones').appendChild(btnCancelar);
};