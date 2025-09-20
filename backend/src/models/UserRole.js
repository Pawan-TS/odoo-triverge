const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserRole = sequelize.define('UserRole', {
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'user_id'
  },
  roleId: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    field: 'role_id'
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'assigned_at'
  }
}, {
  tableName: 'user_roles',
  timestamps: false
});

module.exports = UserRole;