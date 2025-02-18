const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure we have sharp for image processing
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp for image processing...');
    execSync('npm install sharp --save-dev');
}

const sharp = require('sharp');

async function convertSvgToPng(svgPath, size) {
    const svg = fs.readFileSync(svgPath, 'utf8');
    return sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toBuffer();
}

async function generateIcons() {
    const sizes = [16, 48, 128];
    const browsers = ['chrome', 'firefox'];
    
    for (const browser of browsers) {
        const targetDir = path.join('src', browser);
        
        // Ensure browser directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        for (const size of sizes) {
            const svgPath = path.join('src', 'shared', 'icons', `icon${size}.svg`);
            const pngPath = path.join(targetDir, `icon${size}.png`);
            
            try {
                const pngBuffer = await convertSvgToPng(svgPath, size);
                fs.writeFileSync(pngPath, pngBuffer);
                console.log(`✓ Created ${pngPath}`);
            } catch (error) {
                console.error(`✗ Error creating ${pngPath}:`, error.message);
            }
        }
    }
}

// Run if called directly
if (require.main === module) {
    generateIcons().catch(console.error);
}

module.exports = generateIcons; 