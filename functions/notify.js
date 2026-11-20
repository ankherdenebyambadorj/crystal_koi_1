import net from 'node:net';
import tls from 'node:tls';

function sanitizeHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createLineReader(socket) {
  let buffer = '';
  const listeners = [];

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    while (buffer.includes('\n')) {
      const idx = buffer.indexOf('\n');
      const line = buffer.slice(0, idx).replace(/\r$/, '');
      buffer = buffer.slice(idx + 1);
      if (listeners.length > 0) {
        const next = listeners[0];
        if (!/^\d{3}-/.test(line)) {
          listeners.shift();
          next.resolve(line);
        }
      }
    }
  });

  return () =>
    new Promise((resolve, reject) => {
      listeners.push({ resolve, reject });
    });
}

export async function sendPlainEmail({ to, subject, text }) {
  if (!isSmtpConfigured() || !to) {
    return { sent: false, reason: 'not_configured' };
  }

  const host = String(process.env.SMTP_HOST).trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER).trim();
  const pass = String(process.env.SMTP_PASS);
  const from = sanitizeHeader(process.env.SMTP_FROM || user);
  const recipient = sanitizeHeader(to);
  const safeSubject = sanitizeHeader(subject);
  const safeBody = String(text || '').replace(/\r\n/g, '\n').replace(/\n\./g, '\n..');

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const socket =
      port === 465
        ? tls.connect({ host, port, servername: host })
        : net.connect({ host, port });

    socket.setTimeout(5000, () => {
      socket.destroy();
      finish({ sent: false, reason: 'timeout' });
    });

    socket.on('error', () => {
      finish({ sent: false, reason: 'smtp_error' });
    });

    const run = async () => {
      const readReply = createLineReader(socket);
      const sendCmd = async (cmd) => {
        socket.write(`${cmd}\r\n`);
        return readReply();
      };

      const greet = await readReply();
      if (!greet.startsWith('220')) throw new Error('bad_greet');

      let ehlo = await sendCmd('EHLO crystalkoi.local');
      if (!ehlo.startsWith('250')) throw new Error('bad_ehlo');

      if (port !== 465) {
        const st = await sendCmd('STARTTLS');
        if (st.startsWith('220')) {
          const tlsSock = tls.connect({ socket, servername: host });
          const tlsReader = createLineReader(tlsSock);
          const sendTls = async (cmd) => {
            tlsSock.write(`${cmd}\r\n`);
            return tlsReader();
          };
          ehlo = await sendTls('EHLO crystalkoi.local');
          if (!ehlo.startsWith('250')) throw new Error('bad_tls_ehlo');

          const auth1 = await sendTls('AUTH LOGIN');
          if (!auth1.startsWith('334')) throw new Error('bad_auth');
          const authU = await sendTls(Buffer.from(user).toString('base64'));
          if (!authU.startsWith('334')) throw new Error('bad_user');
          const authP = await sendTls(Buffer.from(pass).toString('base64'));
          if (!authP.startsWith('235')) throw new Error('bad_pass');

          await sendTls(`MAIL FROM:<${from}>`);
          await sendTls(`RCPT TO:<${recipient}>`);
          await sendTls('DATA');
          const msg = [
            `From: <${from}>`,
            `To: <${recipient}>`,
            `Subject: =?UTF-8?B?${Buffer.from(safeSubject).toString('base64')}?=`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            safeBody,
            '.',
          ].join('\r\n');
          const done = await sendTls(msg);
          await sendTls('QUIT').catch(() => {});
          tlsSock.end();
          finish({ sent: done.startsWith('250') });
          return;
        }
      }

      const auth1 = await sendCmd('AUTH LOGIN');
      if (!auth1.startsWith('334')) throw new Error('bad_auth');
      await sendCmd(Buffer.from(user).toString('base64'));
      const authP = await sendCmd(Buffer.from(pass).toString('base64'));
      if (!authP.startsWith('235')) throw new Error('bad_pass');

      await sendCmd(`MAIL FROM:<${from}>`);
      await sendCmd(`RCPT TO:<${recipient}>`);
      await sendCmd('DATA');
      const msg = [
        `From: <${from}>`,
        `To: <${recipient}>`,
        `Subject: =?UTF-8?B?${Buffer.from(safeSubject).toString('base64')}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        safeBody,
        '.',
      ].join('\r\n');
      const done = await sendCmd(msg);
      await sendCmd('QUIT').catch(() => {});
      socket.end();
      finish({ sent: done.startsWith('250') });
    };

    run().catch(() => {
      socket.destroy();
      finish({ sent: false, reason: 'smtp_failed' });
    });
  });
}

export async function notifyIntakeSubmission(kind, record) {
  const target = process.env.NOTIFY_EMAIL;
  if (!target || !isSmtpConfigured()) return;

  const lines = [
    `Crystal Koi intake submission: ${kind}`,
    `ID: ${record.request_id}`,
    `Source: ${record.source_path}`,
    `Created: ${record.created_at}`,
  ];
  await sendPlainEmail({
    to: target,
    subject: `[Crystal Koi] New ${kind}`,
    text: lines.join('\n'),
  }).catch(() => {});
}
