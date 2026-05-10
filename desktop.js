const APP_MANIFEST = {
    'settings': { title: 'Settings', template: 'app_templates/settings.html', width: 450, height: 400 },
    'files':    { title: 'Files',    template: 'app_templates/files.html',    width: 600, height: 450 },
    'calc':     { title: 'Calculator', template: 'app_templates/calculator.html', width: 280, height: 400 },
    'games':    { title: 'Steam Library', template: 'app_templates/games.html', width: 900, height: 600 }
};

const Desktop = {
    currentZIndex: 100,
    activeDrag: { window: null, offsetX: 0, offsetY: 0 },

    init: function() {
        this.desktop = document.getElementById('desktop-wrapper');
        
        // Initialize clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Global Listeners for Mouse Movement
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        console.log("Axiom OS Initialized");
    },

    updateClock: function() {
        const now = new Date();
        const hrs = now.getHours() % 12 || 12;
        const min = now.getMinutes().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const clockEl = document.getElementById('clock');
        if(clockEl) clockEl.textContent = `${hrs}:${min} ${ampm}`;
    },

    // --- Wallpaper System ---
    setWallpaper: function(url) {
        const wrapper = document.getElementById('desktop-wrapper');
        wrapper.style.opacity = "0.9";
        setTimeout(() => {
            wrapper.style.backgroundImage = `url('${url}')`;
            wrapper.style.opacity = "1";
        }, 200);
    },

    // --- Steam Game Launcher Logic ---
    launchGame: function(name, url) {
        const gameId = name.replace(/\s+/g, '-').toLowerCase();
        
        // Dynamically add game to manifest so openApp can handle it
        APP_MANIFEST[gameId] = { 
            title: name, 
            type: 'frame', 
            url: url, 
            width: 950, 
            height: 650 
        };
        
        this.openApp(gameId);
    },

    // --- Core Window Logic ---
    openApp: async function(appId) {
        const manifest = APP_MANIFEST[appId];
        if (!manifest) return;

        // Bring to front if already open
        if (document.getElementById(`window-${appId}`)) {
            const existing = document.getElementById(`window-${appId}`);
            existing.style.zIndex = this.currentZIndex++;
            existing.classList.remove('minimized');
            return;
        }

        const template = document.getElementById('window-template');
        const windowClone = template.content.firstElementChild.cloneNode(true);
        const contentArea = windowClone.querySelector('.window-content');
        
        windowClone.id = `window-${appId}`;
        windowClone.style.zIndex = this.currentZIndex++;
        windowClone.querySelector('.window-title').textContent = manifest.title;
        windowClone.style.width = manifest.width + 'px';
        windowClone.style.height = manifest.height + 'px';
        
        // Default spawn position
        windowClone.style.top = "10%";
        windowClone.style.left = "15%";

        windowClone.classList.add('opening');
        this.desktop.appendChild(windowClone);

        // Header events
        const header = windowClone.querySelector('.window-header');
        header.onmousedown = (e) => this.onMouseDown(e, windowClone);

        // Content Loader
        if (manifest.type === 'frame') {
            const iframe = document.createElement('iframe');
            iframe.src = manifest.url;
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            contentArea.appendChild(iframe);
        } else {
            try {
                const response = await fetch(manifest.template);
                const html = await response.text();
                contentArea.innerHTML = html;
                
                // Re-init special app logic
                if (appId === 'calc') this.initCalculator(contentArea);
            } catch (err) {
                contentArea.innerHTML = `<div style="padding:20px">Failed to load ${manifest.title}</div>`;
            }
        }

        setTimeout(() => windowClone.classList.remove('opening'), 10);
    },

    // --- Drag and Drop Logic ---
    onMouseDown: function(e, windowEl) {
        // Don't drag if clicking buttons
        if (e.target.closest('.control')) return;

        windowEl.style.zIndex = this.currentZIndex++;
        this.activeDrag.window = windowEl;
        const rect = windowEl.getBoundingClientRect();
        this.activeDrag.offsetX = e.clientX - rect.left;
        this.activeDrag.offsetY = e.clientY - rect.top;
        windowEl.classList.add('dragging');
    },

    onMouseMove: function(e) {
        if (!this.activeDrag.window) return;
        const win = this.activeDrag.window;
        win.style.left = (e.clientX - this.activeDrag.offsetX) + 'px';
        win.style.top = (e.clientY - this.activeDrag.offsetY) + 'px';
    },

    onMouseUp: function() {
        if (this.activeDrag.window) {
            this.activeDrag.window.classList.remove('dragging');
            this.activeDrag.window = null;
        }
    },

    // --- Window Controls ---
    closeWindow: function(btn) {
        const win = btn.closest('.window');
        win.classList.add('closing');
        setTimeout(() => win.remove(), 300);
    },

    minimizeWindow: function(btn) {
        const win = btn.closest('.window');
        win.classList.add('minimized');
    },

    maximizeWindow: function(btn) {
        const win = btn.closest('.window');
        if (win.style.width === "100vw") {
            win.style.width = "500px";
            win.style.height = "400px";
            win.style.top = "100px";
            win.style.left = "100px";
        } else {
            win.style.width = "100vw";
            win.style.height = "calc(100vh - 40px)";
            win.style.top = "0";
            win.style.left = "0";
        }
    },

    // --- App Specific Helpers ---
    initCalculator: function(container) {
        const display = container.querySelector('#calc-display');
        container.querySelectorAll('.num').forEach(btn => {
            btn.onclick = () => {
                if (display.innerText === '0') display.innerText = '';
                display.innerText += btn.innerText;
            };
        });
        container.querySelector('.eq').onclick = () => {
            try {
                // Using basic eval for the simple calculator
                display.innerText = eval(display.innerText.replace('×', '*').replace('÷', '/'));
            } catch {
                display.innerText = 'Error';
            }
        };
        const clearBtn = container.querySelector('.clear');
        if(clearBtn) clearBtn.onclick = () => display.innerText = '0';
    }
};

// Start the OS
document.addEventListener('DOMContentLoaded', () => Desktop.init());
