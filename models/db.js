const Sequelize = require('sequelize');
const connection = new Sequelize('cadastro','root','02107512',{
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = connection;


