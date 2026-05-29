import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();


import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.clear()
    console.log(colors.green(`Server running on port`), colors.yellow(PORT));
});