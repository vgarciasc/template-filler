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

function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
    	imagefile = new Image();
    	imagefile.src = event.target.result;
        // imagefile.crossOrigin = "Anonymous";
    }
    reader.readAsDataURL(e.target.files[0]);
}

function downloadCanvas(link, filename) {
    link.href = canvas.toDataURL();
    link.download = filename;
}