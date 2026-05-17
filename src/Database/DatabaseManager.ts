import { Sequelize } from "sequelize";
import path from "node:path";

// import models
import { Incident } from "./Models/Incident";
import { Appends } from "./Models/Appends";
import { Config } from "./Models/Config";

class DatabaseManager {
    public sequelize: Sequelize;

    private constructor() {
        const storage = process.platform === "win32"
            ? path.resolve("database.sqlite")
            : "./database.sqlite";

        this.sequelize = new Sequelize(
            {
                dialect: "sqlite",
                storage,
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
        Incident.initialize(this.sequelize);
        Appends.initialize(this.sequelize);
        Config.initialize(this.sequelize);

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
