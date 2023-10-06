import fs from 'fs'
import xlsx from 'xlsx'
import mysql from "mysql2"
import moment from 'moment';
import redis from 'redis';

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

export const index = async (req, res) => {

    const fileBuffer = fs.readFileSync('./data.xlsx');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const userData = xlsx.utils.sheet_to_json(worksheet);

    let count = 1
    let feild = []

    const values = userData.filter(user => {
        // Check conditions
        const isValidAge = typeof user.age === 'number';
        const isValidDateOfBirth = moment(user['date of birth'], 'MM-DD-YYYY').isValid();
        const isValidAddress = typeof user.address === 'string' && user.address.length >= 25;

        if (!(isValidAge && isValidDateOfBirth && isValidAddress)) {
            feild.push(count)
        }
        count++
        return isValidAge && isValidDateOfBirth && isValidAddress;
    }).map(user => [
        user.Id,
        `"${user.name}"`,
        `"${user.address}"`,
        user.age,
        `"${moment(user['date of birth'], 'MM-DD-YYYY').format('YYYY-MM-DD')}"`,
    ]);

    if (values.length != 0) {
        const connection = mysql.createConnection({
            host: process.env.Dev_MYSQL_HOST_project,
            user: process.env.Dev_MYSQL_USER_project,
            password: process.env.Dev_MYSQL_PASS_project,
            database: process.env.Dev_MYSQL_DB_Project,
            port: process.env.Dev_MYSQL_PORT_project
        });
        const placeholders = values.map((el) => `(${el.join(",")})`)
        const sql = `INSERT INTO Person (Id,name, address, age, date_of_birth) VALUES ${placeholders}`;
        await connection.execute(sql, values);
    }

    console.log('Data uploaded to the database.', values);

    return res.json({ status: true, data: `Data Upload.  validation fail in "(${feild})" lines` })
}




export const redis = async (req, res) => {
    const fileBuffer = fs.readFileSync('./data.xlsx');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const userData = xlsx.utils.sheet_to_json(worksheet);

    const invalidLines = [];

    // Use Redis to cache the valid data
    const validData = userData.filter((user, index) => {
        const isValidAge = typeof user.age === 'number';
        const isValidDateOfBirth = moment(user['date of birth'], 'MM-DD-YYYY').isValid();
        const isValidAddress = typeof user.address === 'string' && user.address.length >= 25;

        if (!(isValidAge && isValidDateOfBirth && isValidAddress)) {
            invalidLines.push(index + 1);
        }

        return isValidAge && isValidDateOfBirth && isValidAddress;
    });

    if (validData.length > 0) {
        //setting data
        client.set('validData', JSON.stringify(validData), (err) => {
            if (err) {
                console.error('Error storing valid data in Redis:', err);
            }
        });

        //getting data
        client.get('validData', (err, data) => {
            if (err) {
                console.error('Error retrieving valid data from Redis:', err);
                return res.status(500).json({ status: false, message: 'Error retrieving data from Redis' });
            }

            if (!data) {
                return res.json({ status: true, message: 'No valid data found in Redis' });
            }

            const validData = JSON.parse(data);
            console.log('Retrieved valid data from Redis:', validData);

            return res.json({ status: true, data: validData });
        });
    }



    console.log('Valid data cached in Redis.', validData);

    return res.json({
        status: true,
        data: `Data added to redis. Validation failed in lines ${invalidLines.join(', ')}`,
    });
}


