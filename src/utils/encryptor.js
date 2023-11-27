import crypto from 'crypto';


const generateEncryptionKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const keyLength = 32;
  let key = '';

  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }

  return key;
};

const encryptionKey = generateEncryptionKey();
console.log(encryptionKey); // This will output a 32-character random key


const ENCRYPTION_KEY = encryptionKey; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
const ALGO = 'aes-256-gcm';

export const encrypt = (text) => {
  // random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // random salt
  const salt = crypto.randomBytes(64);

  // derive encryption key: 32 byte key length
  // in assumption the masterkey is a cryptographic and NOT a password there is no need for
  // a large number of iterations. It may can replaced by HKDF
  // the value of 2145 is randomly chosen!
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 2145, 32, 'sha512');

  // AES 256 GCM Mode
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  // encrypt the given text
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  // extract the auth tag
  const tag = cipher.getAuthTag();

  // generate output
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
};

export const decrypt = (encData) => {
  // base64 decoding
  const bData = Buffer.from(encData, 'base64');

  // convert data to buffers
  const salt = bData.slice(0, 64);
  const iv = bData.slice(64, 80);
  const tag = bData.slice(80, 96);
  const text = bData.slice(96);

  // derive key using; 32 byte key length
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 2145, 32, 'sha512');

  // AES 256 GCM Mode
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  // decrypt the given text
  const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');

  return decrypted.toString();
};


// module.exports = {
//   encrypt, decrypt,
// };
