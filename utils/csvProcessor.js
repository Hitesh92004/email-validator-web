const csvParser = require('csv-parser');
const { Readable } = require('stream');

function parseCsvEmails(csvContent) {
  return new Promise((resolve, reject) => {
    const emails = [];

    if (!csvContent || typeof csvContent !== 'string') {
      resolve(emails);
      return;
    }

    Readable.from([csvContent])
      .pipe(csvParser())
      .on('data', (row) => {
        const values = Object.values(row || {});
        const emailValue = values.find(
          (value) => typeof value === 'string' && value.includes('@')
        );

        if (emailValue) {
          emails.push(emailValue.trim());
        }
      })
      .on('end', () => resolve(emails))
      .on('error', (error) => reject(error));
  });
}

module.exports = {
  parseCsvEmails
};
