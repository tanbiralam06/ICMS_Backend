import mailGenerator, { addSignature } from './base.template.js';

export const generateLeaveApplicationEmail = ({ managerName, applicantName, leaveType, fromDate, toDate, reason, days }) => {
    const email = {
        body: {
            name: managerName,
            intro: `${applicantName} has applied for ${leaveType} leave.`,
            table: {
                data: [
                    {
                        item: 'Applicant',
                        detail: applicantName
                    },
                    {
                        item: 'Leave Type',
                        detail: leaveType
                    },
                    {
                        item: 'From',
                        detail: new Date(fromDate).toDateString()
                    },
                    {
                        item: 'To',
                        detail: new Date(toDate).toDateString()
                    },
                    {
                        item: 'Days',
                        detail: days
                    },
                    {
                        item: 'Reason',
                        detail: reason
                    }
                ]
            },
            action: {
                instructions: 'To approve or reject this leave request, please login to the portal:',
                button: {
                    color: '#22BC66',
                    text: 'Go to Leave Dashboard',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/leaves`
                }
            },
            outro: 'Stay informed!'
        }
    };

    const finalEmail = addSignature(email);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};

export const generateLeaveStatusEmail = ({ applicantName, status, leaveType, fromDate, toDate, approverName, rejectionReason }) => {
    const isApproved = status === 'Approved';
    const email = {
        body: {
            name: applicantName,
            intro: `Your ${leaveType} leave request from ${new Date(fromDate).toDateString()} to ${new Date(toDate).toDateString()} has been ${status} by ${approverName}.`,
            action: {
                instructions: 'To check leave details, click the button below:',
                button: {
                    color: isApproved ? '#22BC66' : '#FF4B2B',
                    text: 'View Leave Details',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/leaves`
                }
            },
            outro: !isApproved && rejectionReason ? `Reason for Rejection: ${rejectionReason}` : ''
        }
    };

    const finalEmail = addSignature(email);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};
