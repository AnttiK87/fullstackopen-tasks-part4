

const dummy = (blogs) => {
  blogs = 1
  return blogs
}

const totalLikes = (blogs) => {
  const totalLikes = blogs.reduce((adder, blog) => adder + blog.likes, 0)
  return totalLikes
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null // Jos lista on tyhjä, palautetaan null
  }

  const mostLikes = blogs.reduce((prev, current) =>
    (prev.likes > current.likes ? prev : current)
  )

  return mostLikes
}

const writerWithMostBlogs = (blogs) => {
  // Lasketaan blogien määrä per kirjoittaja
  const authorCount = blogs.reduce((accumulator, blog) => {
    accumulator[blog.author] = (accumulator[blog.author] || 0) + 1
    return accumulator
  }, {})

  // Etsitään kirjoittaja, jolla on eniten blogeja
  const authorWithMostBlogs = Object.keys(authorCount).reduce((max, author) => {
    if (authorCount[author] > max.blogs) {
      return { author: author, blogs: authorCount[author] }
    } else {
      return max
    }
  }, { author: '', blogs: 0 })

  return authorWithMostBlogs
}

const writerWithMostlikes = (blogs) => {
  // Lasketaan tykkäysten määrä per kirjoittaja
  const likesCount = blogs.reduce((accumulator, blog) => {
    accumulator[blog.author] = (accumulator[blog.author] || 0) + blog.likes
    return accumulator
  }, {})

  // Etsitään kirjoittaja, jolla on eniten tykkäyksiä
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
