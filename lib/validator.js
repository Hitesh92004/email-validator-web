const syntaxCheck = require('./syntaxCheck');
const dnsCheck = require('./dnsCheck');
const disposableCheck = require('./disposableCheck');
const smtpCheck = require('./smtpCheck');

const STATUS = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  DISPOSABLE: 'DISPOSABLE',
  INVALID_DOMAIN: 'INVALID_DOMAIN'
};

async function validateEmail(email, options = {}) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!syntaxCheck(normalizedEmail)) {
    return STATUS.INVALID;
  }

  const hasMx = await dnsCheck(normalizedEmail);
  if (!hasMx) {
    return STATUS.INVALID_DOMAIN;
  }

  const isDisposable = await disposableCheck(normalizedEmail);
  if (isDisposable) {
    return STATUS.DISPOSABLE;
  }

  if (options.smtp === true) {
    const smtpOk = await smtpCheck(normalizedEmail);
    if (!smtpOk) {
      return STATUS.INVALID;
    }
  }

  return STATUS.VALID;
}

module.exports = {
  STATUS,
  validateEmail
};
