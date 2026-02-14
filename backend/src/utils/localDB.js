const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data.json');

const initDB = () => {
    if (!fs.existsSync(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, JSON.stringify({
            users: [],
            sessions: [],
            goals: [],
            lectures: [],
            achievements: []
        }, null, 2));
    }
};

const readDB = () => {
    initDB();
    try {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { users: [], sessions: [], goals: [], lectures: [], achievements: [] };
    }
};

const writeDB = (data) => {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

const findById = (collection, id) => {
    const db = readDB();
    return db[collection].find(item => item._id === id || item.id === id);
};

const updateById = (collection, id, updates) => {
    const db = readDB();
    const index = db[collection].findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
        db[collection][index] = { ...db[collection][index], ...updates };
        writeDB(db);
        return db[collection][index];
    }
    return null;
};

module.exports = {
    readDB,
    writeDB,
    findById,
    updateById
};
