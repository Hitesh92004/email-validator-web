const syntaxCheck = require('./syntaxCheck');
const { dnsCheck, resolveMxRecords } = require('./dnsCheck');
const disposableCheck = require('./disposableCheck');
const smtpCheck = require('./smtpCheck');

const STATUS = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  DISPOSABLE: 'DISPOSABLE',
  INVALID_DOMAIN: 'INVALID_DOMAIN',
  UNVERIFIED: 'UNVERIFIED'
};

async function validateEmail(email, options = {}) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!syntaxCheck(normalizedEmail)) {
    return STATUS.INVALID;
  }

  const mxRecords = await resolveMxRecords(normalizedEmail);
  const hasMx = mxRecords.length > 0 || (await dnsCheck(normalizedEmail));
  if (!hasMx) {
    return STATUS.INVALID_DOMAIN;
  }

  const isDisposable = await disposableCheck(normalizedEmail);
  if (isDisposable) {
    return STATUS.DISPOSABLE;
  }

  if (options.smtp === true) {
    const smtpOk = await smtpCheck(normalizedEmail, mxRecords);
    if (smtpOk === false) {
      return STATUS.INVALID;
    }

    if (smtpOk === null) {
      return STATUS.UNVERIFIED;
    }
  }

  return STATUS.VALID;
}

module.exports = {
  STATUS,
  validateEmail
};
