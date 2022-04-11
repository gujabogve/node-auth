import { Sequelize } from "sequelize";
import { logger } from "../logger";
import { User } from "./User";
import { Session } from "./Session";

export const sequelize = new Sequelize(
    process.env.DB_DATABASE!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        define: {
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            deletedAt: 'deletedAt',
        },
        logging:
            process.env.NODE_ENV === 'development' ? logger.info.bind(logger) : false,
    }
);

User.initializeModel(sequelize);
Session.initializeModel(sequelize);

Session.associate();

export {
    User,
    Session
}
