import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { compare, hash } from "bcrypt";

export interface UserAttributes {
    id: string;
    firstName: string | null;
    lastName: string | null;
    password: string;
    email: string | null;
    phone: string | null;
    birthday: Date | null;
    gender: string | null;
    isActive: boolean;
}

export interface UserCreationAttributes
    extends Optional<UserAttributes, 'id'> {
}


export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public birthday!: Date | null;
    public email!: string | null;
    public firstName!: string | null;
    public gender!: string | null;
    public id!: string;
    public isActive!: boolean;
    public lastName!: string | null;
    public password!: string;
    public phone!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    public static initializeModel(sequelize: Sequelize) {
        User.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV1,
                    primaryKey: true,
                    allowNull: false,
                },
                firstName: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                lastName: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    set(email: string): void {
                        this.setDataValue('email', email?.toLowerCase());
                    },
                },
                phone: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                birthday: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                gender: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
            },
            {
                tableName: 'users',
                paranoid: true,
                sequelize,
            }
        );
    }

    public async isValidPassword(password: string): Promise<boolean> {
        return await compare(password, this.password);
    }

    public async hashPassword(): Promise<void> {
        this.password = await hash(this.password, 10);
    }
}
