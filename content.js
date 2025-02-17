// Debug mode - set to true to see detailed logs
const DEBUG = true;

function debugLog(message, isImportant = false) {
    if (DEBUG && isImportant) {
        console.log(`[Ring Reconnector Debug] ${message}`);
    }
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
            return true;
        }
    }

    // Method 2: Backup - look for any button containing "Reconnect" text
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
        if (button.textContent.includes('Reconnect')) {
            debugLog('Found and clicking reconnect button (backup method)...', true);
            button.click();
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