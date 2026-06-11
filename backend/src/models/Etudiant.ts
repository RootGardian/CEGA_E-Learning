import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';

class Etudiant extends Model {
  declare id: number;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare department: string;
  declare numero_etudiant: string | null;
  declare cohorte_id: number | null;
  declare twoFactorSecret: string | null;
  declare isTwoFactorEnabled: boolean;
  declare resetPasswordToken: string | null;
  declare resetPasswordExpires: Date | null;
  declare phone: string | null;
  declare bio: string | null;
  declare profilePicture: string | null;
  declare subscriptionStatus: 'active' | 'expired' | 'pending';
  declare accessExpirationDate: Date | null;
  declare notificationPreferences: any;
  declare is_active: boolean;
  declare studyTime: number;

  // timestamps!
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Etudiant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    numero_etudiant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cohorte_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isTwoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.TEXT, // Using TEXT for base64 or long URLs
      allowNull: true,
    },
    subscriptionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    accessExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notificationPreferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        inAppAlerts: true,
        newCourse: true,
        examReminders: true,
        examResults: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    studyTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'etudiants',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Etudiant;
