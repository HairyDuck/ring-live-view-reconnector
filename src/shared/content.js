// Ring.com Stay Connected - content script only (no page script injection)
//
// WORKAROUND: We do NOT inject any script into the page. Injected scripts can be blocked by
// Ring (e.g. Content-Security-Policy). Instead we run entirely in the content script, which
// Chrome allows and the page cannot disable. We share the same DOM, so we find the Reconnect
// control by visible text and aria-label only and call element.click(). All Chrome-extension
// compliant; no eval(), no remote code, no injection.

const DEBUG = true;
const POLL_MS = 6000;  // How often to look for Reconnect (content script only)

console.log('[Ring Reconnector] Content script loaded');
function debugLog(msg, important = false) {
    if (DEBUG && (important || !document.body)) console.log('[Ring Reconnector] ' + msg);
}

function injectStyles() {
    if (!document.head) return false;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ring-reconnector-notification {
            position: fixed; top: 29px; right: 68px; width: 22px; height: 24px; z-index: 9999;
            opacity: 0; transition: opacity 0.3s ease-in-out; pointer-events: none;
            filter: drop-shadow(0 0 2px rgba(33, 150, 243, 0.3));
        }
        .ring-reconnector-notification.show { opacity: 1; }
        .ring-reconnector-notification svg { width: 100%; height: 100%; animation: rotate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .ring-reconnector-notification circle { stroke: url(#ring-gradient); }
    `;
    document.head.appendChild(style);
    return true;
}

// Reconnect wording in multiple languages (visible text / aria-label only; no selectors)
const RECONNECT_WORDS = [
    'Reconnect', 'Reconectar', 'Reconnecter', 'Verbindung wiederherstellen',
    'Riconnetti', 'Opnieuw verbinden', 'Yeniden bağlan', 'Připojit znovu',
    'Połącz ponownie', 'Újracsatlakozás', '重新连接', '再接続',
    'Reconnect session', 'Stay connected', 'Continue viewing'
];

function norm(s) {
    return (s || '').trim().toLowerCase();
}

function hasReconnectText(el) {
    const text = norm(el.innerText || el.textContent);
    const label = norm(el.getAttribute && el.getAttribute('aria-label'));
    const combined = text + ' ' + label;
    return RECONNECT_WORDS.some(w => combined.includes(norm(w)));
}

function isVisible(el) {
    if (!el || !el.offsetParent) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

// Collect all elements that might be the Reconnect control (including inside shadow roots)
function collectClickables(root, out) {
    if (!root) return;
    const selectors = 'button, [role="button"], a[href="#"]';
    try {
        const list = root.querySelectorAll(selectors);
        for (const el of list) {
            out.push(el);
        }
    } catch (_) {}
    const all = root.querySelectorAll('*');
    for (const el of all) {
        if (el.shadowRoot) collectClickables(el.shadowRoot, out);
    }
}

function findAndClickReconnect() {
    const candidates = [];
    collectClickables(document, candidates);
    for (const el of candidates) {
        if (hasReconnectText(el) && isVisible(el)) {
            try {
                if (typeof el.click === 'function') {
                    el.click();
                    debugLog('Clicked Reconnect (content script)', true);
                    return true;
                }
            } catch (e) {
                debugLog('Click error: ' + e.message, true);
            }
        }
    }
    return false;
}

function initialize() {
    try {
        const notification = document.createElement('div');
        notification.className = 'ring-reconnector-notification';
        notification.title = 'Ring Live View Reconnector - Reconnecting...';
        notification.innerHTML = `
            <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#90CAF9;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <circle cx="15" cy="15" r="12" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="56 20"/>
            </svg>
        `;

        function insertNotification() {
            const header = document.querySelector('[data-testid="video-player-header"]');
            if (header) {
                const closeButton = header.querySelector('[class*="CloseButton"]') || header.querySelector('button');
                if (closeButton) {
                    closeButton.parentNode.insertBefore(notification, closeButton);
                    return true;
                }
                header.appendChild(notification);
                return true;
            }
            return false;
        }

        function showReconnectNotification() {
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2000);
        }

        function poll() {
            if (findAndClickReconnect()) showReconnectNotification();
        }

        function completeInitialization() {
            if (!injectStyles()) {
                setTimeout(completeInitialization, 50);
                return;
            }
            if (document.body && !insertNotification()) {
                setTimeout(insertNotification, 1000);
            }
            setInterval(poll, POLL_MS);
            poll();
            debugLog('Initialization complete (content-script only)', true);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', completeInitialization);
        } else {
            completeInitialization();
        }
    } catch (error) {
        console.error('[Ring Reconnector] Initialization error:', error);
    }
}

initialize();
