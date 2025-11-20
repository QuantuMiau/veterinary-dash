// cargar productos en el DOM
document.addEventListener('DOMContentLoaded', async (params) => {
    await loadServices();
});

// cargar productos 
async function loadServices() {
    try {
        const response = await fetch('http://localhost:3000/services');

        if (!response.ok) {
            throw new Error('Error al cargar los servicios');
        }

        const services = await response.json();
        const tbody = document.getElementById('table-services').querySelector('tbody');

        if (!tbody) {
            throw new Error('El elemento <tbody> no se encontró dentro de #table-services');
        }

        tbody.innerHTML = '';

        services.forEach(service => {
            if (!service.id_concepto) {
                console.error('El servicio no tiene un ID válido:', service);
                return; // O maneja el caso de servicios sin ID
            }

            // Aquí verificamos si la duración es un número o un objeto con las propiedades hours y minutes
            let horas = 0;
            let minutos = 0;

            if (typeof service.duracion === 'number') {
                horas = Math.floor(service.duracion / 60);
                minutos = service.duracion % 60;
            } else if (service.duracion && typeof service.duracion === 'object') {
                horas = service.duracion.hours || 0;
                minutos = service.duracion.minutes || 0;
            }

            let duracion = '';
            if (horas > 0) {
                duracion = `${horas} horas y ${minutos} minutos`;
            } else if (minutos > 0) {
                duracion = `${minutos} minutos`;
            } else {
                duracion = 'Duración no especificada';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.nombre}</td>
                <td>${service.categoria}</td>
                <td>${service.precio}</td>
                <td>${duracion}</td>
                <td>
                    <button class="btn btn-gray btn-sm btn-edit" data-id="${service.id_concepto}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-gray btn-sm btn-delete" data-id="${service.id_concepto}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        addEventListeners(); // Asocia los eventos después de añadir las filas
    } catch (error) {
        console.error('Error al cargar los servicios:', error);
    }
}

// agregar funcionesa  botones
function addEventListeners() {
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', async (event) => {
            const serviceId = event.currentTarget.dataset.id; // Usa currentTarget para garantizar el botón correcto
            if (!serviceId) {
                console.error('Error: No se encontró el ID del servicio');
                return;
            }
            editService(serviceId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (event) => {
            const serviceId = event.currentTarget.dataset.id; // Usa currentTarget para garantizar el botón correcto
            if (!serviceId) {
                console.error('Error: No se encontró el ID del servicio');
                return;
            }
            deleteService(serviceId);
        });
    });
}
//registrar un nuevo servicio
document.getElementById('register-service').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('service-name').value;
    const category = document.getElementById('service-category').value;
    const cost = document.getElementById('service-cost').value;
    const price = document.getElementById('service-price').value;
    const hours = parseInt(document.getElementById('service-hours').value) || 0; // Asegurarse de que sea un número
    const minutes = parseInt(document.getElementById('service-minutes').value) || 0; // Asegurarse de que sea un número
    const duration = (hours * 60) + parseInt(minutes); // Convertir a minutos

    const userName = localStorage.getItem('usuario_nombre');
    try {
        const response = await fetch('http://localhost:3000/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario_nombre': userName
            },
            body: JSON.stringify({
                id_concepto: null,
                nombre: name,
                tipo: 'Servicio',
                categoria: category,
                costo: cost,
                precio: price,
                duracion: duration
            })
        });

        if (response.ok) {
            await loadServices();
            swal.fire({
            icon: 'success',
            title: 'Servicio registrado',
            text: 'El servicio se ha registrado correctamente.'
        }).then((result) => {
            if (result.isConfirmed) {
            location.reload();
            }
        });  
            document.getElementById('register-service').reset();
        }
        

        
    } catch (error) {
        console.error('Error al registrar el servicio:', error);
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar el servicio.'
        });
    }

});


// abrir modal con datos del producto
async function editService(serviceId) {
    try {
        const service = await searchByID(serviceId);

        document.getElementById('editService-name').value = service.nombre;
        document.getElementById('editService-category').value = service.categoria;
        document.getElementById('editService-price').value = service.precio;
       document.getElementById('editService-cost').value = service.costo;
        console.log(service.duracion.minutes);
        console.log(service.duracion.hours);
        
        // Asignar los valores a los campos del formulario
        document.getElementById('editService-hours').value = service.duracion.hours || 0;
        document.getElementById('editService-minutes').value = service.duracion.minutes || 0;

        const modal = document.getElementById('editServiceModal');
        modal.setAttribute('service-id', serviceId);
        
        const editModal = new bootstrap.Modal(document.getElementById('editServiceModal'));
        editModal.show();
    } catch (error) {
        console.error('Error al abrir el modal de edición:', error);
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el servicio para editar.'
        });
    }
}

