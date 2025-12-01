
D4
------------------------------------------------------------

VERTICES (pixel coordinates):
  Point 4: x=1276.00, y=568.00
  Point 5: x=183.00, y=1984.00
  Point 6: x=1280.00, y=2755.00
  Point 7: x=2370.00, y=1981.00

EDGE CONNECTIONS:
  Connect point 7 to point 4 thick
  Connect point 6 to point 7 thick
  Connect point 5 to point 6 thick
  Connect point 4 to point 5 thick
 Connect point 4 to point 6 thin

AREAS:
Points 4 5 6 and back to 4 creates the left half of the triangular die
Points 4 7 6 and back to 4 creates the right half of the triangular die



D6
------------------------------------------------------------

VERTICES (pixel coordinates):
  Point 0: x=134.33, y=994.00
  Point 1: x=1270.00, y=1647.00
  Point 2: x=1270.33, y=2957.00
  Point 3: x=127.50, y=2305.50
  Point 4: x=2405.00, y=994.00
  Point 5: x=2411.50, y=2306.50
  Point 6: x=1269.00, y=328.50

EDGE CONNECTIONS:
  Connect points 3 and 0 thick
  Connect points 3 and 2 thick
  Connect points 5 and 2 thick
  Connect points 5 and 4 thick
  Connect points 6 and 4 thick
  Connect points 6 and 0 thick
  Connect points 1 and 0 thin
  Connect points 1 and 2 thin
  Connect points 1 and 4 thin

AREAS:
Points 0 1 4 6 and back to 0 creates the top face of the cube, facing up and forward, tilted 40 degrees towards the camera
Points 0 1 2 3 and back to 0 creates the left face of the cube, tilted 30 degrees left and slightly downwards
Points 1 2 5 4 and back to 1 creates the right face of the cube, tilted 30 degrees right and slightly downwards



D8
------------------------------------------------------------

VERTICES (pixel coordinates):
  Point 12: x=1267.00, y=431.00
  Point 13: x=272.00, y=1319.00
  Point 14: x=271.00, y=1974.00
  Point 15: x=1269.00, y=2863.00
  Point 16: x=2264.00, y=1976.00

EDGE CONNECTIONS:
  Connect point 12 to point 13 thick
  Connect point 13 to point 14 thick
  Connect point 14 to point 15 thick
  Connect point 15 to point 16 thick
  Connect point 16 to point 17 thick
  Connect point 17 to point 12 thick
  Connect point 12 to point 14 thin
  Connect point 12 to point 16 thin
  Conntect point 14 to 16 thin

AREAS:
Points 12 14 16 and back to 12 creates the top front area of the "prism", facing upwards
Points 15 14 16 and back to 15 creates the bottom front area of the "prism", facing downwards
Points 12 13 14 and back to 12 creates the top left face of the "prism", facing leftwards and up
Points 12 17 16 and back to 12 creates the top right face of the "prism", facing rightwards and up



D10
------------------------------------------------------------

ROTATE 90 DEGREES CLOCKWISE

VERTICES (pixel coordinates):
  Point 1: x=1466.67, y=2246.33
  Point 6: x=1759.00, y=1644.00
  Point 8: x=1467.67, y=1040.00
  Point 13: x=1030.00, y=494.00
  Point 14: x=140.00, y=1644.00
  Point 15: x=1039.00, y=2792.00
  Point 16: x=1480.00, y=2793.00
  Point 17: x=2383.00, y=1643.00
  Point 18: x=1484.00, y=495.00

EDGE CONNECTIONS:
Connect point 13 to point 14 thick
Connect point 14 to point 15 thick
Connect point 15 to point 16 thick
Connect point 16 to point 17 thick
Connect point 17 to point 18 thick
Connect point 18 to point 13 thick
Connect point 18 to point 8 thin
Connect point 8 to point 14 thin
Connect point 8 to point 6 thin
Connect point 6 to point 1 thin
Connect point 6 to point 17 thin
Connect point 1 to point 14 thin
Connect point 1 to point 16 thin

AREAS:
Points 6 8 14 1 and back to 6 creates the top front area of the "prism", facing upwards
Points 8 18 13 14 and back to 8 creates the top right face of the "prism", facing rightwards and up
Points 14 15 16 1 and back to 14 creates the top left face of the "prism", facing leftwards and up
Points 16 1 6 17 and back to 16 creates the bottom left face of the "prism", facing front/leftwards and down
Points 18 8 6 17 and back to 18 creates the bottom right face of the "prism", facing front/rightwards and down



D12
------------------------------------------------------------

ROTATE 90 DEGREES CLOCKWISE

