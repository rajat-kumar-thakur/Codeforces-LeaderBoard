# Codeforces Leaderboard

A modern, responsive web application that fetches user data from Google Spreadsheets and displays real-time Codeforces ratings in a beautiful leaderboard format.

## Features

- 📊 **Real-time Leaderboard**: Automatically fetches and displays Codeforces user ratings
- 📈 **Rating Changes**: Shows rating changes from the last contest
- 🏆 **Ranking System**: Displays users ranked by their current rating
- 🎨 **Modern UI**: Beautiful, responsive design with gradient backgrounds and animations
- 🔍 **Filtering**: Filter users by rating categories (Expert+, Specialist, Pupil, Newbie)
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Auto-refresh**: Automatically updates every 5 minutes
- 🔗 **Direct Links**: Click usernames to visit their Codeforces profiles

## Screenshots

The application features:
- Gradient background with glassmorphism design
- Real-time statistics (Total Users, Average Rating, Max Rating)
- Color-coded rating badges matching Codeforces standards
- Responsive grid layout that adapts to different screen sizes
- Smooth animations and hover effects

## Setup Instructions

### Prerequisites

1. **Google Account**: You need a Google account to create and access Google Sheets
2. **Google Cloud Console Access**: To create API keys
3. **Web Server**: Any local web server (Live Server, Python's http.server, etc.)

### Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Add usernames in column A (starting from row 2, row 1 can be a header)
4. Example structure:
   ```
   A1: Username
   A2: tourist
   A3: Petr
   A4: Egor
   A5: rng_58
   ```
5. Copy the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"
4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### Step 3: Configure the Application

1. Open `script.js` file
2. Update the `CONFIG` object with your values:

```javascript
const CONFIG = {
    // Replace with your Google Spreadsheet ID
    SPREADSHEET_ID: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    
    // Adjust range based on your sheet structure
    RANGE: 'Sheet1!A:B', // Column A: usernames, Column B: optional info
    
    // Replace with your Google API key
    API_KEY: 'AIzaSyBvOkBwv6yJ6n1hVf7t8x9z2c3d4e5f6g7h8i9j0k',
    
    // Update interval (5 minutes = 300000ms)
    UPDATE_INTERVAL: 300000,
};
```

### Step 4: Run the Application

1. **Option A: Using Live Server (VS Code)**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

2. **Option B: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

3. **Option C: Using Node.js**
   ```bash
   npx http-server
   ```

4. Open your browser and navigate to `http://localhost:8000` (or the port shown by your server)

## Configuration Options

### Google Sheets Range Format

The `RANGE` parameter follows Google Sheets A1 notation:
- `Sheet1!A:A` - Only column A (usernames)
- `Sheet1!A:B` - Columns A and B
- `Sheet1!A1:B100` - Specific range from A1 to B100

### Update Interval

Change the `UPDATE_INTERVAL` value to adjust how often the leaderboard refreshes:
- `60000` - 1 minute
- `300000` - 5 minutes (default)
- `600000` - 10 minutes
- `1800000` - 30 minutes

### Rating Categories

The application automatically categorizes users based on Codeforces rating standards:
- **Legendary Grandmaster**: 3000+
- **International Grandmaster**: 2600-2999
- **Grandmaster**: 2400-2599
- **International Master**: 2300-2399
- **Master**: 2100-2299
- **Candidate Master**: 1900-2099
- **Expert**: 1600-1899
- **Specialist**: 1400-1599
- **Pupil**: 1200-1399
- **Newbie**: <1200

## Troubleshooting

### Common Issues

1. **"Failed to load data from Google Sheets"**
   - Check if your API key is correct
   - Ensure Google Sheets API is enabled
   - Verify the Spreadsheet ID is correct
   - Make sure the spreadsheet is publicly accessible or shared with your API key

2. **"User not found" errors**
   - Verify usernames in your spreadsheet are correct
   - Check for typos in usernames
   - Ensure usernames match exactly with Codeforces handles

3. **CORS errors**
   - Make sure you're running the app through a web server, not opening the HTML file directly
   - Use a local development server as mentioned in Step 4

4. **Empty leaderboard**
   - Check browser console for error messages
   - Verify your Google Sheets has data in the specified range
   - Ensure usernames are in the correct column

### Browser Console

Open browser developer tools (F12) and check the Console tab for detailed error messages that can help diagnose issues.

## API Rate Limits

- **Google Sheets API**: 100 requests per 100 seconds per user
- **Codeforces API**: No official rate limit, but be respectful with requests

The application includes error handling and fallback mechanisms to handle API limitations gracefully.

## Customization

### Styling

Modify `styles.css` to customize:
- Colors and gradients
- Fonts and typography
- Layout and spacing
- Animations and transitions

### Functionality

Extend `script.js` to add:
- Additional user statistics
- Contest history display
- Custom filtering options
- Export functionality

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Codeforces](https://codeforces.com) for providing the API
- [Google Sheets API](https://developers.google.com/sheets) for spreadsheet integration
- [Font Awesome](https://fontawesome.com) for icons
