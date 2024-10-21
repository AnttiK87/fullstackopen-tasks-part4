// API routes for user related reguests

// Dependencies
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// Get all users
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, likes: 1 })
  response.json(users)
})

// Add user
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  if (password.length < 3) {
    return response.status(400).json({
      error: 'Password is too short!'
    })
  }

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

// Exports
module.exports = usersRouter