VERTICES (pixel coordinates):
  Point 3: x=1044.00, y=2329.50
  Point 4: x=1829.33, y=2072.67
  Point 6: x=544.67, y=1653.33
  Point 11: x=1833.33, y=1235.67
  Point 12: x=1040.00, y=976.00
  Point 17: x=913.00, y=603.00
  Point 18: x=360.00, y=1010.00
  Point 19: x=153.00, y=1647.00
  Point 20: x=360.00, y=2300.00 // off, adjusted
  Point 21: x=913.00, y=2704.00
  Point 22: x=1600.00, y=2704.00
  Point 23: x=2153.00, y=2297.00
  Point 24: x=2361.00, y=1657.00
  Point 25: x=2140.00, y=1015.00 // off, adjusted
  Point 26: x=1602.00, y=603.00

EDGE CONNECTIONS:
Connect points 17 and 18 thick
Connect points 18 and 19 thick
Connect points 19 and 20 thick
Connect points 20 and 21 thick
Connect points 21 and 22 thick
Connect points 22 and 23 thick
Connect points 23 and 24 thick
Connect points 24 and 25 thick
Connect points 25 and 26 thick
Connect points 26 and 17 thick
Connect points 17 and 12 thin
Connect points 12 and 11 thin
Connect points 11 and 25 thin
Connect points 11 and 4 thin
Connect points 4 and 23 thin
Connect points 4 and 3 thin
Connect points 3 and 21 thin
Connect points 3 and 6 thin
Connect points 6 and 19 thin
Connect points 6 and 12 thin

AREAS:
Points 3 4 11 12 6 and back to 3 creates the main front pentagonal area facing straight forwards
Points 12 17 18 19 6 and back to 12 creates the top right face, facing rightwards and up
Points 6 3 21 20 19 and back to 6 creates the top left face, facing leftwards and up
Points 3 21 22 23 4 and back to 3 creates the bottom left face, facing leftwards and down
Points 4 23 24 25 11 and back to 4 creates the bottom face, facing forward and down
Points 11 25 26 17 12 and back to 11 creates the bottom right face, facing rightwards and down



D20
------------------------------------------------------------

VERTICES (pixel coordinates):
  Point 2: x=1931.00, y=2189.00
  Point 3: x=622.50, y=2188.00
  Point 13: x=1271.80, y=1066.20
  Point 19: x=1270.00, y=478.00
  Point 20: x=283.00, y=1048.00
  Point 21: x=282.00, y=2191.00
  Point 22: x=1274.00, y=2762.00
  Point 23: x=2261.00, y=2192.00
  Point 24: x=2262.00, y=1051.00

EDGE CONNECTIONS:
  Connect points 19 and 20 thick
  Connect points 20 and 21 thick
  Connect points 21 and 22 thick
  Connect points 22 and 23 thick
  Connect points 23 and 24 thick
  Connect points 24 and 19 thick
  Connect points 19 and 13 thin
  Connect points 13 and 20 thin
  Connect points 13 and 3 thin
  Connect points 13 and 2 thin
  Connect points 13 and 24 thin
  Connect points 20 and 3 thin
  Connect points 3 and 21 thin
  Connect points 3 and 22 thin
  Connect points 3 and 2 thin
  Connect points 2 and 22 thin
  Connect points 2 and 23 thin
  Connect points 2 and 24 thin

NOTES:
  Also, 21, 3, 2, and 23 can all have the same y value, since they are all on the same line
  Also, 20, 13, and 24 can all have the same y value, since they are all on the same line
  21 and 20 have the same x value, and 23 and 24 have the same x value

TOP AREAS:
Points 19 20 13 and back to 19 creates the top left triangle, facing 45 degrees left and 45 degrees up
Points 19 24 13 and back to 19 creates the top right triangle, facing 45 degrees right and 45 degrees up
BOTTOM AREAS:
Points 21 3 22 and back to 21 creates a narrow sliver on the bottom left, facing about 75 degrees left and 45 degrees down
Points 23 2 22 and back to 23 creates a narrow sliver on the bottom right, facing about 75 degrees right and 45 degrees down
Points 3 2 22 and back to 3 creates a large center triangle on the bottom, facing forward and 45 degrees down
MIDDLE AREAS:
Points 20 21 3 and back to 20 creates a narrow sliver on the left side of the main middle section, facing about 75 degrees left
Points 23 24 2 and back to 23 creates a narrow sliver on the right side of the main middle section, facing about 75 degrees right
Points 20 3 13 and back to 20 creates a large triangle just left of the middle, facing forward with about 10 degrees to the left
Points 24 2 13 and back to 24 creates a large triangle just right of the middle, facing forward with about 10 degrees to the right
Points 13 3 2 and back to 13 creates the most prominent center triangle, facing directly forward

