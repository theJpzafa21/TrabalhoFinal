import express from 'express';
import session from 'express-session';
import path from 'path';

const app = express();

// Configuração do servidor
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'M1nhaChav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 } // Sessão válida por 30 minutos
}));

// Dados armazenados em memória
let usuarios = [{ nome: 'admin', senha: '123', dataNascimento: '2000-01-01', apelido: 'Admin' }];
let mensagens = [];

// Middleware de autenticação
function verificarAutenticacao(req, res, next) {
    if (req.session.usuarioLogado) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota: Tela de Login
app.get('/login', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Login</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    form { max-width: 300px; margin: auto; padding: 20px; background: #fff; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    h1 { color: #333; text-align: center; }
                </style>
            </head>
            <body>
                <h1>Login</h1>
                <form method="POST" action="/login">
                    <label>Usuário:</label>
                    <input type="text" name="usuario" required>
                    <label>Senha:</label>
                    <input type="password" name="senha" required>
                    <button type="submit">Entrar</button>
                </form>
            </body>
        </html>
    `);
});

// Rota: Autenticação do Usuário
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const user = usuarios.find(u => u.nome === usuario && u.senha === senha);
    if (user) {
        req.session.usuarioLogado = usuario;
        req.session.ultimoAcesso = new Date().toLocaleString(); // Armazenando o último acesso
        res.redirect('/');
    } else {
        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <p style="color: red;">Usuário ou senha inválidos.</p>
                    <a href="/login" style="text-decoration: none; color: #007bff;">Tente novamente</a>
                </body>
            </html>
        `);
    }
});

// Rota: Página Principal (Menu)
app.get('/', verificarAutenticacao, (req, res) => {
    const ultimoAcesso = req.session.ultimoAcesso || 'Não disponível';
    res.send(`
        <html>
            <head>
                <title>Menu</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                </style>
            </head>
            <body>
                <h1>Bem-vindo, ${req.session.usuarioLogado}</h1>
                <p>Último acesso: ${ultimoAcesso}</p>
                <ul>
                    <li><a href="/cadastrar">Cadastrar Usuário</a></li>
                    <li><a href="/usuarios">Exibir Usuários</a></li>
                    <li><a href="/batepapo">Bate-papo</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </body>
        </html>
    `);
});

// Rota: Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Rota: Cadastro de Usuários
app.get('/cadastrar', verificarAutenticacao, (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Cadastro de Usuários</title>
            </head>
            <body>
                <h1>Cadastro de Usuários</h1>
                <form method="POST" action="/cadastrar">
                    <label>Nome:</label>
                    <input type="text" name="nome" required>
                    <label>Data de Nascimento:</label>
                    <input type="date" name="dataNascimento" required>
                    <label>Apelido:</label>
                    <input type="text" name="apelido" required>
                    <button type="submit">Cadastrar</button>
                </form>
                <a href="/">Voltar ao Menu</a>
            </body>
        </html>
    `);
});

// Rota: Processar Cadastro de Usuários
app.post('/cadastrar', verificarAutenticacao, (req, res) => {
    const { nome, dataNascimento, apelido } = req.body;
    const apelidoExistente = usuarios.some(u => u.apelido === apelido);

    if (apelidoExistente) {
        return res.send(`<p>O apelido "${apelido}" já está em uso.</p><a href="/cadastrar">Voltar</a>`);
    }

    usuarios.push({ nome, dataNascimento, apelido });
    res.redirect('/usuarios');
});

// Rota: Exibir Usuários
app.get('/usuarios', verificarAutenticacao, (req, res) => {
    const listaUsuarios = usuarios.map(u => `
        <li>Nome: ${u.nome}, Data de Nascimento: ${u.dataNascimento}, Apelido: ${u.apelido}</li>
    `).join('');

    res.send(`
        <html>
            <body>
                <h1>Usuários Cadastrados</h1>
                <ul>${listaUsuarios}</ul>
                <a href="/">Voltar ao Menu</a>
            </body>
        </html>
    `);
});

// Rota: Bate-papo (não alterada para foco no novo recurso)
// Rota: Bate-papo
app.get('/batepapo', verificarAutenticacao, (req, res) => {
    const listaUsuarios = usuarios.map(u => `<option value="${u.nome}">${u.nome}</option>`).join('');

    res.send(`
        <html>
            <head>
                <title>Bate-papo</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                    h1 { color: #333; }
                    ul { list-style: none; padding: 0; }
                    li { margin: 10px 0; background: #fff; padding: 10px; border-radius: 4px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
                    form { display: flex; margin-top: 20px; flex-wrap: wrap; }
                    select, input { flex: 1; padding: 8px; margin-right: 10px; border: 1px solid #ccc; border-radius: 4px; }
                    button { padding: 10px 20px; background-color: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                    a { text-decoration: none; color: #007bff; }
                </style>
            </head>
            <body>
                <h1>Bate-papo</h1>
                <ul>
                    ${mensagens.map(m => `<li><strong>${m.de}</strong> para <strong>${m.para}</strong>: ${m.mensagem}</li>`).join('')}
                </ul>
                <form method="POST" action="/batepapo">
                    <label>De:</label>
                    <select name="de" required>
                        <option value="">Selecione o remetente</option>
                        ${listaUsuarios}
                    </select>
                    <label>Para:</label>
                    <select name="para" required>
                        <option value="">Selecione o destinatário</option>
                        ${listaUsuarios}
                    </select>
                    <label>Mensagem:</label>
                    <input type="text" name="mensagem" required>
                    <button type="submit">Enviar</button>
                </form>
                <a href="/">Voltar ao Menu</a>
            </body>
        </html>
    `);
});

// Rota: Processar envio de mensagem no bate-papo
app.post('/batepapo', verificarAutenticacao, (req, res) => {
    const { mensagem, de, para } = req.body;

    if (!mensagem || !de || !para) {
        return res.send(`
            <div style="text-align: center; margin-top: 20px;">
                <p style="color: red;">Todos os campos são obrigatórios!</p>
                <a href="/batepapo" style="text-decoration: none;">Voltar</a>
            </div>
        `);
    }

    mensagens.push({ de, para, mensagem });
    res.redirect('/batepapo');
});


// Iniciar servidor
const porta = 3000;
app.listen(porta, () => {
    console.log(`Servidor iniciado e em execução na porta ${porta}`);
});
