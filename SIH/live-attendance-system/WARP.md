# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a real-time attendance system built with vanilla HTML, CSS, JavaScript, and Firebase Firestore. The system consists of two separate web applications:
- **Teacher Dashboard**: Controls attendance sessions and monitors real-time student attendance
- **Student Portal**: Allows students to mark attendance when sessions are active, with face verification using device camera

## Development Commands

### Local Development Server
The application must be served through a web server (not file:// protocol) due to Firebase requirements:

```powershell
# Using Python (if installed)
python -m http.server 8000

# Using Node.js http-server (if installed)
npx http-server

# Using PHP (if installed)
php -S localhost:8000
```

### Accessing Applications
- Teacher Dashboard: `http://localhost:8000/teacher/`
- Student Portal: `http://localhost:8000/student/`

### Firebase Configuration
Before running the application, update `js/firebase-config.js` with your actual Firebase project credentials:
- Replace placeholder values with real Firebase config from Firebase Console
- Ensure Firestore Database is enabled in test mode for development

## Architecture Overview

### Core Application Classes

**TeacherApp** (`js/teacher.js`):
- Manages attendance session lifecycle (start/stop)
- Real-time monitoring of student attendance via Firestore listeners
- UI state management for session controls and student display
- Handles session persistence across page reloads

**StudentApp** (`js/student.js`):
- Listens for active attendance sessions in real-time
- Form validation and duplicate attendance prevention
- Camera-based face verification during attendance marking
- Dynamic UI updates based on session state
- Error handling and user feedback
- MediaDevices API integration for camera access

### Firebase Data Structure

**Collections:**
- `attendance_sessions`: Session metadata (isActive, startTime, endTime, createdBy)
- `attendance_records`: Individual attendance records (sessionId, studentName, timestamp, status, faceVerified)

**Real-time Synchronization:**
- Both applications use Firestore `onSnapshot()` listeners for real-time updates
- Teacher app shows live student attendance as it happens
- Student app automatically enables/disables based on session status

### Key Architectural Patterns

**Event-Driven Architecture:**
- Firebase listeners drive UI state changes
- Form submissions trigger database updates
- Real-time synchronization between teacher and student interfaces

**State Management:**
- Each app class maintains internal state (currentSessionId, hasMarkedAttendance)
- UI updates are triggered by state changes from Firebase listeners
- Session persistence across page reloads through database queries

**Separation of Concerns:**
- `firebase-config.js`: Database configuration and initialization
- `teacher.js` / `student.js`: Application-specific logic
- `styles.css`: Shared responsive styling
- HTML files: Static structure and Firebase CDN imports

### File Structure Context

```
live-attendance-system/
├── teacher/index.html     # Teacher dashboard interface
├── student/index.html     # Student portal interface  
├── css/styles.css         # Shared responsive styles with animations
├── js/
│   ├── firebase-config.js # Firebase setup and collection constants
│   ├── teacher.js         # TeacherApp class with session management
│   └── student.js         # StudentApp class with attendance marking
```

## Development Workflow

### Making Code Changes
1. Modify JavaScript classes for business logic changes
2. Update HTML structure for UI modifications
3. Adjust CSS for styling changes
4. Test both teacher and student interfaces simultaneously for real-time behavior

### Testing Real-time Features
1. Open teacher dashboard in one browser tab/window
2. Open student portal in another tab/window  
3. Start attendance session from teacher interface
4. Verify student interface updates automatically
5. Mark attendance from student interface (triggers camera verification)
6. Allow camera access when prompted
7. Verify face detection simulation runs for ~2.5 seconds
8. Verify teacher interface shows new attendance in real-time

### Firebase Development
- Use Firebase Console to monitor database changes during testing
- Check browser developer console for Firebase connection errors
- Test with multiple students by opening multiple student portal tabs

### Common Development Tasks

**Adding New Fields to Attendance Records:**
1. Update database write operations in `StudentApp.markAttendance()`
2. Update real-time listener processing in `TeacherApp.listenForStudents()`
3. Modify UI rendering in `TeacherApp.updateStudentsList()`

**Modifying Session Logic:**
1. Update session data structure in `TeacherApp.startAttendance()`
2. Modify session queries in `TeacherApp.checkExistingSession()`
3. Update UI state management in both apps' session-related methods

**UI/UX Changes:**
1. Modify HTML structure in respective `index.html` files
2. Update CSS selectors and styles in `styles.css`
3. Adjust JavaScript DOM manipulation in class methods

**Camera/Face Verification Changes:**
1. Modify camera settings in `StudentApp.startCamera()`
2. Update face detection simulation timing in `StudentApp.simulateFaceDetection()`
3. Adjust camera UI styling in CSS `.camera-verification` section
4. Handle camera permissions and error states in verification flow

## Firebase Security Notes

The current setup uses Firebase test mode rules for development. For production deployment:
1. Implement proper Firestore security rules
2. Consider adding Firebase Authentication
3. Restrict database access based on user roles (teacher vs student)

## Browser Compatibility

- Requires modern browsers with ES6+ support
- Uses Firebase v9 compatibility mode for broader support
- JavaScript must be enabled for functionality
- **Camera access requires HTTPS in production** (or localhost for development)
- MediaDevices.getUserMedia() API support required for face verification
- Responsive design works on mobile devices
