DROP DATABASE IF EXISTS crowdfunding;

CREATE DATABASE crowdfunding;
USE crowdfunding;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE UserStats (
    user_id INT PRIMARY KEY,
    total_funded DECIMAL(15,2) DEFAULT 0,
    rewards_received INT DEFAULT 0,
    rejected_count INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Projects (
    project_id CHAR(8) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    funding_goal DECIMAL(15,2) NOT NULL,
    deadline DATE NOT NULL,
    current_funding DECIMAL(15,2) DEFAULT 0,
    creator_id INT,
    FOREIGN KEY (creator_id) REFERENCES Users(user_id)
);

CREATE TABLE RewardTiers (
    reward_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id CHAR(8) NOT NULL,
    reward_name VARCHAR(255) NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    quantity_remaining INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);

CREATE TABLE Fundings (
    pledge_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id CHAR(8) NOT NULL,
    reward_id INT DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('success','rejected') NOT NULL DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (reward_id) REFERENCES RewardTiers(reward_id)
);

CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE ProjectCategories (
    project_id CHAR(8) NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES Projects(project_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

INSERT INTO Users (username, password_hash) VALUES
('alice', 'hash1'),
('bob', 'hash2'),
('charlie', 'hash3'),
('david', 'hash4'),
('eve', 'hash5'),
('frank', 'hash6'),
('grace', 'hash7'),
('heidi', 'hash8'),
('ivan', 'hash9'),
('judy', 'hash10');

INSERT INTO UserStats (user_id) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

INSERT INTO Categories (category_name) VALUES
('Technology'), 
('Art'), 
('Education');

INSERT INTO Projects (project_id, project_name, funding_goal, deadline, creator_id) VALUES
('PJT00001', 'Smart Home Device', 5000.00, '2025-12-31', 1),
('PJT00002', 'AI Art Generator', 3000.00, '2025-11-30', 2),
('PJT00003', 'Online Coding Bootcamp', 4000.00, '2025-10-15', 3),
('PJT00004', 'Eco-Friendly Backpack', 2500.00, '2025-12-15', 4),
('PJT00005', 'Digital Comic Series', 1500.00, '2025-09-30', 5),
('PJT00006', 'Robotics Kit for Kids', 3500.00, '2025-12-01', 6),
('PJT00007', 'Language Learning App', 2000.00, '2025-10-31', 7),
('PJT00008', 'Photography Workshop', 1800.00, '2025-11-20', 8);

INSERT INTO ProjectCategories (project_id, category_id) VALUES
('PJT00001', 1),
('PJT00002', 1),
('PJT00003', 3),
('PJT00004', 1),
('PJT00005', 2),
('PJT00006', 1),
('PJT00007', 3),
('PJT00008', 2);

INSERT INTO RewardTiers (project_id, reward_name, min_amount, quantity_remaining) VALUES
('PJT00001', 'Tier 1', 10.00, 100),
('PJT00001', 'Tier 2', 200.00, 20),
('PJT00001', 'Tier 3', 500.00, 5),
('PJT00002', 'Tier 1', 15.00, 50),
('PJT00002', 'Tier 2', 100.00, 10),
('PJT00002', 'Tier 3', 300.00, 5),
('PJT00003', 'Tier 1', 20.00, 100),
('PJT00003', 'Tier 2', 250.00, 10),
('PJT00003', 'Tier 3', 500.00, 5),
('PJT00004', 'Tier 1', 5.00, 200),
('PJT00004', 'Tier 2', 50.00, 30),
('PJT00004', 'Tier 3', 150.00, 10),
('PJT00005', 'Tier 1', 10.00, 100),
('PJT00005', 'Tier 2', 50.00, 20),
('PJT00005', 'Tier 3', 100.00, 10),
('PJT00006', 'Tier 1', 10.00, 100),
('PJT00006', 'Tier 2', 150.00, 15),
('PJT00006', 'Tier 3', 300.00, 5),
('PJT00007', 'Tier 1', 5.00, 200),
('PJT00007', 'Tier 2', 50.00, 30),
('PJT00007', 'Tier 3', 100.00, 10),
('PJT00008', 'Tier 1', 30.00, 25),
('PJT00008', 'Tier 2', 100.00, 10),
('PJT00008', 'Tier 3', 200.00, 5);

INSERT INTO Fundings (user_id, project_id, reward_id, amount, status) VALUES
(1, 'PJT00001', 2, 200.00, 'success'),
(2, 'PJT00001', 1, 10.00, 'success'),
(3, 'PJT00002', 2, 100.00, 'success'),
(4, 'PJT00003', 1, 20.00, 'rejected'),
(5, 'PJT00003', 2, 250.00, 'success'),
(6, 'PJT00004', 2, 50.00, 'success'),
(7, 'PJT00005', 1, 10.00, 'success'),
(8, 'PJT00006', 2, 150.00, 'rejected'),
(9, 'PJT00007', 2, 50.00, 'success'),
(10, 'PJT00008', 2, 100.00, 'success'),
(1, 'PJT00002', 1, 15.00, 'success'),
(2, 'PJT00005', 2, 50.00, 'rejected'),
(3, 'PJT00006', 2, 150.00, 'success'),
(4, 'PJT00007', 1, 5.00, 'success'),
(5, 'PJT00008', 1, 30.00, 'success');
