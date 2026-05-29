export const successResponse = ( res, message, data = null, statusCode = 200 ) => {
  return res.status(statusCode).json({
    success: true,
    status: true,
    message,
    data,
  });
};

export const errorResponse = ( res, message, statusCode = 500 ) => {
  return res.status(statusCode).json({
    success: false,
    status: false,
    message,
  });
};