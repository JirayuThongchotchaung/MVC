const express = require('express');
const session = require('express-session');
const controller = require('./controller');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));

function requireLogin(req, res, next) {
    if(req.session.user || req.path.startsWith('/login') || req.path.startsWith('/register')) {
        return next();
    }
    res.redirect('/login');
}

app.use(requireLogin);

app.get('/register', controller.registerPage);
app.post('/register', controller.register);
app.get('/login', controller.loginPage);
app.post('/login', controller.login);
app.get('/logout', controller.logout);
app.get('/', controller.listProjects);
app.get('/project/:id', controller.projectDetail);
app.post('/fund', controller.createFunding)
app.get('/stats', controller.stats);
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
