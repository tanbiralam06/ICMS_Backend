import mailGenerator, { addSignature } from './base.template.js';

export const generateTaskAssignmentEmail = ({ fullName, taskTitle, priority, dueDate, createdBy, taskId }) => {
    const email = {
        body: {
            name: fullName,
            intro: `You have been assigned a new task: ${taskTitle}`,
            table: {
                data: [
                    {
                        item: 'Task Name',
                        description: taskTitle
                    },
                    {
                        item: 'Priority',
                        description: priority
                    },
                    {
                        item: 'Due Date',
                        description: new Date(dueDate).toDateString()
                    },
                    {
                        item: 'Assigned By',
                        description: createdBy
                    }
                ],
                columns: {
                    // Custom column widths
                    customWidth: {
                        item: '20%',
                        description: '80%'
                    },
                    // Custom column alignment
                    customAlignment: {
                        item: 'left',
                        description: 'left'
                    }
                }
            },
            action: {
                instructions: 'To view task details and update progress, click the button below:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'View Task',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/tasks`
                }
            },
            outro: 'Need help? Just reply to this email, we\'d love to help.'
        }
    };

    const finalEmail = addSignature(email);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};

export const generateTaskStatusUpdateEmail = ({ creatorName, taskTitle, status, updatedBy }) => {
    const email = {
        body: {
            name: creatorName,
            intro: `The status of the task ${taskTitle} has been updated to ${status} by ${updatedBy}.`,
            action: {
                instructions: 'To check the latest updates, click the button below:',
                button: {
                    color: '#1a73e8',
                    text: 'View Task',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/tasks`
                }
            },
            outro: 'Stay productive!'
        }
    };

    const finalEmail = addSignature(email);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};
