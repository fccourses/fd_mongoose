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
const hostName = '172.17.0.2'

mongoose.connect(
  `mongodb://${hostName}:27017/${dbName}`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
  }
)

const authorSchema = new Schema({
  name: String
})

const bookSchema = new Schema({
  name: String,
  author: { type: Schema.Types.ObjectId, ref: 'authors' }
})

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
const Book = mongoose.model('books', bookSchema)
const Author = mongoose.model('authors', authorSchema)

const app = express()

app.use(express.json())

app.get('/populate', async (req, res, next) => {
  try {
    Book.find()
      .populate('author')
      .exec((err, books) => {
        if (err) {
          throw err
        }
        res.send(books)
      })
  } catch (error) {
    next(error)
  }
})

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

app.delete('/:userId', async (req, res, next) => {
  try {
    const {
      params: { userId }
    } = req

    const deletedUser = await User.findOneAndDelete({ _id: userId })
    if (deletedUser) {
      return res.send(deletedUser)
    }
    res.status(404)
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
