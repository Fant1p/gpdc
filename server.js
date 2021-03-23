

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


// CONFIG CLASSES ET OBJETS

let Entity = function(x, y){
	let self = {
		x:x,
		y:y,
		spdX:0,
		spdY:0,
		id:"",
	}

	self.update = function(){
		self.updatePosition();
	}

	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}

	return self;
}


let Player = function(id, username,sprite, positionX, positionY){
	let self = Entity(positionX, positionY);
		self.id = id;
		self.username = username;
		self.sprite = sprite;
		//Interaction avec le clavier
		self.pressingRight = false;
		self.pressingLeft = false;
		self.pressingUp = false;
		self.pressingDown = false;
		self.maxSpd = 10;

	let super_update = self.update;

	self.update = function(){
		self.updateSpd();
		super_update();
	}

	self.updateSpd = function(){

		if(self.pressingRight){
			self.spdX = self.maxSpd;	
		}
		else if(self.pressingLeft){
			self.spdX = -self.maxSpd;
		}
		else self.spdX = 0;


		if(self.pressingUp){
			self.spdY = -self.maxSpd;
		}
		else if(self.pressingDown){
			self.spdY = self.maxSpd;
		}
		else self.spdY = 0;
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			username:self.username,
			sprite:self.sprite,
			x:self.x,
			y:self.y	
		};		
	}

	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		}	
	}
	Player.list[id]=self;

	initPack.player.push(self.getInitPack());	
	return self;
}

Player.list={};
Player.onConnect = function(socket, data){
	let player = Player(socket.id, data.username, data.sprite, data.screenSizeWidth, data.screenSizeHeight);
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

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
	});
}

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
		// console.log(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}

Player.update=function(socket){
	let pack = [];

	socket.emit('tabJoueurs', {
		tabJoueurs: Player.list,
	});
	// let playerList = Player.list;
	// let socketList = SOCKET_LIST;
	for(var i in Player.list){
		player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
}

let PC = function(id,positionX, positionY){
	let self = Entity(positionX, positionY);
		self.id = id;
		//Interaction avec le clavier

	self.onClick = function(){
		self.clicked = true;
	}

	self.onProximity = function(){
		self.near = true;
		return self.near;
	}

	self.powerOn = function(){
		self.state = true;
		return self.state;
	}

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y	
		};		
	}

	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
		}	
	}

	// PC.list[id]=self;

	initPack.pc.push(self.getInitPack());	
	return self;

}
PC.list={};
PC.create = function(socket,pc){
	let pc = PC(pc.id, pc.x, pc.y);

	socket.emit('init',{
		pc:PC.getAllInitPack()
	});
}

PC.getAllInitPack = function(){
	var pc = [];
	// console.log(PC.list);
	for(var i in PC.list)
		pc.push(PC.list[i].getInitPack());
		// console.log(Player.list[i].getInitPack());
	return pc;
}

PC.update=function(){
	let pack = [];
	for(var i in PC.list){
		pc = PC.list[i];
		pc.update();
		pack.push(pc.getUpdatePack());
	}
	return pack;
}

PC.onPlayerDisconnect = function(pc){
	delete PC.list[pc.id];
	removePack.player.push(pc);
}

// let userArr = [];
// // établissement de la connexion
io.on('connection', (socket) =>{
   	socket.id = Math.random();
	console.log( defaultMsg + 'Connecté au client ' + socket.id);
	
   	// CONNEXION DU JOUEUR
   	socket.on('isConnected',(data)=>{
   		SOCKET_LIST[socket.id] = socket;
   		// console.log(data);
   		PC.list[0] = new PC(0,700,125);
		PC.list[1] = new PC(1,700,325);
		PC.list[2] = new PC(2,700,525);
		PC.list[3] = new PC(3,580,255);
		PC.list[4] = new PC(4,580,455);
		PC.list[5] = new PC(5,580,655);
   		socket.emit('init',{
			pc:PC.getAllInitPack()
		});
   		Player.onConnect(socket,data);
   		console.log(initPack);
   		let playerName = data.username;
   		
   		console.log(defaultMsg + " @ " + socket.id + " -- " + playerName + " is connected");
   		
   		socket.emit('addToChat', '<div style="font:18px; color:#fcc500">Bienvenue '+playerName+' sur la présentation de R-Smart</div>');

   	// DECONNEXION DU JOUEUR

	   	socket.on('disconnect',function(){
	   		console.log(defaultMsg + playerName +" has disconnected");
	   		delete SOCKET_LIST[socket.id];
	   		Player.onDisconnect(socket);

	   		delete PC.list[pc.id];
	   		PC.onPlayerDisconnect(pc);

	   	});

	   	socket.on('sendMsgToServer', function(data){
	   		let msgChat = playerName + ": " + data;
	   		console.log(defaultMsg + msgChat);
	   		for(var i in SOCKET_LIST){
				socket = SOCKET_LIST[i];
				socket.emit('addToChat', msgChat);
			}
		});

   	});
});
let initPack = {player:[], pc:[]};
let removePack = {player:[], pc:[]};

setInterval(function(){
	for(var i in SOCKET_LIST){
		// console.log(initPack);
		let socket = SOCKET_LIST[i];
		let pack = {player:Player.update(socket), pc:PC.update()};
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player =[];
	removePack.player =[];
	initPack.pc = [];
	removePack.pc =[];

}, 1000/25);

server.listen(3000, function () {
 console.log('Server -- OK !');
});













