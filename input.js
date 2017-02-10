var mousePos = new coord(0, 0);

function onKeyPress(e) {
	switch (e.keyCode) {
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
	}
}

function mouseOverRect() {
	for (var i = 0; i < rectList.length; i++) {
		if (mousePos.x > rectList[i].x && mousePos.x < rectList[i].x + rectList[i].width &&
		mousePos.y > rectList[i].y && mousePos.y < rectList[i].y + rectList[i].height) {
			return i;
		}
	}

	return -1;
}

function getMouseSelectionOffset() {
	return new coord(mousePos.x - rectList[selectedRectIndex].x,
				mousePos.y - rectList[selectedRectIndex].y);
}

function onMouseDown() {
	var hover = mouseOverRect();
	if (hover != -1) {
		nowMovingRect = true;
		selectedRectIndex = hover;
		mouseSelectionOffset = getMouseSelectionOffset();
		waitingToRegisterMovingRectAsAction = true;
		return;
	}

	nowSelecting = true;
	selectedRectIndex = -1;
	currentRectOrigin = new coord(mousePos.x, mousePos.y);
}

function onMouseUp() {
	nowMovingRect = false;
	nowSelecting = false;

	if (mouseOverRect() != -1) return;

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
			null);
	}
}

function onMouseMove() {	
	if (nowMovingRect && selectedRectIndex != -1) {
		//só registra selecionar como ação se o usuário mover um retângulo
		if (waitingToRegisterMovingRectAsAction) {
			waitingToRegisterMovingRectAsAction = false;
			actionHistory[actionHistory.length] = new action(selectedRectIndex,
				false,
				false,
				true,
				new coord(rectList[selectedRectIndex].x,
					rectList[selectedRectIndex].y),
				false,
				null);
		}
		rectList[selectedRectIndex].x = mousePos.x - mouseSelectionOffset.x;
		rectList[selectedRectIndex].y = mousePos.y - mouseSelectionOffset.y;
	}
}