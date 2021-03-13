var Img = {};
    Img.player = new Image();
    Img.player.src = '/client/img/player.png';
    Img.map = new Image();
    Img.map.src = '/client/img/office.png';

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
    // let backgroundTexture = PIXI.Texture.from(Img.map.src);
    // const background = new PIXI.TilingSprite(backgroundTexture, WIDTH, HEIGHT);
    app.stage.addChild(background);

    let appContainer = document.getElementById('gameInterface');
    appContainer.appendChild(app.view);

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

        self.move = function(){
            var x = self.x - Player.list[selfId].x + WIDTH/2;
            var y = self.y - Player.list[selfId].y + HEIGHT/2;

            let sprite = self.sprite;
            sprite.anchor.set(0.5);
            sprite.x = x;
            sprite.y = y;

            app.stage.addChild(sprite);
        }
        Player.list[self.id] = self;

        return self;
    }

    Player.list = {};

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
        // console.log(userArr);
    }); 
    var selfId = null;
    socket.on('init', function(data){
        if(data.selfId){
            selfId = data.selfId;
        }

        for(var i = 0; i<data.player.length; i++){
            new Player(data.player[i]);
            // console.log(Player.list);
        }
    });

    socket.on('update', function(data){
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
        // console.log(data);
        // console.log(Player.list);
    }); 

    socket.on('remove', function(data){
        for(var i = 0; i<data.player.length; i++){
            app.stage.removeChild(Player.list[data.player[i]].sprite);
            delete Player.list[data.player[i]];
        }
    });

    setInterval(function(){
        if(!selfId)
            return;
        console.log(selfId);
        let player = Player.list[selfId];
        drawMap(player);
        for(var i in Player.list){
            
            Player.list[i].move();
        }
    },40);

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
}



function displayWindow(id){
    document.getElementById(id).style.display = 'block';
}

function hideWindow(id){
    document.getElementById(id).style.display = 'none';
}

// message('Bienvenue');
