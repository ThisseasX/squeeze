const {
  flow,
  find,
  reject,
  findIndex,
  findLast,
  map,
  filter,
  reduce,
  sum,
  eq,
  concat,
} = require('lodash/fp');

const { inspect } = require('util');
const prevLog = console.log;
console.log = (v) => {
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

const ROW_MAX = 12;
const ROW_MIN = 3;

const tryPushTile = (future, currentRow, tile) => {
  const { component, size } = tile;

  const remainingCapacity =
    ROW_MAX - flow(map('size'), sum)(currentRow);

  const remainingAfter = remainingCapacity - size;

  if (remainingCapacity >= size) {
    if (remainingAfter < ROW_MIN) {
      currentRow = concat(currentRow, {
        component,
        size: remainingCapacity,
      });
    } else {
      currentRow = concat(currentRow, tile);
    }
  } else {
    future = concat(future, tile);
  }

  return {
    future,
    currentRow,
  };
};

const finalizeRow = (rows, currentRow) => ({
  rows: [...rows, currentRow],
  currentRow: [],
});

const tryFinalizeRow = (rows, currentRow) => {
  const remainingCapacity =
    ROW_MAX - flow(map('size'), sum)(currentRow);

  if (remainingCapacity === 0) {
    return finalizeRow(rows, currentRow);
  } else {
    return {
      rows,
      currentRow,
    };
  }
};

const tryEmptyFuture = (rows, future, currentRow) =>
  future.reduce(
    (res, tile) =>
      flow(
        (args) => ({
          ...args,
          ...tryFinalizeRow(args.rows, args.currentRow),
        }),
        (args) => ({
          ...args,
          ...tryPushTile(
            reject(eq(tile), args.future),
            args.currentRow,
            tile,
          ),
        }),
        (args) => ({
          ...args,
          ...tryFinalizeRow(args.rows, args.currentRow),
        }),
      )(res),
    {
      rows,
      future,
      currentRow,
    },
  );

console.log(
  tryEmptyFuture(
    [],
    [
      { component: '1', size: 8 },
      { component: '2', size: 12 },
      { component: '3', size: 4 },
      { component: '4', size: 4 },
    ],
    [{ component: '0', size: 12 }],
  ),
);

const f = (breakpoint) => {
  const brTiles = tiles.map(({ component, sizes }) => ({
    component,
    size: sizes[breakpoint],
  }));

  const res = brTiles.reduce(
    ({ rows, future, currentRow }, tile, i, arr) => {
      let remainingCapacity = currentRow
        .map((tile) => tile.size)
        .reduce((acc, cur) => acc - cur, 12);

      const newFuture = future.reduce((fTiles, fTile) => {
        if (remainingCapacity >= fTile.size) {
          const remainingAfter =
            remainingCapacity - fTile.size;
          const size =
            remainingAfter < 3
              ? remainingCapacity
              : fTile.size;

          currentRow.push({
            component: fTile.component,
            size,
          });

          remainingCapacity -= size;

          return fTiles;
        } else {
          return [...fTiles, fTile];
        }
      }, []);

      if (remainingCapacity < tile.size) {
        newFuture.push(tile);
      } else if (i !== arr.length - 1) {
        const remainingAfter =
          remainingCapacity - tile.size;
        const size =
          remainingAfter < 3
            ? remainingCapacity
            : tile.size;

        currentRow.push({
          component: tile.component,
          size,
        });

        remainingCapacity -= size;
      }

      if (remainingCapacity === 0) {
        rows.push([...currentRow]);
        currentRow.length = 0;
      } else if (i === arr.length - 1) {
        rows.push([...currentRow]);
        currentRow.length = 0;

        currentRow.push({
          component: tile.component,
          size: 12,
        });

        rows.push([...currentRow]);
        currentRow.length = 0;
      }

      return {
        rows,
        future: newFuture,
        currentRow,
      };
    },
    { rows: [], future: [], currentRow: [] },
  );

  return res;
};

const printRes = (rows) => {
  return rows.map((x) =>
    x.reduce((r, y) => r + y.component.repeat(y.size), ''),
  );
};

// const result = printRes(f('xl').rows);

// console.log(result);
