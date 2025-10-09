const express = require("express");
const app = express();
app.use(express.json())

const port = 8080;

let users = [];
let next_id = 1;

app.get("/",(req,res)=>{
    res.send("Hello World")
});

app.post("/users", (req,res)=>{
    let user = {
        user_id: next_id,
        user_name: req.body.name
    };

    users.push(user);
    next_id = next_id + 1;

    return res.status(201).send(user);
});


app.listen(port,()=>{
   console.log("Listening on port: "+ port)
});