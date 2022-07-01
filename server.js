import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './src/routes/authRoutes.js';
import entryRouter from './src/routes/entryRoutes.js';

const server = express();

dotenv.config();

server.use(
    express.urlencoded({
        extended: true,
    })
);

server.use(express.json())
server.use(cors())

server.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

server.use(authRouter, entryRouter);

server.listen(process.env.PORT, () => console.log(`server is listening on port ${process.env.PORT}`))