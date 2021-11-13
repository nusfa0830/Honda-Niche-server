const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8yl3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect();
        const database = client.db('bikes_portal')
        const productsCollection = database.collection('products');
        const homeproductsCollection = database.collection('homeProducts');
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");
        const ordersCollection = database.collection("orders");

        // getting all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // Getting only home page products
        app.get('/homeProducts', async (req, res) => {
            const cursor = homeproductsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // adding review 
        app.post("/addReview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        });

        // add review in home page
        app.get('/homeReview', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);

        })


        // single product find
        app.get("/singleProduct/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await productsCollection
                .find({ _id: ObjectId(req.params.id) })
                .toArray();
            res.send(result[0]);

        });

        // adding order
        app.post("/addOrders", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result)

        });

        // getting my orders
        app.get('/myOrder/:email', async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            // res.send(result);
            console.log(result)

        })

        // delete my order
        app.delete('/myOrder/:id', async (req, res) => {

            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) })
            res.send(result);

        })

        // addidg user information in db
        app.post("/addUserInfo", async (req, res) => {
            console.log("req.body");
            const result = await usersCollection.insertOne(req.body);
            res.send(result);

        });

        // MAKE ADMIN 
        app.put("/madeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
                const documents = await usersCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                console.log(documents);
            }

        });
        // checking admin or not admin
        app.get("/checkAdmin/:email", async (req, res) => {
            const result = await usersCollection
                .find({ email: req.params.email })
                .toArray();

            res.send(result);
        });

        // add product
        app.post("/addProduct", async (req, res) => {
            console.log(req.body);
            const result = await productsCollection.insertOne(req.body);
            res.send(result);

        });
        // getting all order
        app.get("/allOrders", async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        });


        // delete  orders
        app.delete('/allOrders/:id', async (req, res) => {

            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) })
            console.log(result);

        })

        // update status
        app.put("/statusUpdate/:id", async (req, res) => {

            console.log(req.params.id);
            const filter = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);

        });
        // deleted from manage orders
        app.delete('/allOrders/:id', async (req, res) => {
            console.log(req.params.id)
            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) })


        })

    } finally {

        // await client.close();
    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('final project')
})
app.listen(port, () => {
    console.log('server running', port)
})