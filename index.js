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
      const loggedUser = req.query.email;
      // console.log(loggedUser);
      const query = {};
      const users = await usersCollections.find(query).toArray();
      const unfollowedUser = users.filter((user) => user.email !== loggedUser);
      // console.log(unfollowedUser);

      res.send(unfollowedUser);
    });

    // get users without loggedIn user
    // app.get('/users', async (req, res) => {
    //   const loggedUser = req.query;
    //   // console.log(loggedUser);
    //   const userList = usersCollections.find(users => users.email != loggedUser.email);
    //   console.log(userList);
    // })

    // get logged in user
    app.get("/single-user", async (req, res) => {
      const email = req.query.email;
      // console.log(email);

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

    // update about
    app.put("/about/:id", async (req, res) => {
      const about = req.body.about;

      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          about: about,
        },
      };
      const options = { upsert: true };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // update information
    app.put("/information/:id", async (req, res) => {
      const id = req.params.id;
      const name = req.body.name;
      const headline = req.body.headline;
      const address = req.body.address;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          name,
          headline,
          address,
        },
      };
      const options = { upsert: true };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //update profile pic
    app.put("/picture/:id", async (req, res) => {
      const img = req.body.img;
      const id = req.params.id;
      console.log(id);

      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          img: img,
        },
      };
      const options = { upsert: true };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // update cover pic
    app.put("/cover/:id", async (req, res) => {
      const img = req.body.img;
      const id = req.params.id;
      console.log(id);

      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          cover: img,
        },
      };
      const options = { upsert: true };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // add following user
    app.put("/follow-user/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const query = { _id: ObjectId(id) };
      const getUser = await usersCollections.findOne(query);
      let followedUser = getUser.followedUser;

      const existsUser = followedUser?.find((usr) => usr.email === user.email);
      if (existsUser) {
        return res.send({ message: "user already added!!" });
      }
      const options = { upsert: true };
      if (!followedUser) {
        const updatedDoc = {
          $set: {
            followedUser: [user],
          },
        };
        const result = await usersCollections.updateOne(
          query,
          updatedDoc,
          options
        );
        return res.send(result);
      }
      const updatedDoc = {
        $set: {
          followedUser: [...followedUser, user],
        },
      };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
