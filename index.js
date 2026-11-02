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
const joinedEventCollection= db.collection('joinedEvent')


app.listen(PORT, ()=>{
    console.log(`server is running at port ${PORT}`);
})



app.get('/',(req, res)=>{
    res.send({message: 'server is running good'})
})

app.get('/upcomingEvent',async(req, res)=>{
  const result= await eventCollection.find().sort({date: 1}).toArray()
  res.send(result)
})

app.get('/recentUpcomingEvent',async(req, res)=>{
  const result= await eventCollection.find().sort({date: 1}).limit(6).toArray()
  res.send(result)
})


app.get('/eventDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(404).send({ message: 'Event not found' });
    }
    const result = await eventCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).send({ message: 'Event not found' });
    }
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Failed to fetch event details' });
  }
})


app.get('/createdEvent/:email',async(req, res)=>{
  const {email}=req.params
  const result= await eventCollection.find({userEmail:email}).sort({date: 1}).toArray()
  res.send(result)
})

app.get('/joinedEvent/:email',async(req, res)=>{
  const {email}=req.params
  const result= await joinedEventCollection.find({userEmail:email}).sort({date: 1}).toArray()
  res.send(result)
})


// http://localhost:5000/recentUpcomingEvent/



app.post('/createEvent', async(req, res)=>{
  const eventData= req.body
  const result= await eventCollection.insertOne(eventData)
  res.send(result)
})


app.post('/joinedEvent', async (req, res) => {
  try {
    const eventData = { ...req.body };
    const eventId = eventData.eventId ?? eventData._id;
    const userEmail = eventData.userEmail;

    // A joined record must not keep the original event's _id, otherwise
    // inserting a second join of the same event fails with E11000 (500).
    delete eventData._id;
    if (eventId) {
      eventData.eventId = eventId;
    }
    eventData.joinedDate = eventData.joinedDate ?? new Date();

    if (userEmail && eventId) {
      const alreadyJoined = await joinedEventCollection.findOne({ userEmail, eventId });
      if (alreadyJoined) {
        return res.status(409).send({ message: 'Already joined this event' });
      }
    }

    const result = await joinedEventCollection.insertOne(eventData);
    res.send(result)
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Failed to join event' });
  }
})

app.patch('/editEvent/:id', async(req, res)=>{
    const {id}=req.params
    const updatedData= req.body
    const result= await eventCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set:updatedData}
    )
    console.log(result);
    res.send(result)

})

app.delete('/deleteEvent/:id', async(req, res)=>{
    const {id}= req.params
    const result= await eventCollection.deleteOne({_id: new ObjectId(id)})
    console.log(result);
    res.send(result)
})