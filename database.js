const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(
  'banking',
  'root',
  'password',
  {
    host: '127.0.0.1',
    dialect: 'mariadb'
  }
)

const Users = sequelize.define('users', {
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountID: {
    type: DataTypes.STRING,
  }
})

sequelize.sync().then(() => {

  Users.create({
    firstname: "Krerkkiat",
    lastname: "Hemadhulin",
    username: 'aaa',
    password: 'bbb',
    email: 'a@a.com',
    accountID: '1234567890',
  }).then(res => {
    console.log(res)
  }).catch((error) => {
    console.error('Failed to create a new record : ', error);
  });

  console.log('created successfully!');
}).catch((error) => {
  console.error('Unable to create table : ', error);
});