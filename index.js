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
    // userCollection
    const usersCollections = client.db("harkrx").collection("users");
    // post collection
    const postCollections = client.db("harkrx").collection("posts");

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
      console.log(about);
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

    // create post
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollections.insertOne(post);
      res.send(result);
    });

    // get all posts
    app.get("/posts", async (req, res) => {
      const query = {};
      const result = await await postCollections
        .find(query)
        .sort({ date: -1 })
        .toArray();
      res.send(result);
    });

    // like post
    app.put("/like/:id", async (req, res) => {
      const id = req.params.id;
      const authorId = req.body.authorId;
      const query = { _id: ObjectId(id) };
      const post = await postCollections.findOne(query);
      const options = { upsert: true };
      const likes = post.likes;
      const existsLike = likes?.find((like) => like === authorId);
      if (existsLike) {
        return res.send({ message: "You already like this post" });
      }
      const updatedDoc = {
        $set: {
          likes: [...likes, authorId],
        },
      };
      const result = await postCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // comment post
    app.put("/comment/:id", async (req, res) => {
      const id = req.params.id;
      const comment = req.body;
      const query = { _id: ObjectId(id) };
      const post = await postCollections.findOne(query);
      const comments = post.comments;
      const options = { upsert: true };
      if (comments) {
        const updatedDoc = {
          $set: {
            comments: [...comments, comment],
          },
        };
        const result = await postCollections.updateOne(
          query,
          updatedDoc,
          options
        );
        return res.send(result);
      }
      const updatedDoc = {
        $set: {
          comments: [comment],
        },
      };
      const result = await postCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // reort post
    app.put("/report/:id", async (req, res) => {
      const id = req.params.id;
      const reportUserId = req.body.reportUserId;
      const query = { _id: ObjectId(id) };
      const post = await postCollections.findOne(query);
      const options = { upsert: true };
      const reports = post.reports;
      const existsReport = reports?.find((report) => report === reportUserId);
      if (existsReport) {
        return res.send({ message: "You already report this post" });
      }
      const updatedDoc = {
        $set: {
          reports: [reportUserId],
        },
      };
      const result = await postCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // verify request user
    app.put("/verify-request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verificationStatus: "pending",
        },
      };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // verify user
    app.put("/verify-user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verificationStatus: "verified",
        },
      };
      const result = await usersCollections.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // delete post
    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollections.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
