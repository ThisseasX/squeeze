const {
  flow,
  reject,
  map,
  sum,
  eq,
  concat,
  get,
  includes,
  isEmpty,
} = require('lodash/fp');

const ROW_MAX = 12;
const ROW_MIN = 3;

const tryPushTile = (remnants, currentRow, tile) => {
  const { component, size } = tile;

  const remainingCapacity = ROW_MAX - flow(map('size'), sum)(currentRow);
  const remainingAfter = remainingCapacity - size;

  if (remainingCapacity >= size) {
    currentRow = concat(
      currentRow,
      remainingAfter < ROW_MIN ? { component, size: remainingCapacity } : tile,
    );

    remnants = reject(eq(tile), remnants);
  } else if (!includes(tile, remnants)) {
    remnants = concat(remnants, tile);
  }

  return {
    remnants,
    currentRow,
  };
};

const finalizeRow = (rows, currentRow) =>
  currentRow.length
    ? { rows: [...rows, currentRow], currentRow: [] }
    : { rows, currentRow };

const tryFinalizeRow = (rows, currentRow) => {
  const remainingCapacity = ROW_MAX - flow(map('size'), sum)(currentRow);

  return remainingCapacity === 0
    ? finalizeRow(rows, currentRow)
    : { rows, currentRow };
};

const tryEmptyStack = (
  stack = [],
  rows = [],
  currentRow = [],
  remnants = [],
  isRemnantPhase,
) =>
  stack.reduce(
    (res, tile) =>
      flow(
        args => ({
          ...args,
          ...tryPushTile(args.remnants, args.currentRow, tile),
        }),
        args => ({
          ...args,
          ...tryFinalizeRow(args.rows, args.currentRow),
        }),
        args =>
          isRemnantPhase
            ? args
            : tryEmptyStack(
                reject(eq(tile), args.remnants),
                args.rows,
                args.currentRow,
                args.remnants,
                true,
              ),
      )(res),
    { rows, currentRow, remnants },
  );

const balanceRows = rows =>
  rows.map(row => {
    const filledCapacity = flow(map('size'), sum)(row);

    return filledCapacity < 12
      ? row.map(tile => ({ ...tile, size: 12 / row.length }))
      : row;
  });

const getArrangement = (stack = [], rows = [], currentRow = []) =>
  flow(
    args => tryEmptyStack(args.stack, args.rows, args.currentRow),
    args => ({
      ...args,
      ...finalizeRow(args.rows, args.currentRow),
    }),
    args =>
      isEmpty(args.remnants)
        ? args
        : getArrangement(args.remnants, args.rows, args.currentRow),
  )({ stack, rows, currentRow });

const arrangeTiles = tiles => flow(
  getArrangement,
  get('rows'),
  balanceRows,
)(tiles);

module.exports = { arrangeTiles };
