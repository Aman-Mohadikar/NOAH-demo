export const STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
});


export const INVITE_STATUS = Object.freeze({
  PENDING : 'PENDING',
  APPROVED: 'APPROVED',
  REJECT: 'REJECT'
})

export const PERMISSION_STATUS = Object.freeze({
  PENDING : true,
  APPROVED: false
})

export const MESSAGE_TYPES = Object.freeze({
  EMAIL: 'EMAIL',
});


export const INVITATION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  REJECT: 'REJECT',
  APPROVED: 'APPROVED',
});

export const AUDIENCE = Object.freeze({
  WEB: "WEB",
  APP: "APP"
})

export const RESET_PASSWORD_TYPES = Object.freeze({
  OTP: 'OTP',
  LINK: 'LINK',
});