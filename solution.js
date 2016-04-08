var points = {  // All points we have. Format {ID:{x:X, y:Y}, ...}
  last: 0,      // Last used ID
  insert: function(new_x, new_y) {  // Insert new point
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

function intersects(fig1, fig2) {
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
