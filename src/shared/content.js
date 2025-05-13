// Debug mode - set to true to see detailed logs
const DEBUG = true;

// Immediately log that the script is loaded
console.log('[Ring Reconnector] Content script loaded and initialized');

// Function to check if we're in Firefox
const isFirefox = typeof browser !== 'undefined';
console.log(`[Ring Reconnector] Running in ${isFirefox ? 'Firefox' : 'Chrome'}`);

function debugLog(message, isImportant = false) {
    // Always log during initial setup
    if (DEBUG && (isImportant || !document.body)) {
        console.log(`[Ring Reconnector Debug] ${message}`);
    }
}

// Function to inject styles once document.head is available
function injectStyles() {
    if (!document.head) {
        debugLog('Document head not available, will retry...', true);
        return false;
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .ring-reconnector-notification {
            position: fixed;
            top: 29px;
            right: 68px;
            width: 22px;
            height: 24px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            pointer-events: none;
            filter: drop-shadow(0 0 2px rgba(33, 150, 243, 0.3));
        }
        
        .ring-reconnector-notification.show {
            opacity: 1;
        }
        
        .ring-reconnector-notification svg {
            width: 100%;
            height: 100%;
            animation: rotate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .ring-reconnector-notification circle {
            stroke: url(#ring-gradient);
        }
    `;
    document.head.appendChild(style);
    debugLog('Styles injected successfully', true);
    return true;
}

// Ensure the script runs as early as possible
function initialize() {
    debugLog('Starting initialization...', true);

    try {
        // Create the notification element
        const notification = document.createElement('div');
        notification.className = 'ring-reconnector-notification';
        notification.title = 'Ring Live View Reconnector - Automatically reconnecting...';
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
        debugLog('Notification element created', true);

        // Function to ensure notification is in the correct position
        function insertNotification() {
            debugLog('Attempting to insert notification', true);
            const header = document.querySelector('[data-testid="video-player-header"]');
            if (header) {
                debugLog('Found video player header', true);
                const closeButton = header.querySelector('.styled__CloseButton-sc-28f689ba-0');
                if (closeButton) {
                    debugLog('Found close button, inserting notification', true);
                    closeButton.parentNode.insertBefore(notification, closeButton);
                    return true;
                }
            }
            return false;
        }

        // Function to show the notification
        function showReconnectNotification() {
            debugLog('Showing reconnection notification', true);
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                debugLog('Hiding reconnection notification', true);
            }, 2000);
        }

        // Function to click the reconnect button
        function clickReconnectButton() {
            // Method 1: Look for the specific modal and button
            const modal = document.querySelector('[data-testid="live-view__global-reconnect-modal"]');
            if (modal) {
                debugLog('Found reconnect modal', true);
                const reconnectButton = modal.querySelector('button[data-testid="modal__accept-button"]');
                if (reconnectButton) {
                    debugLog('Clicking reconnect button...', true);
                    reconnectButton.click();
                    showReconnectNotification();
                    return true;
                }
            }

            // Method 1.5: Look for the button directly without requiring the modal
            const directButton = document.querySelector('button[data-testid="modal__accept-button"]');
            if (directButton) {
                debugLog('Found reconnect button directly (without modal)...', true);
                directButton.click();
                showReconnectNotification();
                return true;
            }

            // Method 2: Backup - look for any button with reconnect text in various languages
            const reconnectTexts = [
                'Reconnect',                    // English
                'Verbindung wiederherstellen',  // German
                'Reconectar',                   // Spanish
                'Reconnecter',                  // French
                'Riconnetti',                   // Italian
                'Opnieuw verbinden',            // Dutch
                'Yeniden bağlan',               // Turkish
                'Připojit znovu',               // Czech
                'Połącz ponownie',              // Polish
                'Переподключиться',             // Russian
                'Újracsatlakozás',              // Hungarian
                '重新连接',                      // Chinese (Simplified)
                '再接続'                         // Japanese
            ];
            
            const allButtons = document.querySelectorAll('button');
            for (const button of allButtons) {
                const buttonText = button.textContent.trim();
                if (reconnectTexts.some(text => buttonText.includes(text))) {
                    debugLog(`Found and clicking reconnect button with text "${buttonText}" (backup method)...`, true);
                    button.click();
                    showReconnectNotification();
                    return true;
                }
            }

            return false;
        }

        // Set up mutation observer
        const observer = new MutationObserver((mutations) => {
            const now = Date.now();
            if (now - lastSignificantChange > SIGNIFICANT_CHANGE_THRESHOLD) {
                const significantChanges = mutations.some(mutation => 
                    mutation.addedNodes.length > 0 && 
                    Array.from(mutation.addedNodes).some(node => 
                        node.nodeType === 1 && 
                        (node.tagName === 'DIV' || node.tagName === 'BUTTON')
                    )
                );

                if (significantChanges) {
                    lastSignificantChange = now;
                    debugLog('Significant DOM changes detected', true);
                    setTimeout(clickReconnectButton, 500);
                }
            }
        });

        // Initialize variables
        let lastSignificantChange = Date.now();
        const SIGNIFICANT_CHANGE_THRESHOLD = 1000;

        // Function to start observing
        function startObserving() {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style', 'hidden']
                });
                debugLog('Mutation observer started', true);
                return true;
            }
            return false;
        }

        // Function to complete initialization
        function completeInitialization() {
            // Try to inject styles
            if (!injectStyles()) {
                setTimeout(completeInitialization, 50);
                return;
            }

            // Try to start observing
            if (!startObserving()) {
                setTimeout(completeInitialization, 50);
                return;
            }

            // Try to insert notification if possible
            if (document.body && !insertNotification()) {
                setTimeout(insertNotification, 1000);
            }

            // Set up periodic check
            setInterval(() => {
                debugLog('Running periodic check', true);
                clickReconnectButton();
            }, 30000);

            debugLog('Initialization complete', true);
        }

        // Start the initialization process
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', completeInitialization);
        } else {
            completeInitialization();
        }

    } catch (error) {
        console.error('[Ring Reconnector] Initialization error:', error);
    }
}

// Start initialization
initialize(); 