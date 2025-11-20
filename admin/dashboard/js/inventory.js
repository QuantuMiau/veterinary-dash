// fn send to cloudinary

async function uploadImageToCloudinary(file) {
  const cloudName = "dwz8hazeu";
  const uploadPreset = "Veterinary-mobile";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url; // << URL final de la imagen
}

// registra un nuevo producto
document
  .getElementById("register-product")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("product-name").value;
    const code = document.getElementById("product-code").value;
    const type = parseInt(document.getElementById("product-type").value);

    const price = parseFloat(document.getElementById("product-price").value);
    const description = document.getElementById("product-description").value;
    const amount = parseInt(document.getElementById("product-amount").value);

    const imageFile = document.getElementById("product-image").files[0];

    let imageUrl = null;

    // if por si no subo imagen aunque es obligorio xd
    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (err) {
        Swal.fire({
          title: "Error subiendo imagen",
          text: err.message,
          icon: "error",
        });
        return; // NO continuar si falló Cloudinary
      }
    }

    const url = "http://192.168.1.18:3000/product";

    const bodyData = {
      productId: code,
      name: name,
      description: description,
      category: type,
      price: price,
      stock: amount,
      image: imageUrl, // ahora sí enviamos la URL o null
    };

    console.log("Enviando a API:", bodyData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    const resp = await response.json();
    console.log(resp);

    if (response.ok) {
      Swal.fire({
        title: `Producto agregado`,
        icon: "success",
      }).then(() => location.reload());

      document.getElementById("register-product").reset();
    } else {
      Swal.fire({
        title: resp.message || resp.details || "Error al registrar",
        icon: "error",
      });
    }
  });

// cargar productos al inicio
// Paginación
let currentPage = 1;
const productsPerPage = 12;
let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndStoreProducts();
  renderTableWithPagination();
});

async function fetchAndStoreProducts() {
  try {
    const response = await fetch("http://192.168.1.18:3000/product", {
      method: "GET",
    });
    if (!response.ok) throw new Error("Error al obtener los productos");
    allProducts = await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    allProducts = [];
  }
}

function renderTableWithPagination() {
  const tbody = document
    .getElementById("products-table")
    .querySelector("tbody");
  tbody.innerHTML = "";
  const startIdx = (currentPage - 1) * productsPerPage;
  const endIdx = startIdx + productsPerPage;
  const productsToShow = allProducts.slice(startIdx, endIdx);
  productsToShow.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price}</td>
      <td>${product.stock}</td>
      <td>
        <img src="${product.image_url}" alt="img" style="width:40px;height:40px;object-fit:cover;" />
      </td>
      <td>
        <button class="btn btn-gray btn-sm btn-edit" data-id="${product.product_id}">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="btn btn-gray btn-sm btn-delete" data-id="${product.product_id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
  addEventListeners();
  renderPaginationControls();
}

function renderPaginationControls() {
  const totalPages = Math.ceil(allProducts.length / productsPerPage);
  const container = document.getElementById("pagination-controls");
  container.innerHTML = "";
  if (totalPages <= 1) return;
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-outline-primary btn-sm mx-1";
  prevBtn.textContent = "Anterior";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTableWithPagination();
    }
  };
  container.appendChild(prevBtn);

  // Números de página
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `btn btn-sm mx-1 ${
      i === currentPage ? "btn-primary" : "btn-outline-primary"
    }`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      renderTableWithPagination();
    };
    container.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-outline-primary btn-sm mx-1";
  nextBtn.textContent = "Siguiente";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTableWithPagination();
    }
  };
  container.appendChild(nextBtn);
}

// Función para cargar los productos en la tabla
// La función loadProducts ya no se usa, ahora se usa renderTableWithPagination

// Función para agregar eventos a los botones
function addEventListeners() {
  document.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      editProduct(productId);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      deleteProduct(productId);
    });
  });
}

