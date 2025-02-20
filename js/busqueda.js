document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("input", () => {
        const searchText = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".comic-card");

        cards.forEach(card => {
            const title = card.querySelector(".comic-title").textContent.toLowerCase();
            card.style.display = title.includes(searchText) ? "block" : "none";
        });
    });
});
