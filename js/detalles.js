async function cargarDetalles() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.error("No se encontró un ID de película en la URL.");
        return;
    }

    try {
        const response = await fetch(`/api/peliculas/${id}`);
        if (!response.ok) {
            throw new Error("No se encontró la película.");
        }

        const pelicula = await response.json();

        // Verifica si los elementos existen antes de modificarlos
        const tituloElemento = document.querySelector("h2");
        const detalleElemento = document.querySelector(".detalle-info");
        const imagenElemento = document.querySelector(".imagen-detalle img");

        if (tituloElemento) tituloElemento.textContent = pelicula.titulo;
        if (imagenElemento) {
            imagenElemento.src = pelicula.imagen;
            imagenElemento.alt = pelicula.titulo;
        }
        if (detalleElemento) {
            detalleElemento.innerHTML = `
                <p><strong>Formato:</strong> ${pelicula.formato}</p>
                <p><strong>Creador:</strong> ${pelicula.creador}</p>
                <p><strong>Descripción:</strong> ${pelicula.descripcion}</p>
                <p><strong>Fecha de Publicación:</strong> ${new Date(pelicula.fecha).toLocaleDateString()}</p>
            `;


            // Agregar tráiler
            if (pelicula.trailer) {
                const videoID = pelicula.trailer.split("v=")[1]?.split("&")[0] || pelicula.trailer.split("youtu.be/")[1]?.split("?")[0];
                if (videoID) {
                    document.getElementById("trailer-video").src = `https://www.youtube.com/embed/${videoID}?autoplay=1`;
                    document.getElementById("trailer-container").style.display = "block";
                }
            }
        }
    } catch (error) {
        console.error("Error al cargar detalles:", error);
    }




}

document.addEventListener("DOMContentLoaded", cargarDetalles);
