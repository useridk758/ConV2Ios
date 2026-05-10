// Add this inside the Desktop = { ... } object
setWallpaper: function(url) {
    const wrapper = document.getElementById('desktop-wrapper');
    
    // Add a quick fade out/in effect
    wrapper.style.transition = "opacity 0.3s ease";
    wrapper.style.opacity = "0.8";
    
    setTimeout(() => {
        wrapper.style.backgroundImage = `url('${url}')`;
        wrapper.style.opacity = "1";
    }, 300);
},
