const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "database.db");
let db = null;
const PORT = process.env.PORT || 3000;

db = new sqlite3.Database("./database.db",sqlite3.OPEN_READWRITE, (err)=>{
        if(err){
            return console.error(err.message)
        }
        else{
            console.log("Connection sucessfull")
        }
    })

const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(PORT, () => {
        console.log(`Server Running at http://localhost:${PORT}/`);
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  
  initializeDBAndServer();


// CREATE TABLE FOR Users
// const sqlCreateUser = `CREATE TABLE Users (
//     UserID INTEGER PRIMARY KEY AUTOINCREMENT,
//     Username TEXT UNIQUE NOT NULL
// );`
// db.run(sqlCreateUser,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New User Table is Created")
//     }
// }) 


// CREATE MESSAGES TABLE
// const sqlCreateMessages = `CREATE TABLE Messages (
//     MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
//     SenderID TEXT,
//     ReceiverID TEXT,
//     Content TEXT,
//     Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (SenderID) REFERENCES Users(UserID),
//     FOREIGN KEY (ReceiverID) REFERENCES Users(UserID)
// );`
// db.run(sqlCreateMessages,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Message Table is Created")
//     }
// }) 


// Drop TABLE - Users
// const sqlDropUser = `DROP TABLE Users;`
// db.run(sqlDropUser,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A User Table is Droped")
//     }
// }) 

// Drop TABLE - Messages
// const sqlDropUser = `DROP TABLE Messages;`
// db.run(sqlDropUser,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A Message Table is Droped")
//     }
// })



// add message

// const sqlCreateMessages = `INSERT INTO Messages (SenderID,ReceiverID,Content)
//    VALUES ("rahul","sara","Hello");`
// db.run(sqlCreateMessages,(err)=>{
//     if(err){
//         return console.error(err.message)
//     }else{
//         console.log("A New Message is Created")
//     }
// }) 


// get all users from table
app.get("/all-Users/", async(request, response) => {
    const getQuery = `
    SELECT * FROM users;`
    const data = await db.all(getQuery) 
    response.send(data);
  });


// Add new user to table
app.post("/new-User/", async (request,response)=>{
    const {Username} = request.body;
    const getUserQuery = `SELECT * FROM users WHERE Username = '${Username}';`;
    const dbUser = await db.get(getUserQuery);
    if(dbUser===undefined){
        const sqlpost = `INSERT INTO Users (Username)
        VALUES ('${Username}');`
        await db.run(sqlpost)
        response.send(JSON.stringify(`${Username}`))
    }else{
        response.send(JSON.stringify(`${Username}`))
    }
  }
    )


        // get messages-all
// app.get("/messages/", async(request, response) => {
//     const getQueryMessages = `
//     SELECT * FROM Messages`;
//     const data = await db.all(getQueryMessages) 
//     response.send(data);
//   });
 
  
    // get messages
app.post("/messages/", async(request, response) => {
  const {senderUser,Username} = request.body;
    const getQueryMessages = `
    SELECT * FROM Messages WHERE (SenderID = '${senderUser}' AND ReceiverID = '${Username}') OR (SenderID = '${Username}' AND ReceiverID = '${senderUser}');`
    const data = await db.all(getQueryMessages)
    response.send(data);
  });

app.post("/new-message/",async(request,response)=>{
  const {senderUser,Username,InputValue} = request.body;
  const postMessage = `
  INSERT INTO Messages (SenderID,ReceiverID,Content)
      VALUES ('${Username}','${senderUser}','${InputValue}');
  `
  db.run(postMessage,(err)=>{
        if(err){
            return console.error(err.message)
        }else{
            console.log("A New Message is Created")
        }
    }) 
})


// Delete a message
app.post("/delete-message/", async(request, response) => {
  const {MessageID} = request.body;
    const deleteMessage = `
    DELETE FROM Messages WHERE MessageID = ${MessageID};`
    await db.run(deleteMessage)
    response.send(JSON.stringify("Message deleted"));
  });