const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const connection = require('./db');

const Carros = connection.define('Carros', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cambio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  combustivel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quilometragem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ano_modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagem: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      notNull: {
        msg: "O campo 'preco' não pode ser nulo."
      },
      isFloat: {
        msg: "O campo 'preco' deve ser um número decimal."
      }
    }
  }
});

(async () => {
  await Carros.sync();
})();

module.exports = Carros;