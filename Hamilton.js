var ZOOM_LEVELS = [0.35, 0.5, 0.7, 1.0, 1.5, 2.5, 5.0];

function Hamilton(canvas) {
  this.canvas = canvas;
  this.zoomLevel = 3;
  this.scale = ZOOM_LEVELS[this.zoomLevel];
  this.x0 = 0;
  this.y0 = 0;
  this.options = {
    showGrid: true,
    gridSpacing: 50
  };
  var self = this;
  this._listeners = {
    mousemove: function() { self._onMouseMove.apply(self, arguments); },
    mousedown: function() { self._onMouseDown.apply(self, arguments); },
    mouseup: function() { self._onMouseUp.apply(self, arguments); }
  };
  var type;
  for (type in this._listeners) {
    function wrapListener() {
      var listener = self._listeners[type];
      return function(e) {
        var coords = self._scaleInput(e.offsetX, e.offsetY);
        listener.call(self, coords.x, coords.y, e);
      };
    }
    this.canvas.addEventListener(type, wrapListener());
  }
}

Hamilton.prototype.zoomIn = function() {
  if (this.zoomLevel < ZOOM_LEVELS.length - 1) {
    this._scaleTo(ZOOM_LEVELS[++this.zoomLevel]);
  }
};
Hamilton.prototype.zoomOut = function() {
  if (this.zoomLevel > 0) {
    this._scaleTo(ZOOM_LEVELS[--this.zoomLevel]);
  }
};

Hamilton.prototype._scaleInput = function(canvasX, canvasY) {
  return {
    x: canvasX / this.scale,
    y: canvasY / this.scale
  };
};

Hamilton.prototype._scaleTo = function(endScale) {
  if (this._animating) {
    return;
  }
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
  for (i = this._snapToGrid(this.x0)-0.5; i < this.x0 + scaleW; i += sp) {
    ctx.beginPath();
    ctx.moveTo(i, this.y0)
    ctx.lineTo(i, this.y0 + scaleH);
    ctx.closePath();
    ctx.stroke();
  }
  for (i = this._snapToGrid(this.y0)-0.5; i < this.y0 + scaleH; i += sp) {
    ctx.beginPath();
    ctx.moveTo(this.x0, i);
    ctx.lineTo(this.x0 + scaleW, i);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
};

Hamilton.prototype._onMouseDown = function(x, y, e) {
  console.log('mousedown');
  this._mouseDownX = e.pageX;
  this._mouseDownY = e.pageY;
  this._objX = this.x0;
  this._objY = this.y0;
  e.preventDefault();
};

Hamilton.prototype._onMouseUp = function(x, y, e) {
  this._mouseDownX = this._mouseDownY = null;
  this.canvas.style.cursor = 'auto';
};

Hamilton.prototype._onMouseMove = function(x, y, e) {
  console.log('mousemove');
  if (this._mouseDownX && this._mouseDownY) {
    // FIXME(vsiao) cross-browserize
    this.canvas.style.cursor = '-webkit-grabbing';
    this.x0 = this._objX - (e.pageX - this._mouseDownX) / this.scale;
    this.y0 = this._objY - (e.pageY - this._mouseDownY) / this.scale;
    this.draw();
  }
};