// buscar por id
async function searchByID(serviceId) {
    const response = await fetch(`http://localhost:3000/services/id/${serviceId}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

    const product = await response.json();
    if (!response.ok) {
        return;
    }
    return product;
};

// actualizar servicio
document.getElementById('editServiceModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('editServiceModal');
    const serviceId = modal.getAttribute('service-id');

    const name = document.getElementById('editService-name').value;
    const category = document.getElementById('editService-category').value;
    const price = document.getElementById('editService-price').value;
    const cost = document.getElementById('editService-cost').value;
    const hours = parseInt(document.getElementById('editService-hours').value) || 0; // Asegurarse de que sea un número
    const minutes = parseInt(document.getElementById('editService-minutes').value) || 0; // Asegurarse de que sea un número

    const duration = (hours * 60) + parseInt(minutes);
    
    // Convertir a minutos

    if (true) {
        const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'usuario_nombre' : localStorage.getItem('usuario_nombre')},
            body: JSON.stringify({
                id_concepto: serviceId, 
                nombre: name,
                tipo: 'Servicio', 
                categoria: category, 
                costo: cost,
                precio: price,
                duracion: duration
            })
        });
    
        const data = await response.json();
    
        if (response.ok) {
            Swal.fire({
                title: data.message,
                icon: "success",
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
        } else {
            Swal.fire({
                title: data.details,
                icon: "error"
            });
        }

    }

});

// eliminar servicio
async function deleteService(serviceId) {
    try {
        const service = await searchByID(serviceId);
        if (!service) {
            console.error('Error: Servicio no encontrado');
            return;
        }
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar el servicio ${service.nombre}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await fetch(`http://localhost:3000/services/delete/${serviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'usuario_nombre': localStorage.getItem('usuario_nombre')
                }
            });

            if (response.ok) {
                await loadServices();
                Swal.fire({
                    icon: 'success',
                    title: 'Servicio eliminado',
                    text: `El servicio ${service.nombre} ha sido eliminado.`
                });
            } else {
                throw new Error('Error al eliminar el servicio');
            }
        }
    } catch (error) {
        swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el servicio.'
        });
    }
}

// buscar servicio por nombre
async function searchServiceByName(serviceName) {
    const response = await fetch(`http://localhost:3000/services/name/${serviceName}`, {
        method: 'GET',
    });

    const services = await response.json();
    if (!response.ok) {
        return;
    }
    return services;
}


// barra de busqueda // navbar
document.getElementById('searchbar-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('searchbar-input').value;

    if (!searchTerm) {
        return loadServices(); // Si no hay término de búsqueda, cargar todos los servicios
    }

    const serviceData = await searchServiceByName(searchTerm);
    console.log(serviceData);

    let horas = 0;
    let minutos = 0;

    if (serviceData[0] && typeof serviceData[0].duracion === 'object') { // Accediendo al primer elemento del array
        horas = serviceData[0].duracion.hours || 0;      // Extrae las horas, si existen
        minutos = serviceData[0].duracion.minutes || 0;  // Extrae los minutos, si existen
    } else if (typeof serviceData[0]?.duracion === 'number') { // Verifica si duracion es un número
        horas = Math.floor(serviceData[0].duracion / 60); // Calcula las horas basadas en un número
        minutos = serviceData[0].duracion % 60;          // Calcula los minutos restantes
    }

    let duracion = '';
    if (horas > 0) {
        duracion = `${horas} horas y ${minutos} minutos`;
    } else if (minutos > 0) {
        duracion = `${minutos} minutos`;
    } else {
        duracion = 'Duración no especificada';
    }



    if(!serviceData) {
        swal.fire({
            title: 'No se encontraron resultados',
            icon: 'info',
            confirmButtonText: 'OK',
        })
       } else{
        const tbody = document.getElementById('table-services').querySelector('tbody');
        tbody.innerHTML = ''; // Limpiar la tabla antes de agregar los resultados   
        if (serviceData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" class="text-center">No se encontraron resultados</td>`;
            tbody.appendChild(row);
        } else {
            serviceData.forEach(service => {
                const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.nombre}</td>
                <td>${service.categoria}</td>
                <td>${service.precio}</td>
                <td>${duracion}</td>
                <td>
                    <button class="btn btn-gray btn-sm btn-edit" product-id="${service.id_concepto}">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="btn btn-gray btn-sm btn-delete" product-id="${service.id_concepto}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>`;
            tbody.appendChild(row);
        });
    }
    // agrega eventos para cada botón
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('service-id');
            editProduct(productId);
        });
    });

    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('service-id');
            deleteProduct(productId);
        });
    });
   }

   
}
);