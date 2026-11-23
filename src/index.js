import express from 'express';
import livrosRoutes from './routes/livros.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import curtidasRoutes from './routes/curtidas.routes.js';
import comentariosRoutes from './routes/comentarios.routes.js';
import escritorRoutes from './routes/escritor.routes.js';
import bibliotecaRoutes from './routes/biblioteca.routes.js';
import curtidaPerfilRoutes from './routes/curtidasPerfil.routes.js';
import seguidorRoutes from './routes/seguidor.route.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Configura todas as rotas
app.use('/livros', livrosRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/curtidas', curtidasRoutes);
app.use('/comentarios', comentariosRoutes);
app.use('/escritores', escritorRoutes);
app.use('/biblioteca', bibliotecaRoutes);
app.use('/curtida-perfil', curtidaPerfilRoutes);
app.use('/seguidores', seguidorRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
