import mailGenerator, { addSignature } from './base.template.js';

export const generateWelcomeEmail = ({ fullName, email, password }) => {
    const emailData = {
        body: {
            name: fullName,
            intro: `Welcome to Biomoneta Research India Pvt Ltd! Your account has been successfully created.`,
            table: {
                data: [
                    {
                        item: 'Login Email',
                        detail: email
                    },
                    {
                        item: 'Temporary Password',
                        detail: password
                    }
                ]
            },
            action: {
                instructions: 'To login and set up your profile, click the button below:',
                button: {
                    color: '#22BC66',
                    text: 'Login to BMS',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/login`
                }
            },
            outro: 'For security reasons, please change your password immediately after logging in.'
        }
    };

    const finalEmail = addSignature(emailData);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};

export const generatePasswordChangeEmail = ({ fullName }) => {
    const emailData = {
        body: {
            name: fullName,
            intro: 'This is a security notification to inform you that your password has been successfully changed.',
            outro: 'If you did not make this change, please contact IT support or your administrator immediately. Thank you for helping us keep your account secure.'
        }
    };

    const finalEmail = addSignature(emailData);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};

export const generateAccountDeactivationEmail = ({ fullName }) => {
    const emailData = {
        body: {
            name: fullName,
            intro: 'Your account in the Biomoneta Management System (BMS) has been deactivated by the administrator.',
            outro: 'Because of this, you will no longer be able to log in to the BMS portal. If you believe this is an error, please contact your administrator or IT support.'
        }
    };

    const finalEmail = addSignature(emailData);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};

export const generateAccountActivationEmail = ({ fullName }) => {
    const emailData = {
        body: {
            name: fullName,
            intro: 'Your account in the Biomoneta Management System (BMS) has been reactivated by the administrator.',
            action: {
                instructions: 'You can now log in to the BMS portal using your credentials:',
                button: {
                    color: '#22BC66',
                    text: 'Login to BMS',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/login`
                }
            },
            outro: 'If you have any trouble logging in, please contact your administrator or IT support.'
        }
    };

    const finalEmail = addSignature(emailData);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};
