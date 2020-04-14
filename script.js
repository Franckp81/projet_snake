window.onload = function () // Permet l'éxécution à l'ouverture de la page.
{
    var canvasWidth = 900;
    var canvasHeight = 600; // Je sors les variables pour pouvoir les utiliser dans plusieurs fonctions.
    var blockSize = 30; // Tous les "blocks" de mon canvas feront 30px de haut et 30px de large.
    var ctx;
    var delay = 100; // Le délai s'exprime en millisecondes.
    var toto;
    var applee;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var timeout;

    init();

    function init() {
        var canvas = document.createElement('canvas'); // Création d'un élément canvas à l'intérieur de la page.
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "20px solid gray"; // Attribution des propriétés de mon canvas.
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd"
        document.body.appendChild(canvas); // Permet de sélectionner notre tag body dans le HTML et d'y insérer notre élément canvas.
        ctx = canvas.getContext('2d'); // getContext permet de dessiner pour mon projet et j'indique en argument que je veux dessiner en deux dimensions.
        toto = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }


    function refreshCanvas() {
        toto.advance();
        if (toto.checkCollision()) {
            gameOver()
        }
        else {
            if (toto.isEatingApple(applee)) {
                score++;
                toto.ateApple = true;
                do {
                    applee.setNewPosition();
                }
                while (applee.isOnSnake(toto))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Va permettre l'effacement de l'ancien rectangle à chaque fois qu'il se déplace.
            drawScore();
            toto.draw();
            applee.drawApple();
            timeout = setTimeout(refreshCanvas, delay);
        };
    }

    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }

    function restart() {
        toto = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        var x = position[0] * blockSize; // Va permettre d'afficher le serpent à la position voulu grâce au valeur stockée dans le tableau.
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize); // Décide la position et la taille du rectangle (30px comme déclaré plus haut). 
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function () {
            ctx.save(); // Permet de sauvegarder l'emplacement du rectangle.
            ctx.fillStyle = "#ff0000";
            for (let i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function () {
            var nextPosition = this.body[0].slice(); // Me permet de copier cette position.
            switch (this.direction) {
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "left":
                    nextPosition[0] -= 1; // Défini les cas d'utilisation pour les différentes directions possible utilisable par l'utilisateur.
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("Invalid direction");
            };
            this.body.unshift(nextPosition); // Place la nouvelle position de la tête du serpent en première position dans le tableau du corps de mon serpent.

            if (!this.ateApple) {
                this.body.pop(); // Me permet d'effacer la dernière position stockée dans mon tableau.
            }
            else {
                this.ateApple = false;
            }

        };
        this.setDirection = function (newDirection) {
            var allowedDirection; // Me permet de définir les directions permissent en fonction du déplacement précédent.
            switch (this.direction) {
                case "right":
                case "left":
                    allowedDirection = ["up", "down"];
                    break;
                case "up":
                case "down":
                    allowedDirection = ["left", "right"];
                    break;
                default:
                    throw ("Invalid direction");
            };
            if (allowedDirection.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function () {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];  // J'isole la tête du serpent car ça sera toujours elle qui rentrera en collision avec un mur ou le corps du serpent.
            var rest = this.body.slice(1); // Me permet de stocker tout le reste du serpent dans un tableau.
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX; // Me permet d'identifier les limites de mon canvas.
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (let i = 0; i < rest.length; i++) {
                if (snakeX == rest[i][0] && snakeY == rest[i][1]) // Me permet de savoir si la tête du serpent a les même coordonéees qu'un élément de son corps.
                {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };
        this.isEatingApple = function (appleToEat) {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
                return true;
            }
            else {
                return false;
            }
        }
    };


    function Apple(position) {
        this.position = position;
        this.drawApple = function () // Permet de dessiner la pomme.
        {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2; // Correspond au rayon d'un block donc 15px 
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);  // Fonction permettant de dessiner mon cercle pour la pomme.
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function (snakeToCheck) {
            var isOnSnake = false;
            for (let i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    };

    document.onkeydown = function handkeKeyDown(e) // Fonction qui va permettre de surveiller la touche utilisée par l'utilisateur.
    {
        var key = e.keyCode;
        var newDirection;
        console.log(key);
        switch (key) {
            case 37:                       // Les numéros des touches suivant sont établis par défaut.
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        };
        toto.setDirection(newDirection);
    };
};


