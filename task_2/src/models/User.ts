import { DataTypes, Model } from 'sequelize'
import { sequelizeConnection } from '../data-access/config.js'

export interface IUser {
  id?: number
  login: string
  password: string
  age: Number
  refresh_token?: string
  is_deleted?: boolean
  created_at?: Date
  updated_at?: Date
}

export class User extends Model<IUser> {
  public id: number
  public login: string
  public password: string
  public age: Number
  public is_deleted: boolean
  public refresh_token?: string
  public created_at?: Date
  public updated_at?: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 4,
        max: 130,
      },
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'users',
  }
)
