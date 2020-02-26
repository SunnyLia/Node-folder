const express = require("express");
const app = express();
const com = require("./routers");
app.use(express.static('./public'))
app.set("view engine", "ejs");
app.get('/deldir',com.deldir);
app.get('/rename',com.rename);
app.get('/paste',com.paste);
app.get('/clip',com.clip);
app.get('/addFold',com.addFold);
app.post('/upload',com.upload);
app.all('*',com.readdir);

app.listen("8081", () => {
    console.log(`server run in 8081`)
})
