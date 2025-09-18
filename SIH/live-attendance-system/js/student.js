// Student App JavaScript
class StudentApp {
    constructor() {
        this.currentSessionId = null;
        this.sessionListener = null;
        this.hasMarkedAttendance = false;
        this.cameraStream = null;
        this.isVerifyingFace = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.listenForActiveSession();
    }

    bindEvents() {
        const attendanceForm = document.getElementById('attendance-form');
        attendanceForm.addEventListener('submit', (e) => this.markAttendance(e));
    }

    listenForActiveSession() {
        this.sessionListener = db.collection(ATTENDANCE_SESSION_COLLECTION)
            .where('isActive', '==', true)
            .onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const sessionDoc = snapshot.docs[0];
                    const sessionData = sessionDoc.data();
                    this.currentSessionId = sessionDoc.id;
                    this.updateUIForActiveSession(sessionData);
                } else {
                    this.currentSessionId = null;
                    this.hasMarkedAttendance = false;
                    this.updateUIForInactiveSession();
                }
            }, (error) => {
                console.error('Error listening for active session:', error);
                this.showError('Failed to connect to attendance system');
            });
    }

    async markAttendance(e) {
        e.preventDefault();
        
        if (!this.currentSessionId) {
            this.showError('No active attendance session');
            return;
        }

        if (this.hasMarkedAttendance) {
            this.showError('You have already marked your attendance for this session');
            return;
        }

        const formData = new FormData(e.target);
        const studentName = formData.get('studentName').trim();
        
        if (!studentName) {
            this.showError('Please enter your name');
            return;
        }

        try {
            // Check if student already marked attendance for this session
            const existingRecord = await db.collection(ATTENDANCE_RECORDS_COLLECTION)
                .where('sessionId', '==', this.currentSessionId)
                .where('studentName', '==', studentName)
                .limit(1)
                .get();

            if (!existingRecord.empty) {
                this.showError('You have already marked your attendance for this session');
                return;
            }

            // Start face verification process
            const isVerified = await this.performFaceVerification();
            
            if (!isVerified) {
                this.showError('Face verification failed. Please try again.');
                return;
            }

            // Mark attendance after successful verification
            const attendanceRecord = {
                sessionId: this.currentSessionId,
                studentName: studentName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'present',
                faceVerified: true
            };

            await db.collection(ATTENDANCE_RECORDS_COLLECTION).add(attendanceRecord);
            
            this.hasMarkedAttendance = true;
            this.showSuccessMessage(studentName);
            
            console.log('Attendance marked successfully for:', studentName);
        } catch (error) {
            console.error('Error marking attendance:', error);
            this.showError('Failed to mark attendance. Please try again.');
        }
    }

    updateUIForActiveSession(sessionData) {
        const statusLight = document.getElementById('status-light');
        const statusText = document.getElementById('status-text');
        const inactiveMessage = document.getElementById('inactive-message');
        const activeForm = document.getElementById('active-form');
        const successMessage = document.getElementById('success-message');
        const sessionDetails = document.getElementById('session-details');

        // Update status indicator
        statusLight.className = 'status-light active';
        statusText.textContent = 'Attendance is Live!';

        // Show appropriate form state
        if (this.hasMarkedAttendance) {
            inactiveMessage.style.display = 'none';
            activeForm.style.display = 'none';
            successMessage.style.display = 'block';
        } else {
            inactiveMessage.style.display = 'none';
            activeForm.style.display = 'block';
            successMessage.style.display = 'none';
        }

        // Update session details
        const startTime = sessionData.startTime ? 
            new Date(sessionData.startTime.seconds * 1000).toLocaleTimeString() : 
            'Just now';
        
        sessionDetails.innerHTML = `
            <p><strong>Session Started:</strong> ${startTime}</p>
            <p><strong>Status:</strong> <span class="active-status">Active - You can mark attendance</span></p>
        `;
    }

    updateUIForInactiveSession() {
        const statusLight = document.getElementById('status-light');
        const statusText = document.getElementById('status-text');
        const inactiveMessage = document.getElementById('inactive-message');
        const activeForm = document.getElementById('active-form');
        const successMessage = document.getElementById('success-message');
        const sessionDetails = document.getElementById('session-details');

        // Update status indicator
        statusLight.className = 'status-light stopped';
        statusText.textContent = 'Attendance Not Active';

        // Show inactive message
        inactiveMessage.style.display = 'block';
        activeForm.style.display = 'none';
        successMessage.style.display = 'none';

        // Update session details
        sessionDetails.innerHTML = '<p>No active session</p>';

        // Reset form
        const form = document.getElementById('attendance-form');
        form.reset();
    }

    showSuccessMessage(studentName) {
        const inactiveMessage = document.getElementById('inactive-message');
        const activeForm = document.getElementById('active-form');
        const successMessage = document.getElementById('success-message');
        const confirmedName = document.getElementById('confirmed-name');

        inactiveMessage.style.display = 'none';
        activeForm.style.display = 'none';
        successMessage.style.display = 'block';
        confirmedName.textContent = studentName;
    }

    showError(message) {
        // Simple error display - you can enhance this with a proper notification system
        console.error(message);
        
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p style="color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0;">
                ❌ ${message}
            </p>
        `;
        
        const formContainer = document.getElementById('form-container');
        const existingError = formContainer.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async performFaceVerification() {
        if (this.isVerifyingFace) {
            return false;
        }

        this.isVerifyingFace = true;

        try {
            // Show camera verification UI
            this.showCameraVerification();

            // Start camera
            await this.startCamera();

            // Simulate face detection process (2 seconds)
            const isVerified = await this.simulateFaceDetection();

            // Stop camera and hide UI
            this.stopCamera();
            this.hideCameraVerification();

            return isVerified;
        } catch (error) {
            console.error('Face verification error:', error);
            this.stopCamera();
            this.hideCameraVerification();
            return false;
        } finally {
            this.isVerifyingFace = false;
        }
    }

    showCameraVerification() {
        const activeForm = document.getElementById('active-form');
        const cameraVerification = document.getElementById('camera-verification');
        
        activeForm.style.display = 'none';
        cameraVerification.style.display = 'block';
    }

    hideCameraVerification() {
        const activeForm = document.getElementById('active-form');
        const cameraVerification = document.getElementById('camera-verification');
        
        activeForm.style.display = 'block';
        cameraVerification.style.display = 'none';
    }

    async startCamera() {
        const video = document.getElementById('camera-video');
        const statusMessage = document.getElementById('status-message');
        const verificationStatus = document.getElementById('verification-status');

        try {
            // Update status
            statusMessage.textContent = 'Starting camera...';
            verificationStatus.className = 'verification-status initializing';

            // Request camera access
            this.cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 320 }, 
                    height: { ideal: 240 },
                    facingMode: 'user' 
                } 
            });

            // Set video source
            video.srcObject = this.cameraStream;

            // Wait for video to start playing
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });

            console.log('Camera started successfully');
        } catch (error) {
            console.error('Error starting camera:', error);
            statusMessage.textContent = 'Camera access denied or not available';
            verificationStatus.className = 'verification-status failed';
            throw error;
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        const video = document.getElementById('camera-video');
        video.srcObject = null;
    }

    async simulateFaceDetection() {
        const statusMessage = document.getElementById('status-message');
        const verificationStatus = document.getElementById('verification-status');

        return new Promise((resolve) => {
            // Phase 1: Scanning (1 second)
            statusMessage.textContent = 'Detecting face...';
            verificationStatus.className = 'verification-status scanning';

            setTimeout(() => {
                // Phase 2: Verification (1 second)
                statusMessage.textContent = 'Verifying identity...';
                verificationStatus.className = 'verification-status scanning';

                setTimeout(() => {
                    // Phase 3: Success (always succeed for demo)
                    statusMessage.textContent = '✅ Face verified successfully!';
                    verificationStatus.className = 'verification-status verified';
                    
                    // Wait a moment to show success message
                    setTimeout(() => {
                        resolve(true);
                    }, 500);
                }, 1000);
            }, 1000);
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StudentApp();
});