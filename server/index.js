import express from "express";
import { sql } from "./db.js";
import multer from "multer";
import cors from "cors";
import { roleMiddleware } from "./middlewares/roleMiddleware.js";
import { reg } from "./controllers/reg.js";
import { auth } from "./controllers/auth.js";
import { uploadFiles } from "./controllers/uploadFiles.js";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1])
    }
})


const upload = multer({ storage });
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/admin', roleMiddleware(["2"]), async (req, res) => {
    const data = await sql`select * from Requests where statusId = 1`
    res.send(data)
})
app.get('/requests/:id', async (req, res) => {
    const id = req.params.id
    const data = await sql`select * from Requests where userId = ${id}`
    res.send(data)
})
app.get('/nextrequests', async (req, res) => {
    const { userId, count } = req.body
    const data = await sql`select * from Requests where userId = ${userId} limit 10 offset ${count}`
    res.send(data)
})
app.get('/profile/:id', async (req, res) => {
    const id = req.params.id
    const data = await sql`select * from Users where id = ${id}`
    res.send(data)
})

app.post('/reg', reg)
app.post('/auth', auth)
app.post("/newrequest", upload.single("files"), uploadFiles);

app.put('/updateprofile/:id', async (req, res) => {
    const id = req.params.id
    const { nick, phone } = req.body
    const update = await sql`update Users set nick = ${nick}, phone = ${phone} where id = ${id} RETURNING *`
    res.send(update)
})
app.patch('/adminrequests', roleMiddleware(["2"]), async (req, res) => {
    const { id, status } = req.body
    const update = await sql`update Requests set statusId = ${status} where id = ${id} RETURNING *`
    res.send(update)
})

const start = async () => {
    await sql`create table if not exists Roles(
        id SERIAL PRIMARY KEY NOT NULL,
        role varchar(255) NOT NULL
    )`
    await sql`create table if not exists Statuses(
        id SERIAL PRIMARY KEY NOT NULL,
        status varchar(255) NOT NULL
    )`
    await sql`create table if not exists Users(
        id SERIAL PRIMARY KEY NOT NULL,
        nick varchar(255) NOT NULL,
        phone varchar(12) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        roleId INT NOT NULL,
        FOREIGN KEY (roleId) REFERENCES Roles(id)
    )`
    await sql`create table if not exists Requests(
        id SERIAL PRIMARY KEY NOT NULL,
        numberCar varchar(255) NOT NULL,
        location varchar(255) NOT NULL,
        date date NOT NULL,
        file varchar(255) NOT NULL,
        userId INT NOT NULL,
        statusId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (statusId) REFERENCES Statuses(id)
    )`

    // await sql`insert into Roles (role) values ('USER'), ('ADMIN')`
    // await sql`insert into Statuses (status) values ('в обработке'), ('принято'), ('отклонено')`

    app.listen(5000, () => {
        console.log('Сервер был запущен на порту 5000');
    })
}

start() 