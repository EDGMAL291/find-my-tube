const fs = require('node:fs');
const path = require('node:path');
const { generateVAPIDKeys } = require('web-push');
const destination = path.resolve(__dirname, '../.push-keys.env');
const keys = generateVAPIDKeys();
try {
  fs.writeFileSync(destination, `WEB_PUSH_PUBLIC_KEY=${keys.publicKey}\nWEB_PUSH_PRIVATE_KEY=${keys.privateKey}\nWEB_PUSH_SUBJECT=https://findmytube.co.za/about.html\n`, { flag: 'wx', mode: 0o600 });
  console.log('Created .push-keys.env with restricted permissions. Copy its values into the API host’s secret environment settings. Keep this file private and back it up securely.');
} catch (error) {
  if (error.code === 'EEXIST') { console.error('.push-keys.env already exists; existing keys were preserved.'); process.exitCode = 1; }
  else { console.error('Could not save push keys.'); process.exitCode = 1; }
}
