
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const mongoObjId = require('mongodb').ObjectId
require('dotenv').config();
const app = express();

// port declaretion
const port = process.env.PORT || 5000;

// cors set
app.use(cors());
app.use(express.json());

// set uri from getting usr pass by env
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v21cd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// create mongo db client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        // db connect and create db and collection
        await client.connect();
        const database = client.db('tripMaster')
        const servicesCollection = database.collection('services')
        const orderCollection = database.collection('orders')

        // get all service api
        app.get('/services', async(req, res) => {
            const cursor = servicesCollection.find({})
            const services = await cursor.toArray()
            res.send(services)
        })
        
        // get all reservation
        app.get('/all-booked', async(req, res) => {
            const cursor = orderCollection.find({})
            const services = await cursor.toArray()
            res.send(services)
        })

        // get booked room by email
        app.get('/room-booked/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {email: email}
            const cursor = orderCollection.find(query);
            const rooms = await cursor.toArray();
            res.json(rooms)
        })

        // add order api
        app.post('/room-book', async(req, res) =>{
            const order = req.body;
           const result = await orderCollection.insertOne(order)
            res.send(result)
        })
        
        // add service api
        app.post('/add-service', async(req, res) =>{
            const order = req.body;
           const result = await servicesCollection.insertOne(order)
            res.send(result)
        })

        // delete reservation
        app.delete('/room-book/:id', async(req, res)=>{
            const id = req.params.id;
            console.log('hitting delete for id', id)
            const query = {_id: mongoObjId(id)}
            console.log('query', query)
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })

        
        // update api
        app.put('/room-book/:id', async(req, res) =>{
            const id = req.params.id;
            console.log('hitting update for', id)
            const updatedUser = req.body;
            const filter = {_id: mongoObjId(id)}
            const options = {upsert: true}
            const updateDoc = {
                $set:{
                    status: 'Approved'
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating user', id)
            res.json(result)
        })
    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Trip Master server is running')
})

// listen server
app.listen(port, () =>{
    console.log('server runnig')
})