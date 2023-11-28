import { roleModel, userModel, userDetailModel, userInvitationModel, user_roleModel, email_verification } from "../schemas";

class UserDao {

  async createUser(createUserDto) {
    try {
      const user = new userModel({
        email: createUserDto.email,
        password: createUserDto.password,
        status: createUserDto.status,
        createdBy: createUserDto.createdBy,
        updatedBy: createUserDto.createdBy,
      });

      const userDetails = new userDetailModel({
        userId: user._id,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        // roleId: createUserDto.roleId,
        createdBy: user._id,
        updatedBy: user._id,
      });

      const createdUser = await user.save();
      userDetails.userId = createdUser._id;
      await userDetails.save();

      return createdUser;
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
      console.log(error);
      throw new Error('Email verification update failed');
    }
  }
  
  

  async findRoleById(roleId) {
    const role = await roleModel.findOne({ _id: roleId });
    return !!role;
  }

  async findDuplicate(email) {
    const user = await userModel.findOne({ email });
    return !!user;
  }

  async isTokenExisting(token) {
    return await userInvitationModel.findOne({ token });
  }


  async addUserRole(userId, roleId) {
    try {
      const userRole = new user_roleModel({
        userId,
        roleId
      });
      const savedUserRole = await userRole.save();
      return savedUserRole;
    } catch (error) {
      throw error;
    }
  }
}


export default UserDao;
