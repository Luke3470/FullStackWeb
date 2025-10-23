const express = require("express");
const Joi = require("joi")
const app = express();
const sqlite3 = require("sqlite3").verbose()


const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE,(err) =>{
   if(err){
       console.error(err.message);
       throw err;
   }else{
       console.log("Connected to the SQlite DB")

       db.run(`CREATE TABLE IF NOT EXISTS items(
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        item_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL
       )`
       , (err) =>{
          if(err){
              console.log(err)
              console.log("items Table Exists")
          } else{
              console.log("items table Create")
          }
       });
       db.run(`CREATE TABLE IF NOT EXISTS user_items(
        item_id INTEGER,
        user_id INTEGER,
        quantity INTEGER,
        PRIMARY KEY (item_id, user_id),
        FOREIGN KEY (item_id)
            REFERENCES items (item_id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
       )`
       , (err) =>{
           if(err){
               console.log(err)
               console.log("user_items Table Exists")
           } else{
               console.log("user_items table Create")
           }
       });
       db.run(`CREATE TABLE IF NOT EXISTS users(
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL
       )`
       , (err) =>{
           if(err){
               console.log(err)
               console.log("users Table Exists")
           } else{
               console.log("users table Create")
           }
       });
   }
});





app.use(express.json())

const port = 8080;

let next_id = 1;

app.get("/",(req,res)=>{
    res.send("I am Alive")
});

app.get("/users",(req,res)=>{
    let users = []
    db.each(
        "SELECT * FROM users",
        [],
        (err, row) =>{
            if(err) return res.status(400).send("Couldn't get users");

            users.push({
                user_id: row.user_id,
                user_name: row.user_name
            })
        },
        (err, num_rows)=>{
            if(err) return res.status(400).send("Couldn't get users")

            return res.status(200).send(users);
        }
    )
});

app.post("/users",(req,res)=>{
    const schema = Joi.object({
        user_id: Joi.number().min(1),
        user_name: Joi.string()
    });
    console.log(req.body)
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const sql = 'INSERT INTO users (user_name) VALUES (?)'
    let user = [
        req.body.user_name
    ];

    db.run(sql,user, function (err){
        if(err) {
            return res.status(500).send(err.details[0].message);
        }

        return res.status(201).send({
            item_id: this.lastID,
            user_name: req.body.user_name
        });
    });
});


app.get("cart/:id",(req, res)=> {

});


app.get("/items",(req, res)=>{
   let items = []
    db.each(
       "SELECT * FROM items",
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
           if(err) return res.status(400).send("Couldn't get items")

           return res.status(200).send(items);
       }
   )
});

app.post("/items", (req,res)=>{
    const schema = Joi.object({
        item_name: Joi.string(),
        item_price: Joi.number().min(0),
        quantity: Joi.number().integer().min(0)
    });
    console.log(req.body);
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const sql = 'INSERT INTO items (item_name, item_price, quantity) VALUES (?,?,?)'
    let item = [
        req.body.item_name, req.body.item_price, req.body.quantity
    ];
    db.run(sql,item, function (err){
        if(err) {
            return res.status(500).send(err.details[0].message);
        }
        return res.status(201).send({
            item_id: this.lastID,
            item_name: req.body.item_name,
            item_price: req.body.item_price,
            quantity: req.body.quantity
        });
    });
});

app.delete("/items/:id",(req,res) =>{
    let id = parseInt(req.params.id);

    const user = users.find(temp=> temp.user_id === id);
    if (!user) return res.status(404).send("No User Found")

    const index = users.indexOf(user);
    users.splice(index,1);

    return res.status(200).send("User Deleted")
});

app.patch("/items/:id",(req, res) =>{
    const schema = Joi.object({
        quantity: Joi.number().integer().min()
    });

    const { error } = schema.validate(req.body);
    if (!error) return res.status(400).send(error.details[0].message);

    let id = parseInt(req.params.id);
    const sql = 'select * From items WHERE items.item_id = ?'


    const item = items.find(temp => temp.user_id === id);
    if (!item) return res.status(404).send("No Items Found")

    const index = users.indexOf(user);



    items.index.name = req.body.quantity;

    return res.status(201).send("Item quantity of "+index+" to " +req.body.quantity)
});

app.get("/items/:id",(req, res) =>{
    let id = parseInt(req.params.id);
    const schema = Joi.object({
        quantity: Joi.number().integer().min()
    });

    const { error } = schema.validate(id);
    if (!error) return res.status(400).send(error.details[0].message);

    const sql = 'select * From items WHERE items.item_id = ?'

    db.run(sql,id, function (err){
        if(err) {
            return res.status(500).send(err.details[0].message);
        }
        return res.status(200).send({
            item_id: this.lastID,
            item_name: req.body.item_name,
            item_price: req.body.item_price,
            quantity: req.body.quantity
        });
    });
});

app.listen(port,()=>{
   console.log("Listening on port: "+ port)
});