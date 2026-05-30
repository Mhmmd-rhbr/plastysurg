/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let message = 'خطای سرور رخ داده است. لطفاً دوباره تلاش کنید.';
  let statusCode = 500;

  if (err.name === 'ValidationError') {
    message = 'اطلاعات وارد شده نامعتبر است.';
    statusCode = 400;
  } else if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    message = 'این اطلاعات از قبل در سیستم وجود دارد.';
    statusCode = 409;
  }

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
