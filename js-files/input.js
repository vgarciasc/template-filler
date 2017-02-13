var mousePos = new coord(0, 0);

var resizeOriginalPoint = new coord(0, 0);

function onKeyDown(e) {
	var x = e.which || e.keyCode;
	if (selectedRectIndex != -1) {
		e.preventDefault();
		var rect = rectList[selectedRectIndex];
		//left
		if (x == 37) {
			rect.x -= 1;
		}
		//up
		if (x == 38) {
			rect.y -= 1;
		}
		//right
		if (x == 39) {
			rect.x += 1;
		}
		//down
		if (x == 40) {
			rect.y += 1;
		}
	}
}

function onKeyPress(e) {
	var x = e.which || e.keyCode;
	switch (x) {
		//Z
		case 122:
			undo();
			break;
		//D
		case 100:
			duplicateSelectedRect();
			break;
		//R
		case 114:
			removeSelectedRect();
			break;
		//C
		case 99:
			clearSelectedRect();
			break;
		//W
		case 119:
			resetCanvas();
			break;
		//T
		case 116:
			toggleEdit();
			break;
	}
}

function mouseOverRect(rect) {
	return (mousePos.x > rect.x && mousePos.x < rect.x + rect.width &&
		mousePos.y > rect.y && mousePos.y < rect.y + rect.height);
}

function mouseOverAnyRect() {
	for (var i = 0; i < rectList.length; i++) {
		if (mouseOverRect(rectList[i])) {
			return i;
		}
	}

	return -1;
}

function mouseOverRectCorner(rect) {
	var aux = null;
	var offset = cornerSize/2;

	if (mousePos.x > rect.x - offset && mousePos.x < rect.x + cornerSize + offset &&
	mousePos.y > rect.y - offset && mousePos.y < rect.y + cornerSize + offset) {
		aux = "topleft";
	}
	if (mousePos.x < rect.x + rect.width + offset && mousePos.x > rect.x + rect.width - cornerSize - offset &&
	mousePos.y > rect.y - offset && mousePos.y < rect.y + cornerSize + offset) {
		aux = "topright";
	}
	if (mousePos.x > rect.x - offset && mousePos.x < rect.x + cornerSize + offset &&
	mousePos.y < rect.y + rect.height + offset && mousePos.y > rect.y + rect.height - cornerSize - offset) {
		aux = "bottomleft";
	}
	if (mousePos.x < rect.x + rect.width + offset && mousePos.x > rect.x + rect.width - cornerSize - offset &&
	mousePos.y < rect.y + rect.height + offset && mousePos.y > rect.y + rect.height - cornerSize - offset) {
		aux = "bottomright";
	}

	return aux;
}

function getMouseSelectionOffset(rect) {
	return new coord(mousePos.x - rect.x,
		mousePos.y - rect.y);
}

function onMouseDown() {
	if (!nowEditing) return;

	var hover = mouseOverAnyRect();
	if (hover != -1) {
		selectedRectIndex = hover;
		var cornerHover = mouseOverRectCorner(rectList[hover]);
		
		if (cornerHover) {
			nowResizing = true;
			initResize(cornerHover, rectList[selectedRectIndex]);
			return;
		}
		else {
			nowMovingRect = true;
			mouseSelectionOffset = getMouseSelectionOffset(rectList[selectedRectIndex]);
			waitingToRegisterMovingRectAsAction = true;
			return;
		}
	}

	nowSelecting = true;
	selectedRectIndex = -1;
	currentRectOrigin = new coord(mousePos.x, mousePos.y);
}

function onMouseUp() {
	if (!nowEditing) return;

	nowMovingRect = false;
	nowSelecting = false;

	if (nowResizing) {
		nowResizing = false;
		return;
	}

	if (mouseOverAnyRect() != -1) return;

	var topleft, width, height;
	width = Math.abs(mousePos.x - currentRectOrigin.x);
	height = Math.abs(mousePos.y - currentRectOrigin.y);

	if (mousePos.x - currentRectOrigin.x > 0) {
		if (mousePos.y - currentRectOrigin.y > 0) {
			topleft = new coord(currentRectOrigin.x, currentRectOrigin.y);
		}
		else {
			topleft = new coord(currentRectOrigin.x, mousePos.y);
		}
	}
	else {
		if (mousePos.y - currentRectOrigin.y > 0) {
			topleft = new coord(mousePos.x, currentRectOrigin.y);
		}
		else {
			topleft = new coord(mousePos.x, mousePos.y);
		}	
	}

	//impede criação desproposital de retangulos pequenininhos
	if (width + height > 30) {
		rectList.push(new rect(topleft.x, topleft.y, width, height, rectList.length));
		updateSelectList();

		selectedRectIndex = rectList.length - 1;
		actionHistory[actionHistory.length] = new action(rectList.length,
			true,
			false,
			false,
			new coord(0, 0),
			false,
			null,
			false,
			null);
	}
}

function onMouseMove() {	
	if (!nowEditing) return;

	var rect = rectList[selectedRectIndex];
	
	if (nowMovingRect) {
		//só registra selecionar como ação se o usuário mover um retângulo
		if (waitingToRegisterMovingRectAsAction) {
			waitingToRegisterMovingRectAsAction = false;
			actionHistory[actionHistory.length] = new action(selectedRectIndex,
				false,
				false,
				true,
				new coord(rect.x,
					rect.y),
				false,
				null,
				false,
				null);
		}
		rect.x = mousePos.x - mouseSelectionOffset.x;
		rect.y = mousePos.y - mouseSelectionOffset.y;
	}

	if (nowResizing && selectedRectIndex != -1) {
		resize(rect);
	}
}