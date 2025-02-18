const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Ensure we have required dependencies
try {
    require.resolve('archiver');
    require.resolve('sharp');
} catch (e) {
    console.log('Installing required dependencies...');
    execSync('npm install archiver sharp --save-dev');
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function safeRemove(path) {
    try {
        if (fs.existsSync(path)) {
            if (fs.statSync(path).isDirectory()) {
                fs.rmSync(path, { recursive: true, force: true });
            } else {
                fs.rmSync(path, { force: true });
            }
            console.log(`✓ Removed ${path}`);
        }
    } catch (error) {
        // If file is in use, warn but don't fail
        if (error.code === 'EPERM' || error.code === 'EBUSY') {
            console.warn(`⚠ Warning: Could not remove ${path} - file may be in use`);
            return false;
        }
        throw error;
    }
    return true;
}

function cleanup() {
    console.log('\nCleaning up...');
    const dirsToClean = [
        'dist',
        'web-ext-artifacts',
        '.cache',
        '.nyc_output',
        'coverage'
    ];

    let allCleaned = true;
    dirsToClean.forEach(dir => {
        if (!safeRemove(dir)) {
            allCleaned = false;
        }
    });

    // Clean empty directories in src
    ['chrome', 'firefox'].forEach(browser => {
        const browserDir = path.join('src', browser);
        if (fs.existsSync(browserDir)) {
            const files = fs.readdirSync(browserDir);
            if (files.length === 0 || (files.every(f => f.startsWith('icon') && f.endsWith('.png')))) {
                files.forEach(file => {
                    if (file.startsWith('icon') && file.endsWith('.png')) {
                        safeRemove(path.join(browserDir, file));
                    }
                });
                if (fs.readdirSync(browserDir).length === 0) {
                    safeRemove(browserDir);
                }
            }
        }
    });

    if (!allCleaned) {
        console.log('\n⚠ Some files could not be cleaned. You may need to:');
        console.log('  1. Close any applications using the extension');
        console.log('  2. Disable the extension in your browser');
        console.log('  3. Try running cleanup again');
    }
}

function createZip(sourceDir, outputPath) {
    return new Promise((resolve, reject) => {
        safeRemove(outputPath);

        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            console.log(`✓ Created ${outputPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

async function buildExtension(browser) {
    console.log(`\nBuilding ${browser} extension...`);
    
    // Create base directories
    const distBaseDir = path.join('dist', browser);
    const unpackedDir = path.join(distBaseDir, 'unpacked');
    ensureDirectoryExists(unpackedDir);
    
    // Copy content script
    const contentJsPath = path.join('src', 'shared', 'content.js');
    fs.copyFileSync(contentJsPath, path.join(unpackedDir, 'content.js'));
    console.log(`✓ Copied content.js`);

    // Copy manifest and other non-icon files
    const sourceDir = path.join('src', browser);
    fs.readdirSync(sourceDir).forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        if (fs.statSync(sourcePath).isFile() && !file.startsWith('icon')) {
            fs.copyFileSync(sourcePath, path.join(unpackedDir, file));
            console.log(`✓ Copied ${file}`);
        }
    });

    // Generate icons directly in the root directory
    const sharedIconsDir = path.join('src', 'shared', 'icons');
    const requiredIcons = ['icon16.png', 'icon48.png', 'icon128.png'];
    
    for (const icon of requiredIcons) {
        // Get the SVG source file name
        const svgFile = icon.replace('.png', '.svg');
        const svgPath = path.join(sharedIconsDir, svgFile);
        
        if (!fs.existsSync(svgPath)) {
            console.error(`\n✗ Error: Required icon source ${svgFile} is missing!`);
            process.exit(1);
        }

        // Convert SVG to PNG using sharp
        const sharp = require('sharp');
        const size = parseInt(icon.match(/\d+/)[0]); // Extract size from filename
        
        try {
            const svgBuffer = fs.readFileSync(svgPath);
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(path.join(unpackedDir, icon));
            console.log(`✓ Generated and copied ${icon}`);
        } catch (error) {
            console.error(`\n✗ Error generating ${icon}:`, error);
            process.exit(1);
        }
    }

    // Create packed versions
    const packedDir = path.join(distBaseDir, 'packed');
    ensureDirectoryExists(packedDir);
    
    if (browser === 'firefox') {
        await createZip(unpackedDir, path.join(packedDir, 'ring-reconnector.xpi'));
    } else if (browser === 'chrome') {
        await createZip(unpackedDir, path.join(packedDir, 'ring-reconnector.zip'));
    }

    console.log(`✓ ${browser} build completed`);
}

async function build(cleanupFirst = true) {
    try {
        if (cleanupFirst) {
            cleanup();
        }

        console.log('Running validation...');
        require('./validate');

        ensureDirectoryExists('dist');

        await buildExtension('chrome');
        await buildExtension('firefox');

        console.log('\n✓ Build completed successfully!');
        console.log('\nOutput locations:');
        console.log('Chrome:');
        console.log('  - Unpacked: dist/chrome/unpacked/');
        console.log('  - Packed:   dist/chrome/packed/ring-reconnector.zip');
        console.log('Firefox:');
        console.log('  - Unpacked: dist/firefox/unpacked/');
        console.log('  - Packed:   dist/firefox/packed/ring-reconnector.xpi');
        console.log('\nTo load the extensions:');
        console.log('\nChrome:');
        console.log('1. Go to chrome://extensions/');
        console.log('2. Enable "Developer mode"');
        console.log('3. Click "Load unpacked"');
        console.log('4. Select the dist/chrome/unpacked directory');
        console.log('\nFirefox:');
        console.log('1. Go to about:debugging#/runtime/this-firefox');
        console.log('2. Click "Load Temporary Add-on"');
        console.log('3. Select dist/firefox/packed/ring-reconnector.xpi');
    } catch (error) {
        console.error('\n✗ Build failed:', error);
        process.exit(1);
    }
}

// Run build if called directly
if (require.main === module) {
    build();
}

module.exports = { build, cleanup }; 