const { arrangeTiles } = require('./squeeze');

const { inspect } = require('util');
const prevLog = console.log;
console.log = v => {
  prevLog(inspect(v, false, 100, true));
};

const tiles = [
  {
    component: '0',
    sizes: { xl: 4 },
  },
  {
    component: '1',
    sizes: { xl: 4 },
  },
  {
    component: '2',
    sizes: { xl: 4 },
  },
  {
    component: '3',
    sizes: { xl: 6 },
  },
  {
    component: '4',
    sizes: { xl: 6 },
  },
  {
    component: '5',
    sizes: { xl: 3 },
  },
  {
    component: '6',
    sizes: { xl: 3 },
  },
  {
    component: '7',
    sizes: { xl: 3 },
  },
  {
    component: '8',
    sizes: { xl: 3 },
  },
  {
    component: '9',
    sizes: { xl: 12 },
  },
  {
    component: 'A',
    sizes: { xl: 8 },
  },
  {
    component: 'B',
    sizes: { xl: 4 },
  },
  {
    component: 'C',
    sizes: { xl: 4 },
  },
];

const testTiles = [
  { component: '1', minSize: 8, order: 4 },
  { component: '2', minSize: 12, order: 3 },
  { component: '3', minSize: 6, order: 2 },
  { component: '4', minSize: 6, order: 5 },
  { component: '5', minSize: 4, order: 1 },
  { component: '6', minSize: 4, order: 6 },
  { component: '7', minSize: 12, order: 0 },
];

const printResult = rows => {
  return rows.map(row =>
    row.reduce(
      (line, { component, size }) =>
        line + component.repeat(size),
      '',
    ),
  );
};

console.log(arrangeTiles(testTiles));

console.log(printResult(arrangeTiles(testTiles)));

console.log(
  printResult(
    arrangeTiles(
      tiles.map(({ component, sizes }) => ({
        component,
        minSize: sizes['xl'],
      })),
    ),
  ),
);
