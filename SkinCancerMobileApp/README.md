# Skin Cancer Detection Mobile App

React Native Expo mobile application for skin cancer detection using AI.

## Setup Instructions

### 1. Install Dependencies

```bash
cd SkinCancerMobileApp
npm install
```

### 2. Configure Backend URL

Edit `config.js` and update the `BASE_URL` with your backend server address:

```javascript
BASE_URL: 'http://YOUR_IP_ADDRESS:8008'
```

**Important**: 
- For local development, use your computer's local IP address (not `localhost` or `127.0.0.1`)
- Your phone and computer must be on the same Wi-Fi network
- Find your IP:
  - **Mac/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  - **Windows**: `ipconfig | findstr IPv4`

### 3. Start the Backend Server

Make sure your Flask backend is running:

```bash
cd ../SkinCancerDetection-WebApp/src
python app.py
```

The backend should be accessible at `http://YOUR_IP:8008`

### 4. Run the Mobile App

```bash
npm start
```

Then:
- Scan the QR code with Expo Go app on your phone (iOS or Android)
- Or press `i` for iOS simulator, `a` for Android emulator

## Features

- 📷 Capture photos using device camera
- 🖼️ Select images from gallery
- 🔍 AI-powered skin lesion analysis
- 📊 Detailed prediction results with confidence scores
- 🎨 Clean, modern UI

## Troubleshooting

### Connection Issues

- Ensure backend server is running
- Verify IP address in `config.js` matches your computer's IP
- Check that phone and computer are on the same Wi-Fi network
- Make sure firewall isn't blocking port 8008

### Permission Issues

- Grant camera and photo library permissions when prompted
- Check device settings if permissions are denied

## Note

This app is for informational purposes only. Always consult a healthcare professional for medical advice.

