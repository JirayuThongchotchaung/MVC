const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'nine',
    database: 'crowdfunding'
});

const db = {
    query: (sql, params) => pool.query(sql, params),

    createUser: (username, hash) => 
        pool.query('INSERT INTO Users (username, password_hash) VALUES (?,?)', [username, hash]),
    
    getUserByUsername: (username) => 
        pool.query('SELECT * FROM Users WHERE username=?', [username]),

    getUserStats: (user_id) => 
        pool.query('SELECT total_funded, rewards_received, rejected_count FROM UserStats WHERE user_id = ?', [user_id]),

    updateUserStats: async (user_id, status, amount, reward_id) => {
        const values = [
            user_id,
            status === 'success' ? amount : 0,
            status === 'success' && reward_id ? 1 : 0,
            status === 'rejected' ? 1 : 0
        ];

        return pool.query(`
            INSERT INTO UserStats (user_id, total_funded, rewards_received, rejected_count)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                total_funded = total_funded + VALUES(total_funded),
                rewards_received = rewards_received + VALUES(rewards_received),
                rejected_count = rejected_count + VALUES(rejected_count)
        `, values);
    },

    getAllProjects: (search = '', category = '', sort = '') => {
        let sql = `
            SELECT DISTINCT p.* 
            FROM Projects p
            LEFT JOIN ProjectCategories pc ON p.project_id = pc.project_id
            LEFT JOIN Categories c ON pc.category_id = c.category_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ' AND p.project_name LIKE ?';
            params.push(`%${search}%`);
        }

        if (category) {
            sql += ' AND c.category_id = ?';
            params.push(category);
        }

        if (sort === 'newest') {
            sql += ' ORDER BY p.project_id DESC';
        } else if (sort === 'deadline') {
            sql += ' ORDER BY p.deadline ASC';
        } else if (sort === 'funding') {
            sql += ' ORDER BY p.current_funding DESC';
        }

        return pool.query(sql, params);
    },

    getProjectById: (id) => 
        pool.query('SELECT * FROM Projects WHERE project_id=?', [id]),

    updateProjectFunding: (project_id, amount) => 
        pool.query('UPDATE Projects SET current_funding = current_funding + ? WHERE project_id=?', [amount, project_id]),

    getRewardByProject: (project_id) => 
        pool.query('SELECT * FROM RewardTiers WHERE project_id=?', [project_id]),
    
    getRewardById: (reward_id) => 
        pool.query('SELECT * FROM RewardTiers WHERE reward_id=?', [reward_id]),
    
    decreaseReward: (reward_id) => 
        pool.query('UPDATE RewardTiers SET quantity_remaining = quantity_remaining - 1 WHERE reward_id=?', [reward_id]),

    getCategories: () => 
        pool.query('SELECT * FROM Categories'),

    insertFunding: (user_id, project_id, amount, reward_id) =>
        pool.query('INSERT INTO Fundings (user_id, project_id, amount, reward_id) VALUES (?,?,?,?)',
            [user_id, project_id, amount, reward_id]),

    getFundingStats: () => 
        pool.query('SELECT status, COUNT(*) as count FROM Fundings GROUP BY status')
};

module.exports = db;