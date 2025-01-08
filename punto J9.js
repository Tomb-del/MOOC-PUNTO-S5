document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    for (let i = 0; i < 11; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 11; j++) {
            const cell = document.createElement('td');
            if (i === 5 && j === 5) {
                cell.className = 'center';
            } else {
                cell.className = 'border';
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    setListeners();
});

// Création des 4 listes de cartes
const redList = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];
const greenList = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];
const yellowList = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];
const blueList = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];

let currentPlayer = 'red'; // Le joueur actuel commence avec 'red'
let currentCard = null; // La carte actuelle du joueur
let gameActive = true; // État du jeu

// Fonction pour piocher une carte au hasard, la retirer de la liste et renvoyer la valeur
function getAndRemoveRandomCard(list) {
    if (list.length === 0) {
        return null; // Si la liste est vide, renvoyer null
    }
    const randomIndex = Math.floor(Math.random() * list.length);
    const card = list[randomIndex];
    list.splice(randomIndex, 1); // Retirer la carte de la liste
    return card;
}

function setValue(i, j, value) {
    const table = document.querySelector('table');
    const row = table.rows[i];
    const cell = row.cells[j];
    cell.textContent = value;
}

function getValue(i, j) {
    const table = document.querySelector('table');
    const row = table.rows[i];
    const cell = row.cells[j];
    return cell.textContent;
}

function setColor(i, j, color) {
    const table = document.querySelector('table');
    const row = table.rows[i];
    const cell = row.cells[j];
    cell.style.backgroundColor = color;
}

function getColor(i, j) {
    const table = document.querySelector('table');
    const row = table.rows[i];
    const cell = row.cells[j];
    return cell.style.backgroundColor;
}

function isEmpty(i, j) {
    return getValue(i, j) === '';
}

function isWithinLimits(i, j) {
    // Vérifier si (i, j) est dans les limites du tableau 11x11
    if (i < 0 || i >= 11 || j < 0 || j >= 11) {
        return false;
    }

    // Vérifier si (i, j) respecte les limites maximales d'un carré 6x6 par rapport aux cases non vides
    const table = document.querySelector('table');
    const rows = table.rows.length;
    const cols = table.rows[0].cells.length;

    let minRow = rows, maxRow = 0, minCol = cols, maxCol = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (!isEmpty(row, col)) {
                if (row < minRow) minRow = row;
                if (row > maxRow) maxRow = row;
                if (col < minCol) minCol = col;
                if (col > maxCol) maxCol = col;
            }
        }
    }

    // Vérifier les limites de 6x6
    if ((maxRow - minRow + 1) > 6 || (maxCol - minCol + 1) > 6) {
        return false;
    }

    // Vérifier si la ligne ou la colonne contient exactement 6 cases non vides
    let rowCount = 0, colCount = 0;
    for (let k = 0; k < 11; k++) {
        if (!isEmpty(i, k)) rowCount++;
        if (!isEmpty(k, j)) colCount++;
    }

    if (rowCount > 6 || colCount > 6) {
        return false;
    }

    return true;
}

function hasWin(color) {
    const table = document.querySelector('table');
    const rows = table.rows.length;
    const cols = table.rows[0].cells.length;

    // Check horizontal
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (getColor(i, j) === color && getColor(i, j + 1) === color && getColor(i, j + 2) === color && getColor(i, j + 3) === color) {
                return true;
            }
        }
    }

    // Check vertical
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows - 3; i++) {
            if (getColor(i, j) === color && getColor(i + 1, j) === color && getColor(i + 2, j) === color && getColor(i + 3, j) === color) {
                return true;
            }
        }
    }

    // Check diagonal (top-left to bottom-right)
    for (let i = 0; i < rows - 3; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (getColor(i, j) === color && getColor(i + 1, j + 1) === color && getColor(i + 2, j + 2) === color && getColor(i + 3, j + 3) === color) {
                return true;
            }
        }
    }

    // Check diagonal (bottom-left to top-right)
    for (let i = 3; i < rows; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (getColor(i, j) === color && getColor(i - 1, j + 1) === color && getColor(i - 2, j + 2) === color && getColor(i - 3, j + 3) === color) {
                return true;
            }
        }
    }

    return false;
}

function setListeners() {
    const table = document.querySelector('table');
    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const cell = table.rows[i].cells[j];
            cell.addEventListener('click', () => clickedOnCell(i, j));
        }
    }
}

function clickedOnCell(i, j) {
    if (!gameActive) {
        alert('Le jeu est terminé !');
        return;
    }

    if (isWithinLimits(i, j) && isEmpty(i, j)) {
        if (currentCard !== null) {
            setValue(i, j, currentCard);
            setColor(i, j, currentPlayer);
            if (hasWin(currentPlayer)) {
                alert(`${currentPlayer} a gagné !`);
                gameActive = false;
            } else {
                switchPlayer();
                drawCard();
            }
        }
    } else {
        alert('Placement invalide !');
    }
}

function getCurrentPlayerList() {
    switch (currentPlayer) {
        case 'red':
            return redList;
        case 'green':
            return greenList;
        case 'yellow':
            return yellowList;
        case 'blue':
            return blueList;
        default:
            return [];
    }
}

function switchPlayer() {
    switch (currentPlayer) {
        case 'red':
            currentPlayer = 'green';
            break;
        case 'green':
            currentPlayer = 'yellow';
            break;
        case 'yellow':
            currentPlayer = 'blue';
            break;
        case 'blue':
            currentPlayer = 'red';
            break;
    }
    alert(`C'est au tour de ${currentPlayer}`);
}

function drawCard() {
    const playerList = getCurrentPlayerList();
    currentCard = getAndRemoveRandomCard(playerList);
    document.getElementById('current-card').textContent = currentCard !== null ? currentCard : 'Aucune carte';
}

function playGame() {
    alert('Le jeu commence !');
    currentPlayer = 'red';
    gameActive = true;
    drawCard();
    alert(`C'est au tour de ${currentPlayer}`);
}