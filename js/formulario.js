document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const formulario = document.getElementById("formulario-comic");

    if (id) {
        cargarDatosPelicula(id);
    }

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("titulo", document.getElementById("titulo").value);
        formData.append("descripcion", document.getElementById("descripcion").value);
        formData.append("formato", document.getElementById("formato").value);
        formData.append("creador", document.getElementById("creador").value);
        formData.append("fecha", document.getElementById("fecha").value);
        formData.append("trailer", document.getElementById("trailer").value);


        const imagenInput = document.getElementById("imagen").files[0];
        if (imagenInput) {
            formData.append("imagen", imagenInput);
        }

        if (id) {
            await fetch(`http://localhost:5000/api/peliculas/${id}`, {
                method: "PUT",
                body: formData
            })
            .then(response => response.json())
            .then(() => {
                alert("Cómic actualizado correctamente.");
                window.location.href = "admin.html";
            })
            .catch(error => console.error("Error al actualizar el cómic:", error));
        } else {
            await fetch("http://localhost:5000/api/peliculas/", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(() => {
                alert("Cómic agregado correctamente.");
                window.location.href = "admin.html";
            })
            .catch(error => console.error("Error al guardar el cómic:", error));
        }
    });
});

// Cargar los datos del cómic cuando se edita
async function cargarDatosPelicula(id) {
    try {
        const respuesta = await fetch(`http://localhost:5000/api/peliculas/${id}`);
        const comic = await respuesta.json();

        document.getElementById("titulo").value = comic.titulo;
        document.getElementById("descripcion").value = comic.descripcion;
        document.getElementById("formato").value = comic.formato;
        document.getElementById("creador").value = comic.creador;
        document.getElementById("fecha").value = comic.fecha.split("T")[0];
        document.getElementById("trailer").value = comic.trailer || "";


        if (comic.imagen) {
            document.getElementById("vista-previa").src = comic.imagen;
            document.getElementById("vista-previa").style.display = "block";
        }
    } catch (error) {
        console.error("Error al cargar los datos del cómic:", error);
    }
}
