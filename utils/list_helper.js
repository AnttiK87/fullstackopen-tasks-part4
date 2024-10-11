

const dummy = (blogs) => {
  blogs = 1
  return blogs
}

const totalLikes = (blogs) => {
  const totalLikes = blogs.reduce((adder, blog) => adder + blog.likes, 0)
  return totalLikes
}

module.exports = {
  dummy, totalLikes
}
