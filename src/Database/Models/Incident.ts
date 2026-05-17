import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional, type Sequelize } from "sequelize";

export class Incident extends Model<InferAttributes<Incident>, InferCreationAttributes<Incident>> {
    declare id: CreationOptional<number>;
    declare guildId: string;
    declare title: string;
    declare description: string;
    declare messageId: string;
    declare status: string;

    static initialize(sequelize: Sequelize) {
        Incident.init({
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            guildId: { type: DataTypes.STRING, allowNull: false },
            title: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: false },
            messageId: { type: DataTypes.STRING, allowNull: false },
            status: { type: DataTypes.STRING, allowNull: false },
        }, {
            sequelize,
            tableName: "incidents",
        });
    }
}