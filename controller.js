const model = require('./model');
const bcrypt = require('bcrypt');

exports.registerPage = (req,res) => res.render('register', { error: null });
exports.register = async (req,res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.render('register', { error:'All fields required' });
    try {
        const hash = await bcrypt.hash(password, 10);
        await model.createUser(username, hash);
        res.redirect('/login');
    } catch(err){
                console.log(err);

        res.render('register', { error:'Username already exists' });
    }
};

exports.loginPage = (req,res) => res.render('login', { error: null });
exports.login = async (req,res) => {
    const { username, password } = req.body;
    const [rows] = await model.getUserByUsername(username);
    if(rows.length===0) return res.render('login', { error:'Invalid credentials' });
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if(!valid) return res.render('login', { error:'Invalid credentials' });
    req.session.user = { username: rows[0].username, user_id: rows[0].user_id };
    res.redirect('/');
};

exports.logout = (req,res) => {
    req.session.destroy();
    res.redirect('/login');
};

exports.listProjects = async (req,res) => {
    const search = req.query.search || '';
    const selectedCategory = req.query.category || '';
    const sort = req.query.sort || '';

    const [projects] = await model.getAllProjects(search, selectedCategory, sort);
    const [categories] = await model.getCategories();

    res.render('projects', { 
        projects, 
        categories, 
        search, 
        selectedCategory, 
        sort, 
        session: req.session 
    });
};

exports.projectDetail = async (req,res) => {
    const id = req.params.id;
    const [[project]] = await model.getProjectById(id);
    const [rewards] = await model.getRewardByProject(id);
    
    res.render('project_detail', { 
        project, 
        rewards, 
        session: req.session,
        error: null 
    });
};

exports.createFunding = async (req, res) => {
    const { project_id, amount, reward_id } = req.body;
    const user_id = req.session.user.user_id;

    const amountNum = parseFloat(amount);
    if(isNaN(amountNum) || amountNum <= 0){
        const [[project]] = await model.getProjectById(project_id);
        const [rewards] = await model.getRewardByProject(project_id);
        return res.render('project_detail', { 
            project, 
            rewards, 
            session: req.session, 
            error: 'Invalid funding amount.' 
        });
    }

    let status = 'success';
    if(reward_id){
        const [[reward]] = await model.getRewardById(reward_id);
        if(amountNum < reward.min_amount || reward.quantity_remaining <= 0){
            status = 'rejected';
        }
    }

    await model.insertFunding(user_id, project_id, amountNum, reward_id || null, status);
    if(status === 'success'){
        await model.updateProjectFunding(project_id, amountNum);
        if(reward_id) await model.decreaseReward(reward_id);
    }

    await model.updateUserStats(user_id, status, amountNum, reward_id);

    res.redirect('/project/' + project_id);
};

exports.stats = async (req, res) => {
    const user_id = req.session.user.user_id;
    const [[stats]] = await model.getUserStats(user_id);

    const safeStats = stats || { 
        total_funded: 0,    
        rewards_received: 0, 
        rejected_count: 0  
    };

    res.render('stats', { stats: safeStats });
};