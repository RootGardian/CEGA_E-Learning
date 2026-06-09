import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class SystemSetting extends Model {
  declare id: number;
  declare key: string;
  declare value: string | null;
  declare type: 'string' | 'number' | 'boolean' | 'json';
  declare description: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SystemSetting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'string',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true,
  }
);

export default SystemSetting;
