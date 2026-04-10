import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port == 465, // Use SSL/TLS for port 465
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

/**
 * Send an email using SMTP
 * @param {Object} options - { to, subject, html, text, attachments }
 */
export const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"${config.companyName}" <${config.emailFrom}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            attachments: options.attachments || [],
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Error sending email: ${err.message}`);
        // In simple async, we log and proceed
        throw err;
    }
};

// --- Specialized Notification Dispatchers ---

/**
 * Notify user(s) when a task is assigned
 * @param {Array} users - Array of user objects { email, fullName }
 * @param {Object} templateData - Data for the task template
 */
export const notifyTaskAssignment = async (users, templateData) => {
    const { generateTaskAssignmentEmail } = await import('../utils/emailTemplates/task.template.js');
    
    // For Mailtrap/low-tier SMTP, sequential sending with delay is safer
    for (const user of users) {
        try {
            const recipientEmail = typeof user === 'string' ? user : user.email;
            const fullName = typeof user === 'string' ? 'Team Member' : user.fullName;

            const { html, text } = generateTaskAssignmentEmail({ ...templateData, fullName });
            await sendEmail({
                to: recipientEmail,
                subject: `New Task Assigned: ${templateData.taskTitle}`,
                html,
                text
            });
            // Small delay between sends to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            const identifier = typeof user === 'string' ? user : user.email;
            logger.error(`Failed to notify ${identifier}: ${err.message}`);
        }
    }
};

/**
 * Notify task creator when status is updated
 * @param {String} email - Recipient email
 * @param {Object} templateData - Data for the status update template
 */
export const notifyTaskStatusUpdate = async (email, templateData) => {
    const { generateTaskStatusUpdateEmail } = await import('../utils/emailTemplates/task.template.js');
    const { html, text } = generateTaskStatusUpdateEmail(templateData);
    
    return sendEmail({
        to: email,
        subject: `Task Status Updated: ${templateData.taskTitle}`,
        html,
        text
    });
};

/**
 * Notify admins/HRs when a leave is applied
 * @param {Array} users - Array of user objects { email, fullName }
 * @param {Object} templateData - Data for the leave application template
 */
export const notifyLeaveApplication = async (users, templateData) => {
    const { generateLeaveApplicationEmail } = await import('../utils/emailTemplates/leave.template.js');
    
    for (const user of users) {
        try {
            const { html, text } = generateLeaveApplicationEmail({ 
                ...templateData, 
                managerName: user.fullName 
            });
            
            await sendEmail({
                to: user.email,
                subject: `New Leave Application: ${templateData.applicantName}`,
                html,
                text
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            logger.error(`Failed to notify ${user.email} about leave application: ${err.message}`);
        }
    }
};

/**
 * Notify employee when leave status is updated
 * @param {String} employeeEmail - Recipient email
 * @param {Object} templateData - Data for the leave status template
 */
export const notifyLeaveStatusUpdate = async (employeeEmail, templateData) => {
    const { generateLeaveStatusEmail } = await import('../utils/emailTemplates/leave.template.js');
    const { html, text } = generateLeaveStatusEmail(templateData);
    
    return sendEmail({
        to: employeeEmail,
        subject: `Leave Request ${templateData.status}: ${templateData.leaveType}`,
        html,
        text
    });
};

/**
 * Notify all users about a new holiday
 * @param {Array} users - Array of user objects { email, fullName }
 * @param {Object} templateData - Data for the holiday template
 */
export const notifyHolidayAnnouncement = async (users, templateData) => {
    const { generateHolidayEmail } = await import('../utils/emailTemplates/holiday.template.js');
    
    // Broadcast sequentially with delay for safer delivery
    for (const user of users) {
        try {
            const { html, text } = generateHolidayEmail({ 
                name: user.fullName, 
                holidayName: templateData.name,
                startDate: templateData.startDate,
                endDate: templateData.endDate,
                description: templateData.description
            });

            await sendEmail({
                to: user.email,
                subject: `New Holiday Announced: ${templateData.name}`,
                html,
                text
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            logger.error(`Failed to notify ${user.email} about holiday: ${err.message}`);
        }
    }
};

/**
 * Notify user when their account is created
 * @param {String} email - User email
 * @param {Object} templateData - Data for the welcome template { fullName, email, password }
 */
export const notifyWelcome = async (email, templateData) => {
    const { generateWelcomeEmail } = await import('../utils/emailTemplates/user.template.js');
    const { html, text } = generateWelcomeEmail(templateData);
    
    return sendEmail({
        to: email,
        subject: 'Welcome to Biomoneta Research India Pvt Ltd!',
        html,
        text
    });
};

/**
 * Notify user when their password is changed
 * @param {String} email - User email
 * @param {Object} templateData - Data for the password change template { fullName }
 */
export const notifyPasswordChange = async (email, templateData) => {
    const { generatePasswordChangeEmail } = await import('../utils/emailTemplates/user.template.js');
    const { html, text } = generatePasswordChangeEmail(templateData);
    
    return sendEmail({
        to: email,
        subject: 'Security Alert: Password Changed',
        html,
        text
    });
};

/**
 * Notify user when their account is deactivated
 * @param {String} email - User email
 * @param {Object} templateData - Data for the deactivation template { fullName }
 */
export const notifyAccountDeactivation = async (email, templateData) => {
    const { generateAccountDeactivationEmail } = await import('../utils/emailTemplates/user.template.js');
    const { html, text } = generateAccountDeactivationEmail(templateData);
    
    return sendEmail({
        to: email,
        subject: 'Account Deactivated: BMS Portal',
        html,
        text
    });
};

/**
 * Notify user when their account is activated
 * @param {String} email - User email
 * @param {Object} templateData - Data for the activation template { fullName }
 */
export const notifyAccountActivation = async (email, templateData) => {
    const { generateAccountActivationEmail } = await import('../utils/emailTemplates/user.template.js');
    const { html, text } = generateAccountActivationEmail(templateData);
    
    return sendEmail({
        to: email,
        subject: 'Account Reactivated: BMS Portal',
        html,
        text
    });
};

export default {
    sendEmail,
    notifyTaskAssignment,
    notifyTaskStatusUpdate,
    notifyLeaveApplication,
    notifyLeaveStatusUpdate,
    notifyHolidayAnnouncement,
    notifyWelcome,
    notifyPasswordChange,
    notifyAccountDeactivation,
    notifyAccountActivation
};
