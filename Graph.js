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

Graph.prototype.drawEdges = function(ctx) {
  for (i = 0; i < this.edges.length; ++i) {
    this.edges[i].draw(ctx);
  }
};

Graph.prototype.drawVertices = function(ctx) {
  for (i = 0; i < this.vertices.length; ++i) {
    this.vertices[i].draw(ctx);
  }
};

var Vertex = Drawable.extend({
  initialize: function(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  },
  drawOptions: {
    stroke: true,
    fill: true
  },
  drawStyle: {
    lineWidth: 4,
    strokeStyle: '#f00',
    fillStyle: '#fff'
  },
  drawPath: function(ctx) {
    ctx.arc(this.x, this.y, 18, 0, 2*Math.PI);
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
    lineWidth: 3,
    strokeStyle: '#333'
  },
  drawPath: function(ctx) {
    ctx.moveTo(this.v1.x, this.v1.y);
    ctx.lineTo(this.v2.x, this.v2.y);
  }
});
