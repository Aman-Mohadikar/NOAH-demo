const API_ROOT = '/api';
const ADMIN_ROOT = `${API_ROOT}/admins`;
const RESET_PASSWORD = `${API_ROOT}/reset-password`;


export default Object.freeze({
  ping: `${API_ROOT}/ping`,
  healthCheck: `${API_ROOT}/health-check`,

  user: {
    ROOT: `${ADMIN_ROOT}/invitation/:token`,
    ENTITY: `${ADMIN_ROOT}/:id`,
    INVITE_USER: `${API_ROOT}/invite`,
    PROFILE: `${API_ROOT}/user-profile`,
    SET_PASSWORD: `${API_ROOT}/set-password`,
    CHANGE_PASSWORD: `${API_ROOT}/change-password`,
    ACCOUNT_PING: `${API_ROOT}/account-ping`,
    VERIFY_EMAIL: `${API_ROOT}/verify-email/:token`
  },

  security: {
    LOGIN: `${API_ROOT}/login`,
    RESET_PASSWORD,
    REQUEST_RESET_PASSWORD_LINK:`${RESET_PASSWORD}/request-link`,
    INVITATION: `${API_ROOT}/invitation/:code`,
    REQUEST_RESET_OTP_LINK: `${RESET_PASSWORD}/request-otp-link`,
    APP_RESET_PASSWORD: `${API_ROOT}/app-reset-password`,
    ORG_LOGIN: `${API_ROOT}/org-login`,
    ACCEPT_INVITATION: `${API_ROOT}/accept-invitation`,
    REQUEST_RESET_OTP: `${RESET_PASSWORD}/request-otp`,
    INVITATION_REDIRECT: `/invitation/:code`
  },
});
