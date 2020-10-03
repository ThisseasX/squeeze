const { flow, reject, map, sum, eq, concat } = require('lodash/fp');

const ROW_MAX = 12;
const ROW_MIN = 3;

const tryPushTile = (remnants, currentRow, tile) => {
  const { component, size } = tile;

  const remainingCapacity = ROW_MAX - flow(map('size'), sum)(currentRow);
  const remainingAfter = remainingCapacity - size;

  if (remainingCapacity >= size) {
    if (remainingAfter < ROW_MIN) {
      currentRow = concat(currentRow, { component, size: remainingCapacity });
    } else {
      currentRow = concat(currentRow, tile);
    }
  } else {
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
          ...tryPushTile(reject(eq(tile), args.remnants), args.currentRow, tile),
        }),
        args => ({
          ...args,
          ...tryFinalizeRow(args.rows, args.currentRow),
        }),
        args =>
          isRemnantPhase
            ? args
            : tryEmptyStack(args.remnants, args.rows, args.currentRow, [], true),
      )(res),
    {
      rows,
      currentRow,
      remnants,
    },
  );

const balanceRows = rows =>
  rows.map(row => {
    const filledCapacity = flow(map('size'), sum)(row);

    return filledCapacity < 12
      ? row.map(tile => ({ ...tile, size: 12 / row.length }))
      : row;
  });

const arrangeTiles = tiles =>
  flow(
    args => tryEmptyStack(args),
    args => ({
      ...args,
      ...finalizeRow(args.rows, args.currentRow),
    }),
    args => ({
      ...args,
      ...tryEmptyStack(args.remnants, args.rows, args.currentRow),
    }),
    args => balanceRows(args.rows),
  )(tiles);

module.exports = { arrangeTiles };
