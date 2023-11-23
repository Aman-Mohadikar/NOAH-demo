/* eslint-disable no-console */
import convict from 'convict';
import dotenv from 'dotenv';
import fs from 'fs';
import { isValidString } from "../utils";

try {
  if (fs.existsSync('.env')) {
    console.log('Loading configuration from .env');
  } else {
    console.error('.env file do not exist ');
    process.exit(1);
  }
  dotenv.config();
  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
  const jwtPublicKey = process.env.JWT_PUBLIC_KEY;
  if (!isValidString(jwtPublicKey) || !isValidString(jwtPrivateKey)) {
    console.log('Public key and Private key are required for Signing JWT');
    process.exit(1)
  }
  if (!fs.existsSync(jwtPublicKey)) {
    console.log('Public key at', jwtPublicKey, 'is not accessable!');
    process.exit(1);
  }
  if (!fs.existsSync(jwtPrivateKey)) {
    console.log('Private key at', jwtPrivateKey, 'is not accessable!');
    process.exit(1);
  }
} catch (err) {
  console.error("error while loading .env file", err.message);
  process.exit(1);
}

const privateKey = fs.readFileSync(`${process.env.JWT_PRIVATE_KEY}`);
const publicKey = fs.readFileSync(`${process.env.JWT_PUBLIC_KEY}`);

const configLoader = convict({
  env: {
    format: ['prod', 'dev', 'stage'],
    default: 'dev',
    arg: 'nodeEnv',
    env: 'NODE_ENV',
  },
  port: {
    format: 'port',
    default: 8080,
    env: 'PORT',
  },
  featureLevel: {
    format: ['development', 'staging', 'production'],
    default: 'development',
    env: 'FEATURE_LEVEL',
  },
  db: {
    credentials: {
      user: {
        format: String,
        default: '',
        env: 'DB_USER',
      },
      password: {
        format: String,
        default: '',
        env: 'DB_PASSWORD',
      },
    },
    host: {
      format: String,
      default: '',
      env: 'DB_HOST',
    },
    name: {
      format: String,
      default: '',
      env: 'DB_NAME',
    },
    port: {
      format: 'port',
      default: 5432,
      env: 'DB_PORT',
    },
  },
  authTokens: {
    privateKey: {
      format: '*',
      default: privateKey,
    },
    publicKey: {
      format: '*',
      default: publicKey,
    },
    issuer: {
      format: String,
      default: 'noah-api',
    },
    algorithm: {
      format: String,
      default: 'ES512',
    },
    audience: {
      web: {
        format: String,
        default: 'WEB',
      },
      app: {
        format: String,
        default: 'APP',
      },
    },
    version: {
      format: 'int',
      default: 1,
    },
  },
  encryptionKey: {
    format: String,
    default: '',
    env: 'ENCRYPTION_KEY',
  },
});

configLoader.validate({ allowed: 'strict' });
const config = configLoader.getProperties();
export default config;
