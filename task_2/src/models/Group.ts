import { DataTypes, Model } from 'sequelize'
import { sequelizeConnection } from '../data-access/config.js'

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
  UPLOAD_FILES = 'UPLOAD_FILES',
}

export interface IGroup {
  id: number
  name: string
  permissions: Array<Permission>
  created_at?: Date
  updated_at?: Date
}

export class Group extends Model<IGroup> {
  public id: number
  public name: string
  public permissions: Permission[]
  public created_at?: Date
  public updated_at?: Date
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        isIn: [[Permission.READ, Permission.WRITE, Permission.DELETE, Permission.SHARE, Permission.UPLOAD_FILES]],
      },
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'groups',
  }
)
