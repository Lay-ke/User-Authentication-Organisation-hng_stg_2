const { sequelize } = require('../config/dbConnection');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Define the User model
const User = sequelize.define('User', {
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'First name is required' },
      notEmpty: { msg: 'First name must not be empty' }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Last name is required' },
      notEmpty: { msg: 'Last name must not be empty' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: 'Email is required' },
      notEmpty: { msg: 'Email must not be empty' },
      isEmail: { msg: 'Email must be a valid email address' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Password is required' },
      notEmpty: { msg: 'Password must not be empty' }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Define the Organisation model
const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Name is required' },
      notEmpty: { msg: 'Name must not be empty' }
    }
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', 
      key: 'userId'
    }
  }
}, {
  tableName: 'organisations' 
});

// Define the many-to-many relationship
User.belongsToMany(Organisation, { through: 'UserOrganisations', foreignKey: 'userId' });
Organisation.belongsToMany(User, { through: 'UserOrganisations', foreignKey: 'orgId' });

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync(); // This will drop the tables if they already exist
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Unable to create the tables:', error);
  }
})();



module.exports = { User, Organisation };
