export const errorHandler = (err, req, res, next) => {
  console.error('[API Error Handler]', err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;
