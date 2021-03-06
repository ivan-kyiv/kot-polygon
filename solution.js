var points = {  // All points we have. Format {ID:{x:X, y:Y}, ...}
  last: 0,      // Last used ID
  insert: function(new_p) {  // Insert new point
  // returns id of added or exist point
    for (var i = 1; i <= this.last; i++) {
      if (this[i].x == new_p.x && this[i].y == new_p.y) {
        return i
      }
    }
    this.last++;
    this[this.last] = new_p;
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
  var b_p = points.insert(vertexes[0]),
    c_p,  // current point ID
    ip = 1;
  sections[p_name] = [[b_p, null, 0],null];
  while (ip < vertexes.length) {
    c_p = points.insert(vertexes[ip]);
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

function kill_X(l_pol, r_pol) {
// Converts all intersections between two polygons into nodes
  var 
    i1 = 0,
    i2,
    np,
//    tmp,
    do_X = {
      miss: function() {},
      b1: function() {
        dot_cuts(r_pol, i2, sections[l_pol][i1][0])
      },
      e1: function() {
        dot_cuts(r_pol, i2, sections[l_pol][i1][1])
      },
      b2: function() {
        dot_cuts(l_pol, i1, sections[r_pol][i2][0])
      },
      e2: function() {
        dot_cuts(l_pol, i1, sections[r_pol][i2][1])
      },
      stuck: function() {},
      X: function() {
        np = points.insert(find_X());
        dot_cuts(l_pol, i1, np);
        dot_cuts(r_pol, i2, np)
      }
    }
  while (i1 < sections[l_pol].length) {
    for (i2 in sections[r_pol]) {
      do_X[
        _X(
          points[sections[l_pol][i1][0]],
          points[sections[l_pol][i1][1]],
          points[sections[r_pol][i2][0]],
          points[sections[r_pol][i2][1]]
        )
      ]()
//      alert('i1 = ' + i1 + ' i2 = ' + i2 + ' decide ' + tmp);
    }
//    alert(sections[l_pol].length);
    i1++
  }
}

function odd_sheaf(p_name, bp, ep) {
// Counts intersections of the p_name polygon and a line segment
// Result:
//   0 - even number of intersections
//   1 - odd number of intersections
//   2 - a touching interferes me
  var ip, my_X, my_res = 0;
  for (ip in sections[p_name]) {
    my_X = _X(bp, ep, points[sections[p_name][ip][0]], points[sections[p_name][ip][1]]);
    if (my_X != 'miss') {
      if (my_X == 'X') {
        my_res ^= 1
      } else {
        return 2
      }
    }
  }
  return my_res
}

function cull(l_pol, r_pol) {
// Marks every l_pol sections 2, 3 or 4 dependig position to r_pol
  var i, my_p, my_odd;
  for (i in sections[l_pol]) {
    my_p = {
      x: (points[sections[l_pol][i][0]].x + points[sections[l_pol][i][1]].x)/2,
      y: (points[sections[l_pol][i][0]].y + points[sections[l_pol][i][1]].y)/2
    }
    my_odd = odd_sheaf(r_pol, my_p, {x: 0, y: 0});
    if (my_odd == 0) {
      sections[l_pol][i][2] = 2
    } else if (my_odd == 1) {
      sections[l_pol][i][2] = 3
    } else {
      my_odd = odd_sheaf(r_pol, my_p, {x: -77, y: 0});
      if (my_odd == 0) {
        sections[l_pol][i][2] = 2
      } else if (my_odd == 1) {
        sections[l_pol][i][2] = 3
      } else {
        sections[l_pol][i][2] = 4
      }
    }
  }
}

function find_sec(polygons, from_p) {
// Finds a suitable section wich starts at specified point
// Format:
//   polygons = {1st poligon name, 2nd poligon name, ...}
//   from_p - point id or 'any'
// result = {p: polygon name, s: section, e: ending side}
//   ending side - 0 or 1.
  var i, p_name, p_i, mark, my_res = 'stop';
  for (p_i in polygons) {
    p_name = polygons[p_i];
    for (i in sections[p_name]) {
      mark = sections[p_name][i][2];
      if (mark > 2) {
        if (from_p == 'any') {
          if (mark == 3) {
            return {        // This is for the first section in a polygon
              p: p_name,
              s: i,
              e: 1
            }
          }
        } else if (sections[p_name][i][0] == from_p) {
          my_res = {            // The begining of the section is coupled to the previous
            p: p_name,
            s: i,
            e: 1
          }
          if (mark == 3) {
            return my_res
          }
        } else if (sections[p_name][i][1] == from_p) {
          my_res = {            // The ending of the section is coupled to the previous
            p: p_name,
            s: i,
            e: 0
          }
          if (mark == 3) {
            return my_res
          }
        }
      }
    }
  }
  return my_res
}

function intersects(fig1, fig2) {
  // Step 1. Import my polygons into database (points, sections)
  p_import('pol1',fig1);
  p_import('pol2',fig2);

  // Step 2. Exclude all intersections of line segments.
  //         Add every mutual point to 'points' and divide corespondent line segments
  kill_X('pol1', 'pol1');
  kill_X('pol2', 'pol2');
  kill_X('pol1', 'pol2');

  // Step 3. Check every sections. Is it inside of not self polygon?
  cull('pol1', 'pol2');
  cull('pol2', 'pol1');

  // Step 4. Make some resulting polygons. I must use every section wich is inside
  //         of not self polygon. I can use mutual sections if needed.
  var result = [], start_p, cp = -1, my_sec;
  while ((my_sec = find_sec(['pol1', 'pol2'], 'any')) != 'stop') {
    sections[my_sec.p][my_sec.s][2] = 1;
    start_p = sections[my_sec.p][my_sec.s][my_sec.e ^ 1];
    cp++;
    result[cp] = [
      points[start_p],
      points[sections[my_sec.p][my_sec.s][my_sec.e]]
    ];
    my_sec = find_sec(['pol1', 'pol2'], sections[my_sec.p][my_sec.s][my_sec.e]);
    while (sections[my_sec.p][my_sec.s][my_sec.e] != start_p) {
      sections[my_sec.p][my_sec.s][2] = 1;
      result[cp].push(points[sections[my_sec.p][my_sec.s][my_sec.e]]);
      my_sec = find_sec(['pol1', 'pol2'], sections[my_sec.p][my_sec.s][my_sec.e])
    }
    sections[my_sec.p][my_sec.s][2] = 1;
  }
  return result;
  
  // Замените код функции на полноценную реализацию
//
//  return [
//    [
//      { x: 60,  y: 240 },
//      { x: 90,  y: 240 },
//      { x: 120, y: 180 },
//      { x: 90,  y: 90  },
//      { x: 60,  y: 150 },
//    ],
//    [
//      { x: 270, y: 240 },
//      { x: 300, y: 240 },
//      { x: 300, y: 150 },
//      { x: 270, y: 90  },
//      { x: 240, y: 180 },
//    ],
//    [
//      { x: 150, y: 180 },
//      { x: 180, y: 240 },
//      { x: 210, y: 180 },
//      { x: 210, y: 90  },
//      { x: 180, y: 60  },
//      { x: 150, y: 90  }
//    ]
//  ];
}
