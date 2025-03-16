// Sidebar menu item interaction
const menuItems = document.querySelectorAll(".sidebar a");
const homeContent = document.getElementById("home-content");
const homeCarousel = document.getElementById("home-carousel");

function updateContentVisibility() {
    const isHomeActive = document.querySelector(".sidebar a.active[href='#home']");
    
    // Show or hide the home content and carousel based on the active state
    homeContent.style.display = isHomeActive ? "block" : "none";
    homeCarousel.style.display = isHomeActive ? "block" : "none";
}

menuItems.forEach(item => {
    item.addEventListener("click", function () {
        menuItems.forEach(i => i.classList.remove("active"));
        this.classList.add("active");
        updateContentVisibility();
    });
});