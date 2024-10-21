// Helper file for managing tests

// Dependancies
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

// Blogs to add to the db for testing purposest
const initialBlogs = [
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 7,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 9,
  }
]

// For creating non existing id
const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', url: 'willremovethissoon', })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

// For getting blogs in the db
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

// For getting users in the db
const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

// For assuring that db is at correct state before tests
const createNewTestUser = async () => {
  await User.deleteMany({})
  //console.log('Data deleted from the db')

  const passwordHash = await bcrypt.hash('testpassword', 10)
  const user = new User({ username: 'testuser', passwordHash })

  await user.save()
  //console.log('Created a new user')
}

// For logginin the test user and getting the login token
const loginResponse = async () => {
  const response = await api
    .post('/api/login')
    .send({
      // Use correcrt username and password for test user
      username: 'testuser',
      password: 'testpassword',
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  return response.body.token
}

// Exports
module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb, createNewTestUser, loginResponse
}