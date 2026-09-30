/**
 * Erzeugt den Wert für ADMIN_PASSWORD_HASH.
 *
 *   npm run admin:hash
 *
 * Das Passwort wird verdeckt abgefragt und nirgends gespeichert. Den ausgegebenen Hash in die
 * .env-Datei (lokal) bzw. in die Umgebungsvariablen des Hosters eintragen – niemals in Git.
 */
import { createInterface } from 'node:readline';
import { hashPassword } from './auth.js';

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let muted = false;
rl._writeToOutput = (s) => {
  if (!muted) rl.output.write(s);
};

rl.question('Neues Admin-Passwort (mind. 12 Zeichen): ', (pw) => {
  muted = false;
  rl.output.write('\n');
  rl.close();
  if (pw.length < 12) {
    console.error('Bitte mindestens 12 Zeichen verwenden.');
    process.exit(1);
  }
  console.info(`\nADMIN_PASSWORD_HASH=${hashPassword(pw)}\n`);
});
muted = true;
