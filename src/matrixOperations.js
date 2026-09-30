// Determinant: direct formula for 2x2, Sarrus' rule for 3x3,
// and Gaussian elimination with partial pivoting for larger matrices.
export function determinant(matrix) {
  const n = matrix.length
  const values = matrix.map((row) => row.map(Number))

  if (n === 2) {
    const [[a, b], [c, d]] = values
    return a * d - b * c
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = values
    return a * e * i + b * f * g + c * d * h
      - c * e * g - b * d * i - a * f * h
  }

  const work = values.map((row) => [...row])
  let result = 1
  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(work[row][col]) > Math.abs(work[pivot][col])) pivot = row
    }
    if (Math.abs(work[pivot][col]) < 1e-12) return 0
    if (pivot !== col) {
      ;[work[pivot], work[col]] = [work[col], work[pivot]]
      result *= -1
    }
    const pivotValue = work[col][col]
    result *= pivotValue
    for (let row = col + 1; row < n; row += 1) {
      const factor = work[row][col] / pivotValue
      for (let j = col + 1; j < n; j += 1) work[row][j] -= factor * work[col][j]
    }
  }
  return Math.abs(result) < 1e-10 ? 0 : result
}

// Inverse using Gauss-Jordan elimination with partial pivoting.
export function inverse(matrix) {
  const n = matrix.length
  const work = matrix.map((row, i) => [
    ...row.map(Number),
    ...Array.from({ length: n }, (_, j) => Number(i === j)),
  ])

  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(work[row][col]) > Math.abs(work[pivot][col])) pivot = row
    }
    if (Math.abs(work[pivot][col]) < 1e-12) return null
    ;[work[pivot], work[col]] = [work[col], work[pivot]]

    const divisor = work[col][col]
    work[col] = work[col].map((value) => value / divisor)
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue
      const factor = work[row][col]
      work[row] = work[row].map((value, j) => value - factor * work[col][j])
    }
  }

  return work.map((row) => row.slice(n))
}

export function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => Number(row[col])))
}
