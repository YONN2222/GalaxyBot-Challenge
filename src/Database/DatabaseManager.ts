import { Sequelize } from "sequelize";

class DatabaseManager {
    public sequelize: Sequelize;

    private constructor() {
        this.sequelize = new Sequelize(
            {
                dialect: "sqlite",
                storage: "./database.sqlite",
                logging: false
            }
        );

    }

    private static instance: DatabaseManager;

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    public async init() {
        try {
            await this.sequelize.authenticate();
            console.log("Database connected :)");
        } catch (error) {
            console.error("Error authenticating database:", error);
        }
        try {
            await this.sequelize.sync();
        } catch (error) {
            console.error("Error syncing database:", error);
        }

    }
}

export const db = DatabaseManager.getInstance();