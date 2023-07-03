
const User = require('./User');
const Sequelize = require('sequelize');
const connection = require('./db');

const Profile = connection.define('Profile', {
  nome_completo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  data_nasc: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
});

module.exports = Profile;

