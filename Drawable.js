function Drawable(style, options) {
  this.x = 0;
  this.y = 0;
  this.label = 'DRAWABLE';
  this.style = style || {
    lineWidth: 5,
    strokeStyle: '#000',
    fillStyle: '#fff',
    fontSize: 12,
    fontFamily: 'Helvetica, Arial, sans-serif'
  };
  this.options = options || {
    stroke: false,
    fill: false,
    text: false
  };
}

Drawable.prototype.drawPath = function(ctx) {
  throw new Error('Drawable drawPath() not implemented');
};

Drawable.prototype.draw = function(ctx) {
  var drawStyle = this._onceStyle || this.style;
  var drawOptions = this._onceOptions || this.options;
  this._onceStyle = this._onceOptions = null;

  ctx.beginPath();
  this.drawPath(ctx);
  ctx.closePath();
  
  if (drawOptions.fill) {
    ctx.fillStyle = drawStyle.fillStyle;
    ctx.fill();
  }
  if (drawOptions.text) {
    ctx.font = '' + drawStyle.fontSize + 'px' + this.style.fontFamily;
    ctx.fillText(this.label, this.x, this.y);
  }
  if (drawOptions.stroke) {
    ctx.lineWidth = drawStyle.lineWidth;
    ctx.strokeStyle = drawStyle.strokeStyle;
    ctx.stroke();
  }
};

/**
 * Set drawing style and options which persist for only _one_ call to draw().
 */
Drawable.prototype.once = function(style, options) {
  this._onceStyle = {}, this._onceOptions = {};
  var prop;
  for (prop in this.style) {
    this._onceStyle[prop] = this.style[prop];
  }
  style = style || {};
  for (prop in style) {
    this._onceStyle[prop] = style[prop];
  }
  for (prop in this.options) {
    this._onceOptions[prop] = this.options[prop];
  }
  options = options || {};
  for (prop in options) {
    this._onceOptions[prop] = options[prop];
  }
};

Drawable.extend = function(props) {
  function constructor() {
    this.parent = Drawable.call(this, props.drawStyle, props.drawOptions);
    props.initialize.apply(this, arguments);
  }
  constructor.prototype.__proto__ = this.prototype;
  var propName;
  for (propName in props) {
    if (props.hasOwnProperty(propName)) {
      constructor.prototype[propName] = props[propName];
    }
  }
  return constructor;
};
