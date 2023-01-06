const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nk3n7xe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollections = client.db("harkrx").collection("users");

    // post a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const userEmail = user.email;

      const query = { email: userEmail };
      const existsUser = await usersCollections.findOne(query);
      if (existsUser) {
        return res.send({ message: "User already exists!!" });
      }

      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // get all user
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollections.find(query).toArray();
      res.send(users);
    });

    // get logged in user
    app.get("/single-user", async (req, res) => {
      const email = req.query.email;

      const query = { email };
      const user = await usersCollections.findOne(query);
      res.send(user);
    });

    // get single user
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollections.findOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
