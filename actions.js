var actionHistory = [];
var nowSelecting = false;
var nowEditing = true;
var nowMovingRect = false;
var nowResizing = false;
var resizeCorner = null;

function action(rectIndex, rectCreation, imageSet, rectMove, rectOriginalPos, rectRemove, removedRect) {
	this.rectCreation = rectCreation;
	this.imageSet = imageSet;
	this.rectMove = rectMove;
	this.rectOriginalPos = rectOriginalPos;
	this.rectIndex = rectIndex;
	this.rectRemove = rectRemove;
	this.removedRect = removedRect;
}

function toggleEdit() {
	nowEditing = !nowEditing;
}

function undo() {
	if (actionHistory.length > 0) {
		var action = actionHistory.pop();
		if (action.rectCreation) {
			rectList.pop();
		}
		else if (action.imageSet) {
			rectList[action.rectIndex].imgdata = null;
		}
		else if (action.rectMove) {
			rectList[action.rectIndex].x = action.rectOriginalPos.x;
			rectList[action.rectIndex].y = action.rectOriginalPos.y;
		}
		else if (action.rectRemove) {
			for (var i = rectList.length; i > action.rectIndex; i--) {
				rectList[i] = rectList[i - 1];
				rectList[i].id += 1;
			}
			rectList[action.rectIndex] = action.removedRect;
			selectedRectIndex = action.rectIndex;
		}
	}

	updateSelectList();
}

function duplicateSelectedRect() {
	if (selectedRectIndex != -1) {
		var aux = rectList[selectedRectIndex];
		var hover = mouseOverRect(aux);
		
		if (hover == selectedRectIndex) {
			mouseSelectionOffset = getMouseSelectionOffset(aux);
		}
		else {
			mouseSelectionOffset = new coord(aux.width / 2,
				aux.height / 2);
		}

		rectList[rectList.length] = new rect(mousePos.x - mouseSelectionOffset.x,
			mousePos.y - mouseSelectionOffset.y,
			aux.width,
			aux.height,
			rectList.length);
		selectedRectIndex = rectList.length - 1;
		nowMovingRect = true;

		actionHistory[actionHistory.length] = new action(selectedRectIndex,
			true,
			false,
			false,
			new coord(0,0),
			false,
			null);
	}
}

function getCursorPosition(e) {
    return {x: e.offsetX,
    		y: e.offsetY}
}

function setTemplate() {
	template.src = templateurl.value;
	nowEditing = true;
	// template.crossOrigin = "Anonymous";
	resetCanvas();
}

function getSelectedRectangle() {
	//var sel = document.getElementById("selected_rect");
	//sel = sel[sel.selectedIndex].value;
	//return sel - 1;

	return selectedRectIndex;
} 

function setImage(rect, imgdata) {
	rect.imgdata = imgdata;

	actionHistory[actionHistory.length] = new action(rect.id,
		false,
		true,
		false,
		new coord(0, 0),
		false,
		null);
}

function setImageByURL() {
	if (selectedRectIndex == -1) {
		return;
	}
	
	var img = new Image();
	img.src = imageurl.value;

	sendToCropCanvas(img);
}

function setImageByFile() {
	if (selectedRectIndex == -1) {
		return;
	}

	var img = new Image();
	img = imagefile;

	sendToCropCanvas(img);
}

function removeSelectedRect() {
	var sel = getSelectedRectangle();

	if (sel != -1) {
		actionHistory[actionHistory.length] = new action(sel,
			false,
			false,
			false,
			new coord(0, 0),
			true,
			rectList[sel]);

		for (var i = sel; i < rectList.length - 1; i++) {
			rectList[i] = rectList[i + 1];
			rectList[i].id -= 1;
		}

		rectList.length -= 1;
		resetSelectedRect();
		updateSelectList();
	}
}

function clearSelectedRect() {
	var sel = getSelectedRectangle();
	if (sel != -1) {
		rectList[sel].img = null;
	}
}

function resetSelectedRect() {
	selectedRectIndex = -1;
}

function initResize(corner, rect) {
	resizeCorner = corner;
	switch (corner) {
		case "topleft":
			resizeOriginalPoint = new coord(rect.x + rect.width,
				rect.y + rect.height);
			break;
		case "topright":
			resizeOriginalPoint = new coord(rect.x,
				rect.y + rect.height);
			break;
		case "bottomleft":
			resizeOriginalPoint = new coord(rect.x + rect.width,
				rect.y);
			break;
		case "bottomright":
			resizeOriginalPoint = new coord(rect.x,
				rect.y);
			break;
	}
}

function clamp(num, min) {
	if (num < min) return min;
	return num;
}

function resize(rect) {
	var minSize = 20;

	switch (resizeCorner) {
		case "topleft":
			if (resizeOriginalPoint.x - mousePos.x < minSize ||
				resizeOriginalPoint.y - mousePos.y < minSize) {
				break;
			}

			rect.x = mousePos.x;
			rect.y = mousePos.y;

			rect.width = resizeOriginalPoint.x - rect.x;
			rect.height = resizeOriginalPoint.y - rect.y;
			break;
		case "topright":
			if (resizeOriginalPoint.y - mousePos.y < minSize) {
				break;
			}

			rect.y = mousePos.y;

			rect.width = mousePos.x - resizeOriginalPoint.x;
			rect.height = resizeOriginalPoint.y - rect.y;
			break;
		case "bottomleft":
			if (resizeOriginalPoint.x - mousePos.x < minSize) {
				break;
			}

			rect.x = mousePos.x;

			rect.width = resizeOriginalPoint.x - rect.x;
			rect.height = mousePos.y - resizeOriginalPoint.y;
			break;
		case "bottomright":
			rect.width = mousePos.x - resizeOriginalPoint.x;
			rect.height = mousePos.y - resizeOriginalPoint.y;
			break;
	}

	rect.width = clamp(rect.width, minSize);
	rect.height = clamp(rect.height, minSize);
}