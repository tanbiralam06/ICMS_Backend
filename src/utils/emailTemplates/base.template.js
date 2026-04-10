import Mailgen from 'mailgen';
import config from '../../config/index.js';

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: ' ', // Non-empty space to satisfy Mailgen validation while keeping header invisible
        link: config.appUrl
    }
});

/**
 * Common signature for all emails
 */
export const addSignature = (email) => {
    const signature = [
        "Your's Truly,",
        config.companyName || "Biomoneta Research India Pvt Ltd",
        `<img src="${config.backendUrl || 'http://localhost:5000'}/public/uploads/company/logo.png" width="120" style="margin-top: 10px; display: block;" alt="Logo" />`
    ];

    // Disable default mailgen signature to prevent duplication
    email.body.signature = false;

    if (!email.body.outro) {
        email.body.outro = signature;
    } else if (typeof email.body.outro === 'string') {
        email.body.outro = [email.body.outro, '', ...signature];
    } else if (Array.isArray(email.body.outro)) {
        email.body.outro = [...email.body.outro, '', ...signature];
    }
    return email;
};

export default mailGenerator;
