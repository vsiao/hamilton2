var ZOOM_LEVELS = [0.35, 0.5, 0.7, 1.0, 1.5, 2.5, 5.0];

function Hamilton(canvas) {
  this.canvas = canvas;
  this.zoomLevel = 3;
  this.scale = ZOOM_LEVELS[this.zoomLevel];
  this.centerX = 100;
  this.centerY = 100;
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
  var centerOffsetX = (canvasX - this.canvas.width / 2) / this.scale;
  var centerOffsetY = (canvasY - this.canvas.height / 2) / this.scale;
  return {
    x: this.centerX + centerOffsetX,
    y: this.centerY + centerOffsetY
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
    self.scale = self.scale + diff/10;
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
  ctx.translate(this.canvas.width/2, this.canvas.height/2);
  ctx.scale(this.scale, this.scale);
  ctx.translate(-this.centerX, -this.centerY);
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
  var x0 = this.centerX - scaleW / 2;
  var y0 = this.centerY - scaleH / 2;
  var sp = this.options.gridSpacing;

  ctx.save();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1 / this.scale;
  for (i = this._snapToGrid(x0); i < this.centerX + scaleW / 2; i += sp) {
    ctx.beginPath();
    ctx.moveTo(i, y0)
    ctx.lineTo(i, y0 + scaleH);
    ctx.closePath();
    ctx.stroke();
  }
  for (i = this._snapToGrid(y0); i < this.centerY + scaleH / 2; i += sp) {
    ctx.beginPath();
    ctx.moveTo(x0, i);
    ctx.lineTo(x0 + scaleW, i);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
};

Hamilton.prototype._onMouseDown = function(x, y, e) {
  console.log('mousedown');
  this._mouseDownX = e.pageX;
  this._mouseDownY = e.pageY;
  this._objX = this.centerX;
  this._objY = this.centerY;
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
    this.centerX = this._objX - (e.pageX - this._mouseDownX) / this.scale;
    this.centerY = this._objY - (e.pageY - this._mouseDownY) / this.scale;
    this.draw();
  }
};
