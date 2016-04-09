var points = {  // All points we have. Format {ID:{x:X, y:Y}, ...}
  last: 0,      // Last used ID
  insert: function(new_x, new_y) {  // Insert new point
  // returns id of added or exist point
    for (var i = 1; i <= this.last; i++) {
      if (this[i].x == new_x && this[i].y == new_y) {
        return i
      }
    }
    this.last++;
    this[this.last] = {x: new_x, y: new_y};
    return [this.last]
  }
}

var sections = {}; // List by names of arrays of line sections.
// Format {NAME:[[begin_point_ID, end_point_ID, state], ...], ...}
// state:
//     0 == just added,
//     1 == used,
//     2 == can not be used,
//     3 == is inside of not self polygon,
//     4 == is a mutual edge of two polygons.

function p_import(p_name, vertexes) {
// Import a polygon into points and sections
// p_name - polygon name to store in sections
// vertexes - array of {x:X, y:Y} that is the polygon contour
  var b_p = points.insert(vertexes[0].x, vertexes[0].y),
    c_p,  // current point ID
    ip = 1;
  sections[p_name] = [[b_p, null, 0],null];
  while (ip < vertexes.length) {
    c_p = points.insert(vertexes[ip].x, vertexes[ip].y);
    sections[p_name][ip-1][1] = c_p;
    sections[p_name][ip] = [c_p, null, 0];
    ip++;
  }
  sections[p_name][ip-1][1] = b_p;
}

var rel = {} // relative masures of four points for functions _X and find_X
  // Format: rel[base point][related point or vector product]

function _X(b1, e1, b2, e2) {
// rewrites global variable rel
// returns intersection mode of two line segments
// arguments are four point in format {x:X, y:Y}:
//   1, 2 - numbers of segments
//   b - segment begins
//   e - segment ends
// result:
//   'miss' - there is no mutual points except maybe ends
//   'b1', 'e1', 'b2' or 'e2' - specifies the name of mutual point
//       (if mutual is one of these four)
//   'stuck' - collinear
//   'X' - beautiful intersection :) not like above
  rel = {
    b1: {
      e1: {x:(e1.x - b1.x), y:(e1.y - b1.y)},
      b2: {x:(b2.x - b1.x), y:(b2.y - b1.y)},
      e2: {x:(e2.x - b1.x), y:(e2.y - b1.y)}
    }
  }
  rel.b1.zb = rel.b1.b2.x * rel.b1.e1.y - rel.b1.b2.y * rel.b1.e1.x;
  rel.b1.ze = rel.b1.e2.x * rel.b1.e1.y - rel.b1.e2.y * rel.b1.e1.x;
  rel.b1.zz = rel.b1.zb * rel.b1.ze;
  if (rel.b1.zz > 0) {
    return 'miss'      // The line segment 2 has no mutual point with the line 1
  }
  if ((rel.b1.zb == 0) && (rel.b1.ze == 0)) {
    return 'stuck'     // The line segment 2 is totaly inside the line 1
  }
  rel.b2 = {
    b1: {x:(b1.x - b2.x), y:(b1.y - b2.y)},
    e1: {x:(e1.x - b2.x), y:(e1.y - b2.y)},
    e2: {x:(e2.x - b2.x), y:(e2.y - b2.y)},
    base: (b2)         // This is only for 'find_X' function
  }
  rel.b2.zb = rel.b2.b1.x * rel.b2.e2.y - rel.b2.b1.y * rel.b2.e2.x;
  rel.b2.ze = rel.b2.e1.x * rel.b2.e2.y - rel.b2.e1.y * rel.b2.e2.x;
  rel.b2.zz = rel.b2.zb * rel.b2.ze;
  if (rel.b2.zz > 0) {
    return 'miss'      // The line segment 1 has no mutual point with the line 2
  }
  // Now I know that the line segment 1 and the line segment 2 have only one mutual point
  if (rel.b1.zz < 0) { // IF the line 1 cuts the line segment 2
    if (rel.b2.zz < 0) {
      return 'X'
    }
    // Now I know that the line segment 1 abuts the line segment 2
    if (rel.b2.zb == 0) {
      return 'b1'
    }
    return 'e1'
  }
  // Now I khow that the line segment 2 abuts the line 1
  if (rel.b2.zz == 0) {
    return 'miss'      // The segments are coupled
  }
  // Now I know that the line segment 2 abuts the line segment 1
  if (rel.b1.zb == 0) {
    return 'b2'
  }
  return 'e2'
}

function find_X() {
// Can be used olny if '_X' results 'X'
// Reads rel
// returns intersection point (see '_X' function)
  var ratio = Math.abs(rel.b1.zb/(rel.b1.zb - rel.b1.ze));
  return {
    x: rel.b2.base.x + ratio * rel.b2.e2.x,
    y: rel.b2.base.y + ratio * rel.b2.e2.y
  }
}

function dot_cuts(p_name, sect, pid) {
// Cuts the sect line segment at the p_name polygon by the pid point
  sections[p_name][sections[p_name].length] = [
    pid,
    sections[p_name][sect][1],
    0
  ];
  sections[p_name][sect][1] = pid
}

function intersects(fig1, fig2) {
  // Step 1. Import my polygons into database (points, sections)
  // Step 2. Exclude all intersections of line segments.
  //         Add every mutual point to 'points' and divide corespondent line segments
  // Step 3. Check every sections. Is it inside of not self polygon?
  // Step 4. Make some resulting polygons. I must use every section wich is inside
  //         of not self polygon. I can use mutual sections if needed.
  
  // Замените код функции на полноценную реализацию

  return [
    [
      { x: 60,  y: 240 },
      { x: 90,  y: 240 },
      { x: 120, y: 180 },
      { x: 90,  y: 90  },
      { x: 60,  y: 150 },
    ],
    [
      { x: 270, y: 240 },
      { x: 300, y: 240 },
      { x: 300, y: 150 },
      { x: 270, y: 90  },
      { x: 240, y: 180 },
    ],
    [
      { x: 150, y: 180 },
      { x: 180, y: 240 },
      { x: 210, y: 180 },
      { x: 210, y: 90  },
      { x: 180, y: 60  },
      { x: 150, y: 90  }
    ]
  ];
}
