document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/employe/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Respuesta del servidor al intentar iniciar sesión:", data);

    if (!response.ok) {
      document.getElementById("wrong-dats").innerText =
        data.message || "Credenciales incorrectas";
      return;
    }

    // Guardar token
    localStorage.setItem("token", data.access_token);

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Inicio de sesión exitoso",
    });

    setTimeout(() => {
      window.location.href = "./dashboard/home.html";
    }, 1500);
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un problema al iniciar sesión.",
    });
  }
});
