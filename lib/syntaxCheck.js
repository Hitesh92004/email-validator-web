const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

function syntaxCheck(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalized = email.trim();
  return EMAIL_REGEX.test(normalized);
}

module.exports = syntaxCheck;
