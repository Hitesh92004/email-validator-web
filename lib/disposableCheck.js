const fs = require('fs/promises');
const path = require('path');

let disposableSetPromise;

async function loadDisposableSet() {
  if (!disposableSetPromise) {
    disposableSetPromise = fs
      .readFile(path.join(process.cwd(), 'data', 'disposable_domains.txt'), 'utf8')
      .then((content) => {
        const domains = content
          .split(/\r?\n/)
          .map((line) => line.trim().toLowerCase())
          .filter(Boolean);

        return new Set(domains);
      })
      .catch(() => new Set());
  }

  return disposableSetPromise;
}

async function disposableCheck(email) {
  const domain = (email.split('@')[1] || '').toLowerCase();
  const set = await loadDisposableSet();
  return set.has(domain);
}

module.exports = disposableCheck;
