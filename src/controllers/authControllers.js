import bcrypt from 'bcrypt';
import joi from 'joi';
import { v4 as uuid } from 'uuid';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config()

const mongoClient = new MongoClient(process.env.MY_URL_MONGO);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db(process.env.MY_MONGO_DB);
});

export async function createUser(req, res) {

const newUserSchema = joi.object({
    name: joi.string().required().messages({
      'string.empty': "Todos os campos são obrigatórios",
      'any.required': "Todos os campos são obrigatórios",}),
    email: joi.string().email().required().messages({
      'string.empty': "Todos os campos são obrigatórios",
      'string.email': "Digite um endereço de e-mail válido",
      'any.required': "Todos os campos são obrigatórios",}),
    password: joi.string().required().min(6).messages({
      'string.empty': "Todos os campos são obrigatórios",
      'any.required': "Todos os campos são obrigatórios",
      'string.min': "Sua senha deve ter pelo menos 6 caracteres",}),
    confirmPassword: joi.string().required().valid(joi.ref('password')).messages({
      'string.empty': "Todos os campos são obrigatórios",
      'any.required': "Todos os campos são obrigatórios",
      'any.only': "A confirmação de senha não confere!",}),
  });

const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(6)
})

const newUser = req.body; //colocar no front o body no formato newUser 
    
const validation = newUserSchema.validate(newUser);

if (validation.error) {
    console.log(validation.error.details)        
  return res.status(422).send(`${validation.error}`)  
}

//caso dê tudo certo, cadastrar o usuário, então precisa hashear a senha:
const verifyExistingEmail = await db.collection('users').findOne({ email: newUser.email });

if (verifyExistingEmail) {
    return res.status(409).send("E-mail já cadastrado!")
}

const cryptoPass = bcrypt.hashSync(newUser.password, 10);
delete newUser.confirmPassword;
await db.collection('users').insertOne({ ...newUser, password: cryptoPass });
res.status(201).send("Usuário criado com sucesso")
}

export async function loginUser(req, res) {
        const { email, password } = req.body;
        
        const user = await db.collection('users').findOne({ email });
    
        if(user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();        
				await db.collection("sessions").insertOne({
					userId: user._id,
					token
				})
            res.status(200).send(`${token}`)
        } else {
            res.status(401).send("Usuário ou senha incorretos")
        }
}