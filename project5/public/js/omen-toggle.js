document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const omenMenu = document.querySelector('.omen-menu');
    
    toggleBtn.addEventListener('click', function() {
        omenMenu.classList.toggle('show');
        this.classList.toggle('active');
    });
    

    const omenNames = document.querySelectorAll('.omen-name');
    
    omenNames.forEach(name => {
        name.addEventListener('click', function() {
            // get the omen
            const parent = this.closest('.omen-item');
            // expand
            parent.classList.toggle('expanded');
        });
    });
});


window.addEventListener("DOMContentLoaded", () => {
    const bell = document.getElementById("fortune-sound");
    if (bell) bell.play();
  });