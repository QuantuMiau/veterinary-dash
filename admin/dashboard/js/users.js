// sera usado para después cuando tengamos clientes y pacientes
{/* <a href="user-details.html?id=${user._id}" class="btn btn-gray btn-sm"">
<i class="fa-solid fa-eye"></i>
</a> */}


// Register user
document.getElementById('register-user').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = String(document.getElementById('user-name').value);
    const lastName = String(document.getElementById('user-lastname').value);
    const motherLastName = String(document.getElementById('user-mothername').value);
    const email = String(document.getElementById('user-email').value);
    const password = String(document.getElementById('user-password').value);
    const phone = String(document.getElementById('user-phone').value);
    const role = String(document.getElementById('user-role').value);

    const response = await fetch('https://api-sandbox-f3ei.onrender.com/users', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({firstName, lastName, motherLastName, email, password, phone, role})
    })

    const user = await response.json();
    
    if (response.ok) {
        Swal.fire({
            title: "Usuario registrado exitosamente.",
            icon: "success"
        });

        const tbody = document.getElementById('users-table').querySelector('tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
                        <td>${user.firstName} ${user.lastName} ${user.motherLastName}</td>
                        <td>${user.role}</td>
                        <td>${user.email}</td> 
                        <td>${user.phone}</td>
                        <td>
                            <button class="btn btn-gray btn-sm btn-edit" user-id="${user._id}">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="btn btn-gray btn-sm btn-delete" user-id="${user._id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>`;
                        
        tbody.appendChild(row);

        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('user-id');
                editUser(userId);
            });
        });
    
        const deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('user-id');
                deleteUser(userId);
            });
        });

        document.getElementById('register-user').reset();
    } else {
        Swal.fire({
            title: "Error al registrar el usuario.",
            icon: "error"
        });
    }
});

// Query users
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('https://api-sandbox-f3ei.onrender.com/users', {
        method: 'GET',
    });

    const users = await response.json();

    const tbody = document.getElementById('users-table').querySelector('tbody');
    tbody.innerHTML = ''; 
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.firstName} ${user.lastName} ${user.motherLastName}</td>
            <td>${user.role}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>
                <button class="btn btn-gray btn-sm btn-edit" user-id="${user._id}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn btn-gray btn-sm btn-delete" user-id="${user._id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>`;
        tbody.appendChild(row);
    });

    // agrega eventos para cada botón 
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('user-id');
            editUser(userId);
        });
    });
    
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('user-id');
            deleteUser(userId);
        });
    });
});

// Open modal with user dats
async function editUser(userId) {
    try {
        const user = await searchByID(userId);

        document.getElementById('edit-user-name').value = user.firstName;
        document.getElementById('edit-user-lastname').value = user.lastName;
        document.getElementById('edit-user-mothername').value = user.motherLastName;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-phone').value = user.phone;
        document.getElementById('edit-user-role').value = user.role;

        // le asigna el atributo user-id al modal
        const modal = document.getElementById('editUserModal');
        modal.setAttribute('user-id', userId);

        const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
        editModal.show();
    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        alert('No se pudieron cargar los datos del usuario.');
    }
};

async function authPassword(email, password) {
    try {
        const response = await fetch('https://api-sandbox-f3ei.onrender.com/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log(data);
        
        if (data.access_token) {
            return true;
        } else {
            alert('Contraseña incorrecta')
            return false
        }
    } catch (error) {
        alert("Ocurrió un error: " + error.message);
    }
}

// Edit user
document.getElementById('editUserModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('editUserModal');
    const userId = modal.getAttribute('user-id');
    
    const firstName = document.getElementById('edit-user-name').value;
    const lastName = document.getElementById('edit-user-lastname').value;
    const motherLastName = document.getElementById('edit-user-mothername').value;
    const password = document.getElementById('edit-user-password').value;
    const email = document.getElementById('edit-user-email').value;
    const phone = document.getElementById('edit-user-phone').value;
    const role = document.getElementById('edit-user-role').value;
    
    // const bcrypt = dcodeIO.bcrypt;
    // const saltRounds = 10;
    
    // const password = await bcrypt.hash(plainPassword, saltRounds);
    // console.log(password);

    if (true) {
        const response = await fetch(`https://api-sandbox-f3ei.onrender.com/users/${userId}`, {
            method: 'PUT',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({firstName, lastName, motherLastName,password, email, phone, role})
        });
    
        const data = await response.json();
    
        if (response.ok) {
            Swal.fire({
                title: "Usuario actualizado exitosamente.",
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
                title: "Error al actualizar el usuario.",
                icon: "error"
            });
        }
    }

});

// Open delete modal with user info
async function deleteUser(userId) {
    try {
        const user = await searchByID(userId); 


        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `
                <p><strong>Nombre:</strong> ${user.firstName} ${user.lastName} ${user.motherLastName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Rol:</strong> ${user.role}</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            focusCancel: true
        });

        if (result.isConfirmed) {

            const response = await fetch(`https://api-sandbox-f3ei.onrender.com/users/${user._id}`, {
                method: 'DELETE'
            });
        
            if (response.ok) {
                Swal.fire({
                    title: "Usuario eliminado exitosamente.",
                    icon: "success",
                    confirmButtonText: 'OK',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                    location.reload();
                    }
                });       
                
            }
        }
    } catch (error) {
        Swal.fire({
            title: "Error al cargar los datos del usuario.",
            icon: "error"
        });
    }
}

// search user by id
async function searchByID(userId) {
    const response = await fetch(`https://api-sandbox-f3ei.onrender.com/users/id/${userId}`, {
        method: 'GET'
    });

    const user = await response.json();
    if (!response.ok) {
        return;
    }
    return user;
}
// search user by email
async function searchByEmail(userEmail) {
    const response = await fetch(`https://api-sandbox-f3ei.onrender.com/users/${userEmail}`, {
        method: 'GET'
    });

    try {
        const user = await response.json();
    if (response.ok) {
        return user;
    }
    } catch (error) {
        return null;
    }
}

document.getElementById('searchbar-btn').addEventListener('click', async () => {
    const user = document.getElementById('search-input').value.trim();

    if (!user) {
        await loadProducts();
        return;
    }

    console.log(user);
    
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user);
    console.log(isEmail);
    
    const userData = isEmail 
    ? await searchByEmail(user)
    : await searchByID(user);

    console.log(userData);
    

    if (!userData) {
        swal.fire({
            title: 'No se encontró el usuario',
            icon: 'info',
            confirmButtonText: 'OK',
        })
    } else{
        const tbody = document.getElementById('users-table').querySelector('tbody');
    document.querySelector('tbody').innerHTML = '';
        const row = document.createElement('tr');
        row.innerHTML = `<td>${userData._id}</td>
                        <td>${userData.firstName} ${userData.lastName} ${userData.motherLastName}</td>
                        <td>${userData.role}</td>
                        <td>${userData.email}</td> 
                        <td>${userData.phone}</td>
                        <td>
                            <button class="btn btn-gray btn-sm btn-edit" user-id="${userData._id}">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="btn btn-gray btn-sm btn-delete" user-id="${userData._id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>`;
                        
        tbody.appendChild(row);

        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('user-id');
                editUser(userId);
            });
        });
    
        const deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('user-id');
                deleteUser(userId);
            });
        });
    }

    
});




