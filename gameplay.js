const canvas = document.getElementById("gameplaycanvas");
const context = canvas.getContext("2d"); 

//variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let mouseclk = false;
let pause = false;

//bg variables
let imgWidth;
let scrollSpeed;

//player sprite variables
let x = 0;
let y = 0;

let spriteSheetWidth = 1500;
let spriteSheetHeight = 300;
let srcX;
let srcY;
let cols = 5;
let rows = 1;
let spriterowZero = 0;
let spriterowOne = 1;
let spriterowTwo = 2;
let width = spriteSheetWidth / cols;
let height = spriteSheetHeight / rows;
let currentFrame = 0;
let enemysize;
//animation flags
let upkeypressanimation = false;
let downkeypressanimation = false;
let groundpolice;
let skypolice = false;
let clipY;

//audio
let wheelie = new Audio;
wheelie.src = "audio/woohoo.mp3";

let downsound = new Audio;
downsound.src = "audio/swooshsnd.mp3";

let crashsound = new Audio;
crashsound.src = "audio/busted.mp3";

let audiotrack = new Audio;
audiotrack.src = "audio/policesiren.wav";
//images
let splashscreen = new Image;
splashscreen.src = "images/splashscreen.png"
//background
bg = new Image;
bg.src = "images/sunsetBg++.png";
//police
police = new Image;
police.src = "images/policespritefinal.png";

charactersp = new Image;
charactersp.src = "images/lastmod.png";

//note
	console.log("if you are having the following exception:");
	console.log("'Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first.'");
	console.log("Please note that since google chrome 66 or firefox 70, the autoplay"+
		"function has been removed. the background sound will not play of you dont interact with the browser first");

let clipping = [spriterowZero * 120, spriterowOne * 120];
// sprite variables end

//eventListeners
document.addEventListener('keydown', function(event){
	keys[event.code] = true;
});
document.addEventListener('keyup', function(event){
	keys[event.code] = false;
});
document.addEventListener('mousedown', function(event){
	// console.log('clicked');
	mouseclk = true;
});
document.addEventListener('mouseup', function(event){
	// console.log('clicked up');
	mouseclk = false;
});
document.addEventListener('keydown', function(event){
	if(keys['KeyR']){
		location.reload();
	}
});
class Player{
	constructor (x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.dy = 0;
		this.jumpForce = 13;
		this.originalHeight = h;
		this.grounded = false;
		this.currentFrame =0
		this.delay=0;
		
		
	}
	Animate(){
		// jump annimation 
		if (keys['ArrowUp'] || keys['KeyW']){
			this.Jump();
			upkeypressanimation = true;
			downsound.play();
		}
		else{
			upkeypressanimation = false;
			this.jumpTimer = 0;
		}

		if (keys['ArrowDown'] || keys['KeyS']) {
			this.h = this.originalHeight/2;
			downkeypressanimation = true;
			downsound.play();
		}
		else{
			downkeypressanimation = false;
			this.h = this.originalHeight;
		}
		if(mouseclk == true){
			//console.log('clicked');
			wheelie.play();
			wheelie.volume = 0.8;
			upkeypressanimation = true;
		}

		this.y += this.dy;
		// create gravity
		if (this.y + this.h < canvas.height){
			this.dy += gravity;
			this.grounded = false;
		}
		else{
			this.dy = 0;
			this.grounded = true;
			this.y = canvas.height - this.h;
		}	
		this.Draw();	
	}
	Jump(){
		if (this.grounded && this.jumpTimer == 0){
			this.jumpTimer = 1;
			this.dy = - this.jumpForce;
		}
		else if (this.jumpTimer > 0 && this.jumpTimer < 15){
			this.jumpTimer++;
			this.dy = -this.jumpForce - (this.jumpTimer / 50);
		}
	}

	Draw(){
		if(upkeypressanimation == true){
			srcY = spriterowOne * height;
		}
		else if(downkeypressanimation == true){
			srcY = spriterowTwo * height;
		}
		else if(upkeypressanimation == false){
			srcY = spriterowZero * height;
		}
		else if(downkeypressanimation == false){
			srcY = spriterowZero * height;
		}
		srcX = (this.currentFrame % cols) * width;
		context.drawImage(charactersp, srcX, srcY, width, height, this.x ,this.y, 100, 100);
		if(this.delay == 5){
			this.delay = 0;
			this.currentFrame++;
		}
		this.delay++;	
	}
}
class Obstacle{
	constructor (x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.dx = -gameSpeed;
		this.currentFrame = 0;
		this.delay=0;
	}

