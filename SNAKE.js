










class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.gameState = 'menu';
        this.score = 0;
        this.highScore = 0;
        this.gameSpeed = 110;
        this.gameInterval = null;

        this.playerName = 'Jugador';
        this.selectedColor = '#2ecc71';
        this.selectedHeadColor = '#27ae60';

        
        this.ranking = [];

        this.snake = {
            body: [],
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 },
            color: '#2ecc71',
            headColor: '#27ae60'
        };

        this.food = {
            position: { x: 5, y: 5 },
            color: '#e74c3c'
        };

        this.initDOM();
        this.setupControls();
        this.renderRanking(); 
    }

    initDOM() {
        this.startScreen = document.getElementById('start-screen');
        this.gameBoard = document.getElementById('game-board');
        this.gameOverScreen = document.getElementById('game-over-screen');

        this.displayName = document.getElementById('display-name');
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.gameOverMessage = document.getElementById('game-over-message');

        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                colorBtns.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.getAttribute('data-color');
                this.selectedHeadColor = e.target.getAttribute('data-head');
            });
        });

        
        document.getElementById('start-btn').addEventListener('click', () => {
            const nameInput = document.getElementById('player-name').value.trim();
            if (nameInput !== '') {
                this.playerName = nameInput;
            }
            this.startGame();
        });

        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });

        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.gameOverScreen.classList.add('hidden');
            this.startScreen.classList.remove('hidden');
            this.gameState = 'menu';
            this.renderRanking();
        });
    }

    
    updateRanking(name, score) {
        if (!name) return;
        
    
        const existingPlayer = this.ranking.find(p => p.name.toLowerCase() === name.toLowerCase());

        if (existingPlayer) {
            
            if (score > existingPlayer.score) {
                existingPlayer.score = score;
                existingPlayer.name = name; 
            }
        } else {
            
            this.ranking.push({ name: name, score: score });
        }

        
        this.ranking.sort((a, b) => b.score - a.score);
    }

    
    renderRanking() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '';

        if (this.ranking.length === 0) {
            rankingList.innerHTML = '<li class="no-players">Aún no hay partidas registradas</li>';
            return;
        }

        this.ranking.forEach((player, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${player.name}</span> <span><strong>${player.score}</strong> pts</span>`;
            rankingList.appendChild(li);
        });
    }

    startGame() {
        this.snake.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.snake.direction = { x: 1, y: 0 };
        this.snake.nextDirection = { x: 1, y: 0 };
        this.snake.color = this.selectedColor;
        this.snake.headColor = this.selectedHeadColor;

        this.score = 0;
        this.currentScoreEl.textContent = this.score;
        this.highScoreEl.textContent = this.highScore;
        this.displayName.textContent = this.playerName;

        this.spawnFood();

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameBoard.classList.remove('hidden');

        this.gameState = 'playing';

        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.gameLoop(), this.gameSpeed);
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
            this.draw();
        }
    }

    update() {
        this.snake.direction = { ...this.snake.nextDirection };
        const head = { 
            x: this.snake.body[0].x + this.snake.direction.x, 
            y: this.snake.body[0].y + this.snake.direction.y 
        };

        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        for (let i = 0; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
                this.gameOver();
                return;
            }
        }

        this.snake.body.unshift(head);

        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.eatFood();
        } else {
            this.snake.body.pop();
        }
    }

    eatFood() {
        this.score++;
        this.currentScoreEl.textContent = this.score;
        this.spawnFood();
    }

    spawnFood() {
        let validPosition = false;
        while (!validPosition) {
            const newX = Math.floor(Math.random() * this.tileCount);
            const newY = Math.floor(Math.random() * this.tileCount);
            
            validPosition = !this.snake.body.some(segment => segment.x === newX && segment.y === newY);
            if (validPosition) {
                this.food.position = { x: newX, y: newY };
            }
        }
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.snake.direction.y === 0) this.snake.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.snake.direction.y === 0) this.snake.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.snake.direction.x === 0) this.snake.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.snake.direction.x === 0) this.snake.nextDirection = { x: 1, y: 0 };
                    break;
            }
        });
    }

    draw() {
        for (let r = 0; r < this.tileCount; r++) {
            for (let c = 0; c < this.tileCount; c++) {
                this.ctx.fillStyle = (r + c) % 2 === 0 ? '#a2d149' : '#aad751';
                this.ctx.fillRect(c * this.gridSize, r * this.gridSize, this.gridSize, this.gridSize);
            }
        }

        this.ctx.fillStyle = this.food.color;
        this.ctx.beginPath();
        const foodCenterX = this.food.position.x * this.gridSize + this.gridSize / 2;
        const foodCenterY = this.food.position.y * this.gridSize + this.gridSize / 2;
        this.ctx.arc(foodCenterX, foodCenterY, this.gridSize / 2 - 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.snake.body.forEach((segment, index) => {
            const isHead = index === 0;
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            this.ctx.fillStyle = isHead ? this.snake.headColor : this.snake.color;
            this.ctx.fillRect(x, y, this.gridSize, this.gridSize);

            if (isHead) {
                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(x + 4, y + 4, 4, 4);
                this.ctx.fillRect(x + 12, y + 4, 4, 4);
                this.ctx.fillStyle = 'black';
                this.ctx.fillRect(x + 5, y + 5, 2, 2);
                this.ctx.fillRect(x + 13, y + 5, 2, 2);
            }
        });
    }

    gameOver() {
        clearInterval(this.gameInterval);
        this.gameState = 'gameover';

        
        this.updateRanking(this.playerName, this.score);

        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            isNewRecord = true;
        }

        this.gameBoard.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');

        if (isNewRecord && this.score > 0) {
            this.gameOverTitle.textContent = '¡NUEVO RÉCORD!';
            this.gameOverMessage.textContent = `¡Felicidades ${this.playerName}! Superaste el récord con una puntuación de ${this.score} manzanas.`;
        } else {
            this.gameOverTitle.textContent = '¡PERDISTE!';
            this.gameOverMessage.textContent = `${this.playerName}, tu puntuación fue de ${this.score} manzanas. El récord actual es de ${this.highScore}.`;
        }
    }
}

window.onload = () => {
    new SnakeGame();
};