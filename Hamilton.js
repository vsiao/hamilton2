var ZOOM_LEVELS = [0.35, 0.5, 0.7, 1.0, 1.5, 2.5, 5.0];

function Hamilton(canvas) {
  this.canvas = canvas;
  this.graph = new Graph();
  this.graph.addVertex('a', 100, 100);
  this.graph.addVertex('b', 250, 150);
  this.graph.addEdge('a', 'b');
  this.zoomLevel = 3;
  this.scale = ZOOM_LEVELS[this.zoomLevel];
  this.x0 = 0;
  this.y0 = 0;
  this.options = {
    showGrid: true,
    gridSpacing: 50
  };
  var self = this;
  document.addEventListener('mousemove', this._onDocumentMouseMove.bind(this));
  document.addEventListener('mouseup', this._onDocumentMouseUp.bind(this));
  this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
}

Hamilton.prototype.zoomIn = function() {
  if (this._animating) {
    return;
  }
  if (this.zoomLevel < ZOOM_LEVELS.length - 1) {
    this._scaleTo(ZOOM_LEVELS[++this.zoomLevel]);
  }
};
Hamilton.prototype.zoomOut = function() {
  if (this._animating) {
    return;
  }
  if (this.zoomLevel > 0) {
    this._scaleTo(ZOOM_LEVELS[--this.zoomLevel]);
  }
};

Hamilton.prototype._scaleTo = function(endScale) {
  this._animating = true;
  var diff = endScale - this.scale;
  var self = this;
  function animate() {
    var rescale = self.scale + diff / 10;
    var centerOffset = (1 / self.scale) - (1 / rescale);
    self.x0 += centerOffset * self.canvas.width / 2;
    self.y0 += centerOffset * self.canvas.height / 2;
    self.scale = rescale;
    self.draw();
    if ((diff > 0 && self.scale < endScale) ||
        (diff < 0 && self.scale > endScale)) {
      setTimeout(animate, 30);
    } else {
      self.x0 = Math.floor(self.x0);
      self.y0 = Math.floor(self.y0);
      self.scale = endScale;
      self.draw();
      self._animating = false;
    }
  }
  animate();
};

Hamilton.prototype.draw = function() {
  var ctx = this.canvas.getContext('2d');
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.save();
  ctx.scale(this.scale, this.scale);
  ctx.translate(-this.x0, -this.y0);
  this._drawGrid(ctx);

  this.graph.drawEdges(ctx);
  // draw dummy edge

  this.graph.drawVertices(ctx);
  // draw dummy vertex

  ctx.restore();
};

Hamilton.prototype._snapToGrid = function(coord) {
  var gs = this.options.gridSpacing;
  return gs * Math.floor((coord + (gs/2)) / gs);
};

Hamilton.prototype._drawGrid = function(ctx) {
  var scaleW = this.canvas.width / this.scale;
  var scaleH = this.canvas.height / this.scale;
  var sp = this.options.gridSpacing;

  ctx.save();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1 / this.scale;
  for (i = this._snapToGrid(this.x0)+0.5; i < this.x0 + scaleW; i += sp) {
    ctx.beginPath();
    ctx.moveTo(i, this.y0)
    ctx.lineTo(i, this.y0 + scaleH);
    ctx.closePath();
    ctx.stroke();
  }
  for (i = this._snapToGrid(this.y0)+0.5; i < this.y0 + scaleH; i += sp) {
    ctx.beginPath();
    ctx.moveTo(this.x0, i);
    ctx.lineTo(this.x0 + scaleW, i);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
};

Hamilton.prototype._drawMousePos = function(ctx) {
  var xPosStr = '--';
  var yPosStr = '--';
  if (this._mouseX && this._mouseY) {
    xPosStr = '' + Math.floor(this._mouseX);
    yPosStr = '' + Math.floor(this._mouseY);
  }
  ctx.font = '18px Helvetica';
  ctx.fillText(xPosStr + ', ' + yPosStr, 10, this.canvas.height - 10);
};

Hamilton.prototype._onMouseDown = function(e) {
  this._mouseDownX = e.pageX;
  this._mouseDownY = e.pageY;
  this._objX = this.x0;
  this._objY = this.y0;
  e.preventDefault();
};

Hamilton.prototype._onDocumentMouseUp = function(e) {
  this._mouseDownX = this._mouseDownY = null;
  this.canvas.style.cursor = 'auto';

  // need to check canvas bounding box for further action
};

Hamilton.prototype._getCanvasPosition = function() {
  var accLeft = 0, accTop = 0;
  var node = this.canvas;
  if (node.offsetParent) {
    do {
      accLeft += node.offsetLeft;
      accTop += node.offsetTop;
    } while (node = node.offsetParent);
    return {
      x: accLeft,
      y: accTop
    };
  }
};

Hamilton.prototype._onDocumentMouseMove = function(e) {
  if (this._mouseDownX && this._mouseDownY) {
    // FIXME(vsiao) cross-browserize
    this.canvas.style.cursor = '-webkit-grabbing';

    var scaleDiffX = (e.pageX - this._mouseDownX) / this.scale;
    var scaleDiffY = (e.pageY - this._mouseDownY) / this.scale;
    this.x0 = this._objX - scaleDiffX;
    this.y0 = this._objY - scaleDiffY;
  } else {
    // only set if not dragging canvas
    var canvasPos = this._getCanvasPosition();
    this._mouseX = this.x0 + ((e.pageX - canvasPos.x) / this.scale);
    this._mouseY = this.y0 + ((e.pageY - canvasPos.y) / this.scale);
  }
  this.draw();
};
