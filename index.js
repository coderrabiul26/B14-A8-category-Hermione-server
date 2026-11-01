import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'


const app= express()

app.use(cors())
app.use(express.json())

const PORT= 5000




const client = new MongoClient(process.env.MONGODB_URI);



export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoclient= await connectToMongoDB()
const db= mongoclient.db('b14-a8-category-hermione')
const eventCollection= db.collection('event')


app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})



app.get('/',(req, res)=>{
    res.send({message: 'server is running good'})
})

app.get('/upcomingEvent',async(req, res)=>{
  const result= await eventCollection.find().toArray()
  res.send(result)
})

app.get('/eventDetails/:id',async(req, res)=>{
  const {id}=req.params
  console.log(id);
  const result= await eventCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})


// http://localhost:5000/eventDetails/



app.post('/createEvent', async(req, res)=>{
  const eventData= req.body
  const result= await eventCollection.insertOne(eventData)
  res.send(result)
})