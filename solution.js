var points; // All points we have. Format {ID:{x:X, y:Y}, ...}
var sections; // List by names of arrays of line sections.
              // Format {NAME:[[begin_point_ID, end_point_ID, state], ...], ...}
              // state:
              //     0 == just added,
              //     1 == used,
              //     2 == can not be used,
              //     3 == is inside of not self polygon,
              //     4 == is a mutual edge of two polygons.


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
