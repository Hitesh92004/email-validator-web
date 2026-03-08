const net = require('net');

const SMTP_TIMEOUT_MS = 5000;

function parseCode(line) {
  const match = String(line || '').match(/^(\d{3})[ -]/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

function readResponse(socket, timeoutMs) {
  return new Promise((resolve, reject) => {
    const lines = [];

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('SMTP response timeout'));
    }, timeoutMs);

    const onData = (chunk) => {
      const text = chunk.toString('utf8');
      const parts = text.split(/\r?\n/).filter(Boolean);

      for (const part of parts) {
        lines.push(part);
        if (/^\d{3} /.test(part)) {
          cleanup();
          resolve(lines);
          return;
        }
      }
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    function cleanup() {
      clearTimeout(timeout);
      socket.off('data', onData);
      socket.off('error', onError);
    }

    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function sendCommand(socket, command, timeoutMs) {
  socket.write(`${command}\r\n`);
  const lines = await readResponse(socket, timeoutMs);
  const code = parseCode(lines[lines.length - 1]);
  return { code, lines };
}

async function smtpCheck(email, mxRecords = []) {
  if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
    return null;
  }

  const sender = 'probe@localhost.localdomain';

  for (const mx of mxRecords.slice(0, 3)) {
    const host = mx.exchange;

    try {
      const socket = net.createConnection({ host, port: 25 });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.destroy();
          reject(new Error('SMTP connect timeout'));
        }, SMTP_TIMEOUT_MS);

        socket.once('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        socket.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      try {
        const greeting = await readResponse(socket, SMTP_TIMEOUT_MS);
        const greetingCode = parseCode(greeting[greeting.length - 1]);
        if (greetingCode !== 220) {
          socket.destroy();
          continue;
        }

        const ehlo = await sendCommand(socket, 'EHLO localhost', SMTP_TIMEOUT_MS);
        if (!(ehlo.code >= 200 && ehlo.code < 400)) {
          socket.destroy();
          continue;
        }

        const mailFrom = await sendCommand(socket, `MAIL FROM:<${sender}>`, SMTP_TIMEOUT_MS);
        if (!(mailFrom.code >= 200 && mailFrom.code < 400)) {
          socket.destroy();
          continue;
        }

        const rcpt = await sendCommand(socket, `RCPT TO:<${email}>`, SMTP_TIMEOUT_MS);
        await sendCommand(socket, 'QUIT', SMTP_TIMEOUT_MS).catch(() => null);
        socket.end();

        if (rcpt.code === 250 || rcpt.code === 251) {
          return true;
        }

        if (rcpt.code === 550 || rcpt.code === 551 || rcpt.code === 553) {
          return false;
        }

        return null;
      } catch (error) {
        socket.destroy();
        continue;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

module.exports = smtpCheck;
