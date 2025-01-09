document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.getElementById('main-grid');
    
    // Créer une grille de 20x20
    for (let i = 0; i < 400; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;  // Ajouter un index pour chaque cellule
        mainGrid.appendChild(cell);
    }

    // Positions de départ pour les joueurs (4 coins)
    const startPositions = [0, 19, 380, 399];
    const playerColors = ['blue', 'yellow', 'green', 'red'];
    
    startPositions.forEach((pos, index) => {
        const startCell = mainGrid.children[pos];
        startCell.style.backgroundColor = playerColors[index];
    });

    // Gestion de la sélection des pièces
    const pieces = [
        [[1]], // Pièce 1
        [[1, 1]], // Pièce 2
        [[1, 1, 1]], // Pièce 3
        [[1, 0], [1, 1]], // Pièce 4
        [[1, 1, 1, 1]], // Pièce 5
        [[1, 1], [1, 1]], // Pièce 6
        [[1, 1, 1], [0, 0, 1]], // Pièce 7
        [[1, 1, 0], [0, 1, 1]], // Pièce 8
        [[1, 0], [1, 1], [1, 0]], // Pièce 9
        [[1, 1, 1, 1, 1]], // Pièce 10
        [[1, 1, 1, 1], [0, 0, 0, 1]], // Pièce 11
        [[1, 1, 0, 0], [0, 1, 1, 1]], // Pièce 12
        [[1, 1, 1], [1, 0, 1]], // Pièce 13
        [[1, 1, 1], [0, 1, 1]], // Pièce 14
        [[0, 1, 0, 0], [1, 1, 1, 1]], // Pièce 15
        [[0, 0, 1], [1, 1, 1], [0, 0, 1]], // Pièce 16
        [[0, 0, 1], [0, 0, 1], [1, 1, 1]], // Pièce 17
        [[0, 0, 1], [0, 1, 1], [1, 1, 0]], // Pièce 18
        [[1, 0, 0], [1, 1, 1], [0, 0, 1]], // Pièce 19
        [[0, 1, 0], [1, 1, 1], [0, 1, 0]], // Pièce 20
        [[1, 0, 0], [1, 1, 1], [0, 1, 0]], // Pièce 21
    ];
    const pieceList = document.getElementById('piece-list');
    const piecePreview = document.getElementById('piece-preview');

    let currentPiece = null;
    let currentPieceElement = null;
    const playerPieces = [new Set(pieces), new Set(pieces), new Set(pieces), new Set(pieces)];
    let currentPlayer = 0; // 0: Blue, 1: Yellow, 2: Green, 3: Red

    function renderPiece(piece, container) {
        container.innerHTML = '';
        const size = 5; // Taille de la grille de prévisualisation

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const div = document.createElement('div');
                if (r < piece.length && c < piece[0].length) {
                    div.style.backgroundColor = piece[r][c] ? playerColors[currentPlayer] : 'transparent';
                } else {
                    div.style.backgroundColor = 'transparent';
                }
                container.appendChild(div);
            }
        }
    }

    function rotatePiece(piece, direction) {
        const rows = piece.length;
        const cols = piece[0].length;
        const newPiece = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (direction === 'right') {
                    newPiece[c][rows - 1 - r] = piece[r][c];
                } else if (direction === 'left') {
                    newPiece[cols - 1 - c][r] = piece[r][c];
                }
            }
        }
        return newPiece;
    }

    function canPlacePiece(piece, startIndex) {
        const size = 20; // Taille de la grille principale
        const rowStart = Math.floor(startIndex / size);
        const colStart = startIndex % size;
        let hasCornerConnection = false;

        for (let r = 0; r < piece.length; r++) {
            for (let c = 0; c < piece[r].length; c++) {
                if (piece[r][c]) {
                    const gridIndex = (rowStart + r) * size + (colStart + c);
                    if (gridIndex >= 400 || mainGrid.children[gridIndex].style.backgroundColor !== '') {
                        return false;
                    }

                    // Vérifier les coins connectés
                    const corners = [
                        (rowStart + r - 1) * size + (colStart + c - 1),
                        (rowStart + r - 1) * size + (colStart + c + 1),
                        (rowStart + r + 1) * size + (colStart + c - 1),
                        (rowStart + r + 1) * size + (colStart + c + 1)
                    ];

                    for (const corner of corners) {
                        if (corner >= 0 && corner < 400 && mainGrid.children[corner].style.backgroundColor === playerColors[currentPlayer]) {
                            hasCornerConnection = true;
                        }
                    }

                    // Vérifier les côtés connectés
                    const sides = [
                        (rowStart + r - 1) * size + (colStart + c),
                        (rowStart + r + 1) * size + (colStart + c),
                        (rowStart + r) * size + (colStart + c - 1),
                        (rowStart + r) * size + (colStart + c + 1)
                    ];

                    for (const side of sides) {
                        if (side >= 0 && side < 400 && mainGrid.children[side].style.backgroundColor === playerColors[currentPlayer]) {
                            return false;
                        }
                    }
                }
            }
        }

        return hasCornerConnection;
    }

    function placePieceOnGrid(piece, startIndex) {
        const size = 20; // Taille de la grille principale
        const rowStart = Math.floor(startIndex / size);
        const colStart = startIndex % size;

        piece.forEach((row, rIndex) => {
            row.forEach((cell, cIndex) => {
                if (cell) {
                    const gridIndex = (rowStart + rIndex) * size + (colStart + cIndex);
                    const gridCell = mainGrid.children[gridIndex];
                    if (gridCell) {
                        gridCell.style.backgroundColor = playerColors[currentPlayer];
                    }
                }
            });
        });
    }

    function updatePieceList() {
        pieceList.innerHTML = '';
        playerPieces[currentPlayer].forEach((piece) => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece');
            pieceElement.style.display = 'grid';
            pieceElement.style.gridTemplateColumns = `repeat(${piece[0].length}, 10px)`; // Adjust the size of the cells
            pieceElement.style.gridTemplateRows = `repeat(${piece.length}, 10px)`; // Adjust the size of the cells
            piece.forEach(row => {
                row.forEach(cell => {
                    const cellDiv = document.createElement('div');
                    cellDiv.style.width = '10px'; // Adjust the size of the cells
                    cellDiv.style.height = '10px'; // Adjust the size of the cells
                    cellDiv.style.backgroundColor = cell ? 'blue' : 'transparent';
                    pieceElement.appendChild(cellDiv);
                });
            });
            pieceList.appendChild(pieceElement);

            pieceElement.addEventListener('click', () => {
                currentPiece = piece;
                currentPieceElement = pieceElement;
                renderPiece(currentPiece, piecePreview);
            });
        });
    }

    pieces.forEach((piece) => {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece');
        pieceElement.style.display = 'grid';
        pieceElement.style.gridTemplateColumns = `repeat(${piece[0].length}, 10px)`; // Adjust the size of the cells
        pieceElement.style.gridTemplateRows = `repeat(${piece.length}, 10px)`; // Adjust the size of the cells
        piece.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                cellDiv.style.width = '10px'; // Adjust the size of the cells
                cellDiv.style.height = '10px'; // Adjust the size of the cells
                cellDiv.style.backgroundColor = cell ? 'blue' : 'transparent';
                pieceElement.appendChild(cellDiv);
            });
        });
        pieceList.appendChild(pieceElement);

        pieceElement.addEventListener('click', () => {
            if (playerPieces[currentPlayer].has(piece)) {
                currentPiece = piece;
                currentPieceElement = pieceElement;
                renderPiece(currentPiece, piecePreview);
            }
        });
    });

    piecePreview.addEventListener('click', () => {
        if (currentPiece) {
            currentPiece = rotatePiece(currentPiece, 'right');
            renderPiece(currentPiece, piecePreview);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (currentPiece) {
            if (event.key === 'ArrowRight') {
                currentPiece = rotatePiece(currentPiece, 'right');
                renderPiece(currentPiece, piecePreview);
            } else if (event.key === 'ArrowLeft') {
                currentPiece = rotatePiece(currentPiece, 'left');
                renderPiece(currentPiece, piecePreview);
            }
        }
    });

    mainGrid.addEventListener('click', (event) => {
        if (currentPiece) {
            const cellIndex = event.target.dataset.index;
            if (cellIndex !== undefined && canPlacePiece(currentPiece, parseInt(cellIndex))) {
                placePieceOnGrid(currentPiece, parseInt(cellIndex));
                playerPieces[currentPlayer].delete(currentPiece);
                currentPieceElement.classList.add('used-piece');
                currentPiece = null;
                currentPieceElement = null;
                piecePreview.innerHTML = ''; // Clear the preview after placing the piece
                currentPlayer = (currentPlayer + 1) % 4; // Pass to the next player
                updatePieceList(); // Update the piece list for the next player
            }
        }
    });

    updatePieceList(); // Initial update of the piece list

});