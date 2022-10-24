const express = require('express');

const app = express();

app.get('/', (req,res)=> {
	return res.send('First nodejs server!')
	});

app.listen(3000, ()=> console.log(`app running!`))