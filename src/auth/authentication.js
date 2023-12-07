// class Authentication {
//   static hasRight(user, right) {
//     let hasRight = false;
//     user.roles.forEach((role) => {
//       if (!hasRight) {
//         hasRight = role.hasRight(right);
//       }
//     });
//     return hasRight;
//   }

//   static userEffectiveRights(user) {
//     return Array.from(new Set(user.roles
//       .flatMap((role) => (role.getRights()))));
//   }

//   static hasPermission(rights, right) {
//     return rights.indexOf(right) !== -1;
//   }
// }

// export default Authentication;



// class Authentication {
  // static async hasRight(user, right) {
  //   if (!user || !user.rights || user.rights.length === 0) {
  //     return false;
  //   }
  //   console.log("user", user)
  //   return user.rights.includes(right);
  // }
  
  // static userEffectiveRights(user) {
  //   return user.rights || [];
  // }
  
  // static hasPermission(rights, right) {
  //   return rights.indexOf(right) !== -1;
  // }



  
  // static async hasRight(userRoles, right) {
  //   if (!userRoles || userRoles.length === 0) {
  //     return false;
  //   }
  //   console.log("userRoles", userRoles)
    
  //   return userRoles.includes(right);
  // }

  // static userEffectiveRights(userRoles) {
  //   return Array.from(new Set(userRoles.flatMap((userRole) => userRole.roleId.roleName)));
  // }

  // static hasPermission(rights, right) {
  //   return rights.indexOf(right) !== -1;
  // }
// }


import { userModel } from "../schemas";

const roleRightsMap = {
  1: ['READ', 'WRITE'],
  2: ['WRITE'],
  3: ['READ'],
};

function getRightsByRoleId(roleId) {
  return roleRightsMap[roleId] || [];
}


class Authentication {
  static async hasRight(user, right) {
    const userDoc = await userModel.findById(user._id).populate('roleId');
    const roleId = userDoc.roleId; // Assuming roleId is an integer field

    // You'll need to retrieve the rights based on the roleId
    // Assuming there's a mapping of roleId to rights in your application

    let hasRight = false;
    // Assuming getRightsByRoleId is a function to fetch rights based on roleId
    const rights = getRightsByRoleId(roleId);

    if (rights) {
      hasRight = rights.includes(right);
    }

    return hasRight;
  }

  static userEffectiveRights(user) {
    // You'll need to retrieve the rights based on the roleId
    // Assuming there's a mapping of roleId to rights in your application
    const roleId = user.roleId; // Assuming roleId is an integer field
    const rights = getRightsByRoleId(roleId);

    return rights || [];
  }

  static hasPermission(rights, right) {
    return rights.includes(right);
  }
}

export default Authentication;
