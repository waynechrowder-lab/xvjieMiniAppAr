export function canvasDrawBuffer(canvas, buffer, width, height) {
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(width, height);
  imageData.data.set(buffer);
  context.putImageData(imageData, 0, 0);
}