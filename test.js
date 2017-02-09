var template = new Image();

var canvas, context, imageurl, templateurl;
var fps = 60;
var nowSelecting = false;
var nowEditing = true;

var rectList = [];
var currentRectOrigin = new coord(0, 0);
var currentRectDest = new coord(0, 0);

var actionHistory = [];

var currentMousePos = new coord(0, 0);

function action(rectCreation, imageSet, rectIndex) {
	this.rectCreation = rectCreation;
	this.imageSet = imageSet;
	this.rectIndex = rectIndex;
}

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
	canvas.addEventListener("mousemove", onMouseMove, false);
	canvas.addEventListener("keypress", onKeyPress, false);
	setInterval(function() {
					draw();
				}, 1000/fps);
}

function toggleEdit() {
	nowEditing = !nowEditing;
}

function cleanCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function resetCanvas() {
	rectList = [];
	cleanCanvas();
}

function draw() {
	cleanCanvas();
	context.drawImage(template, 0, 0);

	if (nowSelecting && nowEditing) {
		var pos = currentMousePos;
		context.fillStyle = "rgba(0, 200, 0, 0.5)";
		context.strokeStyle = "rgb(0, 100, 0)";
		context.lineWidth = 5;
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
		if (rectList[i].img) {
			if (nowEditing) {
				context.globalAlpha = 0.5;
			}
			context.drawImage(rectList[i].img,
				rectList[i].x,
				rectList[i].y,
				rectList[i].width,
				rectList[i].height);
			context.globalAlpha = 1;
			if (nowEditing) {
				context.font = (rectList[i].height * 2)/5 +"px Arial";
				context.fillStyle = "rgba(0, 0, 0, 0.5)"
				context.textAlign = "center";
				context.fillText(rectList[i].id,
					rectList[i].x + rectList[i].width / 2,
					rectList[i].y + rectList[i].height / 2);
			}
		}
		else if (nowEditing) {
			context.fillStyle = "rgba(200, 200, 0, 0.5)";
			context.strokeStyle = "rgb(180, 180, 0)";
			context.lineWidth = 5;
			context.fillRect(rectList[i].x,
							rectList[i].y,
							rectList[i].width,
							rectList[i].height);
			context.strokeRect(rectList[i].x,
							rectList[i].y,
							rectList[i].width,
							rectList[i].height);
			context.font = (rectList[i].height * 2)/5 +"px Arial";
			context.fillStyle = "rgba(0, 0, 0, 0.5)"
			context.textAlign = "center";
			context.fillText(rectList[i].id,
							rectList[i].x + rectList[i].width / 2,
							rectList[i].y + rectList[i].height / 2);
		}
	}

	if (nowEditing) {
		context.font = "20px Arial";
		context.fillStyle = "rgba(255, 0, 0, 0.5)"
		context.textAlign = "left";
		context.fillText("EDIT MODE",
						0,
						20);
	}
}

function onKeyPress(e) {
	if (e.keyCode == 122) {
		undo();
	}
}

function undo() {
	if (actionHistory.length > 0) {
		var action = actionHistory.pop();
		if (action.rectCreation) {
			rectList.pop();
		}
		else if (action.imageSet) {
			rectList[action.rectIndex].img = null;
		}
	}
	updateSelectList();
}

function onMouseDown() {
	nowSelecting = true;
	var pos = getCursorPosition();
	currentRectOrigin = new coord(pos.x, pos.y);
}

function onMouseUp() {
	nowSelecting = false;
	var pos = getCursorPosition();

	var topleft, width, height;
	width = Math.abs(pos.x - currentRectOrigin.x);
	height = Math.abs(pos.y - currentRectOrigin.y);

	if (pos.x - currentRectOrigin.x > 0) {
		if (pos.y - currentRectOrigin.y > 0) {
			topleft = new coord(currentRectOrigin.x, currentRectOrigin.y);
		}
		else {
			topleft = new coord(currentRectOrigin.x, pos.y);
		}
	}
	else {
		if (pos.y - currentRectOrigin.y > 0) {
			topleft = new coord(pos.x, currentRectOrigin.y);
		}
		else {
			topleft = new coord(pos.x, pos.y);
		}	
	}

	if (width + height > 30) {
		rectList.push(new rect(topleft.x, topleft.y, width, height, rectList.length + 1));
		updateSelectList();

		actionHistory[actionHistory.length] = new action(true, false, rectList.length);
	}
}

function updateSelectList() {
	var $select = $("#selected_rect");
	$select.empty();
	$.each(rectList, function(key, value) {
		$select.append($("<option></option>").attr("value", value.id).text("rect " + value.id));
	});
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

function setImage() {
	var topleft, width, height;
	width = Math.abs(currentRectDest.x - currentRectOrigin.x);
	height = Math.abs(currentRectDest.y - currentRectOrigin.y);

	var sel = document.getElementById("selected_rect");
	sel = sel[sel.selectedIndex].value;
	rectList[sel - 1].img = new Image();
	rectList[sel - 1].img.src = imageurl.value;

	actionHistory[actionHistory.length] = new action(false, true, sel - 1);
}