import express from "express"
import mysql from 'mysql'
import cors from 'cors'
import cookieParser from "cookie-parser"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from "multer"
import path from 'path'

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
})

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        cb(null, 'public/images')
    },
    filename:(req, file, cb) => {
        cb(null, file.fieldname +"_" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: storage
})
con.connect(function(err){
    if(err){
        console.log("Error in Connection");
    }
    else{
        console.log("Connected");
    }
})

app.get('/getEmployee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get employee error in sql"});
        return res.json({status: "Success", Result: result})
    })
})
app.post('/login',(req,res) => {
    const sql = "SELECT * FROM users Where email = ? AND password =?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if(err) return res.json({Status: "Error", Error: "Error in running query"});
        if(result.length > 0){
            return res.json({Status: "Success"});
        }
        else{
            return res.json({Status: "Error", Error: "Wrong email or password"});
        }
    })
})

app.post('/create', upload.single('image'), (req,res) => {
    const sql = "INSERT INTO employee (`name`,`email`,`password`,`salary`,`address`,`image`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if(err) return res.json({Error: "Error in hashing password"});
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.salary,
            req.body.address,
            req.file.filename,
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Error: "Inside singup query"});
            return res.json({Status: "Success"});
        })
    })
})


// me pahala console.log eken terminal eke pennanwa api upload karana image eke wisthara
// app.post('/create', upload.single('image'), (req,res) => {
//     console.log(req.file);
// })

app.listen(8081, ()=>{
    console.log("Running");
});