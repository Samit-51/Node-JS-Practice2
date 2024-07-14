const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const app = express();
const wss = new WebSocket.Server({ port: 3060 });
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'samit',
    password: '12321samit', 
    database: 'users'
});

conn.connect(err =>{
    if(err){
        console.log('Error connecting to the database:',err);
        process.exit(1);
    }
    console.log('Connected to database.')
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', ws=>{
    ws.on('message', async msg=>{
        const data = JSON.parse(msg);
        const {id, amt} = data;
        conn.query('SELECT amt FROM userinfo WHERE user_id = ?', [id], (err,result)=>{
            if(err){
                console.log('Error querring database:/n', err);
                res.status(500).send('Internal server error. Try again later.');
            }
            let Oldamt=result[0].amt;
            let newAmount = amt+ Oldamt;
            conn.query('UPDATE userinfo SET amt = ? WHERE user_id = ?',[newAmount, id],(err)=>{
                if(err){
                    console.log('Error updating database.');
                    res.status(500).send('Internal server error. Try again later.');
                    return;
                }
                console.log(`Amount updated for user with userId ${id}`);
                ws.send(JSON.stringify({newAmount}));
            });
        });
    });
});
app.get('/user/:id', (req, res) => {
    let id = req.params.id;
    try{
        conn.query('SELECT * FROM userInfo WHERE user_id = ?',[id], async(err, result)=>{
            if (result.length === 0) {
                return res.send('User does not exist.');
            }
            try{
                const user = result[0];
                let html = await fs.readFile(path.join(__dirname, 'public/index.html'), 'utf8');
                html = html.replace(/{username}/g, user.username);
                html = html.replace('{userid}', user.user_id);
                html = html.replace('{amt}', user.amt);
                res.send(html);
            }
            catch(err){
                console.log(err);
                res.status(500).send('Internal server error.');
            }
        });
    }catch(err){
        console.log('Error querring database.')
        res.status(500).send('Server error');
    }
});

process.on('SIGINT', () => {
    conn.end(err =>{
        if(err){
            console.log('Error ending connection');
            process.exit(1);
        }
        console.log('Connection ended successfully.')
        process.exit();
    })
});

app.listen(3000, () => {
    console.log('Website available at http://localhost:3000/user/@00231');
});
