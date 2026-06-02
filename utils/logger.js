// import winston from 'winston';

// const logger =
//   winston.createLogger({
//     level: 'info',

//     transports: [
//       new winston.transports.File({
//         filename: 'logs/error.log',
//         level: 'error'
//       }),

//       new winston.transports.File({
//         filename: 'logs/app.log'
//       })
//     ]
//   });

// export default logger;



import winston from 'winston';

// Destructure directly from the winston instance since we are using ES Modules
const { combine, timestamp, label, printf } = winston.format;


// Your custom format function
const myFormat = printf(({ level, message, label, timestamp }) => {
    // If the message is an object, stringify it so it's readable
    const formattedMessage = typeof message === 'object' 
        ? JSON.stringify(message, null, 2) 
        : message;

    return `${timestamp} [${label}] ${level}: ${formattedMessage}`;
});


const logger = winston.createLogger({
    level: 'info',
    format: combine(
        label({ label: 'right meow!' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Added clean timestamp formatting
        myFormat
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/app.log'
        })
    ]
});

export default logger;