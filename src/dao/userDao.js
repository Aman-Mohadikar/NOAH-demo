import { roleModel, userModel, userDetailModel, userInvitationModel, user_roleModel, email_verification, PasswordResetTokenModel } from "../schemas";
import Database from "../db";
import userRole from "../schemas/user-roleModel";

class UserDao {

  constructor() {
    this.database = new Database();
  }

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

  async checkTokenExistence(userId, token) {
    try {
      const tokenData = await PasswordResetTokenModel.findOne({ userId, token });
      return !!tokenData;
    } catch (error) {
      throw new Error('Error while checking token existence');
    }
  }
  

  async changeUserPassword(dto) {
    const { user_id, password, updatedBy } = dto;
  
    try {
      const updatedUser = await userModel.updateOne(
        { _id: user_id },
        { $set: { password, updatedBy : updatedBy } }
      );
  
      return updatedUser.length === 1;
    } catch (error) {
      console.error('Error updating password:', error);
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




// const userPipeline = [
//   {
//     $match: { email: 'user@example.com' } // Replace 'user@example.com' with the desired email
//   },
//   {
//     $lookup: {
//       from: 'user_roles', // Replace with the actual name of your user_roles collection
//       localField: 'id',
//       foreignField: 'user_id',
//       as: 'user_roles'
//     }
//   },
//   {
//     $unwind: '$user_roles' // If you expect one user to have multiple roles, use $unwind to deconstruct the array
//   },
//   {
//     $lookup: {
//       from: 'roles', // Replace with the actual name of your roles collection
//       localField: 'user_roles.role_id',
//       foreignField: 'id',
//       as: 'roles'
//     }
//   },
//   {
//     $lookup: {
//       from: 'user_details', // Replace with the actual name of your user_details collection
//       localField: 'id',
//       foreignField: 'user_id',
//       as: 'user_details'
//     }
//   },
//   {
//     $unwind: '$user_details' // If you expect one user to have one user_detail, use $unwind to deconstruct the array
//   },
//   {
//     $project: {
//       _id: 0,
//       id: '$id',
//       first_name: '$user_details.first_name',
//       last_name: '$user_details.last_name',
//       phone: '$user_details.phone',
//       email: '$email',
//       role: { $arrayElemAt: ['$roles.name', 0] },
//       invite_status: '$invite_status',
//       status: '$status',
//       created_on: '$created_on'
//     }
//   }
// ];

// // Execute the aggregation pipeline using the MongoDB driver
// const user = await db.collection('users').aggregate(userPipeline).toArray();



async getUserByEmail(email) {
  try {
    const user = await userModel.findOne({ email }); // Find user based on email

    if (!user) {
      throw new Error('User not found');
    }

    const userId = user._id;

    // Assuming your user-role table references roles based on user_id
    const userRoles = await user_roleModel.find({ userId }).populate('roleId'); // Replace with the correct field name
    console.log("userRoles", userRoles)
    return { email: user.email, roles: userRoles }; // Return email and roles
  } catch (error) {
    console.error('Error checking email and fetching roles:', error);
    throw new Error('Failed to check email and fetch roles');
  }
}


// async getUserByEmail(email) {
//   try {
//     const user = await userModel.findOne({ email }); // Find user based on email

//     if (!user) {
//       throw new Error('User not found');
//     }

//     const userId = user._id;

//     const userRoles = await roleModel.find({ user_id: userId }); // Find roles based on user_id

//     return { email: user.email, roles: userRoles }; // Return email and roles
//   } catch (error) {
//     console.error('Error checking email and fetching roles:', error);
//     throw new Error('Failed to check email and fetch roles');
//   }
// }


// async getUserByEmail(email) {
//   try {
//     const userRolesPipeline = [
//       {
//         $match: { email: email } // Match based on the email
//       },
//       {
//         $lookup: {
//           from: 'user-role', // Replace with your roles collection name
//           localField: 'id', // Assuming 'id' in users table is used to reference roles
//           foreignField: 'user_id', // Assuming 'user_id' in roles table is the reference
//           as: 'user_roles'
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           email: 1,
//           roles: '$user_roles' // Include the roles field with the retrieved roles
//         }
//       }
//     ];

//     const userWithRoles = await userModel.aggregate(userRolesPipeline).toArray();

//     return userWithRoles;
//   } catch (error) {
//     console.error('Error checking email and fetching roles:', error);
//     throw new Error('Failed to check email and fetch roles');
//   }
// }


// async getUserByEmail(email) {
//   const userPipeline = [
//     {
//       $match: { email } // Replace with the desired email variable
//     },
//     {
//       $lookup: {
//         from: 'user_roles', // Replace with the actual name of your user_roles collection
//         localField: 'id',
//         foreignField: 'user_id',
//         as: 'user_roles'
//       }
//     },
//     {
//       $unwind: '$user_roles' // If you expect one user to have multiple roles, use $unwind to deconstruct the array
//     },
//     {
//       $lookup: {
//         from: 'roles', // Replace with the actual name of your roles collection
//         localField: 'user_roles.role_id',
//         foreignField: 'id',
//         as: 'roles'
//       }
//     },
//     {
//       $lookup: {
//         from: 'user_details', // Replace with the actual name of your user_details collection
//         localField: 'id',
//         foreignField: 'user_id',
//         as: 'user_details'
//       }
//     },
//     {
//       $unwind: '$user_details' // If you expect one user to have one user_detail, use $unwind to deconstruct the array
//     },
//     {
//       $project: {
//         _id: 0,
//         id: '$id',
//         first_name: '$user_details.first_name',
//         last_name: '$user_details.last_name',
//         phone: '$user_details.phone',
//         email: '$email',
//         role: { $arrayElemAt: ['$roles.name', 0] },
//         invite_status: '$invite_status',
//         status: '$status',
//         created_on: '$created_on'
//       }
//     }
//   ];

//   try {
//     const userCollection = this.database.collection('users');
//     const user = await userCollection.aggregate(userPipeline).toArray();
//     return user;

//   } catch (error) {
//     console.error('Error retrieving user:', error);
//     throw new Error('Failed to retrieve user');
//   }
// }


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

