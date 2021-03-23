var Img = {};
    Img.player = new Image();
    Img.player.src = '/client/img/player.png';
    Img.map = new Image();
    Img.map.src = '/client/img/office.png';
    Img.entity = new Image();
    Img.entity.src = '/client/img/bat.png';

let chatText = document.getElementById('chat-text');
let chatInput = document.getElementById('chat-input');
let chatForm = document.getElementById('chat-form');
// let ctx = document.getElementById('ctx').getContext("2d");
// ctx.font='30px Arial';

const socket = io();
let enterGame = function(nickname){

    // PIXIJS
    let screenDimensions = [window.innerWidth, window.innerHeight];
    let zoom = 1;
    // let ratio = screenDimensions[0] / screenDimensions[1];
    const app = new PIXI.Application({
        width: screenDimensions[0], height: screenDimensions[1], backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
    });

    let WIDTH = app.screen.width;
    let HEIGHT = app.screen.height;

    const background = PIXI.Sprite.from(Img.map.src);
    background.width = WIDTH*2;
    background.height = HEIGHT*3;
    background.position.x = 0;
    background.position.y = 0;
   
    const texture = PIXI.Texture.from(Img.map.src);
    const tiledBackground = new PIXI.TilingSprite(texture,0,0);
    
    tiledBackground.width = WIDTH*2;
    tiledBackground.height = HEIGHT*3;
    // tiledBackground.position.x = 0;
    // tiledBackground.position.y = 0;

    app.stage.addChild(background);
    app.stage.addChild(tiledBackground);


    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#fcc500'
    });

    const wallPositions = {
        x:175,
        y:75
    };
    // let backgroundTexture = PIXI.Texture.from(Img.map.src);
    // const background = new PIXI.TilingSprite(backgroundTexture, WIDTH, HEIGHT);

    let appContainer = document.getElementById('gameInterface');
    

    let Player = function(initPack){
        
        let self = {};
        self.id = initPack.id;
        self.username = initPack.username;
        self.x = initPack.x;
        self.y = initPack.y;
        self.pathSprite = initPack.sprite;

        self.texture = PIXI.Texture.from(self.pathSprite);
        self.sprite = new PIXI.Sprite(self.texture);
        self.sprite.interactive = true;
        self.sprite.buttonMode = true;
        self.sprite.message = new PIXI.Text(self.username, style);
        // self.sprite.message.text = "";

        // self.makeHitArea = function(){
        //     let hitArea = new PIXI.Rectangle(self.x-self.sprite.width/2, self.y-self.sprite.height/2, self.sprite.width, self.sprite.height);
        //     self.sprite.hitArea = hitArea;
        // }

        self.move = function(){
            var x = self.x - Player.list[selfId].x + WIDTH/2;
            var y = self.y - Player.list[selfId].y + HEIGHT/2;

            let sprite = self.sprite;
            sprite.anchor.set(0.5);
            sprite.x = x;
            sprite.y = y;

            app.stage.addChild(sprite);
        }

        self.onHover = function(){
            self.sprite.alpha = 0.5;
            self.sprite.message.alpha = 1;
            var message = self.sprite.message;
                message.x = self.sprite.x-self.sprite.width/2;
                message.y = self.sprite.y-self.sprite.height-20;
            self.sprite.message = message;
            app.stage.addChild(message);
        }


        self.onRelease = function(){
            self.sprite.alpha = 1;
            self.sprite.message.alpha = 0;
            // console.log(self.sprite.message);
        }
        Player.list[self.id] = self;

        return self;
    }

    Player.list = {};
    // let PC.list = {};
    
    let PC = function(initPack){
        let self = {};
        self.id = initPack.id;
        self.x = initPack.x;
        self.y = initPack.y;

        // self.texture = PIXI.Texture.from(Img.entity.src);
        
        self.sprite = new PIXI.Sprite();
        self.sprite.anchor.set(0.5);
        self.sprite.interactive = true;
        self.sprite.buttonMode = true;
        self.sprite.width = 60;
        self.sprite.height = 70;
        
        self.near = false;
        self.clicked = false;
        // self.sprite.hitArea = new PIXI.Rectangle(self.x, self.y, self.width, self.height); 
        

        self.onPlayerMove = function(){
            let x = self.x - Player.list[selfId].x + WIDTH/2;
            let y = self.y - Player.list[selfId].y + HEIGHT/2;
            self.sprite.x = x;
            self.sprite.y = y; 

            app.stage.addChild(self.sprite);  
        }
        
        self.onClick = function(){
            console.log(self.clicked);

            if(self.near && self.clicked){
                self.powerOn();
                self.clicked = false;
            }
        }

        self.powerOn = function(){
            alert('voici le pc ' + self.id);
        }

        self.onProximity = function(player){
            if(player.x <= self.x + 150 || player.y < self.y + 100 ){
                self.near = true;
            }
            else{
                self.near = false;
            }
        }       
            
        PC.list[self.id] = self;
    }

    PC.list = {};
    
    // EMIT
    socket.emit('isConnected',{
        username : nickname,
        sprite : Img.player.src,
        screenSizeWidth:document.documentElement.clientWidth,
        screenSizeHeight:document.documentElement.clientHeight
    });

    // ON
    socket.on('tabJoueurs',(data)=>{
        userArr = [];
        for(var i in data.tabJoueurs){
            userArr.push(data.tabJoueurs[i].username);
        }
    }); 
    var selfId = null;
    socket.on('init', function(data){
        // console.log(data);
        if(data.selfId){
            selfId = data.selfId;
        }
        let player = data.player;
        let pc=data.pc;

        for(var i = 0; i<player.length; i++){
            new Player(data.player[i]);
        }

        for(var i = 0; i<pc.length; i++){
            new PC(data.pc[i]);
        }
        // for(var i in Player.list){
        //     let player = Player.list[i];
        //     player.makeHitArea();
        // }
    });

    socket.on('update', function(data){
        // console.log(data);
        for(var i = 0; i<data.player.length; i++){
            let pack = data.player[i];
            let p = Player.list[pack.id];
            if(p){
                if(pack.x !== undefined){
                    p.x = pack.x;
                }
                if(pack.y !== undefined){
                    p.y = pack.y;
                }
            }     
        }
    }); 

    socket.on('remove', function(data){
        // console.log(data);
        for(var i = 0; i<data.player.length; i++){
            app.stage.removeChild(Player.list[data.player[i]].sprite);
            delete Player.list[data.player[i]];
            // delete PC.list[data.pc[i]];
        }
        for(var i = 0; i<data.pc.length; i++){
            app.stage.removeChild(PC.list[data.pc[i]].sprite);
            delete PC.list[data.player[i]];
        }
        
    });

    let coord = true;
    setInterval(function(){
        if(!selfId)
            return;
        let player = Player.list[selfId];
        drawMap(player);
        for(var i in Player.list){
            let player = Player.list[i];
            player.sprite.on('pointerover',player.onHover);
            player.sprite.on('pointerout',player.onRelease);
            Player.list[i].move();
            if(coord){
                player.sprite.on('pointerdown', function(){
                    console.clear();
                    console.log("x: "+player.x);
                    console.log("y: "+player.y);
                });
                console.log(Player.list);
                console.log(PC.list);
                coord = false;
            }
        }
        // console.log(PC.list);
        for(var p in PC.list){
            let pc = PC.list[p];
            let player = Player.list[selfId];
            pc.onPlayerMove();

            app.stage.addChild(pc.sprite);

            pc.onProximity(player);
            pc.sprite.on('pointerdown',function(){
                if(pc.clicked){
                    pc.clicked = false;
                }
                else{
                    pc.clicked = true;
                    pc.onClick();
                }
            });
        }
    },40);

    // qqqqq

    socket.on('addToChat',function(data){
        chatText.innerHTML += '<div>'+data+'</div>';
    })

    var drawMap = function(player){
        let x = WIDTH/2 - player.x;
        let y = HEIGHT/2 - player.y;
        background.position.x = x;
        background.position.y = y;
    }

    // INTERFACE

    hideWindow('formPlayer');
    displayWindow('gameInterface');

    chatForm.onsubmit = function(e){
        e.preventDefault();
        socket.emit('sendMsgToServer', chatInput.value);
        chatInput.value = "";
    }

    // INTERACTIONS CLAVIER

    document.onkeydown = function(event){
        // console.log(event);
        if(event.keyCode === 68 ){  //D
            socket.emit('keyPress',{inputId:'right', state:true});
        } 
        else if(event.keyCode === 83){  //S
            socket.emit('keyPress',{inputId:'down', state:true});
        } 
        else if(event.keyCode === 81){  //Q
            socket.emit('keyPress',{inputId:'left', state:true});
        }
        else if(event.keyCode === 90){  //Z
            socket.emit('keyPress',{inputId:'up', state:true});
        }

    }

    document.onkeyup = function(event){
        // console.log(event.keyCode);
        if(event.keyCode === 68 ){  //D
            socket.emit('keyPress',{inputId:'right', state:false});
        } 
        else if(event.keyCode === 83){  //S
            socket.emit('keyPress',{inputId:'down', state:false});
        } 
        else if(event.keyCode === 81){  //Q
            socket.emit('keyPress',{inputId:'left', state:false});
        }
        else if(event.keyCode === 90){  //Z
            socket.emit('keyPress',{inputId:'up', state:false});
        }

    }

    appContainer.appendChild(app.view);
}



function displayWindow(id){
    document.getElementById(id).style.display = 'block';
}

function hideWindow(id){
    document.getElementById(id).style.display = 'none';
}

// message('Bienvenue');
