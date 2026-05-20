import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type Sequelize,
} from "sequelize";

export class Incident extends Model<
	InferAttributes<Incident>,
	InferCreationAttributes<Incident>
> {
	declare id: CreationOptional<number>;
	declare guildId: string;
	declare title: string;
	declare description: string;
	declare messageId: CreationOptional<string>;
	declare status: "open" | "closed" | "appended";
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	static initialize(sequelize: Sequelize) {
		Incident.init(
			{
				id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
				guildId: { type: DataTypes.STRING, allowNull: false },
				title: { type: DataTypes.STRING, allowNull: false },
				description: { type: DataTypes.TEXT, allowNull: false },
				messageId: { type: DataTypes.STRING, allowNull: true },
				status: {
					type: DataTypes.STRING,
					allowNull: false,
					validate: {
						isIn: [["open", "closed", "appended"]],
					},
				},
				createdAt: { type: DataTypes.DATE, allowNull: false },
				updatedAt: { type: DataTypes.DATE, allowNull: false },
			},
			{
				sequelize,
				tableName: "incidents",
			},
		);
	}
}
