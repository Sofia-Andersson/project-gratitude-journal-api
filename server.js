import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-gratitude-journal-api";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const ThoughtsSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Please write what you are grateful for'],
    minlength: [5, 'You need to write a grateful thought with more than 5 letters.'],
    maxlength: [140, 'Please write a shorter grateful thought, maxiumum length is 140 letters.']
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

const Thought = mongoose.model("Thought", ThoughtsSchema);

/*
const Note = mongoose.model('Note', {
  text: String,
  createdAt: {
    type: Date,
    default: () => new Date()
  }
}) */

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send({
    Message:"Gratitude Journal API!"
   });
});

app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find()
  .sort({createdAt: 'desc'})
  .limit(20)
  .exec();
  res.json(thoughts);
});

app.post('/thoughts', async (req, res) => {
  //The line below will add the actual time-stamp.
  try {
  const thought = new Thought({ 
    message: req.body.message
  }).save();
  res.json(await thought);
} catch (err) {
  res.status (400).json({
    message: 'Could not publish this gratitude thought',
    errors: err.errors,
  });
 }
});

app.post('/thoughts/:id/like', async (req, res) => {
  try {
    await Thought.updateOne({ _id: req.params.id }, { $inc: { hearts: 1 }});
    res.status(201).json({ Success: 'Like has been added!' });
  } catch (err) {
    res
    .status (404)
    .json({ message: 'Could not find this gratitude thought', errors: err.errors });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});