import { roleModel, userModel, userDetailModel, userInvitationModel, user_roleModel, email_verification, PasswordResetTokenModel } from "../schemas";

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
    const userEmail= await userModel.findOne({email : dto.email});
    return userEmail;
  }

  async changeUserPassword(db, dto) {
    try {
      const usersCollection = db.collection('users');
      const filter = { _id: ObjectId(dto.userId) };
      const updateDoc = {
        $set: {
          password: dto.password,
          updated_by: dto.updatedBy
        }
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw new Error('Failed to update user password');
    }
  }



}


export default UserDao;




// async findUserById(db, id) {
//   try {
//     const usersCollection = db.collection('users');
    
//     const result = await usersCollection.aggregate([
//       {
//         $match: { _id: ObjectId(id) }
//       },
//       {
//         $lookup: {
//           from: 'user_roles',
//           localField: '_id',
//           foreignField: 'user_id',
//           as: 'userRoles'
//         }
//       },
//       {
//         $unwind: { path: '$userRoles', preserveNullAndEmptyArrays: true }
//       },
//       {
//         $lookup: {
//           from: 'roles',
//           localField: 'userRoles.role_id',
//           foreignField: '_id',
//           as: 'roles'
//         }
//       },
//       {
//         $unwind: { path: '$roles', preserveNullAndEmptyArrays: true }
//       },
//       {
//         $lookup: {
//           from: 'user_details',
//           localField: '_id',
//           foreignField: 'user_id',
//           as: 'userDetails'
//         }
//       },
//       {
//         $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
//       },
//       {
//         $project: {
//           _id: 1,
//           'userDetails.first_name': 1,
//           'userDetails.last_name': 1,
//           'userDetails.phone': 1,
//           email: 1,
//           'roles.name': 1,
//           invite_status: 1,
//           status: 1,
//           created_on: 1
//         }
//       }
//     ]).toArray();

//     return result[0]; // Assuming only one user is expected
//   } catch (error) {
//     console.error('Error finding user by ID:', error);
//     throw new Error('Failed to find user by ID');
//   }
// }

