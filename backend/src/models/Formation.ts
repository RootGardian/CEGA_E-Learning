import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class Formation extends Model {
  declare id: number;
  declare titre: string;
  declare code_formation: string;
  declare frais_inscription: number;

  // timestamps
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
}

Formation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: true, // Based on existing table
    },
    code_formation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frais_inscription: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      get() {
        const value = this.getDataValue('frais_inscription');
        return value === null ? null : parseFloat(value as any);
      }
    },
  },
  {
    sequelize,
    tableName: 'formations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Formation;
