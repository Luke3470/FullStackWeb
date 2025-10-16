const express = require("express");
const app = express();
app.use(express.json())

const port = 8080;

let items = [];
let next_id = 1;

app.get("/",(req,res)=>{
    res.send("I am Alive")
});

app.get("/cart",(req, res)=>{
   return res.status(200).send(items);
});

app.post("/cart", (req,res)=>{
    let item = {
        item_id: next_id,
        item_name: req.body.item_name,
        item_price: req.body.item_price,
        quantity: req.body.quantity
    };

    items.push(item);
    next_id = next_id + 1;

    return res.status(201).send(item);
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
    const item = items.find(temp => temp.user_id === id);
    if (!item) return res.status(404).send("No User Found")

    const index = users.indexOf(user);

    users.index.name = req.body.quantity;

    return res.status(200).send("User name of "+index+" to " +req.body.quantity)
});

app.get("/users/:id",(req, res) =>{
    const item = items.find(temp => temp.items_id === id);
    if (!item) return res.status(404).send("No User Found")

    return res.status(200).send(item);
});

app.listen(port,()=>{
   console.log("Listening on port: "+ port)
});