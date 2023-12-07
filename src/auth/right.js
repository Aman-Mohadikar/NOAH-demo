

/**
 * Rights are the lowest abstraction level items in the authorization system.
 * The decision if a user has access to some
 * feature or not is ultimately decided on the fact if that specific user
 * has the required {@link Right}. Rights are
 * never added to the database in any form: they are aggregated via {@link Role}s.
 * This allows flexible tuning and
 * changing of {@link Right} items during development:
 * if you find a specific use case where current {@link Right}
 * options are not fitting, then add a new one. Just remember to
 * add that {@link Right} to appropriate {@link Role}s.
 */
class Right {
  static general= Object.freeze({
    /* General Rights */
    PING: 'PING',
    LOGIN: 'LOGIN',
    RESET_PASSWORD: 'RESET_PASSWORD'

  });

  static user = Object.freeze({
    /* User Profile */
    FETCH_USER_PROFILE: 'FETCH_USER_PROFILE',
    MODIFY_USER_PROFILE: 'MODIFY_USER_PROFILE',
    ACCOUNT_PING: 'ACCOUNT_PING'
  });

  static orgAdmin = Object.freeze({
    FETCH_ORG_USERS: "FETCH_ORG_USERS",
    DELETE_ORG_USER: "DELETE_ORG_USER",
    MODIFY_ORG_CREATOR: "MODIFY_ORG_CREATOR",
    INVITE_ORG_USER: "INVITE_ORG_USER",
    INVITE_ORG_CREATOR: "INVITE_ORG_CREATOR"
  })
  static orgCreator = Object.freeze({
    FETCH_ORG_VIEWERS: "FETCH_ORG_VIEWERS",
    DELETE_ORG_VIEWER: "DELETE_ORG_VIEWER",
    MODIFY_ORG_VIEWER: "MODIFY_ORG_VIEWER",
    INVITE_ORG_VIEWER: "INVITE_ORG_VIEWER",
    CREATE_VIDEO: "CREATE_VIDEO",
    DELETE_VIDEO: "DELETE_VIDEO",
    UPDATE_VIDEO: "UPDATE_VIDEO"
  })

  static companyUser = Object.freeze({
    CHANGE_USER_PASSWORD: 'CHANGE_USER_PASSWORD',
    FETCH_VIDEO: 'FETCH_VIDEO',
    FETCH_ORG_USERS: "FETCH_ORG_USERS",
    DELETE_ORG_USER: "DELETE_ORG_USER",
    INVITE_ORG_USER: "INVITE_ORG_USER",
    MODIFY_ORG_USER: "MODIFY_ORG_USER"
  });

  static org = Object.freeze({
    FETCH_COMPANY_CHANNELS: "FETCH_COMPANY_CHANNELS"
  })

  static superAdmin = Object.freeze({
    /* Admin Module */
    FETCH_ADMINS: 'FETCH_ADMINS',
    MODIFY_ADMINS: 'MODIFY_ADMINS',

    /* Company Module */
    FETCH_COMPANIES: 'FETCH_COMPANIES',
    MODIFY_ADMINS: 'MODIFY_ADMINS',

    /* Company Users */
    FETCH_COMPANY_USERS: 'FETCH_COMPANY_USERS',
    MODIFY_COMPANY_USERS: 'MODIFY_COMPANY_USERS',

      /* Invitation */
      FETCH_INVITATION: "FETCH_INVITATION"

  });

  // helper methods and stuff
  static allRights() {
    return [].concat(
      Right.getRightArray(this.general),
      Right.getRightArray(this.user),
    );
  }

  static superAdminRights() {
    return [].concat(
      Right.getRightArray(this.general),
      Right.getRightArray(this.user),
      Right.getRightArray(this.org),
      Right.getRightArray(this.superAdmin),
      Right.getRightArray(this.companyUser)
    );
  }

  static orgAdminRights() {
    return [].concat(
      Right.getRightArray(this.general),
      Right.getRightArray(this.user),
      Right.getRightArray(this.orgAdmin),
      Right.getRightArray(this.orgCreator),
      Right.getRightArray(this.org),
      Right.getRightArray(this.companyUser)
    )
  }

  static orgCreatorRights() {
    return [].concat(
      Right.getRightArray(this.general),
      Right.getRightArray(this.user),
      Right.getRightArray(this.orgCreator),
      Right.getRightArray(this.org),
      Right.getRightArray(this.companyUser)
    )
  }

  static orgViewerRights() {
    return [].concat(
      Right.getRightArray(this.general),
      Right.getRightArray(this.user),
      Right.getRightArray(this.org),
      Right.getRightArray(this.companyUser)
    )
  }

  static getRightArray(rights) {
    return Object.freeze(Object.keys(rights).map((key) => rights[key]));
  }

  static hasPermission(rights, val) {
    return rights.indexOf(val) !== -1;
  }

  static exists(val) {
    const index = this.allRights().indexOf(val);
    return index !== -1;
  }
}

export default Right;
