// Ring.com Stay Connected - content script only (no page script injection)
//
// WORKAROUND: We do NOT inject any script into the page. Injected scripts can be blocked by
// Ring (e.g. Content-Security-Policy). Instead we run entirely in the content script, which
// Chrome allows and the page cannot disable. We share the same DOM, so we find the Reconnect
// control by visible text and aria-label only and call element.click(). All Chrome-extension
// compliant; no eval(), no remote code, no injection.

const DEBUG = true;
const POLL_MS = 6000;           // Normal: how often to look for Reconnect
const POLL_FAST_MS = 1200;      // When modal is open: poll aggressively
const MODAL_POLL_MS = 800;      // After clicking: retry once this soon if modal still open

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

// Text that indicates the "Continue Live View" / "Live View paused" modal is open
const MODAL_PHRASES = [
    'Continue Live View', 'Live View paused', 'Reconnect or end',
    'Reconnect or end your session', 'End live view'
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

// Get visible text from a subtree (one string, for modal detection)
function getSubtreeText(root, maxLen = 500) {
    if (!root) return '';
    const text = (root.innerText || root.textContent || '').trim();
    return text.length > maxLen ? text.slice(0, maxLen) : text;
}

// Whether this element is inside a container that has the "reconnect modal" text
function isInsideReconnectModal(el) {
    let node = el;
    while (node && node !== document.body) {
        const text = norm(getSubtreeText(node, 300));
        if (MODAL_PHRASES.some(p => text.includes(norm(p)))) return true;
        node = node.parentElement || (node.getRootNode && node.getRootNode().host);
    }
    return false;
}

// Walk DOM and shadow roots; return true if "reconnect modal" text is present
function isReconnectModalPresent(root = document) {
    const quick = norm(getSubtreeText(root.body || root, 500));
    if (MODAL_PHRASES.some(p => quick.includes(norm(p)))) return true;
    const seen = new Set();
    function walk(r) {
        if (!r || seen.has(r)) return false;
        seen.add(r);
        const text = norm(getSubtreeText(r, 400));
        if (MODAL_PHRASES.some(p => text.includes(norm(p)))) return true;
        try {
            const list = r.querySelectorAll('*');
            for (const el of list) {
                if (el.shadowRoot && walk(el.shadowRoot)) return true;
            }
        } catch (_) {}
        return false;
    }
    return walk(root);
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

// Dispatch a full pointer/mouse/click sequence so React's delegated handlers see it.
function dispatchClickSequence(el) {
    const opts = { bubbles: true, cancelable: true, view: window, detail: 1 };
    const coord = { clientX: 0, clientY: 0 };
    try {
        el.focus();
        el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, ...coord, button: 0, buttons: 1 }));
        el.dispatchEvent(new MouseEvent('mousedown', { ...opts, ...coord, button: 0, buttons: 1 }));
        el.dispatchEvent(new PointerEvent('pointerup', { ...opts, ...coord, button: 0, buttons: 0 }));
        el.dispatchEvent(new MouseEvent('mouseup', { ...opts, ...coord, button: 0, buttons: 0 }));
        el.dispatchEvent(new MouseEvent('click', { ...opts, ...coord, button: 0 }));
    } catch (e) {
        if (typeof el.click === 'function') el.click();
    }
}

// Get the best Reconnect button: prefer one inside the "Continue Live View" modal.
function getReconnectButton() {
    const candidates = [];
    collectClickables(document, candidates);
    const withText = candidates.filter(el => hasReconnectText(el) && isVisible(el));
    if (withText.length === 0) return null;
    const inModal = withText.filter(el => isInsideReconnectModal(el));
    return (inModal.length > 0 ? inModal[0] : withText[0]);
}

// Run every click strategy we have on the element (must work).
function runAllClickStrategies(el) {
    if (!el) return;
    try {
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
    } catch (_) {}
    // Strategy 1: full event sequence (React-friendly)
    try { dispatchClickSequence(el); } catch (_) {}
    // Strategy 2: native click
    try { if (typeof el.click === 'function') el.click(); } catch (_) {}
    // Strategy 3: repeat sequence + native (in case first didn't register)
    try {
        setTimeout(() => {
            try { dispatchClickSequence(el); } catch (_) {}
            try { if (typeof el.click === 'function') el.click(); } catch (_) {}
        }, 150);
    } catch (_) {}
}

function findAndClickReconnect() {
    const el = getReconnectButton();
    if (!el) return false;
    try {
        runAllClickStrategies(el);
        debugLog('Clicked Reconnect (content script)', true);
        return true;
    } catch (e) {
        debugLog('Click error: ' + e.message, true);
        return false;
    }
}

// Inspect: run in console with modal open to dump Reconnect button DOM for debugging.
// DevTools (F12) → Console:  ringReconnectInspect()
function inspectReconnectButton() {
    const el = getReconnectButton();
    if (!el) {
        console.log('[Ring Reconnector] Inspect: no Reconnect button found');
        return null;
    }
    const parentChain = [];
    let n = el;
    while (n && n !== document.body) {
        const root = n.getRootNode();
        const inShadow = root instanceof ShadowRoot;
        parentChain.push((inShadow ? '#shadow ' : '') + (n.tagName || '') + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(/\s+/).slice(0, 2).join('.') : ''));
        n = inShadow ? root.host : n.parentElement;
    }
    const rect = el.getBoundingClientRect();
    const info = {
        tagName: el.tagName,
        id: el.id || null,
        className: el.className,
        role: el.getAttribute && el.getAttribute('role'),
        ariaLabel: el.getAttribute && el.getAttribute('aria-label'),
        innerText: (el.innerText || '').slice(0, 80),
        parentChain,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        inModal: isInsideReconnectModal(el)
    };
    console.log('[Ring Reconnector] Inspect:', info);
    return el;
}

// Manual trigger: call from browser console if auto-click doesn't work.
// In DevTools (F12) → Console, run:  ringReconnect()
// Or run multiple times:  ringReconnect() || ringReconnect() || ringReconnect()
function exposeManualTrigger() {
    try {
        window.ringReconnect = function () {
            const ok = findAndClickReconnect();
            console.log('[Ring Reconnector] Manual trigger:', ok ? 'click attempted' : 'no Reconnect button found');
            return ok;
        };
        window.ringReconnectInspect = inspectReconnectButton;
    } catch (_) {}
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

        let pollTimer = null;

        function scheduleNextPoll() {
            if (pollTimer) clearTimeout(pollTimer);
            const interval = isReconnectModalPresent() ? POLL_FAST_MS : POLL_MS;
            pollTimer = setTimeout(() => {
                poll();
                scheduleNextPoll();
            }, interval);
        }

        function poll() {
            const clicked = findAndClickReconnect();
            if (clicked) showReconnectNotification();
            // When modal is open, also schedule a quick re-check to retry if click didn't dismiss it
            if (clicked && isReconnectModalPresent()) {
                setTimeout(() => {
                    if (isReconnectModalPresent()) {
                        const el = getReconnectButton();
                        if (el) runAllClickStrategies(el);
                    }
                }, MODAL_POLL_MS);
            }
        }

        function completeInitialization() {
            if (!injectStyles()) {
                setTimeout(completeInitialization, 50);
                return;
            }
            if (document.body && !insertNotification()) {
                setTimeout(insertNotification, 1000);
            }
            poll();
            scheduleNextPoll();
            exposeManualTrigger();
            debugLog('Initialization complete (content-script only). Manual: ringReconnect()', true);
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
