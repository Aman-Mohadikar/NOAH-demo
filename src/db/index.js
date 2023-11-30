/* eslint-disable class-methods-use-this */
import mongoose from 'mongoose';
import dotenv from "dotenv";
import { userModel } from "../schemas";
import config from '../config';
dotenv.config();

class Database {
  constructor() {
    mongoose.connect(config.mongoURI, {}, {
      useNewUrlParser: true, // Add other options as needed
      useUnifiedTopology: true,
    });
    this.db = mongoose.connection;

    this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    this.db.once('open', () => {
      console.log('MongoDB connected successfully');
    });
  }

  async testConnection() {
    // Since MongoDB is schema-less, you can use any valid query here.
    // For testing the connection, a simple query can be used.
    // Make sure you have the correct model defined for the collections you are querying.
    const result = await userModel.findOne({ exampleField: 'exampleValue' });
    return 'MongoDB Connected';
  }

  async withTransaction(callback) {
    const session = await mongoose.startSession();
    session.startTransaction();

    let res;
    try {
      res = await callback(session);
      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
    return res;
  }
}

export default Database;
