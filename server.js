const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const yup = require('yup')

const emailValidationSchema = yup
  .string()
  .email()
  .required()

const { Schema } = mongoose
const dbName = process.env.MONGO_DB || 'fdMongoose'

mongoose.connect(
  `mongodb://localhost:27017/${dbName}`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      throw err
      process.exit(1)
    }
  }
)

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[а-яА-ЯA-Za-z]{2,32}$/.test(v)
    }
  },
  lastName: {
    type: String,
    required: true,
    validate: {
      validator: v => /^[а-яА-ЯA-Za-z]{2,32}$/.test(v)
    }
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: v => emailValidationSchema.isValid(v)
    }
  },
  isMale: {
    type: Boolean,
    required: true
  },
  birthday: { type: Date },
  rating: { type: Number }
})

const User = mongoose.model('users', userSchema)

const app = express()

app.use(express.json())

app.post('/', async (req, res, next) => {
  try {
    const { body } = req
    const newUser = await User.create(body)
    res.send(newUser)
  } catch (err) {
    next(err)
  }
})

app.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
    res.send(users)
  } catch (err) {
    next(err)
  }
})

app.patch('/:userId', async (req, res, next) => {
  try {

    const {
      body,
      params: { userId }
    } = req

    const updatedUser = await User.findOneAndUpdate({ _id: userId }, body, {
      new: true
    })

    res.send(updatedUser)
  } catch (error) {
    next(error)
  }
})

const server = http.createServer(app)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log('Started')
})

/*  
  books m : 1 authors   

  validation,
  insert data, 
  1) books with author
  2) author book count
*/
