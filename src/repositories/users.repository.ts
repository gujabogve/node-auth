import { sequelize, User } from "../models";

export interface IUserRepository {
  getById(id: string): Promise<User | null>;

  getUserByEmail(email: string): Promise<User | null>;

  saveUser(user: User): Promise<User>;

  emailExists(email: string): Promise<boolean>;

}

export class UserRepository implements IUserRepository {
  async emailExists(email: string): Promise<boolean> {
    const userCount = await User.count({
      where: {
        email: email,
      },
    });

    return userCount > 0;
  }

  async saveUser(user: User): Promise<User> {
    await user.save();

    return user;
  }

  async getById(id: string): Promise<User | null> {
    const user = await User.findByPk(id);

    if (!user || user.deletedAt != null) {
      return null;
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await User.findOne({
      where: {
        email: email,
      },
      include: [
        {
          model: sequelize.models.EmailVerification,
          as: 'emailVerification',
        },
      ],
    });
    if (!user || user.deletedAt != null) {
      return null;
    }
    return user;
  }
}
