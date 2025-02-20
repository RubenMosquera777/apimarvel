async function cargarPeliculas() {
    try {
        const response = await fetch("/api/peliculas");
        const peliculas = await response.json();
        const container = document.getElementById("peliculas-container");

        container.innerHTML = ""; 

        peliculas.forEach((pelicula) => {
            const card = document.createElement("div");
            card.classList.add("col-md-4", "comic-card"); 

            card.innerHTML = `
                <div class="card">
                    <img src="${pelicula.imagen}" class="card-img-top" alt="${pelicula.titulo}">
                    <div class="card-body">
                        <h5 class="card-title comic-title">${pelicula.titulo}</h5>
                        <p class="card-text">${pelicula.descripcion}</p>
                        <a href="detalle.html?id=${pelicula._id}" class="btn btn-primary">Ver más</a>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar películas:", error);
    }
}

cargarPeliculas();