	Update(){
		this.x += this.dx;
		this.Draw();
		this.dx = -gameSpeed;
	}

	Draw(){
		srcY = spriterowZero * 120;
		srcX = (this.currentFrame % 4) * 300;
		context.drawImage(police, srcX, clipY, 300,120, this.x, this.y,this.w, this.h );
		if(this.delay == 5){
			this.delay = 0;
			this.currentFrame++;
		}
		this.delay++;
	}
}
class Text{
	constructor(t,x,y,a,c,s){
		this.t = t;
		this.x = x;
		this.y = y;
		this.a = a;
		this.c = c;
		this.s = s;
	}
	Draw(){
		context.beginPath();
		context.fillStyle = this.c;
		context.font = this.s + "px sans-serif";
		context.textAlign = this.a;
		context.fillText(this.t, this.x, this.y);
		context.closePath();
	}
}
// game functions 
//sprite annimations functions - end
function SpawnObstacle(){
	enemysize = RandomIntInRange(99,100);
	// for ground - 0 and air - 1 obstacles
	let type = RandomIntInRange(0,1); 
	let obstacle = new Obstacle(canvas.width + enemysize, canvas.height - enemysize, enemysize, enemysize);
	 console.log(type);
	if(type == 1){
		clipY = clipping[1];
		obstacle.y -= player.originalHeight - 10;
		obstacle.w = 180;
	}
	else if(type == 0){
		clipY = clipping[0];
		obstacle.h = player.originalHeight +15;
		obstacle.y = player.originalHeight +190;
		obstacle.w = player.originalHeight +30;
	}
	obstacles.push(obstacle);
}
function RandomIntInRange(min, max){
	return Math.round(Math.random() * (max - min) + min );
}
function restart(){
	//reset game
	crashsound.play();
	obstacles = [];
	score = 0;
	spawnTimer = initialSpawnTimer;
	gameSpeed = 6;
	
}

function Start(){

	canvas.width = 1000;
	canvas.height = 400;

	context.font = "20px sans-serif";

	gameSpeed = 6;
	gravity = 1;

	score = 0;
	highscore = 0;

	imgWidth = 0;
	scrollSpeed = 10;
	// stores the high score in the browser memory
	if(localStorage.getItem('highscore')){
		highscore = localStorage.getItem('highscore');
	}
	player = new Player(50, 0, 100,100);
	scoreText = new Text("Score = "+score , 25, 25, "left", "#212121", "20");
	highscoreText = new Text("HighScore: "+ highscore, canvas.width - 25, 25, "right", "#212121", "20");
	requestAnimationFrame(Update);
}
let initialSpawnTimer = 220;
let spawnTimer = initialSpawnTimer;
function Update(){
	if(pause == true){return;}
	requestAnimationFrame(Update);

	audiotrack.play();
	audiotrack.volume = 0.1;
	// clear the player draw on each frame
	//context.clearRect(0, 0, canvas.width, canvas.height);
	//bg draw
	context.drawImage(bg, -imgWidth, 0);
	context.drawImage(bg, -(imgWidth - canvas.width), 0);
	imgWidth += scrollSpeed;
	if(imgWidth == canvas.width){
		imgWidth = 0;
	}

	spawnTimer--;
	if(spawnTimer <= 0){
		SpawnObstacle();
		//console.log(obstacles);
		spawnTimer = initialSpawnTimer - gameSpeed * 8;
		
		if (spawnTimer < 60){
			spawnTimer = 60;
		}
	}
	// spawn enemies
  	for (let i = 0; i < obstacles.length; i++) {
	    let obstacle = obstacles[i];
	    let dx = player.x - obstacle.x;
	    let dy = player.y - obstacle.y;
	    let dist = Math.sqrt(dx * dx + dy * dy);

	    //delete the obstacles as soon as it hita the far left boundary
	    if(obstacle.x + obstacle.w < 0){
	    	obstacles.splice(i, 1);
	    }
	    
	    // check collision
	    if (
	    	dist < player.h/2 + obstacle.h/2
	    ){
	    	audiotrack.pause();
	    	crashsound.play();
	    	pause = true;
	    	context.drawImage(splashscreen, 0,0);
	    	window.localStorage.setItem('highscore', highscore);
	    }
		obstacle.Update();

	}
	player.Animate();
	score++;
	scoreText.t = "Score: "+score;
	scoreText.Draw();
	if(score > highscore){
		highscore = score;
		highscoreText.t = "HighScore: " + highscore;
	}
	highscoreText.Draw();
	gameSpeed += 0.005;
}
Start();