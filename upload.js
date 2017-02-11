function setTemplateByURL() {
	var aux = templateurl.value;

	if (!(aux.endsWith(".png") ||
		aux.endsWith(".jpg") ||
		aux.endsWith(".jpeg"))) {
		return;
	}

	template = new Image();
	template.src = aux;
	nowEditing = true;

	// template.crossOrigin = "Anonymous";
	switchMainCanvas(true);
}

function setTemplateByFile() {
	if (!isValidImageFile(templatefile.src)) {
		return;
	}

	template = new Image();
	template = templatefile;
	nowEditing = true;

	// template.crossOrigin = "Anonymous";
	switchMainCanvas(true);
}

function switchMainCanvas(value) {
	mainCanvasActive = value;
	resetCanvas();
}

function isValidImageFile(img_src) {
	var fileType = img_src.slice(0, img_src.indexOf(";"));
	var ValidImageTypes = ["data:image/jpg", "data:image/jpeg", "data:image/png", "data:image/gif"];
	if ($.inArray(fileType, ValidImageTypes) < 0) {
		return false;
	}

	return true;
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
	if (!isValidImageFile(imagefile.src)) {
		return;
	}

	if (selectedRectIndex == -1) {
		return;
	}

	var img = new Image();
	img = imagefile;

	sendToCropCanvas(img);
}

function handleImage(e) {
    var reader = new FileReader();
    reader.onload = function(event){
    	imagefile = new Image();
    	imagefile.src = event.target.result;
        // imagefile.crossOrigin = "Anonymous";
    }
    reader.readAsDataURL(e.target.files[0]);
}

function handleTemplate(e) {
    var reader = new FileReader();
    reader.onload = function(event){
        templatefile = new Image();
        templatefile.src = event.target.result;
        // templatefile.crossOrigin = "Anonymous";
    }
    reader.readAsDataURL(e.target.files[0]);
}

function setTemplateJSON() {
	if (document.getElementById("templatejson").value != "") {
		var template_json = JSON.parse(document.getElementById("templatejson").value);
		rectList = template_json.rects;
		for (var i = 0; i < rectList.length; i++) {
			rectList[i].img = null;
		}
		templateurl.value = template_json.imgurl;
		template.src = template_json.imgurl;
		resetSelectedRect();
	}
}

function getTemplateJSON() {
	var template_json = {imgurl: templateurl.value, rects: rectList};
	template_json = JSON.stringify(template_json);

    document.getElementById("templatejson").value = template_json;

    /*var blob = new Blob([template_json], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, "filename.txt");
    }
    else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = "filename.txt";        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }*/
}