import { Model, DataTypes, ForeignKey } from 'sequelize'
import { sequelizeConnection } from '../data-access/config.js'

export interface IUserGroup {
  user_group_id?: number
  fk_user_ids: number[]
  fk_group_id: number
  created_at?: Date
  updated_at?: Date
}

export class UserGroup extends Model<IUserGroup> {
  user_group_id: number
  fk_user_ids: number[]
  fk_group_id: ForeignKey<number>
  created_at?: Date
  updated_at?: Date
}

UserGroup.init(
  {
    user_group_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fk_user_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false,
    },
    fk_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'usergroups',
  }
)
