window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" || e.key === "ArrowDown") &&
          !this.game.keys.includes(e.key)
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          this.game.player.shootTop();
        }
      });
      window.addEventListener("keyup", (e) => {
        if (this.game.keys.includes(e.key)) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }
  class SoundController {
    constructor() {
      this.explosionSound = document.getElementById("explosion");
      this.shotSound = document.getElementById("shot");
      this.hitSound = document.getElementById("hit");
    }
    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.play();
    }
    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.play();
    }
    hit() {
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }
  }
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 36.25;
      this.height = 20;
      this.speed = Math.random() * 0.2 + 2.8;
      this.markedForDeletion = false;
      this.image = document.getElementById("fireball");
      this.frameX = 0;
      this.maxFrame = 3;
      this.fps = 10;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }
    update(deltaTime) {
      this.x += this.speed;
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 144;
      this.height = 128;
      this.x = 20;
      this.y = 100;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 2;
      this.speedY = 0;
      this.maxSpeed = 4;
      this.projectiles = [];
      this.image = document.getElementById("player");
      this.fps = 10;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }
    update(deltaTime) {
      if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
      else if (this.game.keys.includes("ArrowDown"))
        this.speedY = this.maxSpeed;
      else this.speedY = 0;
      this.y += this.speedY;
      if (this.y > this.game.height - this.height * 0.8)
        this.y = this.game.height - this.height * 0.8;
      else if (this.y < -this.height * 0.2) this.y = -this.height * 0.2;
      this.projectiles.forEach((projectile) => projectile.update(deltaTime));
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );

      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }
    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 95, this.y + 70)
        );
        this.game.ammo--;
      }
      this.game.sound.shot();
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 2;
      this.fps = 10;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }
    update(deltaTime) {
      this.x += this.speedX - this.game.speed;
      if (this.x + this.width < 0) this.markedForDeletion = true;
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = 0;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  class RedDragon extends Enemy {
    constructor(game) {
      super(game);
      this.width = 144;
      this.height = 128;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("red-dragon");
      this.frameY = 0;
      this.speedX = Math.random() * -1 - 0.2;
    }
  }
  class GoldDragon extends Enemy {
    constructor(game) {
      super(game);
      this.width = 144;
      this.height = 128;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("gold-dragon");
      this.frameY = 0;
      this.lives = 10;
      this.score = this.lives;
      this.speedX = Math.random() * -4.2 - 0.5;
    }
  }
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 576;
      this.height = 324;
      this.x = 0;
      this.y = 0;
    }
    update() {
      if (this.x <= -this.width) this.x = 0;
      this.x -= this.game.speed * this.speedModifier;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }
  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.1);
      this.layer2 = new Layer(this.game, this.image2, 0.6);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }
    update() {
      this.layers.forEach((layer) => layer.update());
    }
    draw(context) {
      this.layers.forEach((layer) => layer.draw(context));
    }
  }
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Cinzel";
      this.color = "white";
    }
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      context.fillText("Score: " + this.game.score, 20, 40);
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score > this.game.winningScore) {
          message1 = "Inferno of Glory!";
          message2 = "You scorched the skies, mighty dragon!";
        } else {
          message1 = "Smoldering Embers!";
          message2 = "Sharpen your claws and try again!";
        }

        context.font = "70px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 20
        );
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 20
        );
      }
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      context.restore();
    }
  }
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.keys = [];
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 500;
      this.speed = 1;
      this.score = 0;
      this.winningScore = 80;
      this.gameTime = 0;
      this.timeLimit = 50000;
      this.gameOver = false;
    }
    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.background.update();
      this.background.layer4.update();
      this.player.update(deltaTime);
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) this.ammo++;
        this.ammoTimer = 0;
      } else {
        this.ammoTimer += deltaTime;
      }
      this.enemies.forEach((enemy) => {
        enemy.update(deltaTime);
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.sound.hit();
          if (!this.gameOver) this.score -= enemy.score * 0.5;
        }
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              this.sound.explosion();
              if (!this.gameOver) this.score += enemy.score;
              if (this.score > this.winningScore) this.gameOver = true;
            }
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }
    draw(context) {
      this.background.draw(context);
      this.ui.draw(context);
      this.player.draw(context);
      this.enemies.forEach((enemy) => enemy.draw(context));
      this.background.layer4.draw(context);
    }
    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.3) this.enemies.push(new GoldDragon(this));
      else if (randomize < 0.8) this.enemies.push(new RedDragon(this));
    }
    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
      );
    }
  }
  const game = new Game(canvas.width, canvas.height);
  let lastAnimationLoopTime = 0;
  function animate(timestamp) {
    const deltaTime = timestamp - lastAnimationLoopTime;
    lastAnimationLoopTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }
  animate(0);
});
