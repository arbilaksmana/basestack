// Standard success response
function success(data) {
  return {
    success: true,
    data
  };
}

// Standard error response
function error(message, code = 'ERROR') {
  return {
    success: false,
    error: {
      message,
      code
    }
  };
}

// Send success response
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json(success(data));
}

// Send error response
function sendError(res, message, code = 'ERROR', statusCode = 400) {
  return res.status(statusCode).json(error(message, code));
}

module.exports = { success, error, sendSuccess, sendError };
