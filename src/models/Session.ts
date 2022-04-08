import { Association, DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from "./User";

export interface SessionAttributes {
    sid: string;
    userId: string;
    expires: string | null;
    data: string | null;
}

export interface SessionCreationAttributes
    extends Optional<SessionAttributes, 'sid'> {}

export class Session
    extends Model<SessionAttributes, SessionCreationAttributes>
    implements SessionAttributes {
    public sid!: string;
    public userId!: string;
    public expires!: string | null;
    public data!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    public readonly user?: User;

    public static associations: {
        user: Association<Session, User>;
    };

    public static initializeModel(sequelize: Sequelize) {
        Session.init(
            {
                sid: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                },
                userId: {
                    type: DataTypes.UUID,
                },
                expires: DataTypes.DATE,
                data: DataTypes.TEXT,
            },
            {
                tableName: 'sessions',
                paranoid: true,
                sequelize, // passing the `sequelize` instance is required
            }
        );
    }

    public static associate(): void {
        Session.belongsTo(User, {
            foreignKey: 'userId',
            as: 'user',
        });
    }

    public static extendDefaultFields(defaults: any, session: any) {
        return {
            data: defaults.data,
            expires: defaults.expires,
            userId: session.passport ? session.passport.user : null,
        };
    }
}
