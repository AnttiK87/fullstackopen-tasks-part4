// Loggers for showing info and errors messages at the console

// Logger for info messages
const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params)
  }
}

// Logger for error messages
const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(...params)
  }
}

// Exports
module.exports = {
  info, error
}