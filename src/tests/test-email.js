import emailService from '../services/email.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testEmails() {
    console.log("Starting Email Service Test...");
    
    // Helper for delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // 1. Test Task Assignment
        console.log("Testing Task Assignment Email...");
        await emailService.notifyTaskAssignment([{ email: 'test-user@example.com', fullName: 'John Doe' }], {
            taskTitle: 'Implement Email System',
            priority: 'High',
            dueDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
            createdBy: 'Admin Manager',
            taskId: 'mock-task-123'
        });
        console.log("✅ Task Assignment Email Sent (check Mailtrap)");

        await delay(2000); // Wait 2 seconds

        // 2. Test Task Status Update
        console.log("Testing Task Status Update Email...");
        await emailService.notifyTaskStatusUpdate('creator@example.com', {
            creatorName: 'Jane Smith',
            taskTitle: 'Implement Email System',
            status: 'Completed',
            updatedBy: 'John Doe'
        });
        console.log("✅ Task Status Email Sent (check Mailtrap)");

        await delay(2000); // Wait 2 seconds

        // 3. Test Leave Application (Admin/HR Broadcast)
        console.log("Testing Leave Application Email (Admin & HR)...");
        await emailService.notifyLeaveApplication(
            [{ email: 'admin@example.com', fullName: 'System Admin' }, { email: 'hr@example.com', fullName: 'HR Manager' }], 
            {
                applicantName: 'Alice Johnson',
                leaveType: 'Sick',
                fromDate: new Date(),
                toDate: new Date(Date.now() + 86400000 * 2),
                reason: 'Feeling unwell',
                days: 2
            }
        );
        console.log("✅ Leave Application Email Sent to Admin/HR (check Mailtrap)");
        await delay(2000); // Wait 2 seconds
        
        // 4. Test Holiday Announcement
        console.log("Testing Holiday Announcement Email...");
        await emailService.notifyHolidayAnnouncement(
            [{ email: 'employee1@example.com', fullName: 'Employee One' }, { email: 'employee2@example.com', fullName: 'Employee Two' }], 
            {
                name: 'Ganesh Chaturthi',
                startDate: new Date('2026-08-25'),
                endDate: new Date('2026-08-25'),
                description: 'Public Holiday for Ganesh Chaturthi'
            }
        );
        await delay(2000); // Wait 2 seconds
        
        // 5. Test Welcome Email
        console.log("Testing Welcome Email...");
        await emailService.notifyWelcome('newuser@example.com', {
            fullName: 'New User Account',
            email: 'newuser@example.com',
            password: 'temporary-password-123'
        });
        console.log("✅ Welcome Email Sent (check Mailtrap)");

        await delay(2000); // Wait 2 seconds

        // 6. Test Password Change Alert
        console.log("Testing Password Change Alert Email...");
        await emailService.notifyPasswordChange('security-user@example.com', {
            fullName: 'Security Aware User'
        });
        await delay(2000); // Wait 2 seconds

        // 7. Test Account Deactivation Alert
        console.log("Testing Account Deactivation Alert Email...");
        await emailService.notifyAccountDeactivation('inactive-user@example.com', {
            fullName: 'Disabled Account User'
        });
        await delay(2000); // Wait 2 seconds

        // 8. Test Account Activation Alert
        console.log("Testing Account Activation Alert Email...");
        await emailService.notifyAccountActivation('active-user@example.com', {
            fullName: 'Reactivated User'
        });
        console.log("✅ Account Activation Alert Sent (check Mailtrap)");

    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
}

testEmails();
