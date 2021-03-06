const Sequelize = require('sequelize');
const db = require("./../../utils/connection");

module.exports = db.define('event', {
    rowid: { type: Sequelize.INTEGER, primaryKey:true, autoIncrement: true },
    name: { type: Sequelize.STRING },
    datetime: { type:Sequelize.STRING, validate: { is: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/ }},
    location: { type: Sequelize.STRING }
}, {
    timestamps: false,
    freezeTableName: true
});