document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const wordInput = document.getElementById('wordInput');
    const submitButton = document.getElementById('submitButton');
    const hint = document.getElementById('hint');
    const message = document.getElementById('message');

    const words = [
        { word: 'natal', hint: 'Celebração cristã (5 letras)' },
        { word: 'presente', hint: 'Joana é um para nós! (8 letras)' },
        { word: 'neve', hint: 'Pensando em inverno, um fenômeno natural (4 letras)' },
        { word: 'noel', hint: 'Personagem natalina (4 letras)' },
        { word: 'conto', hint: 'Um ... de natal (Charles Dickens) (5 letras)' },
        { word: 'presépio', hint: 'Cena Natalina (8 letras)' },
        { word: 'estrela', hint: 'Fica no topo da nossa árvore (7 letras)' },
        { word: 'jesus', hint: 'Ele está no meio de nós (5 letras)' },
        { word: 'luz', hint: 'Jesus é a nossa... (3 letras)' },
        { word: 'maria', hint: 'Bendita, entre as mulheres (5 letras)' },
        { word: 'amor', hint: 'Ele veio irradiar o... (4 letras)' },
        { word: 'esperança', hint: 'O Natal renova a nossa... (9 letras)' }
    ];
    let currentWordIndex = 0;
    let gameWon = false;
    const candles = [
        { x: 0.70, y: 0.25, lit: false },
        { x: 0.65, y: 0.35, lit: false },
        { x: 0.75, y: 0.40, lit: false },
        { x: 0.55, y: 0.50, lit: false },
        { x: 0.65, y: 0.45, lit: false },
        { x: 0.57, y: 0.37, lit: false },
        { x: 0.59, y: 0.27, lit: false },
        { x: 0.75, y: 0.50, lit: false },
        { x: 0.60, y: 0.42, lit: false },
        { x: 0.70, y: 0.35, lit: false },
        { x: 0.65, y: 0.25, lit: false },
        { x: 0.65, y: 0.20, lit: false }
    ];

    const backgroundImages = [
        'tree-background.jpg',
        'tree-background1.jpg',
        'tree-background2.jpg',
        'tree-background3.jpg',
        'tree-background4.jpg',
        'tree-background5.jpg',
        'tree-background6.jpg',
        'tree-background7.jpg',
        'tree-background8.jpg',
        'tree-background9.jpg',
        'tree-background10.jpg'
    ];

    let backgroundImage = new Image();
    backgroundImage.src = backgroundImages[0];

    const transparente = new Image();
    transparente.src = 'transparente.png';

    const starImage = new Image();
    starImage.src = 'estrela.png';

    const sparkleImages = [
        'spark1.png',
        'spark2.png',
        'spark3.png',
        'spark4.png'
    ];

    // Preload all background images
    const preloadedBackgrounds = backgroundImages.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientWidth * 0.75; // Mantém a proporção 4:3
        drawScene();
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        drawCandles();
        if (gameWon) {
            ctx.drawImage(starImage, canvas.width * 0.63, canvas.height * 0.06, canvas.width * 0.05, canvas.height * 0.05);
        }
    }

    function drawCandle(candle) {
        const x = candle.x * canvas.width;
        const y = candle.y * canvas.height;
        if (candle.lit) {
            const img = new Image();
            img.src = sparkleImages[Math.floor(Math.random() * sparkleImages.length)];
            img.onload = () => {
                ctx.drawImage(img, x - 10, y - 10, 25, 25);
            };
        } else {
            ctx.drawImage(transparente, x - 10, y - 10, 20, 20);
        }
    }

    function drawCandles() {
        candles.forEach(drawCandle);
    }

    function checkWin() {
        return candles.every(candle => candle.lit);
    }

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        const randomImage = sparkleImages[Math.floor(Math.random() * sparkleImages.length)];
        sparkle.style.backgroundImage = `url(${randomImage})`;
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    function handleWordSubmission() {
        const guessedWord = wordInput.value.toLowerCase().trim();
        if (guessedWord === words[currentWordIndex].word) {
            const candle = candles[currentWordIndex];
            candle.lit = true;
            createSparkle(candle.x * canvas.width, candle.y * canvas.height);
            currentWordIndex++;
            message.textContent = 'Correto! Continue...';
            wordInput.value = '';
            updateBackground();
            drawScene();

            if (checkWin()) {
                message.textContent = 'Luzes Acessas! Um Feliz e Santo Natal para você!';
                gameWon = true;
                startBlinking();
            } else {
                hint.textContent = `${words[currentWordIndex].hint}`;
            }
        } else {
            message.textContent = 'Tente novamente!';
        }
    }

    function updateBackground() {
        if (currentWordIndex < preloadedBackgrounds.length) {
            const newBackgroundImage = preloadedBackgrounds[currentWordIndex];
            fadeIn(newBackgroundImage);
        }
    }

    function fadeIn(newImage) {
        const fadeDuration = 500; // Duration of the fade effect in milliseconds
        let opacity = 0;
        const fadeStep = 50; // Time between each step in milliseconds

        const fadeInterval = setInterval(() => {
            opacity += fadeStep / fadeDuration;
            if (opacity >= 1) {
                opacity = 1;
                clearInterval(fadeInterval);
            }
            ctx.globalAlpha = opacity;
            ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1; // Reset alpha to default for other drawings
        }, fadeStep);

        backgroundImage = newImage; // Update the current background image
    }

    function startBlinking() {
        setInterval(() => {
            candles.forEach(candle => candle.lit = !candle.lit);
            drawScene();
        }, 500);
    }

    submitButton.addEventListener('click', handleWordSubmission);

    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleWordSubmission();
        }
    });

    window.addEventListener('resize', resizeCanvas);

    backgroundImage.onload = () => {
        hint.textContent = `Dica: ${words[currentWordIndex].hint}`;
        resizeCanvas();
    };
});