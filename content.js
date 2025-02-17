// Debug mode - set to true to see detailed logs
const DEBUG = true;

function debugLog(message, isImportant = false) {
    if (DEBUG && isImportant) {
        console.log(`[Ring Reconnector Debug] ${message}`);
    }
}

// Create and inject the notification styles
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

// Find the header element and insert the notification before the close button
const header = document.querySelector('[data-testid="video-player-header"]');
if (header) {
    const closeButton = header.querySelector('.styled__CloseButton-sc-28f689ba-0');
    if (closeButton) {
        closeButton.parentNode.insertBefore(notification, closeButton);
    } else {
        document.body.appendChild(notification);
    }
} else {
    document.body.appendChild(notification);
}

// Function to show the notification
function showReconnectNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000); // Hide after 2 seconds
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
            showReconnectNotification(); // Show the notification when reconnecting
            return true;
        }
    }

    // Method 2: Backup - look for any button containing "Reconnect" text
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
        if (button.textContent.includes('Reconnect')) {
            debugLog('Found and clicking reconnect button (backup method)...', true);
            button.click();
            showReconnectNotification(); // Show the notification when reconnecting
            return true;
        }
    }

    return false;
}

// Track significant DOM changes to avoid excessive checks
let lastSignificantChange = Date.now();
const SIGNIFICANT_CHANGE_THRESHOLD = 1000; // 1 second

// Set up a mutation observer to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    const now = Date.now();
    // Only process if it's been more than 1 second since last significant change
    if (now - lastSignificantChange > SIGNIFICANT_CHANGE_THRESHOLD) {
        const significantChanges = mutations.some(mutation => 
            mutation.addedNodes.length > 0 && 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeType === 1 && // Element nodes only
                (node.tagName === 'DIV' || node.tagName === 'BUTTON')
            )
        );

        if (significantChanges) {
            lastSignificantChange = now;
            // Small delay to ensure the modal is fully rendered
            setTimeout(clickReconnectButton, 500);
        }
    }
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'hidden'] // Only watch for relevant attribute changes
});

// Backup check every 30 seconds just in case
setInterval(clickReconnectButton, 30000);

// Log that the extension is running
debugLog('Ring Live View Reconnector initialized and monitoring for disconnects', true); 