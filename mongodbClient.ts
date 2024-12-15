// src/mongodbClient.ts

import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://maaliehtisham:me2232002@datamark.nsbz5lg.mongodb.net/?retryWrites=true&w=majority&appName=DATAMARK'; // Replace with your MongoDB URI
const client = new MongoClient(uri); // Remove options as they are no longer required

let dbInstance: any = null;

export const connectToDatabase = async () => {
  if (!dbInstance) {
    try {
      await client.connect(); // Establish a connection to MongoDB
      dbInstance = client.db('DATAMARK'); // Replace with your database name
    } catch (error) {
      console.error("Database connection failed", error);
      throw error;
    }
  }
  return dbInstance;
};
