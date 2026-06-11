import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Module from './Module';

class Comment extends Model {
  declare id: number;
  declare content: string;
  declare moduleId: number;
  declare authorId: string;
  declare authorType: string; // 'etudiant' | 'enseignant'
  declare authorName: string;
  declare parentId: number | null;

  // timestamps!
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Module,
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.STRING, // Can be string(UUID) for enseignant or string(Integer) for etudiant
      allowNull: false,
    },
    authorType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Module.hasMany(Comment, { foreignKey: 'moduleId', onDelete: 'CASCADE' });
Comment.belongsTo(Module, { foreignKey: 'moduleId' });

Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

export default Comment;
