import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

// Caminho para o JSON da conta de serviço do Firebase (NUNCA commitar esse arquivo)
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
