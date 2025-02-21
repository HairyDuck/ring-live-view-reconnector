# Ring Live View Reconnector | Auto-Reconnect for Ring Cameras

[![Build Status](https://github.com/HairyDuck/ring-live-view-reconnector/actions/workflows/build.yml/badge.svg)](https://github.com/HairyDuck/ring-live-view-reconnector/actions)
[![GitHub Release](https://img.shields.io/github/v/release/HairyDuck/ring-live-view-reconnector)](https://github.com/HairyDuck/ring-live-view-reconnector/releases/latest)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/chiphiennfhnjnhnmjgmfgkilegpdpkh?label=chrome)](https://chrome.google.com/webstore/detail/chiphiennfhnjnhnmjgmfgkilegpdpkh)
[![Firefox Add-on](https://img.shields.io/amo/v/ring-live-view-reconnector?label=firefox)](https://addons.mozilla.org/firefox/addon/ring-live-view-reconnector/)
[![License](https://img.shields.io/github/license/HairyDuck/ring-live-view-reconnector)](LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/HairyDuck/ring-live-view-reconnector)](https://github.com/HairyDuck/ring-live-view-reconnector/issues)

> 🎥 Never miss a moment with your Ring cameras! This browser extension automatically fixes Ring Live View disconnections, ensuring continuous monitoring of your Ring doorbell cameras and security cameras.

## 🌟 Key Features

- ✨ **Auto-Reconnect**: Instantly restores Ring camera live view when disconnected
- 🔒 **Privacy First**: No data collection, works 100% locally
- 🚀 **Zero Configuration**: Works immediately after installation
- 🎯 **Lightweight**: Minimal system resource usage
- 🌐 **Browser Support**: Works on both Chrome and Firefox
- 💫 **Visual Feedback**: Subtle notification when reconnecting
- ⚡ **Fast Loading**: Optimized for quick response
- 🛡️ **Secure**: No special permissions required

## ⚠️ Important Battery Notice

> 🔋 **For Battery-Powered Ring Devices**: Using this extension will keep your camera's live view continuously connected, which can significantly increase battery drain. If you're using battery-powered Ring devices (like the Battery Doorbell or Battery Spotlight Cam), please be aware that you may need to recharge your devices more frequently. This is most impactful when keeping the live view open for extended periods.

## 🎯 Compatibility

### Supported Ring Devices
- Ring Video Doorbell (all models)* 
- Ring Security Cameras*
- Ring Stick Up Cam*
- Ring Spotlight Cam*
- Ring Floodlight Cam
- Ring Indoor Cam
- Ring Elite

*Note: Battery-powered versions of these devices will experience faster battery drain when using live view for extended periods.

### Supported Browsers
- Google Chrome (latest)
- Mozilla Firefox (v58.0+)
- Chrome-based browsers (Edge, Brave, etc.)

## 🔍 How It Works

The extension automatically:
1. 👀 Monitors your Ring camera live view
2. 🔄 Detects disconnection events
3. 🖱️ Clicks the reconnect button instantly
4. ✅ Maintains continuous camera feed

You'll know it's working when:
- A subtle blue rotating ring appears near the close button during reconnection
- Your live view stays connected without manual intervention
- Debug logs appear in the console (if enabled)

## 📥 Quick Install

### Chrome Users
1. Visit [Ring Live View Reconnector on Chrome Web Store](https://chrome.google.com/webstore/detail/chiphiennfhnjnhnmjgmfgkilegpdpkh)
2. Click "Add to Chrome"
3. Start watching your Ring cameras worry-free!

### Firefox Users
1. Visit [Ring Live View Reconnector on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/ring-live-view-reconnector/)
2. Click "Add to Firefox"
3. Enjoy uninterrupted Ring camera viewing!

## 🔐 Privacy & Security

We take your privacy seriously:
- ✅ No data collection or storage
- ✅ No tracking or analytics
- ✅ Works entirely in your browser
- ✅ No external communications
- ✅ No special permissions needed
- ✅ Only runs on account.ring.com

## 🤝 Support & Community

### Troubleshooting
If the extension isn't working:
1. Make sure you're on https://account.ring.com
2. Check that the extension is enabled in your browser
3. Try refreshing the page
4. Ensure you're using a supported browser version

### Get Help
- 🐛 [Report Issues](https://github.com/HairyDuck/ring-live-view-reconnector/issues)
- 💡 [Suggest Features](https://github.com/HairyDuck/ring-live-view-reconnector/issues)
- 👥 [Contribute Code](https://github.com/HairyDuck/ring-live-view-reconnector/pulls)

## 🔧 Technical Details

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

### Version 1.1.1 (2025-02-21)
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