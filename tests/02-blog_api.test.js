const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

describe('user related requests', async () => {

  beforeEach(async () => {
    await helper.createNewTestUser()
  })

  test('Adding user succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    //console.log('Käyttäjät lisäyksen jälkeen: ', usersAtEnd)
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('Adding user fails with errorcode 400 and error message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    //console.log('Tietokanta alussa', usersAtStart)

    const newUser = {
      username: 'testuser',
      name: 'DuplicateUser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('Adding user fails with status code 400 if username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ak',
      name: 'Antti Kortelainen',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const response = await api.get('/api/users')

    assert.strictEqual(response.body.length, usersAtStart.length)
  })

  test('Adding user fails with status code 400 if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'akortela',
      name: 'Antti Kortelainen',
      password: 'sa'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const response = await api.get('/api/users')

    assert.strictEqual(response.body.length, usersAtStart.length)
  })
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('viewing all of the blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned notes', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)
    assert(titles.includes('Type wars'))
  })
})

describe('id is formatted correctly', () => {
  test('every object has Id field named id', async () => {
    const response = await api.get('/api/blogs')

    const allHaveId = response.body.every(blog => blog.id)
    assert.strictEqual(allHaveId, true, 'All blogs should have an id field')
  })

  test('none of the objects has Id field named _id', async () => {
    const response = await api.get('/api/blogs')

    const noUnderscoreIds = response.body.every(blog => !blog._id)
    assert.strictEqual(noUnderscoreIds, true, 'No blog should have an _id field')
  })
})

describe('adding of a new blog', async () => {

  beforeEach(async () => {
    await User.deleteMany({})
    await helper.createNewTestUser()
  })

  //const usersAtStart = await helper.usersInDb() //for debugging
  //console.log('Users at start: ', usersAtStart) //for debugging

  test('Adding the blog succeeds with valid data', async () => {
    const token = await helper.loginResponse()

    const newBlog = {
      title: 'This blog is added to test adding new blog',
      author: 'Antti Kortelainen',
      url: 'http://www.just-testing-for-sake-of-testing.com',
      likes: 6,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)  // Lisää token Authorization-headeriin
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

    assert(titles.includes('First class tests'))
  })

  test('Likes shound be 0 for new blog', async () => {
    const token = await helper.loginResponse()

    const newBlog = {
      title: 'This blog is added to test adding without likes',
      author: 'Antti Kortelainen',
      url: 'http://www.just-testing-for-sake-of-testing.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    // I'm assuming that new blog is added to the end of the blog list
    const addedBlog = response.body[response.body.length - 1]

    assert.strictEqual(addedBlog.likes, 0)
  })

  test('Adding the blog fails with status code 400 if title is invalid', async () => {
    const token = await helper.loginResponse()

    const newBlog = {
      title: '',
      author: 'Antti Kortelainen',
      url: 'http://www.adding-without-title.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('fails with status code 400 if url is invalid', async () => {
    const token = await helper.loginResponse()

    const newBlog = {
      title: 'Trying to add without url',
      author: 'Antti Kortelainen',
      url: '',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  await User.deleteMany({})

  //const usersAtEnd = await helper.usersInDb() //for debugging
  //console.log('Users after deleting: ', usersAtEnd) //for debugging
})

describe('viewing a specific blog', () => {

  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultNote = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a blog', async () => {

  beforeEach(async () => {
    await helper.createNewTestUser()
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const token = await helper.loginResponse()

    const newBlog = {
      title: 'This blog is added to be deleted',
      author: 'Antti Kortelainen',
      url: 'http://www.just-testing-for-sake-of-testing.com',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[3]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)  // Suorita delete-kutsu ensin
      .set('Authorization', `Bearer ${token}`)  // Lisää token Authorization-headeriin
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const token = await helper.loginResponse()

    const validNonexistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', `Bearer ${token}`)  // Lisää token Authorization-headeriin
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const token = await helper.loginResponse()

    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)  // Lisää token Authorization-headeriin
      .expect(400)
  })
})

describe('updating likes of a blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 10,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const likes = response.body[0].likes

    assert.strictEqual(likes, 10)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(newBlog)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(newBlog)
      .expect(400)
  })

  test('fails with status code 400 if data invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      title: '',
      author: 'Robert C. Martin',
      url: '',
      likes: 10,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')

    const likes = response.body[0].likes

    assert.strictEqual(likes, 7)
  })
})

after(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})
  await mongoose.connection.close()
})