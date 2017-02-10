var actionHistory = [];

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
			rectList[action.rectIndex].img = null;
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
		var hover = mouseOverRect();
		var aux = rectList[selectedRectIndex];
		
		if (hover == selectedRectIndex) {
			mouseSelectionOffset = getMouseSelectionOffset();
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

function getTemplate() {
	template.src = templateurl.value;
	resetCanvas();
}

function getSelectedRectangle() {
	//var sel = document.getElementById("selected_rect");
	//sel = sel[sel.selectedIndex].value;
	//return sel - 1;

	return selectedRectIndex;
} 

function setImage() {
	var topleft, width, height;
	width = Math.abs(currentRectDest.x - currentRectOrigin.x);
	height = Math.abs(currentRectDest.y - currentRectOrigin.y);

	var sel = getSelectedRectangle();
	if (sel != -1) {
		rectList[sel].img = new Image();
		rectList[sel].img.src = imageurl.value;

		actionHistory[actionHistory.length] = new action(sel,
			false,
			true,
			false,
			new coord(0, 0),
			false,
			null);
	}
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