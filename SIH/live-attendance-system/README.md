# Live Attendance System

A real-time attendance system with separate interfaces for teachers and students, built with HTML, CSS, JavaScript, and Firebase Firestore.

## Features

### Teacher App
- Start and stop attendance sessions with simple buttons
- Real-time view of students who have marked their attendance
- Session management and status tracking
- Live updates when students mark attendance

### Student App
- Automatically detects when attendance is live
- Simple form to enter name and mark attendance
- Prevents duplicate attendance marking
- Real-time status updates

## Project Structure

```
live-attendance-system/
├── teacher/
│   └── index.html          # Teacher interface
├── student/
│   └── index.html          # Student interface
├── css/
│   └── styles.css          # Shared styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── teacher.js          # Teacher app logic
│   └── student.js          # Student app logic
└── README.md
```

## Setup Instructions

### 1. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
   - Choose a project name (e.g., "live-attendance-system")

2. **Enable Firestore Database**
   - In the Firebase console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Web" icon to add a web app
   - Register your app with a name
   - Copy the Firebase configuration object

4. **Update Configuration File**
   - Open `js/firebase-config.js`
   - Replace the placeholder values with your actual Firebase config:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-actual-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-actual-app-id"
   };
   ```

### 2. Firebase Security Rules (Optional for Production)

For production use, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to attendance sessions
    match /attendance_sessions/{sessionId} {
      allow read, write: if true; // Modify as needed for your security requirements
    }
    
    // Allow read/write access to attendance records
    match /attendance_records/{recordId} {
      allow read, write: if true; // Modify as needed for your security requirements
    }
  }
}
```

### 3. Running the Application

1. **Serve the Files**
   - You need to serve the HTML files through a web server (not file:// protocol)
   - Options:
     - **Live Server (VS Code)**: Install Live Server extension and right-click on HTML files
     - **Python**: `python -m http.server 8000`
     - **Node.js**: `npx http-server`
     - **PHP**: `php -S localhost:8000`

2. **Access the Applications**
   - Teacher App: `http://localhost:8000/teacher/`
   - Student App: `http://localhost:8000/student/`

## How to Use

### For Teachers

1. Open the teacher app in your browser
2. Click "Start Attendance" to begin a session
3. Share the student app URL with your students
4. Monitor real-time attendance as students mark themselves present
5. Click "Stop Attendance" when the session is complete

### For Students

1. Open the student app in your browser
2. Wait for the teacher to start the attendance session
3. When attendance becomes live, enter your full name
4. Click "Mark as Present" to record your attendance
5. You'll see a confirmation message when successful

## Technical Details

### Firebase Collections

The app uses two Firestore collections:

1. **attendance_sessions**
   - Stores session information
   - Fields: `isActive`, `startTime`, `endTime`, `createdBy`

2. **attendance_records**
   - Stores individual attendance records
   - Fields: `sessionId`, `studentName`, `timestamp`, `status`

### Real-time Features

- Uses Firestore's real-time listeners for instant updates
- Teacher app automatically shows new students as they mark attendance
- Student app automatically enables/disables based on session status

## Troubleshooting

### Common Issues

1. **Firebase Errors**
   - Ensure Firebase config is correctly set in `firebase-config.js`
   - Check browser console for detailed error messages
   - Verify Firestore database is created and accessible

2. **CORS Issues**
   - Make sure you're serving files through a web server, not opening HTML files directly
   - Firebase CDN should work from any domain in test mode

3. **Real-time Updates Not Working**
   - Check internet connection
   - Verify Firestore rules allow read/write access
   - Check browser console for errors

### Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (recent versions)
- JavaScript must be enabled

## Development

### Adding Features

The codebase is modular and easy to extend:

- **Authentication**: Add Firebase Auth for user management
- **Class Management**: Extend to support multiple classes/subjects
- **Reports**: Add attendance reports and analytics
- **Mobile App**: Use the same Firebase backend for mobile apps

### Code Structure

- `TeacherApp` class handles all teacher functionality
- `StudentApp` class handles all student functionality  
- Shared Firebase configuration and utilities
- Responsive CSS design for mobile compatibility

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Ensure you're serving files through a web server
4. Check that Firestore database is properly set up

---

Built with ❤️ using HTML, CSS, JavaScript, and Firebase.