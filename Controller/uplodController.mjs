import fs from 'fs'
import xlsx from 'xlsx'
import mysql from "mysql2"
import moment from 'moment';
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

        if(!(isValidAge && isValidDateOfBirth && isValidAddress)){
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

    if(values.length != 0){
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