function downloadCanvas(link, filename) {
    link.href = canvas.toDataURL();
    link.download = filename;
}