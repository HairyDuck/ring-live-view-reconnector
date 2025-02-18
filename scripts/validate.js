const fs = require('fs');
const path = require('path');

function validateManifest(manifestPath, browser) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Common checks
        if (!manifest.name || !manifest.version || !manifest.description) {
            throw new Error(`${browser}: Missing required manifest fields`);
        }

        // Browser-specific checks
        if (browser === 'chrome' && manifest.manifest_version !== 3) {
            throw new Error('Chrome manifest must use version 3');
        }

        if (browser === 'firefox' && manifest.manifest_version !== 2) {
            throw new Error('Firefox manifest must use version 2');
        }

        if (browser === 'firefox' && (!manifest.browser_specific_settings || !manifest.browser_specific_settings.gecko)) {
            throw new Error('Firefox manifest must include gecko ID');
        }

        console.log(`✓ ${browser} manifest is valid`);
        return true;
    } catch (error) {
        console.error(`✗ Error validating ${browser} manifest:`, error.message);
        process.exit(1);
    }
}

function validateSharedCode(contentPath) {
    try {
        const content = fs.readFileSync(contentPath, 'utf8');
        
        // Basic validation checks
        if (!content.includes('function clickReconnectButton')) {
            throw new Error('Missing core reconnect functionality');
        }

        if (!content.includes('MutationObserver')) {
            throw new Error('Missing DOM observation code');
        }

        console.log('✓ Shared code is valid');
        return true;
    } catch (error) {
        console.error('✗ Error validating shared code:', error.message);
        process.exit(1);
    }
}

function validateIcons(chromePath, firefoxPath) {
    const requiredSizes = ['48', '128'];
    
    for (const browser of ['chrome', 'firefox']) {
        const iconPath = browser === 'chrome' ? chromePath : firefoxPath;
        
        for (const size of requiredSizes) {
            const iconFile = path.join(iconPath, `icon${size}.png`);
            if (!fs.existsSync(iconFile)) {
                console.error(`✗ Missing ${size}px icon for ${browser}`);
                process.exit(1);
            }
        }
        console.log(`✓ ${browser} icons are present`);
    }
    return true;
}

// Run validations
console.log('Validating extension files...\n');

validateManifest('src/chrome/manifest.json', 'chrome');
validateManifest('src/firefox/manifest.json', 'firefox');
validateSharedCode('src/shared/content.js');
validateIcons('src/chrome', 'src/firefox');

console.log('\n✓ All validations passed!'); 