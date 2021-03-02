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

    const background = PIXI.Sprite.from(Img.map.src);
    background.width = app.screen.width;
    background.height = app.screen.height;
    app.stage.addChild(background);

    let appContainer = document.getElementById('gameInterface');
    appContainer.appendChild(app.view);


    console.log(app.view);

    let Player = function(initPack){
        
        let self = {};
        self.id = initPack.id;
        self.username = initPack.username;
        self.x = initPack.x;
        self.y = initPack.y;
        self.pathSprite = initPack.sprite;

        self.texture = PIXI.Texture.from(self.pathSprite);

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

    socket.on('init', function(data){
        for(var i = 0; i<data.player.length; i++){
            new Player(data.player[i]);
        }

        for(var i in Player.list){
            let sprite = new PIXI.Sprite(Player.list[i].texture);

            sprite.anchor.set(0.5);
            sprite.x = Player.list[i].x;
            sprite.y = Player.list[i].y;

            app.stage.addChild(sprite);
        }
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
        for(var i = 0; i<data.player.length; i++){
            delete Player[data.player[i]];
        }
    });

    setInterval(function(){
        app.view.getContext('2d').clearRect(0,0, 500,500);
        for(var i in Player.list){
            let sprite = new PIXI.Sprite(Player.list[i].texture);
            sprite.anchor.set(0.5);
            sprite.x = Player.list[i].x;
            sprite.y = Player.list[i].y;
            app.stage.addChild(sprite);
        }
    },40);

    socket.on('addToChat',function(data){
        chatText.innerHTML += '<div>'+data+'</div>';
    })

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
