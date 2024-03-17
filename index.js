import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client(
    {
      user: process.env.PGUSER,   //use PGUSER as name only else will not work
      host: process.env.HOST,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      port: process.env.DBPORT,
    }
);

db.connect();

let todo = [];

const heading = 'PermaList Project';

app.use("/", express.static("public"))

app.use(bodyParser.urlencoded({ extended: true }))

//today list routing
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM permalist ORDER BY id ASC");
    todo = result.rows;
    res.render("index.ejs", {
      todos: todo, 
      head: heading
    });
  } catch (error) {
    console.log(error);
  }
});

//add list items
app.post("/add", async (req, res)=>{
  const itemTitle = req.body.text;
  try {
    await db.query("INSERT INTO permalist (items) VALUES ($1)", [itemTitle]);
  } catch (error) {
    console.log(error);
  }
  //redirect back to main page (refresh page)
  res.redirect("/")
});

//edit list items
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE permalist SET items = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

//delete list items
app.post("/delete", async (req, res)=>{
  const itemid = req.body.Id;
  try {
    await db.query("DELETE FROM permalist WHERE id = $1", [itemid]);     
  } catch (error) {
    console.log(error);
  }
  //redirect back to main page (refresh page)
  res.redirect("/")
});

app.listen(port , () =>{
  console.log(`Listening on port ${port}`)
})
