const Sequelize = require('sequelize');
const db = require("./../../utils/connection");

module.exports = db.define('guest', {
    rowid: { type:Sequelize.INTEGER, primaryKey:true, autoIncrement: true },
    name: { type: Sequelize.STRING, validate: { is: /^[a-zA-Z]$/ }}
}, {
    timestamps: false,
    freezeTableName: true
});