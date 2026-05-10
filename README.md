# Con iOS 🌌

**Con iOS** is a web-based "Virtual Desktop" interface designed to look and feel like a modern operating system. It provides a clean, organized space to access unblocked games and web apps directly from a browser.

## 🚀 Features
* **Web OS Interface:** A familiar desktop environment with a taskbar and app icons.
* **Custom Wallpaper:** Features a high-definition sunset mountain aesthetic.
* **Real-time Clock:** Integrated system tray with a live time and date display.
* **Lightweight:** Built with pure HTML, CSS, and JavaScript—no heavy frameworks required.

## 📸 Preview
The interface mimics a desktop environment with a glassy taskbar and a grid-based app layout, optimized for quick navigation.

## 🛠️ How to Add Games
To add more games to your desktop, open `index.html` and add a new icon div inside the `app-grid` section:

```html
<div class="icon" onclick="openApp('URL_TO_GAME')">
    <img src="URL_TO_ICON" alt="Game Name">
    <span>Game Name</span>
</div>
