const express = require("express");
const app = express();
app.use(express.json())

const port = 8080;

let users = [];
let next_id = 1;

app.get("/",(req,res)=>{
    res.send("I am Alive")
});

app.get("/users",(req, res)=>{
   return res.status(200).send(users);
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

app.delete("/users/:id",(req,res) =>{
    let id = parseInt(req.params.id);

    const user = users.find(temp=> temp.user_id === id);
    if (!user) return res.status(404).send("No User Found")

    const index = users.indexOf(user);
    users.splice(index,1);

    return res.status(200).send("User Deleted")
});

app.patch("/users/:id",(req, res) =>{
    const user = users.find(temp => temp.user_id === id);
    if (!user) return res.status(404).send("No User Found")

    const index = users.indexOf(user);
    users.index.name = req.body.name;

    return res.status(200).send("User name of "+index+" to "+req.body.name)
});

app.get("/users/id",(req, res) =>{
    const user = users.find(temp => temp.user_id === id);
    if (!user) return res.status(404).send("No User Found")

    return res.status(200).send(user);
});

app.listen(port,()=>{
   console.log("Listening on port: "+ port)
});