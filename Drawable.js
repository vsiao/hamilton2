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
  ctx.beginPath();
  this.drawPath(ctx);
  ctx.closePath();
  
  if (this.options.fill) {
    ctx.fillStyle = this.style.fillStyle;
    ctx.fill();
  }
  if (this.options.text) {
    ctx.font = '' + this.style.fontSize + 'px' + this.style.fontFamily;
    ctx.fillText(this.label, this.x, this.y);
  }
  if (this.options.stroke) {
    ctx.lineWidth = this.style.lineWidth;
    ctx.strokeStyle = this.style.strokeStyle;
    ctx.stroke();
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
