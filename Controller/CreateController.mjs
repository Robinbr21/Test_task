import mysql from "mysql2"

export const index = async (req, res) => {

    // Create a MySQL connection
    const connection = mysql.createConnection({
        host: process.env.Dev_MYSQL_HOST_project,
        user: process.env.Dev_MYSQL_USER_project,
        password: process.env.Dev_MYSQL_PASS_project,
        database: process.env.Dev_MYSQL_DB_Project,
        port: process.env.Dev_MYSQL_PORT_project
    });

    await connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        const createTableSQL = `CREATE TABLE IF NOT EXISTS Person (Id INT PRIMARY KEY,name VARCHAR(255) NOT NULL,address VARCHAR(255),age INT,date_of_birth DATE);`;

        connection.query(createTableSQL, (err, results) => {
            if (err) {
                console.error('Error creating table:', err);
            } else {
                console.log('Table "Person" created successfully');
            }
            // Close the MySQL connection
            connection.end();
        });
    });
    return res.json({ status: true, data: "Api Succes" })
}

export const createtwotable = async (req, res) => {

    // Create a MySQL connection
    const connection = mysql.createConnection({
        host: process.env.Dev_MYSQL_HOST_project,
        user: process.env.Dev_MYSQL_USER_project,
        password: process.env.Dev_MYSQL_PASS_project,
        database: process.env.Dev_MYSQL_DB_Project,
        port: process.env.Dev_MYSQL_PORT_project
    });

    await connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        const createTableEmployee = `CREATE TABLE IF NOT EXISTS employee (id INT PRIMARY KEY, name VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL,phone VARCHAR(15) NOT NULL)`;
        const createTablEemployee_job_status = `CREATE TABLE IF NOT EXISTS employee_job_status  (id INT PRIMARY KEY,empId INT NOT NULL,jobsts VARCHAR(20) NOT NULL,FOREIGN KEY (empId) REFERENCES employee(id))`;

        connection.query(createTableEmployee, (err, results) => {
            if (err) {
                console.error('Error creating table Employee:', err);
            } else {
                console.log('Table "Employee" created successfully');
            }
            // Close the MySQL connection
            connection.end();
        });
        connection.query(createTablEemployee_job_status, (err, results) => {
            if (err) {
                console.error('Error creating table Eemployee_job_status:', err);
            } else {
                console.log('Table "Eemployee_job_status" created successfully');
            }
            // Close the MySQL connection
            connection.end();
        });
    });
    return res.json({ status: true, data: "Api Succes" })
}


export const finalResult = async (req, res) => {

    const connection = mysql.createConnection({
        host: process.env.Dev_MYSQL_HOST_project,
        user: process.env.Dev_MYSQL_USER_project,
        password: process.env.Dev_MYSQL_PASS_project,
        database: process.env.Dev_MYSQL_DB_Project,
        port: process.env.Dev_MYSQL_PORT_project
    });
    const sqlQuery = `SELECT e.id, e.name, e.email, e.phone, ej.jobsts AS job_status FROM employee AS e JOIN ( SELECT ej1.empId, ej1.jobsts FROM employee_job_status AS ej1 WHERE ej1.id = (SELECT MAX(ej2.id) FROM employee_job_status AS ej2 WHERE ej2.empId = ej1.empId)) AS ej ON e.id = ej.empId;`;

    let result = await connection.query(sqlQuery);
    connection.end();

    console.log(`valueee is :${result}`);
    return res.json({ status: true, data: "Api Succes" })

}