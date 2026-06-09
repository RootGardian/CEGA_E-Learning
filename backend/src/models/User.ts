import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class User extends Model {
  declare id: string;
  declare email: string;
  declare password_hash: string;
  declare nom: string | null;
  declare prenom: string | null;
  declare role: string;
  declare status: string;
  declare is_active: boolean;
  declare telephone: string | null;
  declare photo_url: string | null;
  declare derniere_connexion: Date | null;
  declare last_login: Date | null;
  declare reset_password_token: string | null;
  declare reset_password_expires: Date | null;
  declare created_by: string | null;

  // timestamps!
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  declare readonly deleted_at: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'etudiant', // ou 'directeur_formation'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'actif',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Pour deleted_at
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

export default User;
