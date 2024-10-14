const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('viewing a all blogs', () => {
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

describe('is id formatted correctly', () => {
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

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 6,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

    assert(titles.includes('First class tests'))
  })

  test('fails with status code 400 if data invalid', async () => {
    const newBlog = {
      title: '',
      author: 'Robert C. Martin',
      url: '',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('Likes shound be 0 for new blog', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    // Oletetaan, että uusi blogi on lisätty listan viimeiseksi
    const addedBlog = response.body[response.body.length - 1]

    assert.strictEqual(addedBlog.likes, 0)
  })
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

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .expect(204)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .delete(`/api/blogs/${invalidId}`)
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
  await mongoose.connection.close()
})