const express = require("express");
const Joi = require("joi")
const app = express();
const sqlite3 = require("sqlite3")


const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE,(err) =>{
   if(err){
       console.error(err.message);
       throw err;
   }else{
       console.log("Connected to the SQlite DB")

       db.run(`CREATE TABLE cart(
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        item_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
       )
       `, (err) =>{
          if(err){
              console.log("Cart Table Exists")
          } else{
              console.log("Cart table Create")
          }
       });
   }
});


















app.use(express.json())

const port = 8080;

let items = [];
let next_id = 1;

app.get("/",(req,res)=>{
    res.send("I am Alive")
});

app.get("/cart",(req, res)=>{
   db.each(
       "SELECT * FROM cart",
       [],
       (err, row) =>{
           if(err) return res.status(400).send("Couldn't get items");

           items.push({
               item_id: row.item_id,
               item_name: row.item_name,
               item_price: row.item_price,
               quantity: row.quantity
           })
       },
       (err, num_rows)=>{
           if(err) return res.status(400).send("Couldn't get cart")

           return res.status(200).send(items);
       }
   )
});

app.post("/cart", (req,res)=>{
    const schema = Joi.object({
        item_name: req.body.item_name,
        item_price: Joi.number().min(0),
        quantity: Joi.number().integer().min(0)
    });

    const { error } =schema.valid(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const sql = 'INSERT INTO cart (item_id, item_name, item_price, quantity) VALUES (?,?,?)'
    let item = [
        next_id, req.body.item_name, req.body.item_price, req.body.quantity
    ];

    db.run(sql,item, function (err){
        if(err) return done(err);

        return res.status(201).send({
            item_id: this.lastID,
            item_name: req.body.item_name,
            item_price: req.body.item_price,
            quantity: req.body.quantity
        });
    });


    next_id = next_id + 1;

    return res.status(201).send(item);
});

app.delete("/items/:id",(req,res) =>{
    let id = parseInt(req.params.id);

    const user = users.find(temp=> temp.user_id === id);
    if (!user) return res.status(404).send("No User Found")

    const index = users.indexOf(user);
    users.splice(index,1);

    return res.status(200).send("User Deleted")
});

app.patch("/users/:id",(req, res) =>{
    const schema = Joi.object({
        quantity: Joi.number().integer().min()
    });


    const item = items.find(temp => temp.user_id === id);
    if (!item) return res.status(404).send("No Items Found")

    const index = users.indexOf(user);

    const { error } = schema.valid(req.body);
    if (!error) return res.status(400).send(error.details[0].message);

    items.index.name = req.body.quantity;

    return res.status(200).send("Item quantity of "+index+" to " +req.body.quantity)
});

app.get("/users/:id",(req, res) =>{
    const item = items.find(temp => temp.items_id === id);
    if (!item) return res.status(404).send("No User Found")

    return res.status(200).send(item);
});

app.listen(port,()=>{
   console.log("Listening on port: "+ port)
});