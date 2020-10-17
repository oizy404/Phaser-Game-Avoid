Avoid.Level1 = function(){
    this.bulletTime=0;// create a bullet every game loop

    this.capsuleRate = 2000; //generate coins every 2000ms
    this.capsuleTimer = 0; //create a coin every game loop


    this.virusRate = 1000; //generate coins every 1000ms
    this.virusTimer = 0; //create a coin every game loop

    this.heroLife= 1; //hero life

    this.score = 0;
    this.kill=0;
};
Avoid.Level1.prototype = {
    create: function(){
        this.background1 = this.game.add.tileSprite(0, -73, 3000, 473, 'background1');//add background
        this.building1 = this.game.add.tileSprite(0, 10, 3000, 473, 'building1');//add building
        this.sun1 = this.game.add.tileSprite(0, -73, 3000, 473, 'sun1');//add sun

        this.sky1 = this.game.add.tileSprite(0, -73, 3000, 473, 'sky1');//add sky
        this.sky1.autoScroll(-80, 0); //this will move the background to the left

        this.road = this.game.add.sprite(0, 470, 'road');//add road
        this.safe = this.game.add.sprite(2505, 470, 'safe');//add safety sign
        this.hero = this.game.add.sprite(20, 390, 'hero'); //add hero to the game
        this.hero.scale.setTo(0.5);//resize the hero
        
        this.game.world.setBounds(0, 0, 2990, 0); //game size

        this.game.physics.startSystem(Phaser.Physics.ARCADE);// add physics to the game

        this.game.physics.arcade.enableBody(this.building1); //apply physics to this object
        this.building1.body.immovable = true; //this will keep the building stay in place

        this.game.physics.arcade.enableBody(this.safe); // apply physics to this object
        this.safe.body.immovable = true; //this will keep the safety sign stay in place

        this.game.physics.enable(this.hero);//enable physics to the hero
        
        this.hero.body.collideWorldBounds = (true); //hero will not fall or disappear from screen

        //Our two animations, walking left and right.
        //this will count the  spritesheet per frame(0-3) of the hero
        this.hero.animations.add('left', [0, 1, 2, 3], 10, true); 
        //this will count the  spritesheet per frame(5-8) of the hero
        this.hero.animations.add('right', [5, 6, 7, 8], 10, true);


        this.bullets = game.add.group(); //add bullet
        this.capsules = game.add.group();//add capsule
        this.viruses = game.add.group();//add viruses

        this.bullets.enableBody = true; //enable ang physics sa bullet along with the hero

        //enable physics to bullets
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE; 

        this.bullets.createMultiple(1, 'bullet');// how many bullet release every pressing the key
        //will generate bullet every press, call the function(resetBullet)
        this.bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetBullet, this);
        this.bullets.setAll('checkWorldBounds', true); //extending sprite object

        //  Register the key.
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);//register spacebar key
        this.cursors = this.game.input.keyboard.createCursorKeys();//register keyboard key(left,right,down,up)

        //add herolifetext to game, will show the hero life
        this.heroLifeText = this.game.add.bitmapText(1160 ,0, 'minecraftia', 'Hero Life: '+ this.heroLife , 25);
        this.heroLifeText.fixedToCamera = true;// enable to fixed with the camera
        
        //add scoretext to game, will show the score
        this.scoreText = this.game.add.bitmapText(1160,40, 'minecraftia', 'Score: 0', 25);
        this.scoreText.fixedToCamera = true;// enable to fixed with the camera

        this.level = this.game.add.bitmapText(10,10, 'minecraftia', 'LEVEL 1', 32); //show game level
        this.level.fixedToCamera = true;// enable to fixed with the camera

        //adding audio/music/sfx
        this.win= this.game.add.audio('win');
        this.life = this.game.add.audio('life');
        this.charattack = this.game.add.audio('charattack');
        this.chardied = this.game.add.audio('chardied');
        this.enemyattack = this.game.add.audio('enemyattack');
        this.ingame1 = this.game.add.audio('ingame1');
        this.ingame2 = this.game.add.audio('ingame2');
        this.ingame1.play('', 10, true);
    },
    update: function(){
        this.hero.body.velocity.x = 0; //reset the x velocity of hero
        this.hero.body.velocity.y = 0; //reset the y velocity of hero

        if (this.cursors.left.isDown){
            //  Move to the left
            this.hero.body.velocity.x = -130;
            this.hero.animations.play('left',true);
            this.game.camera.x-=2; //game camera will follow when the left key was pressed
        }
        else if (this.cursors.right.isDown){
            //  Move to the right
            this.hero.body.velocity.x = 130;
            this.hero.animations.play('right',true);
            this.game.camera.x+=2; //game camera will follow when the right key was pressed
        }
        else if (this.cursors.up.isDown){
            //  Move to the up
            this.hero.body.velocity.y = -80;
            this.hero.animations.play('right',true);
        }
        else if (this.cursors.down.isDown){
            //  Move to the down
            this.hero.body.velocity.y = 80;
            this.hero.animations.play('right',true);
        }
        else{
            //  Stand still
            this.hero.animations.stop();
            this.hero.frame = 4;
        }
        if (this.spaceKey.isDown){
            this.fireBullet(); //fire bullet when spacebar key is press(isDown) call function(fireBullet)
        }
        if (this.capsuleTimer < this.game.time.now) {
            this.createCapsule(); //create capsule
            this.capsuleTimer = this.game.time.now + this.capsuleRate; //increment the capsule
        }
        if (this.virusTimer < this.game.time.now) {
            this.createVirus(); //create virus
            this.virusTimer = this.game.time.now + this.virusRate; //increment the virus
        }

        //this will check when hero and building1 collide, refer to buildingHit function below
        this.game.physics.arcade.collide(this.hero,this.building1,this.buildingHit, null, this);

        //this will check when hero and safe collide, refer to safeHit function below
        this.game.physics.arcade.collide(this.hero, this.safe, this.safeHit, null, this);

        //this will check when player and capsules overlap, refer to capsuleHit function below
        this.game.physics.arcade.overlap(this.hero, this.capsules, this.capsuleHit, null, this);

        //this will check when hero and virus overlap, refer to virusHit function below
        this.game.physics.arcade.overlap(this.hero, this.viruses, this.virusHit, null, this);

        //this will check when bullets and virus overlap, refer to virusShot function below
        this.game.physics.arcade.overlap(this.viruses, this.bullets, this.virusShot, null, this);
    },
    shutdown: function(){
        this.capsules.destroy();
        this.viruses.destroy();
        this.bullets.destroy();
        this.hero.destroy();
        this.score = 0;
        this.heroLife= 1;
        this.capsuleTimer = 0;
        this.virusTimer = 0;
    },
    fireBullet:function(){ //recycle bullet and add to bullet group
        if (this.game.time.now > this.bulletTime){
        bullet = this.bullets.getFirstExists(false);

            if (bullet){
                bullet.reset(this.hero.x + 150, this.hero.y +40); // position of bullet from hero
                bullet.body.velocity.x =5000; //position of bullet and its velocity from ground
            }
        }
    },
    createCapsule: function(){
        var x = this.game.rnd.integerInRange(10, this.game.world.width); //random capsule y position
        var y = 0;// x position

        var capsule = this.capsules.getFirstExists(false);
        if (!capsule) {
            capsule = new Capsule(this.game, 0, 0); //x,y
            this.capsules.add(capsule); //add capsule if not exist
        }
        capsule.reset(x, y); //set sprite
        capsule.revive();
    },
    createVirus: function(){
        var x = 2700; // x position
        //random virus y position, relative to the height of the ground
        var y = this.game.rnd.integerInRange(10, this.game.world.height - 500);

        var virus = this.viruses.getFirstExists(false);
        if (!virus) {
            virus = new Virus(this.game, 0, 0); //x,y
            this.viruses.add(virus); //add virus if not exist
        }
        virus.reset(x, y); //set sprite
        virus.revive();
    },
    buildingHit: function(hero, building1){
        hero.body.velocity.y = -200; // bounce the player when hit the building
    },
    capsuleHit: function(hero, capsule){
        this.heroLife++; // increase herolife
        this.life.play(); //play the sound when catching the capsule 
        capsule.kill();// will hide the capsule

        // get the position of the capsule and save it to dummycapsule
        var dummyCapsule = new Capsule(this.game, capsule.x, capsule.y);
        this.game.add.existing(dummyCapsule);

        // animation when the capsule get hit. ''animation name'', "speed", "loop"
        dummyCapsule.animations.play('fly', 40, true);

        //transition to the upper left when the capsule get hit
        var scoreTween = this.game.add.tween(dummyCapsule).to({x: 50, y:50}, 300, Phaser.Easing.Linear.NONE, true);

        scoreTween.onComplete.add(function(){
            dummyCapsule.destroy(); // destroy capsule
            this.heroLifeText.text = 'Hero Life: ' + this.heroLife; //show the capsulelife upper left
        }, this);
    },
    virusHit: function(hero, virus){
        this.heroLife--; //decrement the life of hero when hit by virus
        this.chardied.play(); //play sound when the hero hit the virus
        virus.kill(); // will hide the virus

        this.heroLifeText.text = 'Hero Life: ' + this.heroLife; //update the remaining hero life if hit
        if (this.heroLife <= 0 ) {
            hero.kill(); //will hide the hero
            this.ingame1.stop(); //end the game music
            this.sky1.stopScroll(); //will stop sky from scrolling
            this.viruses.setAll('body.velocity.x', 0);// we stop virus from moving forward
            this.capsules.setAll('body.velocity.x', 0); //we stop capsule from moving downward
            this.virusTimer = Number.MAX_VALUE; //stop generating virus
            this.capsuleTimer = Number.MIN_VALUE; //stop generating capsule
            var scoreboard1 = new Scoreboard1(this.game);
            scoreboard1.show(this.score); // show the scoreboard
        }
    },
    safeHit: function(safe){
        safe.kill(); // will hide the safe line
        this.ingame1.stop(); //end the game music
        this.sky1.stopScroll(); //will stop sky from scrolling
        this.viruses.setAll('body.velocity.x', 0);// we stop virus from moving forward
        this.capsules.setAll('body.velocity.x', 0); //the same with capsule
        this.virusTimer = Number.MAX_VALUE; //stop generating virus
        this.capsuleTimer = Number.MIN_VALUE; //stop generating capsule
        var scoreboardwin1 = new ScoreboardWin1(this.game);
        scoreboardwin1.show(this.score); //show scoreboardwin
        this.win.play();
    },
    resetBullet: function(bullet){ //release bullet
        bullet.kill();
        this.charattack.play();//play sound effect
    },
    virusShot: function(bullet, virus){
        this.score++; // increase our score 
        this.charattack.play(); //play sound effect
        bullet.kill(); //will hide the bullet
        virus.kill(); //will hide the enemy
        this.scoreText.text = 'Score: ' + this.score; //add the score to the board
    },
};