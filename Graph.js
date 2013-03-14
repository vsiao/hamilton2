function Graph() {
  this.verticesById = {};
  this.vertices = [];
  this.edges = [];
}

Graph.prototype.addVertex = function(id, x, y) {
  if (this.verticesById.hasOwnProperty(id)) {
    throw new Error('addVertex: duplicate vertex id');
  }
  var vtx = new Vertex(id, x, y);
  this.verticesById[id] = vtx;
  this.vertices.push(vtx);
};

Graph.prototype.addEdge = function(id1, id2) {
  if (!this.verticesById.hasOwnProperty(id1) ||
      !this.verticesById.hasOwnProperty(id2)) {
    throw new Error('addEdge: endpoints are not vertices');
  }
  var v1 = this.verticesById[id1];
  var v2 = this.verticesById[id2];
  this.edges.push(new Edge(v1, v2));
};

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

Graph.prototype.setFocus = function(mouseX, mouseY) {
  this.focusElement = null;
  var vtx;
  for (i = 0; i < this.vertices.length; ++i) {
    vtx = this.vertices[i];
    if (dist(mouseX, mouseY, vtx.x, vtx.y) < vtx.r) {
      this.focusElement = vtx;
      return true;
    }
  }
  return false;
};

Graph.prototype.drawEdges = function(ctx) {
  var edge;
  for (i = 0; i < this.edges.length; ++i) {
    edge = this.edges[i];
    if (edge.v1 === this.focusElement ||
        edge.v2 === this.focusElement) {
      edge.once({strokeStyle: HAMILTON_COLORS.TEAL});
    }
    edge.draw(ctx);
  }
};

Graph.prototype.drawVertices = function(ctx) {
  var vtx;
  for (i = 0; i < this.vertices.length; ++i) {
    vtx = this.vertices[i];
    if (this.focusElement === vtx) {
      vtx.once({strokeStyle: HAMILTON_COLORS.RED});
    }
    vtx.draw(ctx);
  }
};

var Vertex = Drawable.extend({
  initialize: function(id, x, y) {
    this.id = id;
    this.r = 20;
    this.x = x;
    this.y = y;
  },
  drawOptions: {
    stroke: true,
    fill: true
  },
  drawStyle: {
    lineWidth: 5,
    strokeStyle: '#333',
    fillStyle: '#fff'
  },
  drawPath: function(ctx) {
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
  }
});

var Edge = Drawable.extend({
  initialize: function(v1, v2) {
    if (!(v1 instanceof Vertex) ||
        !(v2 instanceof Vertex)) {
      throw new Error('Edge: endpoints must be instances of Vertex.');
    }
    this.v1 = v1;
    this.v2 = v2;
  },
  drawOptions: {
    stroke: true
  },
  drawStyle: {
    lineWidth: 4,
    strokeStyle: '#333'
  },
  drawPath: function(ctx) {
    ctx.moveTo(this.v1.x, this.v1.y);
    ctx.lineTo(this.v2.x, this.v2.y);
  }
});
