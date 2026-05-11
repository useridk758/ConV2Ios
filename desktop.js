const APP_MANIFEST = {
    'settings': { title: 'Settings', template: 'app_templates/settings.html', width: 450, height: 400 },
    'files':    { title: 'Files',    template: 'app_templates/files.html',    width: 600, height: 450 },
    'calc':     { title: 'Calculator', template: 'app_templates/calculator.html', width: 280, height: 400 },
    'games':    { title: 'Steam Library', template: 'app_templates/games.html', width: 900, height: 600 },
    'camera':   { title: 'Camera',   template: 'app_templates/camera.html',   width: 400, height: 550 }
};

const Desktop = {
    currentZIndex: 100,
    activeDrag: { window: null, offsetX: 0, offsetY: 0 },

    init: function() {
        this.desktop = document.getElementById('desktop-wrapper');
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
    },

    updateClock: function() {
        const now = new Date();
        const hrs = now.getHours() % 12 || 12;
        const min = now.getMinutes().toString().padStart(2, '0');
        const clockEl = document.getElementById('clock');
        if(clockEl) clockEl.textContent = `${hrs}:${min} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    },

    setWallpaper: function(url) {
        const wrapper = document.getElementById('desktop-wrapper');
        wrapper.style.opacity = "0.9";
        setTimeout(() => {
            wrapper.style.backgroundImage = `url('${url}')`;
            wrapper.style.opacity = "1";
        }, 200);
    },

    launchGame: function(name, url) {
        const gameId = name.replace(/\s+/g, '-').toLowerCase();
        APP_MANIFEST[gameId] = { title: name, type: 'frame', url: url, width: 950, height: 650 };
        this.openApp(gameId);
    },

    openApp: async function(appId) {
        const manifest = APP_MANIFEST[appId];
        if (!manifest) return;

        if (document.getElementById(`window-${appId}`)) {
            const existing = document.getElementById(`window-${appId}`);
            existing.style.zIndex = this.currentZIndex++;
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
        
        windowClone.classList.add('opening');
        this.desktop.appendChild(windowClone);

        windowClone.querySelector('.window-header').onmousedown = (e) => this.onMouseDown(e, windowClone);

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
                
                // Special handling to make <script> tags in templates work
                const range = document.createRange();
                const fragment = range.createContextualFragment(html);
                contentArea.appendChild(fragment);

                if (appId === 'calc') this.initCalculator(contentArea);
            } catch (err) {
                contentArea.innerHTML = `<div style="padding:20px">Error loading app.</div>`;
            }
        }
        setTimeout(() => windowClone.classList.remove('opening'), 10);
    },

    onMouseDown: function(e, windowEl) {
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

    closeWindow: function(btn) {
        const win = btn.closest('.window');
        win.classList.add('closing');
        setTimeout(() => win.remove(), 300);
    },

    minimizeWindow: function(btn) {
        btn.closest('.window').classList.add('minimized');
    },

    maximizeWindow: function(btn) {
        const win = btn.closest('.window');
        if (win.style.width === "100vw") {
            win.style.width = "500px"; win.style.height = "400px";
        } else {
            win.style.width = "100vw"; win.style.height = "calc(100vh - 40px)";
            win.style.top = "0"; win.style.left = "0";
        }
    },

    initCalculator: function(container) {
        const display = container.querySelector('#calc-display');
        container.querySelectorAll('.num').forEach(btn => {
            btn.onclick = () => {
                if (display.innerText === '0') display.innerText = '';
                display.innerText += btn.innerText;
            };
        });
        container.querySelector('.eq').onclick = () => {
            try { display.innerText = eval(display.innerText.replace('×', '*').replace('÷', '/')); }
            catch { display.innerText = 'Error'; }
        };
        const clr = container.querySelector('.clear');
        if(clr) clr.onclick = () => display.innerText = '0';
    }
};

document.addEventListener('DOMContentLoaded', () => Desktop.init());
