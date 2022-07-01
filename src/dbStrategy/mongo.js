import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config()

const mongoClient = new MongoClient(process.env.MY_URL_MONGO);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MY_MONGO_DB);
});

export default db;