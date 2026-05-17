import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type Sequelize } from "sequelize";

export class Config extends Model<InferAttributes<Config>, InferCreationAttributes<Config>> {
    declare guildId: string;
    declare channelId: string;
    declare roleId: string;

    static initialize(sequelize: Sequelize) {
        Config.init({
            guildId: { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true },
            channelId: { type: DataTypes.STRING, allowNull: false },
            roleId: { type: DataTypes.STRING, allowNull: false },
        }, {
            sequelize,
            tableName: "config",
        });
    }
}