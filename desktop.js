// A database of known apps/services to load
const APP_MANIFEST = {
    'settings': { title: 'Settings', template: 'app_templates/settings.html', width: 450, height: 400 },
    'files':    { title: 'Files',    template: 'app_templates/files.html',    width: 600, height: 450 },
    'calc':     { title: 'Calculator',template: 'app_templates/calculator.html',width: 250, height: 350 },
    
    // How to handle standard web links (like Roblox)
    'roblox':   { title: 'Roblox (PROXY TEST)', type: 'frame', url: 'https://poki.com' } // Using poki for embedding demo
};

const Desktop = {
    currentZIndex: 100, // Windows on top

    init: function() {
        this.desktop = document.getElementById('desktop-wrapper');
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        
        // Setup Drag Event Listeners on the Desktop area
        this.desktop.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.desktop.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.desktop.addEventListener('mouseup',   (e) => this.onMouseUp(e));
        
        // Touch events for drag (optional)
        // this.desktop.addEventListener('touchstart', (e) => this.onMouseDown(e));
        // this.desktop.addEventListener('touchmove',  (e) => this.onMouseMove(e));
        // this.desktop.addEventListener('touchend',   (e) => this.onMouseUp(e));
    },

    updateClock: function() {
        const now = new Date();
        const hrs = now.getHours() % 12 || 12;
        const min = now.getMinutes().toString().padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        document.getElementById('clock').textContent = `${hrs}:${min} ${ampm}`;
    },

    openApp: async function(appId) {
        const manifest = APP_MANIFEST[appId];
        if (!manifest) return;

        // Clone the template structure
        const template = document.getElementById('window-template');
        const windowClone = template.content.firstElementChild.cloneNode(true);
        const contentArea = windowClone.querySelector('.window-content');
        
        // Set unique properties
        windowClone.id = `window-${appId}`;
        windowClone.style.zIndex = this.currentZIndex++;
        windowClone.querySelector('.window-title').textContent = manifest.title;
        windowClone.style.width = manifest.width + 'px';
        windowClone.style.height = manifest.height + 'px';
        
        // Place in slightly random position so they don't stack perfectly
        const randomOffset = 15 + Math.random() * 40;
        windowClone.style.top = (100 + randomOffset) + 'px';
        windowClone.style.left = (100 + randomOffset) + 'px';

        // Add the 'opening' state for smooth scale in
        windowClone.classList.add('opening');
        this.desktop.appendChild(windowClone);

        // Load content based on type (Internal HTML or External Frame)
        if (manifest.type === 'frame') {
            const iframe = document.createElement('iframe');
            iframe.src = manifest.url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            contentArea.appendChild(iframe);
        } else {
            // Load local HTML file
            try {
                const response = await fetch(manifest.template);
                if (response.ok) {
                    contentArea.innerHTML = await response.text();
                } else {
                    contentArea.textContent = "Error loading template.";
                }
            } catch (err) { contentArea.textContent = "Error fetching app: " + err; }
        }

        // Trigger opening animation
        setTimeout(() => windowClone.classList.remove('opening'), 10);
    },

    // --- Drag and Drop Interface ---
    activeDrag: { window: null, offsetX: 0, offsetY: 0 },

    onMouseDown: function(e) {
        // Did we click a window? (Check parents)
        const windowEl = e.target.closest('.window');
        if (!windowEl) return;
        
        // Focus the window (bring to front)
        windowEl.style.zIndex = this.currentZIndex++;

        // Was it specifically the header (draggable part) that was clicked?
        if (e.target.closest('.window-header')) {
            const rect = windowEl.getBoundingClientRect();
            
            this.activeDrag.window = windowEl;
            this.activeDrag.offsetX = (e.clientX || e.touches[0].clientX) - rect.left;
            this.activeDrag.offsetY = (e.clientY || e.touches[0].clientY) - rect.top;
            
            // Add 'dragging' class to disable CSS transitions for immediate feedback
            windowEl.classList.add('dragging');
        }
    },

    onMouseMove: function(e) {
        if (!this.activeDrag.window) return;

        e.preventDefault(); // Stop standard browser behavior (like scrolling on touch)

        const win = this.activeDrag.window;
        const dRect = this.desktop.getBoundingClientRect();
        const mouseX = e.clientX || (e.touches ? e.touches[0].clientX : null);
        const mouseY = e.clientY || (e.touches ? e.touches[0].clientY : null);

        if(mouseX === null) return;

        // Calculate new position
        let newX = mouseX - this.activeDrag.offsetX - dRect.left;
        let newY = mouseY - this.activeDrag.offsetY - dRect.top;

        // Boundary enforcement (keep inside desktop area)
        newX = Math.max(0, Math.min(newX, dRect.width - win.offsetWidth));
        newY = Math.max(0, Math.min(newY, dRect.height - 40 - win.offsetHeight)); // 40 is taskbar height

        win.style.left = newX + 'px';
        win.style.top = newY + 'px';
    },

    onMouseUp: function(e) {
        if (!this.activeDrag.window) return;
        
        // Remove dragging class to re-enable smooth transitions for other controls
        this.activeDrag.window.classList.remove('dragging');
        this.activeDrag.window = null;
    },

    // --- Window Controls Interface ---
    closeWindow: function(controlBtn) {
        const windowEl = controlBtn.closest('.window');
        windowEl.classList.add('closing');
        // Wait for smooth animation to finish before removal
        setTimeout(() => windowEl.remove(), 250); 
    },

    maximizeWindow: function(controlBtn) {
        const win = controlBtn.closest('.window');
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            // Restore original position/size (requires advanced tracking, simple reset for now)
            win.style.top = '150px';
            win.style.left = '150px';
            win.style.width = '400px';
            win.style.height = '300px';
        } else {
            win.classList.add('maximized');
            // Snappy snap to full size (override JS values temporarily)
            win.style.top = '0';
            win.style.left = '0';
            win.style.width = '100vw';
            win.style.height = 'calc(100vh - 40px)'; // Full height above taskbar
        }
    },

    minimizeWindow: function(controlBtn) {
        const win = controlBtn.closest('.window');
        win.classList.add('minimized');
        // Handle taskbar interaction here later (e.g., adding an active app icon)
    }
};

// Start the OS when DOM is ready
document.addEventListener('DOMContentLoaded', () => Desktop.init());
