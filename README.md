# Ring.com Live View Reconnector

[![Build Status](https://github.com/HairyDuck/ring-live-view-reconnector/actions/workflows/build.yml/badge.svg)](https://github.com/HairyDuck/ring-live-view-reconnector/actions)
[![GitHub Release](https://img.shields.io/github/v/release/HairyDuck/ring-live-view-reconnector)](https://github.com/HairyDuck/ring-live-view-reconnector/releases/latest)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/chiphiennfhnjnhnmjgmfgkilegpdpkh?label=chrome)](https://chrome.google.com/webstore/detail/chiphiennfhnjnhnmjgmfgkilegpdpkh)
[![Firefox Add-on](https://img.shields.io/amo/v/ring-live-view-reconnector?label=firefox)](https://addons.mozilla.org/firefox/addon/ring-live-view-reconnector/)
[![License](https://img.shields.io/github/license/HairyDuck/ring-live-view-reconnector)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/HairyDuck/ring-live-view-reconnector)](https://github.com/HairyDuck/ring-live-view-reconnector/issues)

A browser extension that automatically reconnects your Ring camera's Live View when it disconnects, ensuring continuous monitoring of your Ring cameras.

## Features

- Automatically clicks the "Reconnect" button when Ring Live View disconnects
- Visual notification indicator when reconnection occurs
- Works silently in the background
- No configuration needed
- Lightweight and efficient
- Privacy-focused: operates entirely locally with no data collection
- Supports both Chrome and Firefox browsers

## How It Works

The extension monitors your Ring Live View and when a disconnect occurs:
1. Automatically detects the disconnect dialog
2. Clicks the "Reconnect" button for you
3. Shows a subtle blue rotating ring indicator near the close button
4. Maintains your live view connection without manual intervention

## Visual Feedback

When the extension reconnects your live view:
- A small blue rotating ring appears near the close button
- Hover over it to see "Ring Live View Reconnector - Automatically reconnecting..."
- Indicator disappears after reconnection is complete
- Non-intrusive and matches Ring's interface design

## Installation

### Chrome Web Store (Recommended)
1. Visit the [Ring Live View Reconnector](https://chrome.google.com/webstore/detail/chiphiennfhnjnhnmjgmfgkilegpdpkh) on the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation

### Firefox Add-ons (Recommended)
1. Visit the [Ring Live View Reconnector](https://addons.mozilla.org/firefox/addon/ring-live-view-reconnector/) on Firefox Add-ons
2. Click "Add to Firefox"
3. Confirm the installation

### Manual Installation (Development)

#### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)

#### Building from Source
1. Clone the repository:
   ```bash
   git clone https://github.com/HairyDuck/ring-live-view-reconnector.git
   cd ring-live-view-reconnector
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extensions:
   ```bash
   npm run build
   ```
   This will create both Chrome and Firefox extensions in the `dist` directory.

4. Load the extension:
   - Chrome:
     1. Open Chrome and go to `chrome://extensions/`
     2. Enable "Developer mode"
     3. Click "Load unpacked"
     4. Select the `dist/chrome` directory

   - Firefox:
     1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
     2. Click "Load Temporary Add-on"
     3. Select the `dist/firefox` directory

## Development

### Available Scripts
- `npm run build` - Build both Chrome and Firefox extensions
- `npm run build:chrome` - Build Chrome extension only
- `npm run build:firefox` - Build Firefox extension only
- `npm run dev` - Build and run Firefox extension for development
- `npm run lint` - Lint the extension code
- `npm run clean` - Clean build artifacts
- `npm run validate` - Validate extension files
- `npm run icons` - Generate extension icons

### File Structure
```
├── src/
│   ├── shared/           # Shared code between browsers
│   │   ├── content.js    # Main extension logic
│   │   └── icons/       # Source SVG icons
│   ├── chrome/          # Chrome-specific files
│   │   └── manifest.json
│   └── firefox/         # Firefox-specific files
│       └── manifest.json
├── scripts/             # Build and utility scripts
├── dist/               # Build output (generated)
└── screenshots/        # Store screenshots
```

## Privacy & Terms

This extension is designed with privacy as a core principle:
- No data collection or storage
- No tracking or analytics
- Works entirely locally in your browser
- No external communications
- No special permissions required
- Only runs on account.ring.com

By installing and using this extension, you agree to our:
- [Privacy Policy and Terms of Use](privacy-policy.md)
- [MIT License](LICENSE)

This extension is not affiliated with or endorsed by Ring/Amazon.

## Support

If you encounter any issues or have suggestions:
1. Check the [Known Issues](https://github.com/HairyDuck/ring-live-view-reconnector/issues)
2. Create a new issue if your problem isn't already listed
3. Include debug logs if possible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Run `npm run validate` to ensure everything works
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate comments.

## Changelog

### Version 1.1.1 (2025-02-19)
- Removed unnecessary activeTab permission for better privacy
- Updated documentation to reflect permission changes
- Improved security by using minimal required permissions

### Version 1.1.0 (2025-02-18)
- Added Firefox support (minimum version 58.0)
- Improved initialization process for faster loading
- Enhanced build system with better validation
- Added automated GitHub Actions workflow
- Improved error handling and logging

### Version 1.0.0 (2025-02-17)
- Initial release
- Automatic reconnection functionality
- Privacy-focused implementation
- Chrome support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the Ring camera users who inspired this solution
- Contributors who help improve this extension
- Ring for their camera system (though this is an unofficial extension) 
