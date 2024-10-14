
// for testing that testing enviroment works
const dummy = (blogs) => {
  blogs = 1
  return blogs
}

// for calculatin total likes
const totalLikes = (blogs) => {
  const totalLikes = blogs.reduce((adder, blog) => adder + blog.likes, 0)
  return totalLikes
}

// For finding blog with most likes
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null // Jos lista on tyhjä, palautetaan null
  }

  const mostLikes = blogs.reduce((prev, current) =>
    (prev.likes > current.likes ? prev : current)
  )

  return mostLikes
}

// For findin writer with most blogs and calculates blogs amount
const writerWithMostBlogs = (blogs) => {
  // blogs/writer
  const authorCount = blogs.reduce((accumulator, blog) => {
    accumulator[blog.author] = (accumulator[blog.author] || 0) + 1
    return accumulator
  }, {})

  // Writer with most blogs
  const authorWithMostBlogs = Object.keys(authorCount).reduce((max, author) => {
    if (authorCount[author] > max.blogs) {
      return { author: author, blogs: authorCount[author] }
    } else {
      return max
    }
  }, { author: '', blogs: 0 })

  return authorWithMostBlogs
}

// For findin writer with most likes and calculates likes amount
const writerWithMostlikes = (blogs) => {
  // Likes/writer
  const likesCount = blogs.reduce((accumulator, blog) => {
    accumulator[blog.author] = (accumulator[blog.author] || 0) + blog.likes
    return accumulator
  }, {})

  // writer with most likes
  const authorWithMostLikes = Object.keys(likesCount).reduce((max, author) => {
    if (likesCount[author] > max.likes) {
      return { author: author, likes: likesCount[author] }
    } else {
      return max
    }
  }, { author: '', likes: 0 })

  return authorWithMostLikes
}

module.exports = {
  dummy, totalLikes, mostLikes, writerWithMostBlogs, writerWithMostlikes
}