/// abrir modal con datos del producto
async function editProduct(productId) {
  try {
    const product = await searchByID(productId);

    document.getElementById("editProduct-name").value = product.name;
    document.getElementById("editProduct-description").value =
      product.description;
    document.getElementById("editProduct-category").value = product.category_id;
    document.getElementById("editProduct-price").value = product.price;
    document.getElementById("editProduct-stock").value = product.stock;
    document.getElementById("current-image").src = product.image_url;

    // le asigna el atributo user-id al modal
    const modal = document.getElementById("editProductModal");
    modal.setAttribute("product-id", productId);

    const editModal = new bootstrap.Modal(
      document.getElementById("editProductModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error al cargar los datos del producto:", error);
    Swal.fire({
      title: "Datos no recuperados.",
      icon: "error",
    });
  }
}

/// por ahora ya nos los uso xd
// buscar por id
async function searchByID(productId) {
  const response = await fetch(
    `http://192.168.1.18:3000/product/${productId}`,
    {
      method: "GET",
    }
  );

  const product = await response.json();
  if (!response.ok) {
    return;
  }
  return product;
}

// buscar por nombre
async function searchByName(productName) {
  const response = await fetch(
    `http://localhost:3000/products/name/${productName}`,
    {
      method: "GET",
    }
  );

  const product = await response.json();
  if (!response.ok) {
    return;
  }
  return product;
}

// editar producto por id
document
  .getElementById("editProductModal")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const modal = document.getElementById("editProductModal");
    const productId = modal.getAttribute("product-id");

    const name = document.getElementById("editProduct-name").value;
    const description = document.getElementById(
      "editProduct-description"
    ).value;

    const category = parseInt(
      document.getElementById("editProduct-category").value
    );

    const price = parseFloat(
      document.getElementById("editProduct-price").value
    ).toFixed(2);

    const stock = parseInt(document.getElementById("editProduct-stock").value);

    const imageFile = document.getElementById("editProduct-image").files[0];

    let image_url = null;

    if (imageFile) {
      try {
        image_url = await uploadImageToCloudinary(imageFile);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        Swal.fire({
          title: "Error al subir la imagen",
          icon: "error",
        });
        return; // detener el submit
      }
    }

    // const bcrypt = dcodeIO.bcrypt;
    // const saltRounds = 10;

    // const password = await bcrypt.hash(plainPassword, saltRounds);
    // console.log(password);

    if (true) {
      const response = await fetch(`http://192.168.1.18:3000/product`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          name: name,
          description: description,
          category: category,
          price: price,
          stock: stock,
          image: image_url,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: data.message,
          icon: "success",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload();
          }
        });
      } else {
        Swal.fire({
          title: data.details,
          icon: "error",
        });
      }
    }
  });

// eliminar producto por id de forma logica
async function deleteProduct(productId) {
  try {
    const product = await searchByID(productId);

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      html: `
                <p><strong>Nombre:</strong> ${product.name}</p>
                <p><strong>Descripción:</strong> ${product.description}</p>
            `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      focusCancel: true,
    });

    if (result.isConfirmed) {
      const response = await fetch(
        `http://localhost:3000/product/${productId}`,
        {
          method: "DELETE",
        }
      );

      const product = await response.json();
      if (response.ok) {
        Swal.fire({
          title: product.message,
          icon: "success",
          confirmButtonText: "OK",
          allowOutsideClick: false,
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
      icon: "error",
    });
  }
}

// barra de busqueda
document
  .getElementById("searchbar-btn")
  .addEventListener("click", async (e) => {
    const searchValue = document
      .getElementById("searchbar-input")
      .value.trim()
      .toLowerCase();
    currentPage = 1;
    await fetchAndStoreProducts();
    if (!searchValue) {
      renderTableWithPagination();
      return;
    }

    // filtrar por nombre
    allProducts = allProducts.filter(
      (product) =>
        product.name && product.name.toLowerCase().includes(searchValue)
    );
    if (allProducts.length === 0) {
      Swal.fire({
        title: "No se encontraron resultados",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
    renderTableWithPagination();
  });
