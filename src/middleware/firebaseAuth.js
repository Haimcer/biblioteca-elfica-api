import admin from '../config/firebaseConfig.js';

export const verificarTokenFirebase = async (req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('verifyToken');

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token não fornecido ou mal formatado!' });
  }

  try {
    const token = authorization.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('decodedToken:', decodedToken);

    req.uid = decodedToken.uid;
    req.usuario = decodedToken;

    next();
  } catch (error) {
    console.error('Erro ao verificar o token:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(403).send({ message: 'Token expirado. Por favor, faça login novamente.' });
    }

    return res.status(401).send({ message: 'Token inválido!' });
  }
};
