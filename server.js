import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();
import app from './app.js';
import logger from './utils/logger.js';



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.clear()
    // logger.info(`Server running on port ${PORT}`);
    console.log(colors.green(`Server running on port`), colors.yellow(PORT));
});