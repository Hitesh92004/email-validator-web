const dns = require('dns').promises;

async function resolveMxRecords(emailOrDomain) {
  const domain = (emailOrDomain || '').includes('@')
    ? emailOrDomain.split('@')[1]
    : emailOrDomain;

  if (!domain) {
    return [];
  }

  try {
    const records = await dns.resolveMx(domain);
    if (!Array.isArray(records)) {
      return [];
    }

    return records
      .filter((record) => record && record.exchange)
      .sort((a, b) => a.priority - b.priority);
  } catch (error) {
    return [];
  }
}

async function dnsCheck(emailOrDomain) {
  const records = await resolveMxRecords(emailOrDomain);
  return records.length > 0;
}

module.exports = {
  dnsCheck,
  resolveMxRecords
};
