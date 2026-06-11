import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/db';
import Etudiant from './Etudiant';

class Transaction extends Model {
  declare id: number;
  declare etudiantId: number;
  declare amount: number;
  declare currency: string;
  declare status: 'succeeded' | 'failed' | 'pending';
  declare paymentMethod: 'stripe' | 'cinetpay';
  declare stripePaymentIntentId: string | null;
  declare cinetpayTransactionId: string | null;
  declare description: string | null;

  // timestamps!
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Transaction.init(
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'gnf',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'stripe',
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cinetpayTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Setup associations
Etudiant.hasMany(Transaction, { foreignKey: 'etudiantId' });
Transaction.belongsTo(Etudiant, { foreignKey: 'etudiantId' });

export default Transaction;
