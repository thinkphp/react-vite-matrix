import { useMemo, useState } from 'react'
import { determinant, inverse, transpose } from './matrixOperations.js'
import './App.css'

const makeMatrix = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(''))

function MatrixView({ matrix, label }) {
  return <div className="matrix-result"><div className="matrix-bracket"><div className="matrix-grid" style={{ '--cols': matrix[0]?.length || 1 }}>
    {matrix.flatMap((row, i) => row.map((value, j) => <span key={`${i}-${j}`}>{formatNumber(value)}</span>))}
  </div></div><span className="matrix-caption">{label}</span></div>
}

function formatNumber(value) {
  const rounded = Math.abs(value) < 1e-10 ? 0 : Number(value.toFixed(4))
  return String(rounded)
}

function App() {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [rowsInput, setRowsInput] = useState('3')
  const [colsInput, setColsInput] = useState('3')
  const [matrix, setMatrix] = useState(() => makeMatrix(3, 3))
  const [operation, setOperation] = useState('determinant')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const isSquare = rows === cols
  const complete = useMemo(() => matrix.every((row) => row.every((value) => value !== '' && Number.isFinite(Number(value)))), [matrix])

  function resize(nextRows, nextCols) {
    const safeRows = Math.min(8, Math.max(1, Number(nextRows) || 1))
    const safeCols = Math.min(8, Math.max(1, Number(nextCols) || 1))
    setRows(safeRows)
    setCols(safeCols)
    setRowsInput(String(safeRows))
    setColsInput(String(safeCols))
    setMatrix((old) => Array.from({ length: safeRows }, (_, i) => Array.from({ length: safeCols }, (_, j) => old[i]?.[j] ?? '')))
    setResult(null)
    setError('')
  }

  function updateCell(i, j, value) {
    setMatrix((old) => old.map((row, ri) => row.map((cell, cj) => (ri === i && cj === j ? value : cell))))
    setResult(null)
    setError('')
  }

  function calculate() {
    if (!complete) { setError('Enter a valid number in every matrix cell.'); setResult(null); return }
    if (operation !== 'transpose' && !isSquare) { setError('Determinant and inverse are only defined for square matrices.'); return }
    setError('')
    if (operation === 'transpose') setResult({ type: 'matrix', value: transpose(matrix), label: 'Transposed matrix' })
    if (operation === 'determinant') setResult({ type: 'number', value: determinant(matrix) })
    if (operation === 'inverse') {
      const value = inverse(matrix)
      if (!value) { setResult(null); setError('This matrix is singular (its determinant is 0), so it has no inverse.'); return }
      setResult({ type: 'matrix', value, label: 'Inverse matrix' })
    }
  }

  return <main className="page-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">▦</span> Matrix<span className="brand-dot">Lab</span></a><span className="top-note"><span className="online-dot" /> LINEAR ALGEBRA TOOLKIT</span></header>
    <section className="intro"><div className="eyebrow"><span /> MATRIX CALCULATOR <b>·</b> 01</div><h1>Make numbers <em>work for you.</em></h1><p>Explore matrix operations with a clean, interactive workspace.</p></section>
    <div className="workspace">
      <section className="card editor-card">
        <div className="card-heading"><div><span className="step">01</span><h2>Define your matrix</h2></div><span className="dimension-tag">{rows} × {cols}</span></div>
        <div className="dimensions"><label>ROWS<input type="text" inputMode="numeric" value={rowsInput} onChange={(e) => setRowsInput(e.target.value.replace(/\D/g, ''))} onBlur={() => resize(rowsInput, cols)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} /></label><span className="times">×</span><label>COLUMNS<input type="text" inputMode="numeric" value={colsInput} onChange={(e) => setColsInput(e.target.value.replace(/\D/g, ''))} onBlur={() => resize(rows, colsInput)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} /></label><span className="dimension-hint">UP TO 8 × 8</span></div>
        <div className="matrix-editor-wrap"><div className="matrix-editor" style={{ '--cols': cols }}>{matrix.map((row, i) => row.map((value, j) => <input key={`${i}-${j}`} aria-label={`Row ${i + 1}, column ${j + 1}`} type="number" step="any" placeholder="0" value={value} onChange={(e) => updateCell(i, j, e.target.value)} />))}</div></div>
        <div className="editor-footer"><span><i className={complete ? 'status-dot ready' : 'status-dot'} />{complete ? 'All cells filled' : 'Fill in every cell'}</span><button className="text-button" onClick={() => { setMatrix(makeMatrix(rows, cols)); setResult(null); setError('') }}>Clear values <span>↺</span></button></div>
      </section>
      <section className="card operation-card">
        <div className="card-heading"><div><span className="step">02</span><h2>Choose an operation</h2></div></div>
        <div className="operation-list">
          <button className={`operation-option ${operation === 'determinant' ? 'selected' : ''} ${!isSquare ? 'unavailable' : ''}`} onClick={() => setOperation('determinant')}><span className="op-icon">det</span><span className="op-copy"><strong>Determinant</strong><small>Returns a single scalar value</small></span><span className="radio" /></button>
          <button className={`operation-option ${operation === 'inverse' ? 'selected' : ''} ${!isSquare ? 'unavailable' : ''}`} onClick={() => setOperation('inverse')}><span className="op-icon">A⁻¹</span><span className="op-copy"><strong>Inverse</strong><small>Find the multiplicative inverse</small></span><span className="radio" /></button>
          <button className={`operation-option ${operation === 'transpose' ? 'selected' : ''}`} onClick={() => setOperation('transpose')}><span className="op-icon">Aᵀ</span><span className="op-copy"><strong>Transpose</strong><small>Swap rows and columns</small></span><span className="radio" /></button>
        </div>
        {!isSquare && <p className="inline-hint">A square matrix is required for determinant and inverse.</p>}
        <button className="calculate-button" onClick={calculate}>Calculate <span>→</span></button>
      </section>
      <section className={`card result-card ${result ? 'has-result' : ''}`}>
        <div className="card-heading"><div><span className="step">03</span><h2>Result</h2></div>{result && <span className="result-badge">COMPLETE</span>}</div>
        {error ? <div className="message error-message"><span>!</span>{error}</div> : result ? <div className="result-content">{result.type === 'number' ? <><span className="result-label">MATRIX DETERMINANT</span><strong className="det-value">{formatNumber(result.value)}</strong></> : <MatrixView matrix={result.value} label={result.label} />}</div> : <div className="empty-result"><span className="empty-icon">∑</span><span>Your result will appear here</span><small>Enter your matrix and select Calculate.</small></div>}
      </section>
    </div>
    <footer className="footer"><span>Built for curious minds.</span><span>Linear algebra <b>·</b> React + Vite</span></footer>
  </main>
}

export default App
