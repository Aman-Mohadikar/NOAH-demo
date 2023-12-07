import { roleModel, userModel, userInvitationModel, user_roleModel, email_verification, PasswordResetTokenModel, designationModel } from "../schemas";
import Database from "../db";

class UserDao {

  constructor() {
    this.database = new Database();
  }

  async createUser(createUserDto, createdBy) {
    try {
      const user = new userModel({
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: createUserDto.password,
        status: createUserDto.status,
        roleId: createUserDto.roleId,
        phone: createUserDto.phone,
        designationId: createUserDto.designationId,
        createdBy: createdBy,
        updatedBy: createdBy,
      });

      const createdUser = await user.save();

      return createdUser;
    } catch (error) {
      throw error;
    }
  }


  async tokenDocument(dto, RESET_TOKEN, expirationTime) {
    try {
      const data = new userInvitationModel({
        email: dto.email, token: RESET_TOKEN, roleId: dto.roleId, expiration_time: expirationTime
      });
      const createdToken = await data.save();
      return createdToken;
    } catch (error) {
      throw error;
    }
  }



  async sendVerificationEmail(userId, token) {
    try {
      const verificationData = new email_verification({
        userId,
        token
      })
      await verificationData.save();
      return verificationData;
    } catch (error) {
      console.log(error);
      throw new Error('Email verification failed');
    }
  }

  async getInvitationData(token) {
    try {
      const invitationData = await userInvitationModel.findOne({ token }).exec();
      return invitationData;
    } catch (error) {
      throw error;
    }
  }


  async updateInvite(updateUserDto) {
    try {
      const verificationData = await email_verification.findOneAndUpdate(
        { token: updateUserDto.token },
        { email_verification_status: updateUserDto.email_verification_status },
        { new: true }
      );

      if (!verificationData) {
        throw new Error('Verification data not found');
      }

      return verificationData;
    } catch (error) {
      throw error;
    }
  }



  async findRoleById(id) {
    const role = await roleModel.findOne({ id });
    return !!role;
  }

  async findDesignationById(designationId) {
    const designation = await designationModel.findById(designationId);
    return !!designation;
  }

  async findDuplicate(email) {
    const user = await userModel.findOne({ email });
    return !!user;
  }


  async isTokenExisting(token) {
    return await userInvitationModel.findOne({ token });
  }


  async createResetPasswordTokenForUser(dto) {
    await PasswordResetTokenModel.deleteOne({ user_id: dto.userId });

    const expirationTime = new Date(dto.expiration_time);
    const newToken = new PasswordResetTokenModel({
      user_id: dto.userId,
      token: dto.token,
      expiration_time: expirationTime
    });

    const insertedToken = await newToken.save();
    return !!insertedToken;
  }


  async findResetPasswordTokenForUser(dto) {
    const tokenData = await PasswordResetTokenModel.findOne({ token: dto.token });
    return tokenData;
  }

  async findUserById(dto) {
    const userId = await userModel.findById(dto.id);
    return userId;
  }

  async findUserByEmail(dto) {
    const userEmail = await userModel.findOne({ email: dto.email });
    return userEmail;
  }

  async checkTokenExistence(userId, token) {
    try {
      const tokenData = await PasswordResetTokenModel.findOne({ userId, token });
      return !!tokenData;
    } catch (error) {
      throw error;
    }
  }


  async changeUserPassword(dto) {
    const { user_id, password, updatedBy } = dto;

    try {
      const updatedUser = await userModel.updateOne(
        { _id: user_id },
        { $set: { password, updatedBy: updatedBy } }
      );

      return updatedUser.length === 1;
    } catch (error) {
      console.error(error);
      return false;
    }
  }



  async removeResetPasswordTokenForUser(dto) {
    const deletedToken = await PasswordResetTokenModel.deleteOne({
      user_id: dto.userId,
      token: dto.token
    });
    return deletedToken.deletedCount === 1;
  }


  async getUserByEmail(email) {
    try {
      const user = await userModel.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const userId = user._id;

      const userRoles = await user_roleModel.find({ userId }).populate('roleId');
      return { email: user.email, roles: userRoles };
    } catch (error) {
      throw error;
    }
  }

}


export default UserDao;