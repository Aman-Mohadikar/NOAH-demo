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
class Authentication {
  static async hasRight(userRoles, right) {
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    
    return userRoles.some((userRole) => userRole.roleId.roleName.includes(right));
  }

  static userEffectiveRights(userRoles) {
    return Array.from(new Set(userRoles.flatMap((userRole) => userRole.roleId.roleName)));
  }

  static hasPermission(rights, right) {
    return rights.indexOf(right) !== -1;
  }
}

export default Authentication;
