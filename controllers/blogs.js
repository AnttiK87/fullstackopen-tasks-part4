const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blogs = await Blog.findById(request.params.id)
  if (blogs) {
    response.json(blogs)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  try {
    const body = request.body  // Ei tarvitse käyttää await, koska body on jo saatavilla
    const user = request.user  // Sama juttu, user on asetettu middlewaresta

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      user: user._id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error) // Siirretään virhe error handler -middlewarelle
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  // Creating new Person model for validating
  const validBlog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  })

  await validBlog.validate()

  const blog = {
    likes: body.likes,
  }

  // Etsi ensin blogi tietokannasta sen ID:llä
  const existingBlog = await Blog.findById(request.params.id)

  if (!existingBlog) {
    // Jos blogia ei löydy, palautetaan 404-virhekoodi
    return response.status(404).json({ error: 'Blog not found' })
  }

  // Jos blogi löytyy, päivitetään se
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const userId = await request.user.id.toString()

  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  const blogAdderId = blog.user.toString()

  if ( userId ===   blogAdderId ) {
    await Blog.findByIdAndDelete(request.params.id)
    return response.status(204).end()
  } else {
    return  response.status(403).json({ error: 'No permission to delete this blog' })
  }
})

module.exports = blogsRouter