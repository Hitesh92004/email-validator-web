const dns = require('dns').promises;

async function dnsCheck(email) {
  const domain = email.split('@')[1];

  if (!domain) {
    return false;
  }

  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (error) {
    return false;
  }
}

module.exports = dnsCheck;
