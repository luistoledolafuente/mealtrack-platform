function sendSuccess(res, data = null, message = 'Operación realizada correctamente', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendCreated(res, data = null, message = 'Recurso creado correctamente') {
  return sendSuccess(res, data, message, 201);
}

module.exports = { sendSuccess, sendCreated };
