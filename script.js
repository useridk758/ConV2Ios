function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
    
    const dateStr = (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
    document.getElementById('date').textContent = dateStr;
}

function openApp(url) {
    // For a school site, opening in a new tab is safest for now
    window.open(url, '_blank');
}

setInterval(updateClock, 1000);
updateClock();
