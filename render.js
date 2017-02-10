var template = new Image();

var canvas, context, imageurl, templateurl;
var fps = 60;
var nowSelecting = false;
var nowEditing = true;
var nowMovingRect = false;
var waitingToRegisterMovingRectAsAction = false;

var rectList = [];
var currentRectOrigin = new coord(0, 0);
var currentRectDest = new coord(0, 0);

var selectedRectIndex = -1;
var mouseSelectionOffset = new coord(0, 0);

var rectLineWidth = 2;

function coord(x, y) {
	this.x = x;
	this.y = y;	
}

function rect(x, y, width, height, id) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.id = id;
}

function start() {
	canvas = document.getElementById("tutorial");
	context = canvas.getContext("2d");
	imageurl = document.getElementById("imageurl");
	templateurl = document.getElementById("templateurl");
	
	templateurl.value = "http://puu.sh/tVZt6/0a443ab360.jpg";
	imageurl.value = "http://puu.sh/tUrXh/1cec05c440.jpg";

	canvas.addEventListener("mousedown", onMouseDown, false);
	canvas.addEventListener("mouseup", onMouseUp, false);
	canvas.addEventListener("mousemove", function(e) {
			mousePos = getCursorPosition(e);
			onMouseMove();
		}, false);
	window.addEventListener("keypress", onKeyPress, false);
	setInterval(function() {
					draw();
				}, 1000/fps);
}

function cleanCanvas() {
	canvas.width = template.width;
	canvas.height = template.height;
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function resetCanvas() {
	rectList = [];
	updateSelectList();
	cleanCanvas();
}

function draw() {
	cleanCanvas();
	drawBackground();
	context.drawImage(template, 0, 0);

	if (nowSelecting && nowEditing) {
		var pos = mousePos;
		context.fillStyle = "rgba(105, 199, 217, 0.5)";
		context.strokeStyle = "rgba(37, 157, 179, 0.5)";
		context.lineWidth = rectLineWidth;
		context.fillRect(currentRectOrigin.x,
						currentRectOrigin.y,
						pos.x - currentRectOrigin.x,
						pos.y - currentRectOrigin.y);
		context.strokeRect(currentRectOrigin.x,
						currentRectOrigin.y,
						pos.x - currentRectOrigin.x,
						pos.y - currentRectOrigin.y);
	}

	for (var i = 0; i < rectList.length; i++) {
		renderRect(rectList[i]);
	}

	if (nowEditing) {
		context.font = "20px Arial";
		context.fillStyle = "rgba(255, 0, 0, 0.5)";
		context.textAlign = "left";
		context.fillText("EDIT MODE",
			0,
			20);
	}
}

function drawBackground() {
	context.fillStyle = "rgb(255, 255, 255)";
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawImageEdit(rect) {
	context.globalAlpha = 0.5;
	context.drawImage(rect.img,
		rect.x,
		rect.y,
		rect.width,
		rect.height);
	context.globalAlpha = 1;
}

function drawImage(rect) {
	context.drawImage(rect.img,
		rect.x,
		rect.y,
		rect.width,
		rect.height);
}

function drawRectID(rect) {
	context.font = (rect.height * 2)/5 +"px Georgia";
	context.fillStyle = "rgba(0, 0, 0, 0.8)"
	context.textAlign = "center";
	context.fillText(rect.id + 1,
		rect.x + rect.width / 2,
		rect.y + rect.height / 2);
}

function drawRectSelected(rect) {
	context.fillStyle = "rgba(105, 199, 217, 0.5)";
	context.strokeStyle = "rgba(37, 157, 179, 0.5)";
	context.lineWidth = rectLineWidth;
	context.fillRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
	context.strokeRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
}

function drawRectUnselected(rect) {
	context.fillStyle = "rgba(255, 232, 79, 0.5)";
	context.strokeStyle = "rgb(216, 188, 5)";
	context.lineWidth = rectLineWidth;
	context.fillRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
	context.strokeRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
}

function renderRect(rect) {
	if (nowEditing) {
		if (rect.img) {
			if (rect.id == selectedRectIndex) {
				drawRectSelected(rect);
			}

			drawImageEdit(rect);
			drawRectID(rect);
		}
		else {
			if (rect.id == selectedRectIndex) {
				drawRectSelected(rect);
			}
			else {
				drawRectUnselected(rect);
			}

			drawRectID(rect);
		}
	}
	else {
		if (rect.img) {
			drawImage(rect);
		}
	}
}

function updateSelectList() {
	/*var $select = $("#selected_rect");
	$select.empty();
	$.each(rectList, function(key, value) {
		$select.append($("<option></option>").attr("value", value.id).text("rect " + value.id));
	});*/
}