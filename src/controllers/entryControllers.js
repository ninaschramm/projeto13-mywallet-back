import joi from 'joi';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config()

const mongoClient = new MongoClient(process.env.MY_URL_MONGO);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MY_MONGO_DB);
});

export async function newEntry(req, res) { 
    const newEntry = req.body;

    const newEntrySchema = joi.object({
        description: joi.string().required(),
        value: joi.string().required(),
        type: joi.string().valid('debit', 'credit').required(),
        date: joi.string().required(),
    })

    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
  
    if(!token) return res.sendStatus(401);
  
    const session = await db.collection("sessions").findOne({ token });
              
    if (!session) {
        return res.sendStatus(401);
    }
  
      const user = await db.collection("users").findOne({ 
          _id: session.userId 
      })
  
    if(user) {
        const validation = newEntrySchema.validate(newEntry);
        if (validation.error) {
            console.log(validation.error.details)        
          return res.status(422).send(`${validation.error}`)  
        }
        
        await db.collection("entries").insertOne({ ...newEntry, user: user._id })
        
         return res.status(201).send("");
    } else {
     return res.sendStatus(401);
    }

}

export async function getEntries(req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
  
    if(!token) return res.sendStatus(401);
  
    const session = await db.collection("sessions").findOne({ token });
              
    if (!session) {
        return res.sendStatus(401);
    }
  
      const user = await db.collection("users").findOne({ 
          _id: session.userId 
      })

      const username = user.name;
  
    if(user) {
        const entryList = await db.collection("entries").find({ user: user._id }).toArray();        
         return res.send(entryList);
    } else {
     return res.sendStatus(401);
    }
}