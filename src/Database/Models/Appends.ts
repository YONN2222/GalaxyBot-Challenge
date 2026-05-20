import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type Sequelize,
} from "sequelize";

export class Appends extends Model<
	InferAttributes<Appends>,
	InferCreationAttributes<Appends>
> {
	declare id: CreationOptional<number>;
	declare incidentId: number;
	declare text: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	static initialize(sequelize: Sequelize) {
		Appends.init(
			{
				id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
				incidentId: { type: DataTypes.INTEGER, allowNull: false },
				text: { type: DataTypes.TEXT, allowNull: false },
				createdAt: { type: DataTypes.DATE, allowNull: false },
				updatedAt: { type: DataTypes.DATE, allowNull: false },
			},
			{
				sequelize,
				tableName: "appends",
			},
		);
	}
}
