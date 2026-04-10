import mailGenerator, { addSignature } from './base.template.js';

export const generateHolidayEmail = ({ name, holidayName, startDate, endDate, description }) => {
    const isSingleDay = new Date(startDate).getTime() === new Date(endDate).getTime();
    const dateRange = isSingleDay 
        ? new Date(startDate).toDateString() 
        : `${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`;

    const email = {
        body: {
            name: name,
            intro: `We are pleased to announce a new company holiday: ${holidayName}.`,
            table: {
                data: [
                    {
                        item: 'Holiday',
                        detail: holidayName
                    },
                    {
                        item: 'Date(s)',
                        detail: dateRange
                    }
                ]
            },
            action: {
                instructions: 'To view the full holiday calendar, click the button below:',
                button: {
                    color: '#FF9900',
                    text: 'View Holiday Calendar',
                    link: `${process.env.APP_URL || 'http://localhost:3000'}/attendance`
                }
            },
            outro: 'Enjoy your break!'
        }
    };

    const finalEmail = addSignature(email);
    return {
        html: mailGenerator.generate(finalEmail),
        text: mailGenerator.generatePlaintext(finalEmail)
    };
};
