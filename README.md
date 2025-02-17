# Ring Live View Reconnector

A Chrome extension that automatically reconnects your Ring camera's Live View when it disconnects, ensuring continuous monitoring of your Ring cameras.

## Features

- Automatically clicks the "Reconnect" button when Ring Live View disconnects
- Works silently in the background
- No configuration needed
- Lightweight and efficient
- Privacy-focused: operates entirely locally with no data collection

## Installation

### Chrome Web Store (Recommended)
1. Visit the [Ring Live View Reconnector](https://chrome.google.com/webstore/detail/chiphiennfhnjnhnmjgmfgkilegpdpkh) on the Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Install the extension
2. Visit [Ring.com](https://account.ring.com/) and log in to your account
3. Open any camera's Live View
4. The extension will automatically reconnect the Live View if it disconnects

No additional configuration is needed. The extension works automatically in the background.

## How It Works

The extension uses a combination of methods to detect when your Ring Live View disconnects:
1. Monitors for the appearance of the reconnect dialog
2. Watches for DOM changes that indicate a disconnect
3. Uses a backup periodic check every 30 seconds

When a disconnect is detected, the extension automatically clicks the "Reconnect" button, maintaining your live view connection.

## Debug Mode

The extension includes a debug mode that can be enabled to help troubleshoot issues:
1. Open Chrome Developer Tools (F12)
2. Check the Console tab
3. Look for messages prefixed with `[Ring Reconnector Debug]`

## Privacy & Terms

This extension is designed with privacy as a core principle:
- No data collection or storage
- No tracking or analytics
- Works entirely locally in your browser
- No external communications
- Minimal permissions required

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

Contributions are welcome! Please feel free to submit a Pull Request. To contribute:

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

Please ensure your code follows the existing style and includes appropriate comments.

## Development

To work on this extension locally:

1. Clone the repository
2. Make your changes to the code
3. Load the extension in Chrome using Developer mode
4. Test your changes
5. Submit a pull request with your improvements

## Changelog

### Version 1.0.0 (2025-02-19)
- Initial release
- Automatic reconnection functionality
- Debug mode
- Privacy-focused implementation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the Ring camera users who inspired this solution
- Contributors who help improve this extension
- Ring for their camera system (though this is an unofficial extension) 
