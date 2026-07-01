export const errorHandler = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = "Something went wrong. Please try again later.";

    // Validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // PostgreSQL duplicate key
    if (err.code === "23505") {
        statusCode = 409;
        message = "Resource already exists.";
    }

    // JWT
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token.";
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};