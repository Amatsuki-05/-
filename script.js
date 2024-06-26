// script.js
let operation = null;
let history = [];

function setOperation(op) {
    operation = op;
    document.getElementById('input-fields').innerHTML = ''; // フィールドのリセット
    addMatrixInputs();

    // 全てのボタンからアクティブクラスを削除
    const buttons = document.querySelectorAll('#operation-buttons button');
    buttons.forEach(button => button.classList.remove('active'));

    // クリックされたボタンにアクティブクラスを追加
    event.target.classList.add('active');
}

function addMatrixInputs() {
    const inputFields = document.getElementById('input-fields');
    const matrixAInput = document.createElement('textarea');
    matrixAInput.id = 'matrixA';
    matrixAInput.placeholder = '行列 A (行ごとに改行して入力)';
    matrixAInput.addEventListener('input', autoResize);
    inputFields.appendChild(matrixAInput);

    if (['+', '-', '*'].includes(operation)) {
        const matrixBInput = document.createElement('textarea');
        matrixBInput.id = 'matrixB';
        matrixBInput.placeholder = '行列 B (行ごとに改行して入力)';
        matrixBInput.addEventListener('input', autoResize);
        inputFields.appendChild(matrixBInput);
    } else if (['s', '^'].includes(operation)) {
        const scalarInput = document.createElement('input');
        scalarInput.type = 'number';
        scalarInput.id = 'scalar';
        scalarInput.placeholder = 'スカラー';
        inputFields.appendChild(scalarInput);
    }
}

function autoResize(event) {
    event.target.style.height = 'auto';
    event.target.style.height = (event.target.scrollHeight) + 'px';
}

function startCalculation() {
    const matrixA = parseMatrix(document.getElementById('matrixA').value);
    let result;
    let formula = '';

    try {
        if (['+', '-', '*'].includes(operation)) {
            const matrixB = parseMatrix(document.getElementById('matrixB').value);
            if (operation === '+') {
                result = addMatrices(matrixA, matrixB);
                formula = `${formatMatrixHTML(matrixA)} + ${formatMatrixHTML(matrixB)}`;
            }
            if (operation === '-') {
                result = subtractMatrices(matrixA, matrixB);
                formula = `${formatMatrixHTML(matrixA)} - ${formatMatrixHTML(matrixB)}`;
            }
            if (operation === '*') {
                result = multiplyMatrices(matrixA, matrixB);
                formula = `${formatMatrixHTML(matrixA)} * ${formatMatrixHTML(matrixB)}`;
            }
        } else if (operation === 's') {
            const scalar = parseFloat(document.getElementById('scalar').value);
            result = scalarMultiply(matrixA, scalar);
            formula = `${formatMatrixHTML(matrixA)} * ${scalar}`;
        } else if (operation === '^') {
            const power = parseInt(document.getElementById('scalar').value);
            result = matrixPower(matrixA, power);
            formula = `${formatMatrixHTML(matrixA)} ^ ${power}`;
        } else if (operation === 'r') {
            result = matrixRank(matrixA);
            formula = `rank(${formatMatrixHTML(matrixA)})`;
        } else if (operation === 'd') {
            result = matrixDeterminant(matrixA);
            formula = `det(${formatMatrixHTML(matrixA)})`;
        } else if (operation === 't') {
            result = transposeMatrix(matrixA);
            formula = `transpose(${formatMatrixHTML(matrixA)})`;
        } else if (operation === 'i') {
            result = inverseMatrix(matrixA);
            formula = `inverse(${formatMatrixHTML(matrixA)})`;
        }

        const isDuplicate = history.some(entry => entry.formula === formula);

        document.getElementById('result').innerHTML = formatMatrixHTML(result);

        if (isDuplicate) {
            document.getElementById('result-note').classList.remove('hidden');
        } else {
            document.getElementById('result-note').classList.add('hidden');
        }

        history.push({ operation, formula, result: formatMatrixHTML(result) });
        if (history.length > 10) history.shift();

        updateHistory();

    } catch (error) {
        document.getElementById('result').textContent = `エラー: ${error.message}`;
    }
}

function toggleHistory() {
    const historyDiv = document.getElementById('history');
    if (historyDiv.classList.contains('hidden')) {
        showHistory();
        historyDiv.classList.remove('hidden');
    } else {
        historyDiv.classList.add('hidden');
    }
}

function showHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '';
    history.forEach((entry, index) => {
        historyDiv.innerHTML += `<div class="history-entry"><strong>履歴 ${index + 1}:</strong> ${entry.formula} = <pre>${entry.result}</pre></div>`;
    });
}

function updateHistory() {
    const historyDiv = document.getElementById('history');
    if (!historyDiv.classList.contains('hidden')) {
        showHistory();
    }
}

// 行列のパース
function parseMatrix(matrixStr) {
    return matrixStr.trim().split('\n').map(row => row.trim().split(/\s+/).map(Number));
}

// 行列のフォーマット
function formatMatrixHTML(matrix) {
    if (typeof matrix === 'number') return matrix.toString();
    const rows = matrix.map(row => row.join(' '));
    return `<pre>${rows.join('\n')}</pre>`;
}

// 行列の加算
function addMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('行列のサイズが一致しません。');
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

// 行列の減算
function subtractMatrices(A, B) {
    if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('行列のサイズが一致しません。');
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

// 行列の乗算
function multiplyMatrices(A, B) {
    if (A[0].length !== B.length) throw new Error('行列のサイズが乗算に適していません。');
    return A.map((row, i) => B[0].map((_, j) => row.reduce((sum, _, n) => sum + A[i][n] * B[n][j], 0)));
}

// スカラー倍
function scalarMultiply(A, scalar) {
    return A.map(row => row.map(val => val * scalar));
}

// 行列の累乗
function matrixPower(A, power) {
    let result = A;
    for (let i = 1; i < power; i++) {
        result = multiplyMatrices(result, A);
    }
    return result;
}

// 行列のランク
function matrixRank(A) {
    // ランクの計算 (例として単純化した実装を使用)
    return A.length; // 実際にはランクを計算するアルゴリズムが必要
}

// 行列式
function matrixDeterminant(A) {
    if (A.length !== A[0].length) throw new Error('正方行列ではありません。');
    // 行列式の計算 (例として単純化した実装を使用)
    return 1; // 実際には行列式を計算するアルゴリズムが必要
}

// 転置行列
function transposeMatrix(A) {
    return A[0].map((_, i) => A.map(row => row[i]));
}

// 逆行列
function inverseMatrix(A) {
    if (A.length !== A[0].length) throw new Error('正方行列ではありません。');
    // 逆行列の計算 (例として単純化した実装を使用)
    return A; // 実際には逆行列を計算するアルゴリズムが必要
}


