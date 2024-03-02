import express, { Express } from 'express';
import 'dotenv/config';
import cors from "cors";
import { AppDataSource } from "./src/data-source"
import MainRoutes from "./src/Routes/index";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { initSocket } from './src/socket/socket';
import { connectUser, sendMessageToUser } from './src/socket/socketEvent';

const app: Express = express();
const port = process.env.PORT || 4000;

// express config
app.use(cors());
app.use(bodyParser.json())
app.use(morgan('tiny'))

// database connection 
AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized! 🎈")
}).catch((err) => {
    console.error("Error during Data Source initialization 🏃‍♂️:", err)
})

// config mainRoute
app.use('/api/v1', MainRoutes);

app.get('/send/:userId', (req, res) => {
    const userId = req.params.userId;
    // sendMessageToUser(userId, 'Hello from server');
    res.send('Message sent to user');
});


const server = app.listen(port, () => {
    console.log(`Server is running at Port :: ${port} `);
    initSocket(server)
});
