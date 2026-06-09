import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Etudiant from './Etudiant';

class Notification extends Model {
  declare id: number;
  declare etudiantId: number;
  declare title: string;
  declare message: string;
  declare type: 'info' | 'success' | 'warning' | 'error';
  declare isRead: boolean;

  // timestamps!
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    etudiantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Etudiant,
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'info',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Setup associations
Etudiant.hasMany(Notification, { foreignKey: 'etudiantId' });
Notification.belongsTo(Etudiant, { foreignKey: 'etudiantId' });

export default Notification;
