const APP_MANIFEST = {
    'settings': { title: 'Settings', template: 'app_templates/settings.html', width: 450, height: 400 },
    'files':    { title: 'Files',    template: 'app_templates/files.html',    width: 600, height: 450 },
    'calc':     { title: 'Calculator', template: 'app_templates/calculator.html', width: 280, height: 400 },
    'roblox':   { title: 'Roblox', type: 'frame', url: 'https://nowgg.lol/play/roblox-corporation/5349/roblox', width: 800, height: 600 }
};

const Desktop = {
    currentZIndex: 100,
    activeDrag: { window: null, offsetX: 0, offsetY: 0 },

    init: function() {
        this.desktop = document.getElementById('desktop-wrapper');
        
        // Start Clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Global Listeners for Dragging
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        console.log("Con iOS Initialized");
    },

    updateClock: function() {
        const now = new Date();
        const hrs = now.getHours() % 12 || 12;
        const min = now.getMinutes().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const clockEl = document.getElementById('clock');
        if(clockEl) clockEl.textContent = `${hrs}:${min} ${ampm}`;
    },

    // --- Wallpaper Logic ---
    setWallpaper: function(url) {
        const wrapper = document.getElementById('desktop-wrapper');
        wrapper.style.opacity = "0.9";
        setTimeout(() => {
            wrapper.style.backgroundImage = `url('${url}')`;
            wrapper.style.opacity = "1";
        }, 200);
    },

    // --- Window Management ---
    openApp: async function(appId) {
        const manifest = APP_MANIFEST[appId];
        if (!manifest) return;

        // Check if already open
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
        
        // Centering the window
        windowClone.style.top = "15%";
        windowClone.style.left = "25%";

        windowClone.classList.add('opening');
        this.desktop.appendChild(windowClone);

        // Header click to focus and drag
        const header = windowClone.querySelector('.window-header');
        header.onmousedown = (e) => this.onMouseDown(e, windowClone);

        // Load Content
        if (manifest.type === 'frame') {
            const iframe = document.createElement('iframe');
            iframe.src = manifest.url;
            contentArea.appendChild(iframe);
        } else {
            try {
                const response = await fetch(manifest.template);
                const html = await response.text();
                contentArea.innerHTML = html;
                
                // If the app is the calculator, we need to manually trigger its logic
                if (appId === 'calc') this.initCalculator(contentArea);
            } catch (err) {
                contentArea.innerHTML = `<div style="padding:20px">Error loading ${manifest.title}</div>`;
            }
        }

        setTimeout(() => windowClone.classList.remove('opening'), 10);
    },

    // --- Drag Logic ---
    onMouseDown: function(e, windowEl) {
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

    // --- Control Buttons ---
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
            win.style.width = "400px";
            win.style.height = "300px";
            win.style.top = "100px";
            win.style.left = "100px";
        } else {
            win.style.width = "100vw";
            win.style.height = "calc(100vh - 40px)";
            win.style.top = "0";
            win.style.left = "0";
        }
    },

    // --- Calculator Logic Helper ---
    initCalculator: function(container) {
        const display = container.querySelector('#calc-display');
        container.querySelectorAll('.num').forEach(btn => {
            btn.onclick = () => {
                if (display.innerText === '0' || display.innerText === 'Error') display.innerText = '';
                display.innerText += btn.innerText;
            };
        });
        container.querySelector('.eq').onclick = () => {
            try {
                // Using a basic Function constructor for math safety
                display.innerText = Function('"use strict";return (' + display.innerText.replace('×', '*').replace('÷', '/') + ')')();
            } catch {
                display.innerText = 'Error';
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => Desktop.init());
