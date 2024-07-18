document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const startScreen = document.getElementById('startScreen');
    const gameScreen = document.getElementById('gameScreen');
    const endScreen = document.getElementById('endScreen');
    const message = document.getElementById('message');
    const leftButton = document.getElementById('left-button');
    const rightButton = document.getElementById('right-button');
    const statusMessage = document.getElementById('status-message');
    const playerStatus = document.getElementById('player-status');
    const treasure = document.createElement('div');

    // Ajuste de tamanho do canvas para ser responsivo
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7; // 70% da altura da janela
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let gameStarted = false;
    let gameOver = false;
    let player, magicPotion, treasureChest, giantBarrier, tinyBarrier, fallingBlocks, currentBackground, backgroundX;

    const images = {
        background: new Image(),
        background2: new Image(),
        background3: new Image(),
        player: new Image(),
        magicPotion: new Image(),
        treasureChest: new Image(),
        block: new Image(),
        barrier: new Image(),
        defeated: new Image()
    };

    let imagesToLoad = 9;
    const imageLoaded = () => {
        imagesToLoad--;
        if (imagesToLoad === 0) {
            startButton.disabled = false;
        }
    };

    images.background.src = 'background.png';
    images.background.onload = imageLoaded;
    images.background2.src = 'background2.png';
    images.background2.onload = imageLoaded;
    images.background3.src = 'background3.png';
    images.background3.onload = imageLoaded;
    images.player.src = 'lego-character.png';
    images.player.onload = imageLoaded;
    images.magicPotion.src = 'magic-potion.png';
    images.magicPotion.onload = imageLoaded;
    images.treasureChest.src = 'treasure-chest.png';
    images.treasureChest.onload = imageLoaded;
    images.block.src = 'block.png';
    images.block.onload = imageLoaded;
    images.barrier.src = 'barreira.png';
    images.barrier.onload = imageLoaded;
    images.defeated.src = 'derrotado.png';
    images.defeated.onload = imageLoaded;

    function initializeGame() {
        player = { x: 0, y: canvas.height - 60, width: 50, height: 50, size: 'normal', jumping: false, jumpHeight: 0 };
        magicPotion = { x: 0, y: 0, width: 30, height: 30, visible: false, falling: false };
        treasureChest = { x: canvas.width - 100, y: canvas.height - 60, width: 100, height: 100, visible: false };
        giantBarrier = { x: canvas.width * 0.625, y: canvas.height - 100, width: 100, height: 100, visible: true }; // Ajustando a posição e tamanho da barreira gigante
        tinyBarrier = { x: canvas.width * 0.625, y: canvas.height - 75 - 25, width: 100, height: 75, visible: false }; // Ajustando a posição e deslocamento da barreira minúscula
        fallingBlocks = [];
        currentBackground = 'background';
        backgroundX = 0;
        images.player.src = 'lego-character.png';
        endScreen.classList.add('hidden');
        endScreen.style.display = 'none';
        message.textContent = '';
        statusMessage.textContent = 'Encontre a porção mágica!';
        playerStatus.textContent = 'Status: Normal';
    }

    function startGame() {
        initializeGame();
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startButton.disabled = true;
        gameStarted = true;
        gameOver = false;
        tinyBarrier.visible = false;
        treasure.style.backgroundImage = `url('')`;
        setTimeout(dropMagicPotion, 2000); // Ajustar tempo para a primeira queda da porção

        gameLoop();
    }

    function restartGame() {
        endScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        startButton.disabled = false;
    }

    function dropMagicPotion() {
        if (!gameStarted || gameOver || currentBackground === 'background3') return; // Não gerar porções na terceira fase

        magicPotion.x = Math.random() * (canvas.width - magicPotion.width);
        magicPotion.y = 0;
        magicPotion.visible = true;
        magicPotion.falling = true;
    }

    function gameLoop() {
        if (!gameStarted || gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(images[currentBackground], backgroundX, 0, canvas.width, canvas.height);
        ctx.drawImage(images[currentBackground], backgroundX + canvas.width, 0, canvas.width, canvas.height);
        backgroundX -= 2;
        if (backgroundX <= -canvas.width) {
            backgroundX = 0;
        }

        // Desenhar jogador
        ctx.drawImage(images.player, player.x, player.y - player.jumpHeight, player.width, player.height);

        // Desenhar porção mágica
        if (magicPotion.visible) {
            ctx.drawImage(images.magicPotion, magicPotion.x, magicPotion.y, magicPotion.width, magicPotion.height);
            if (magicPotion.falling) {
                magicPotion.y += 5;
                if (magicPotion.y > canvas.height) {
                    magicPotion.visible = false;
                    magicPotion.falling = false;
                    setTimeout(dropMagicPotion, 2000); // Repetir a queda da porção mágica até ser coletada
                }
            }
        }

        // Desenhar baú do tesouro
        if (treasureChest.visible) {
            ctx.drawImage(images.treasureChest, treasureChest.x, treasureChest.y, treasureChest.width, treasureChest.height);
        }

        // Desenhar barreiras
        if (giantBarrier.visible) {
            ctx.drawImage(images.barrier, giantBarrier.x, giantBarrier.y, giantBarrier.width, giantBarrier.height);
        }

        if (tinyBarrier.visible) {
            ctx.drawImage(images.barrier, tinyBarrier.x, tinyBarrier.y, tinyBarrier.width, tinyBarrier.height);
        }

        // Desenhar blocos que caem
        fallingBlocks.forEach(block => {
            ctx.drawImage(images.block, block.x, block.y, block.width, block.height);
            block.y += 5;
        });

        // Remover blocos que saíram da tela
        fallingBlocks = fallingBlocks.filter(block => block.y < canvas.height);

        checkCollisions();

        requestAnimationFrame(gameLoop);
    }

    function checkCollisions() {
        // Colisão com a porção mágica
        if (magicPotion.visible && player.x < magicPotion.x + magicPotion.width &&
            player.x + player.width > magicPotion.x &&
            player.y - player.jumpHeight < magicPotion.y + magicPotion.height &&
            player.y + player.height - player.jumpHeight > magicPotion.y) {
            if (player.size === 'normal' && currentBackground === 'background') {
                player.size = 'large';
                growPlayer();
                magicPotion.visible = false;
                magicPotion.falling = false;
                giantBarrier.visible = true;
                statusMessage.textContent = 'Você encontrou a porção mágica! Agora passe pela barreira';
                playerStatus.textContent = 'Status: Grande';
            } else if (player.size === 'normal' && currentBackground === 'background2') {
                player.size = 'small';
                shrinkPlayer();
                magicPotion.visible = false;
                magicPotion.falling = false;
                tinyBarrier.visible = true;
                statusMessage.textContent = 'Você encontrou a porção mágica! Agora passe pela barreira!';
                playerStatus.textContent = 'Status: Pequeno';
            }
        }

        // Colisão com a barreira gigante
        if (giantBarrier.visible && player.size === 'large' &&
            player.x < giantBarrier.x + giantBarrier.width &&
            player.x + player.width > giantBarrier.x &&
            player.y - player.jumpHeight < giantBarrier.y + giantBarrier.height &&
            player.y + player.height - player.jumpHeight > giantBarrier.y) {
            player.size = 'normal';
            player.width = 50;
            player.height = 50;
            player.x = 0; // Reposiciona o jogador no lado esquerdo da tela
            player.y = canvas.height - player.height;
            giantBarrier.visible = false;
            currentBackground = 'background2';
            tinyBarrier.visible = true; // Garante que a barreira da segunda fase esteja presente
            setTimeout(dropMagicPotion, 2000); // Ajustar tempo para a porção na segunda fase
        } else if (giantBarrier.visible && player.size !== 'large' &&
            player.x < giantBarrier.x + giantBarrier.width &&
            player.x + player.width > giantBarrier.x &&
            player.y < giantBarrier.y + giantBarrier.height &&
            player.y + player.height > giantBarrier.y) {
            player.x = giantBarrier.x - player.width; // Impede o jogador de passar
        }

        // Colisão com a barreira minúscula
        if (tinyBarrier.visible && player.size === 'small' &&
            player.x < tinyBarrier.x + tinyBarrier.width &&
            player.x + player.width > tinyBarrier.x &&
            player.y - player.jumpHeight < tinyBarrier.y + tinyBarrier.height &&
            player.y + player.height - player.jumpHeight > tinyBarrier.y) {
            // Permite que o jogador passe por baixo da barreira minúscula
        } else if (tinyBarrier.visible && player.size !== 'small' &&
            player.x < tinyBarrier.x + tinyBarrier.width &&
            player.x + player.width > tinyBarrier.x &&
            player.y < tinyBarrier.y + tinyBarrier.height &&
            player.y + player.height > tinyBarrier.y) {
            player.x = tinyBarrier.x - player.width; // Impede o jogador de passar
        }

        // Transição para a terceira fase
        if (currentBackground === 'background2' && player.size === 'small' &&
            player.x + player.width >= canvas.width) {
            player.size = 'normal';
            player.width = 50;
            player.height = 50;
            player.x = 0; // Reposiciona o jogador no lado esquerdo da tela
            player.y = canvas.height - player.height;
            tinyBarrier.visible = false;
            currentBackground = 'background3';
            setTimeout(() => {
                treasureChest.visible = true;
                statusMessage.textContent = 'Você está bem!';
                playerStatus.textContent = 'Status: Vencendo';
            }, 2000);
        }

        // Colisão com o baú do tesouro
        if (treasureChest.visible && player.x < treasureChest.x + treasureChest.width &&
            player.x + player.width > treasureChest.x &&
            player.y - player.jumpHeight < treasureChest.y + treasureChest.height &&
            player.y + player.height - player.jumpHeight > treasureChest.y) {
            gameStarted = false;
            gameOver = true;
            gameScreen.classList.add('hidden');
            endScreen.classList.remove('hidden');
            endScreen.style.display = 'block';
            message.textContent = 'Parabéns! Você encontrou o tesouro!';
            startButton.disabled = false;
            animateTreasure();
        }

        // Colisão com blocos que caem
        fallingBlocks.forEach((block, index) => {
            if (player.x < block.x + block.width &&
                player.x + player.width > block.x &&
                player.y - player.jumpHeight < block.y + block.height &&
                player.y + player.height - player.jumpHeight > block.y) {
                images.player.src = 'derrotado.png'; // Alterar imagem do jogador para derrotado
                fallingBlocks.splice(index, 1); // Remover o bloco colidido
                setTimeout(() => {
                    gameOver = true;
                    gameScreen.classList.add('hidden');
                    startScreen.classList.remove('hidden');
                    startButton.disabled = false;
                    statusMessage.textContent = 'Você foi atingido!';
                }, 100); // Adicionar um pequeno atraso para exibir a mensagem de derrota
            }
        });
    }

    function createFallingBlock() {
        if (!gameStarted || gameOver) return;

        const block = {
            x: Math.random() * (canvas.width - 30),
            y: 0,
            width: 30,
            height: 30
        };

        fallingBlocks.push(block);
    }

    function growPlayer() {
        const growInterval = setInterval(() => {
            if (player.width < 100) {
                player.width += 1;
                player.height += 1;
                player.y = canvas.height - player.height;
            } else {
                clearInterval(growInterval);
            }
        }, 50); // Ajustar para crescer mais lentamente
    }

    function shrinkPlayer() {
                        const shrinkInterval = setInterval(() => {
                    if (player.width > 25) {
                        player.width -= 1;
                        player.height -= 1;
                        player.y = canvas.height - player.height;
                    } else {
                        clearInterval(shrinkInterval);
                    }
                }, 50); // Ajustar para diminuir mais lentamente
                }

                startButton.addEventListener('click', startGame);
                restartButton.addEventListener('click', restartGame);

                // Função para mover o jogador
                function movePlayer(direction) {
                if (!gameStarted || gameOver) return;

                const moveDistance = 20; // Ajuste a quantidade de pixels que o jogador se move

                if (direction === 'ArrowLeft' && player.x > 0) {
                    player.x -= moveDistance;
                } else if (direction === 'ArrowRight') {
                    player.x += moveDistance;
                    if (player.x > canvas.width) {
                        player.x = 0; // Reaparecer no lado esquerdo
                    }
                }
                }

                // Adicionar evento para as setas do teclado
                document.addEventListener('keydown', (e) => {
                movePlayer(e.key);
                });

                // Adicionar evento para os botões de seta
                leftButton.addEventListener('click', () => movePlayer('ArrowLeft'));
                rightButton.addEventListener('click', () => movePlayer('ArrowRight'));

                // Função para animar o baú do tesouro
                function animateTreasure() {
                treasure.style.position = 'absolute';
                treasure.style.left = `${treasureChest.x}px`;
                treasure.style.top = `${treasureChest.y}px`;
                treasure.style.width = `${treasureChest.width}px`;
                treasure.style.height = `${treasureChest.height}px`;
                treasure.style.backgroundImage = `url('treasure-chest.png')`;
                treasure.style.backgroundSize = 'cover';
                treasure.style.animation = 'treasureAnimation 2s infinite';
                document.body.appendChild(treasure);

                // Definir a animação do baú do tesouro
                const styleSheet = document.styleSheets[0];
                styleSheet.insertRule(`
                    @keyframes treasureAnimation {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                `, styleSheet.cssRules.length);
                }

                setInterval(createFallingBlock, 2000);

                // Inicializar o jogo ao carregar a página
                initializeGame();
                });