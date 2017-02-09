var template = new Image();
var image = {coord: new coord(0, 0), width: 0, height: 0, img: new Image()};

var canvas, context, imageurl, templateurl;
var fps = 60;
var nowSelecting = false;
var selectionActive = false;

var rectOrigin = new coord(0, 0);
var rectDest = new coord(0, 0);
var currentMousePos = new coord(0, 0);

function coord(x, y) {
	this.x = x;
	this.y = y;	
}

function start() {
	canvas = document.getElementById("tutorial");
	context = canvas.getContext("2d");
	imageurl = document.getElementById("imageurl");
	templateurl = document.getElementById("templateurl");
	
	templateurl.value = "http://puu.sh/tUrSS/1dd1c4a6f7.png";
	imageurl.value = "http://puu.sh/tUrXh/1cec05c440.jpg";

	canvas.addEventListener("mousedown", onMouseDown, false);
	canvas.addEventListener("mouseup", onMouseUp, false);
	canvas.addEventListener("mousemove", onMouseMove, false);
	setInterval(function() {
					draw();
				}, 1000/fps);
}

function draw() {
	cleanCanvas();
	context.drawImage(template, 0, 0);
	context.drawImage(image.img,
					image.coord.x,
					image.coord.y,
					image.width,
					image.height);

	if (selectionActive) {
		context.fillStyle = "rgba(200, 200, 0, 0.5)";
		context.strokeStyle = "rgb(180, 180, 0)";
		context.lineWidth = 5;
		context.fillRect(rectOrigin.x,
						rectOrigin.y,
						rectDest.x - rectOrigin.x,
						rectDest.y - rectOrigin.y);
		context.strokeRect(rectOrigin.x,
						rectOrigin.y,
						rectDest.x - rectOrigin.x,
						rectDest.y - rectOrigin.y);
	}

	if (nowSelecting) {
		var pos = currentMousePos;
		context.fillStyle = "rgba(0, 200, 0, 0.5)";
		context.strokeStyle = "rgb(0, 100, 0)";
		context.lineWidth = 5;
		context.fillRect(rectOrigin.x,
						rectOrigin.y,
						pos.x - rectOrigin.x,
						pos.y - rectOrigin.y);
		context.strokeRect(rectOrigin.x,
						rectOrigin.y,
						pos.x - rectOrigin.x,
						pos.y - rectOrigin.y);
	}
}

function cleanCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function onMouseDown() {
	selectionActive = false;
	nowSelecting = true;
	var pos = getCursorPosition();
	rectOrigin = new coord(pos.x, pos.y);
}

function onMouseUp() {
	selectionActive = true;
	nowSelecting = false;
	var pos = getCursorPosition();
	rectDest = new coord(pos.x, pos.y);
}

function onMouseMove() {
	var rect = canvas.getBoundingClientRect();
	currentMousePos = {x: event.clientX - rect.left,
    				   y: event.clientY - rect.top};
}

function getCursorPosition() {
    var rect = canvas.getBoundingClientRect();
    return {x: event.clientX - rect.left,
    		y: event.clientY - rect.top}
}

function getTemplate() {
	template.src = templateurl.value; 
}

function getImage() {
	selectionActive = false;

	var topleft, width, height;
	width = Math.abs(rectDest.x - rectOrigin.x);
	height = Math.abs(rectDest.y - rectOrigin.y);

	if (rectDest.x - rectOrigin.x > 0) {
		if (rectDest.y - rectOrigin.y > 0) {
			topleft = new coord(rectOrigin.x, rectOrigin.y);
		}
		else {
			topleft = new coord(rectOrigin.x, rectDest.y);
		}
	}
	else {
		if (rectDest.y - rectOrigin.y > 0) {
			topleft = new coord(rectDest.x, rectOrigin.y);
		}
		else {
			topleft = new coord(rectDest.x, rectDest.y);
		}	
	}

	image.coord = new coord(topleft.x, topleft.y);
	image.width = width;
	image.height = height;
	image.img = new Image();
	image.img.src = imageurl.value;
}