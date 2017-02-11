var template = new Image();
// template.crossOrigin = "Anonymous";

var cropcanvas, cropcontext;
var canvas, context, imageurl, templateurl, imagefile;
var fps = 60;
var waitingToRegisterMovingRectAsAction = false;

var rectList = [];
var currentRectOrigin = new coord(0, 0);
var currentRectDest = new coord(0, 0);

var selectedRectIndex = -1;
var mouseSelectionOffset = new coord(0, 0);

var cornerSize = 10;
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

function imgdata(img, sx, sy, swidth, sheight) {
	this.img = img;
	this.sx = sx;
	this.sy = sy;
	this.swidth = swidth;
	this.sheight = sheight;
}

function start() {
	canvas = document.getElementById("main_canvas");
	context = canvas.getContext("2d");

	cropcanvas = document.getElementById("crop_canvas"); 
	cropcontext = cropcanvas.getContext("2d");

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
		drawMainCanvas();
		drawCropCanvas();
	}, 1000/fps);

	document.getElementById("imagefile").addEventListener("change", handleImage, false);
	// document.getElementById("downloadcanvas").addEventListener("click", function() {
	// 	downloadCanvas(this, "test.png");
	// },
	// false);

	crop_start();
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

function drawMainCanvas() {
	if (!nowHidingCropCanvas) {
		canvas.width = 0;
		canvas.height = 0;
		return;
	}

	cleanCanvas();
	drawBackground();

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
	context.drawImage(template, 0, 0);
}

function drawImageEdit(ctx, rect) {
	ctx.globalAlpha = 0.5;
	ctx.drawImage(rect.imgdata.img,
		rect.imgdata.sx,
		rect.imgdata.sy,
		rect.imgdata.swidth,
		rect.imgdata.sheight,
		rect.x,
		rect.y,
		rect.width,
		rect.height);
	ctx.globalAlpha = 1;
}

function drawImageFull(ctx, rect) {
	ctx.drawImage(rect.imgdata.img,
		rect.imgdata.sx,
		rect.imgdata.sy,
		rect.imgdata.swidth,
		rect.imgdata.sheight,
		rect.x,
		rect.y,
		rect.width,
		rect.height);
}

function drawRectID(ctx, rect) {
	ctx.font = (rect.height * 2)/5 +"px Georgia";
	ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
	ctx.textAlign = "center";
	ctx.fillText(rect.id + 1,
		rect.x + rect.width / 2,
		rect.y + rect.height / 2);
}

function drawRectSelected(ctx, rect) {
	ctx.fillStyle = "rgba(105, 199, 217, 0.5)";
	ctx.strokeStyle = "rgba(37, 157, 179, 0.5)";
	ctx.lineWidth = rectLineWidth;
	ctx.fillRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
	ctx.strokeRect(rect.x,
		rect.y,
		rect.width,
		rect.height);

	drawRectCorners(ctx, rect, "rgba(37, 157, 179, 0.5)", "rgba(20, 47, 146, 0.5)");
}

function drawRectCorners(ctx, rect, color, selectedColor) {
	var corner = mouseOverRectCorner(rect);

  	ctx.beginPath();
	ctx.moveTo(rect.x, rect.y);
	ctx.lineTo(rect.x + cornerSize, rect.y);
	ctx.lineTo(rect.x, rect.y + cornerSize);
	ctx.closePath();
	ctx.fillStyle = color;
	if (corner == "topleft")
		ctx.fillStyle = selectedColor;	
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(rect.x + rect.width, rect.y);
	ctx.lineTo(rect.x + rect.width - cornerSize, rect.y);
	ctx.lineTo(rect.x + rect.width, rect.y + cornerSize);
	ctx.closePath();
	ctx.fillStyle = color;
	if (corner == "topright")
		ctx.fillStyle = selectedColor;	
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(rect.x, rect.y + rect.height);
	ctx.lineTo(rect.x + cornerSize, rect.y + rect.height);
	ctx.lineTo(rect.x, rect.y + rect.height - cornerSize);
	ctx.closePath();
	ctx.fillStyle = color;
	if (corner == "bottomleft")
		ctx.fillStyle = selectedColor;	
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(rect.x + rect.width , rect.y + rect.height);
	ctx.lineTo(rect.x + rect.width - cornerSize, rect.y + rect.height);
	ctx.lineTo(rect.x + rect.width , rect.y + rect.height - cornerSize);
	ctx.closePath();
	ctx.fillStyle = color;
	if (corner == "bottomright")
		ctx.fillStyle = selectedColor;	
	ctx.fill();

}

function drawRectUnselected(ctx, rect) {
	ctx.fillStyle = "rgba(255, 232, 79, 0.5)";
	ctx.strokeStyle = "rgb(216, 188, 5)";
	ctx.lineWidth = rectLineWidth;
	ctx.fillRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
	ctx.strokeRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
}

function renderRect(rect) {
	if (nowEditing) {
		if (rect.imgdata) {
			if (rect.id == selectedRectIndex) {
				drawRectSelected(context, rect);
			}

			drawImageEdit(context, rect);
			drawRectID(context, rect);
		}
		else {
			if (rect.id == selectedRectIndex) {
				drawRectSelected(context, rect);
			}
			else {
				drawRectUnselected(context, rect);
			}

			drawRectID(context, rect);
		}
	}
	else {
		if (rect.imgdata) {
			drawImageFull(context, rect);
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