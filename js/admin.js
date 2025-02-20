document.addEventListener("DOMContentLoaded", async () => {
    const tablaCatalogo = document.getElementById("tabla-catalogo");

    try {
        const respuesta = await fetch("http://localhost:5000/api/peliculas");
        const comics = await respuesta.json();

        tablaCatalogo.innerHTML = comics.map(comic => `
            <tr>
                <td>${comic.titulo}</td>
                <td><a href="${comic.imagen}" target="_blank">Ver imagen</a></td>
                <td>${comic.descripcion}</td>
                <td>${comic.formato}</td>
                <td>${comic.creador}</td>
                <td>${new Date(comic.fecha).toLocaleDateString()}</td>
                <td>
                    ${comic.trailer ? `<a href="${comic.trailer}" target="_blank">Ver trailer</a>` : "Sin trailer"}
                </td>
                <td>
                    <button class="btn btn-warning btn-sm editar" data-id="${comic._id}">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm eliminar" data-id="${comic._id}">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join("");

        agregarEventosBotones();
    } catch (error) {
        console.error("Error al obtener los cómics:", error);
    }
});

function agregarEventosBotones() {
    document.querySelectorAll(".editar").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const id = e.target.closest("button").dataset.id;
            window.location.href = `formulario.html?id=${id}`; // Redirige con el ID
        });
    });

    document.querySelectorAll(".eliminar").forEach(boton => {
        boton.addEventListener("click", async (e) => {
            const id = e.target.closest("button").dataset.id;
            if (confirm("¿Estás seguro de eliminar este cómic?")) {
                await eliminarComic(id);
            }
        });
    });
}

async function eliminarComic(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/peliculas/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Cómic eliminado correctamente.");
            location.reload(); // Recargar la lista sin afectar lo demás
        } else {
            alert("Error al eliminar el cómic.");
        }
    } catch (error) {
        console.error("Error al eliminar cómic:", error);
    }
}
