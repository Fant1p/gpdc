

// ----- ajout des modules ----- //

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server);
// const pixi = require('pixi.js')

app.get('/', function (req, res) {
   res.sendFile('index.html', { root: __dirname + "/client" });
})

app.use('/client', express.static(__dirname + '/client'));

// CONFIGURATION DU LIEN ENTRE SERVEUR ET CLIENT//

let now = new Date();
connectionDate = now.getFullYear() + "/" +now.getMonth() + 1 + "/" +now.getDate() + "-" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

let defaultMsg = connectionDate + ' -- ';

let SOCKET_LIST = {}; 
let PLAYER_LIST = {};

let Player = function(id, username){
	let self = {
		id:id,
		username:username,
		x:250,
		y:250,

		//Interaction avec le clavier
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpd:10,

	}
	self.updatePosition = function(){
		if(self.pressingRight){
			self.x+= self.maxSpd;	
		}
		if(self.pressingLeft){
			self.x-= self.maxSpd;
		}
		if(self.pressingUp){
			self.y-= self.maxSpd;
		}
		if(self.pressingDown){
			self.y+= self.maxSpd;
		}

	}	
	return self;
}
let userArr = [];
// // établissement de la connexion
io.on('connection', (socket) =>{

   	// CONNEXION DU JOUEUR
   	socket.id = Math.random();

	console.log( defaultMsg + 'Connecté au client' + socket.id);
   	
   	socket.on('isConnected',(data)=>{
   		userArr.push(data.username);

   		socket.emit('tabJoueurs', {
   			tabJoueurs: userArr,
   		});
   		console.log(defaultMsg + " @ " + socket.id + " -- " + data.username + " is connected");
   		SOCKET_LIST[socket.id] = socket;
		
		let player = Player(socket.id, data.username)
		PLAYER_LIST[socket.id] = player;
   	// DECONNEXION DU JOUEUR

	   	socket.on('disconnect',function(){
	   		console.log(defaultMsg + data.username +" has disconnected");
	   		userArr.splice(userArr.indexOf(data.username));
	   		delete SOCKET_LIST[socket.id];
	   		delete PLAYER_LIST[socket.id];

	   	});

	   	socket.on('keyPress', function(data){
	   		switch (data.inputId) {
	   			case 'left':
	   				player.pressingLeft = data.state;
   				break;
   				case 'right':
	   				player.pressingRight = data.state;
   				break;
   				case 'up':
	   				player.pressingUp = data.state;
   				break;
   				case 'down':
	   				player.pressingDown = data.state;
   				break;
	   		}
	   	});

   	});
});

setInterval(function(){

	let pack = [];
	// let playerList = PLAYER_LIST;
	// let socketList = SOCKET_LIST;
	for(var i in PLAYER_LIST){
		player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x:player.x,
			y:player.y,
			username: player.username
		});
	}
	for(var i in SOCKET_LIST){
		socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}

}, 1000/25);

server.listen(3000, function () {
 console.log('Votre app est disponible sur localhost:3000 !')
});













