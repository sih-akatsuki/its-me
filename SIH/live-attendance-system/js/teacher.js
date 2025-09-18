// Teacher App JavaScript
class TeacherApp {
    constructor() {
        this.currentSessionId = null;
        this.studentsListener = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
    }

    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');

        startBtn.addEventListener('click', () => this.startAttendance());
        stopBtn.addEventListener('click', () => this.stopAttendance());
    }

    async checkExistingSession() {
        try {
            const sessionsRef = db.collection(ATTENDANCE_SESSION_COLLECTION);
            const activeSession = await sessionsRef.where('isActive', '==', true).limit(1).get();
            
            if (!activeSession.empty) {
                const sessionData = activeSession.docs[0].data();
                this.currentSessionId = activeSession.docs[0].id;
                this.updateUIForActiveSession(sessionData);
                this.listenForStudents();
            }
        } catch (error) {
            console.error('Error checking existing session:', error);
            this.showError('Failed to check for existing sessions');
        }
    }

    async startAttendance() {
        try {
            const sessionData = {
                isActive: true,
                startTime: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: 'teacher',
                students: []
            };

            const docRef = await db.collection(ATTENDANCE_SESSION_COLLECTION).add(sessionData);
            this.currentSessionId = docRef.id;
            
            this.updateUIForActiveSession(sessionData);
            this.listenForStudents();
            
            console.log('Attendance session started:', this.currentSessionId);
        } catch (error) {
            console.error('Error starting attendance:', error);
            this.showError('Failed to start attendance session');
        }
    }

    async stopAttendance() {
        try {
            if (!this.currentSessionId) return;

            await db.collection(ATTENDANCE_SESSION_COLLECTION).doc(this.currentSessionId).update({
                isActive: false,
                endTime: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.updateUIForInactiveSession();
            this.stopListening();
            this.currentSessionId = null;
            
            console.log('Attendance session stopped');
        } catch (error) {
            console.error('Error stopping attendance:', error);
            this.showError('Failed to stop attendance session');
        }
    }

    listenForStudents() {
        if (!this.currentSessionId) return;

        this.studentsListener = db.collection(ATTENDANCE_RECORDS_COLLECTION)
            .where('sessionId', '==', this.currentSessionId)
            .onSnapshot((snapshot) => {
                const students = [];
                snapshot.forEach((doc) => {
                    students.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                this.updateStudentsList(students);
            }, (error) => {
                console.error('Error listening for students:', error);
            });
    }

    stopListening() {
        if (this.studentsListener) {
            this.studentsListener();
            this.studentsListener = null;
        }
    }

    updateUIForActiveSession(sessionData) {
        const statusLight = document.getElementById('status-light');
        const statusText = document.getElementById('status-text');
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        const sessionDetails = document.getElementById('session-details');

        statusLight.className = 'status-light active';
        statusText.textContent = 'Live';
        startBtn.disabled = true;
        stopBtn.disabled = false;

        const startTime = sessionData.startTime ? 
            new Date(sessionData.startTime.seconds * 1000).toLocaleTimeString() : 
            'Just now';
        
        sessionDetails.innerHTML = `
            <p><strong>Session ID:</strong> ${this.currentSessionId}</p>
            <p><strong>Started:</strong> ${startTime}</p>
            <p><strong>Status:</strong> <span class="active-status">Active</span></p>
        `;
    }

    updateUIForInactiveSession() {
        const statusLight = document.getElementById('status-light');
        const statusText = document.getElementById('status-text');
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        const sessionDetails = document.getElementById('session-details');
        const studentsList = document.getElementById('students-list');

        statusLight.className = 'status-light stopped';
        statusText.textContent = 'Stopped';
        startBtn.disabled = false;
        stopBtn.disabled = true;

        sessionDetails.innerHTML = '<p>No active session</p>';
        studentsList.innerHTML = '<p class="no-students">No students marked present yet</p>';
    }

    updateStudentsList(students) {
        const studentsList = document.getElementById('students-list');
        
        if (students.length === 0) {
            studentsList.innerHTML = '<p class="no-students">No students marked present yet</p>';
            return;
        }

        const studentsHTML = students
            .sort((a, b) => new Date(b.timestamp?.seconds || 0) - new Date(a.timestamp?.seconds || 0))
            .map(student => {
                const time = student.timestamp ? 
                    new Date(student.timestamp.seconds * 1000).toLocaleTimeString() : 
                    'Unknown';
                return `
                    <div class="student-item">
                        <div class="student-info">
                            <span class="student-name">${student.studentName}</span>
                            <span class="student-time">${time}</span>
                        </div>
                        <div class="student-status">✅</div>
                    </div>
                `;
            })
            .join('');

        studentsList.innerHTML = studentsHTML;
    }

    showError(message) {
        // Simple error display - you can enhance this with a proper notification system
        console.error(message);
        alert(message);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TeacherApp();
});