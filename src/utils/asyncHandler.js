const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      const statusCode = error.statusCode && error.statusCode >= 100 && error.statusCode < 600 
        ? error.statusCode 
        : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal Server Error"
      });
    });
  };
};

export { asyncHandler };
