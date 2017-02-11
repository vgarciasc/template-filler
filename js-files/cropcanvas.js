var proportions = {h: 16, v: 9};
var currentImage = new Image();
var cropRect;
var cropRatio;

var mainCanvasActive = false;
var cropCanvasActive = false;

var c_nowResizing = false;

function crop_start() {
	cropcanvas.addEventListener("mousedown", c_onMouseDown, false);
	cropcanvas.addEventListener("mouseup", c_onMouseUp, false);
	cropcanvas.addEventListener("mousemove", function(e) {
			mousePos = getCursorPosition(e);
			c_onMouseMove();
		}, false);
}

function c_onMouseDown() {
	var corner = mouseOverRectCorner(cropRect);
	if (corner) {
		c_nowResizing = true;
		initResize(corner, cropRect);
		return;
	}

	if (mouseOverRect(cropRect)) {
		nowMovingRect = true;
		mouseSelectionOffset = getMouseSelectionOffset(cropRect);
		return;
	}
}

function c_onMouseUp() {
	nowMovingRect = false;
	c_nowResizing = false;
}

function c_onMouseMove() {
	if (nowMovingRect) {
		if (mousePos.x - mouseSelectionOffset.x + cropRect.width < cropcanvas.width &&
			mousePos.x - mouseSelectionOffset.x > 0 &&
			mousePos.y - mouseSelectionOffset.y + cropRect.height < cropcanvas.height &&
			mousePos.y - mouseSelectionOffset.y > 0) {
			cropRect.x = mousePos.x - mouseSelectionOffset.x;
			cropRect.y = mousePos.y - mouseSelectionOffset.y;
		}
	}

	if (c_nowResizing) {
		c_resize(resizeCorner);
	}
}

function c_resize(corner) {
	var minSize = 20;

	var x, y, width, height;

	switch (corner) {
		case "topleft":
			if (resizeOriginalPoint.x - mousePos.x < minSize ||
				resizeOriginalPoint.y - mousePos.y < minSize) {
				break;
			}

			x = mousePos.x;

			width = resizeOriginalPoint.x - x;
			height = width / cropRatio;

			y = resizeOriginalPoint.y - height;

			break;
		case "topright":
			if (resizeOriginalPoint.y - mousePos.y < minSize) {
				break;
			}

			y = mousePos.y;
			height = resizeOriginalPoint.y - y;
			width = height * cropRatio;

			x = cropRect.x;
			break;
		case "bottomleft":
			if (resizeOriginalPoint.x - mousePos.x < minSize) {
				break;
			}

			x = mousePos.x;
			width = resizeOriginalPoint.x - x;
			height = width / cropRatio;

			y = cropRect.y;
			break;
		case "bottomright":
			width = mousePos.x - resizeOriginalPoint.x;
			height = width / cropRatio;
			x = cropRect.x;
			y = cropRect.y;
			break;
	}

	if (x < 0 || x > cropcanvas.width || y < 0 || y > cropcanvas.height ||
		x + width < 0 || x + width > cropcanvas.width ||
		y + height < 0 || y + height > cropcanvas.height ||
		mousePos.x < 0 || mousePos.x > cropcanvas.width ||
		mousePos.y < 0 || mousePos.y > cropcanvas.height) {
		x = y = width = height = null;
	}

	if (x) {
		cropRect.x = x;
	}
	if (y) {
		cropRect.y = y;
	}
	if (width) {
		cropRect.width = width;
	}
	if (height) {
		cropRect.height = height;
	}
}

function cancelCrop() {
	mainCanvasActive = true;
	cropCanvasActive = false;
}

function sendCropToMainCanvas() {
	if (selectedRectIndex != -1) {
		var rect = rectList[selectedRectIndex];

		setImage(rect, new imgdata(currentImage,
			cropRect.x,
			cropRect.y,
			cropRect.width,
			cropRect.height));

			mainCanvasActive = true;
			cropCanvasActive = false;
	}
}

function sendToCropCanvas(img) {
	currentImage = img;
	
	var aux = rectList[selectedRectIndex];
	cropRect = new rect(0,
		0,
		aux.width,
		aux.height,
		-2);
	cropRatio = aux.width / aux.height;
	toggleCanvases();
}

function manageHTMLButtons() {
	if (mainCanvasActive) {
		$("#main-canvas").show();
	}
	else {
		$("#main-canvas").hide();
	}

	if (cropCanvasActive) {
		$("#crop-canvas").show();
	}
	else {
		$("#crop-canvas").hide();
	}

	if (selectedRectIndex != -1) {
		$(".upload-image-button").prop("disabled", false);
	}
	else {
		$(".upload-image-button").prop("disabled", true);
	}
}

function drawCropCanvas() {
	cropcanvas.width = currentImage.width;
	cropcanvas.height = currentImage.height;

	cropcontext.globalAlpha = 0.5;
	cropcontext.drawImage(currentImage, 0, 0);
	cropcontext.globalAlpha = 1;

	if (cropRect) {
		drawCropRect(cropcontext, cropRect);
	}
}

function drawCropRect(ctx, rect) {
	ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
	ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
	ctx.lineWidth = rectLineWidth;
	ctx.fillRect(rect.x,
		rect.y,
		rect.width,
		rect.height);
	ctx.strokeRect(rect.x,
		rect.y,
		rect.width,
		rect.height);

	drawRectCorners(ctx,
		rect,
		"rgba(30, 30, 30, 0.5)",
		"rgb(0, 0, 0)");
}

function toggleCanvases() {
	mainCanvasActive = !mainCanvasActive;
	cropCanvasActive = !cropCanvasActive;
}