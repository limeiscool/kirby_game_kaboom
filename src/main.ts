import { makeBirdEnemy, makeFlameEnemy, makeGuyEnemy, makePlayer, makeCoin, setControls } from "./entities";
import { k } from "./kaboomCtx";
import { gameState } from "./state";
import { makeMap, getRandomNumber } from "./utils";

async function gameSetup() {
  k.loadSprite("assets", "./kirby-like.png", {
    sliceX: 9,
    sliceY: 10,
    anims: {
      kirbIdle: 0,
      kirbInhaling: 1,
      kirbFull: 2,
      kirbInhaleEffect: {from: 3, to: 8, speed: 15, loop: true },
      shootingStar: 9,
      flame: {from: 36, to: 37, speed: 2, loop: true},
      guyIdle: 19,
      guyWalk: {from: 18, to: 19, speed: 6, loop: true}, 
      bird: {from: 27, to: 28, speed: 4, loop: true},
    },
  });

  k.loadSprite("coin", "./gold-coin.png", {
    sliceX: 6,
    sliceY: 1,
    anims: {
      coinSpin: {from: 0, to: 5, speed: 10, loop: true},
    }
  });

  k.loadSprite("level-1", "./level-1.png");

  k.loadSprite("level-2", "./level-2.png");

  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.fixed()]);

  const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap(k, "level-1");

  const {map: level2Layout, spawnPoints: level2SpawnPoints} = await makeMap(k, "level-2");

  k.scene("level-1", () => {
    gameState.setCurrentScene("level-1");
    gameState.setNextScene("level-2");
    k.setGravity(2100);
    k.add([
      k.rect(k.width(), k.height()),
      k.color(k.Color.fromHex("#f7d7db")),
      k.fixed(),
    ])

    k.add(level1Layout);

    const kirb = makePlayer(
      k,
      level1SpawnPoints.Player[0].x,
      level1SpawnPoints.Player[0].y
    );

    setControls(k, kirb);

    k.add(kirb);

    k.camScale(k.vec2(0.8));
    k.onUpdate(() => {
      if (kirb.pos.x < level2Layout.pos.x + 400) {
        if (kirb.pos.y > level2Layout.pos.y + 900) {
          k.camPos(400, 900);
          return
        }
        if (kirb.pos.y < level2Layout.pos.y + 350) {
          k.camPos(400, 350);
          return
        }
        k.camPos(400, kirb.pos.y);
        return
      }
      if (kirb.pos.x > level2Layout.pos.x + 1400) {
        if (kirb.pos.y > level2Layout.pos.y + 900) {
          k.camPos(1400, 900);
          return
        }
        if (kirb.pos.y < level2Layout.pos.y + 350) {
          k.camPos(1400, 350);
          return
        }
        k.camPos(1400, kirb.pos.y);
        return
      }
      if (kirb.pos.y > level2Layout.pos.y + 900) {
        k.camPos(kirb.pos.x, 900);
        return
      } 
      if (kirb.pos.y < level2Layout.pos.y + 350) {
        k.camPos(kirb.pos.x, 350);
        return
      }
     k.camPos(kirb.pos.x, kirb.pos.y); 
    })

    for (const bird of level1SpawnPoints.bird) {
      const possibleSpeeds = [100, 150, 200];
      k.loop(getRandomNumber(7, 10), () => {
        makeBirdEnemy(k, bird.x, bird.y, possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)]);
      })
    }
    for (const flame of level1SpawnPoints.flame) {
      makeFlameEnemy(k, flame.x, flame.y);
    }

    for (const guy of level1SpawnPoints.guy) {
      makeGuyEnemy(k, guy.x, guy.y);
    }

    for (const coin of level1SpawnPoints.coin) {
      gameState.levelCoins++;
      makeCoin(k, coin.x, coin.y);
    }


  });

  k.scene("level-2", () => {
    gameState.setCurrentScene("level-2");
    gameState.setNextScene("level-1");
    k.setGravity(2100);
    k.add([
      k.rect(k.width(), k.height()),
      k.color(k.Color.fromHex("#f7d7db")),
      k.fixed(),
    ])

    k.add(level2Layout);

    const kirb = makePlayer(
      k,
      level2SpawnPoints.Player[0].x,
      level2SpawnPoints.Player[0].y
    );
    kirb.flipX = true;

    setControls(k, kirb);

    k.add(kirb);

    k.camScale(k.vec2(0.8));
    k.onUpdate(() => {
      if (kirb.pos.x < level2Layout.pos.x + 400) {
        if (kirb.pos.y > level2Layout.pos.y + 900) {
          k.camPos(400, 900);
          return
        }
        if (kirb.pos.y < level2Layout.pos.y + 350) {
          k.camPos(400, 350);
          return
        }
        k.camPos(400, kirb.pos.y);
        return
      }
      if (kirb.pos.x > level2Layout.pos.x + 1400) {
        if (kirb.pos.y > level2Layout.pos.y + 900) {
          k.camPos(1400, 900);
          return
        }
        if (kirb.pos.y < level2Layout.pos.y + 350) {
          k.camPos(1400, 350);
          return
        }
        k.camPos(1400, kirb.pos.y);
        return
      }
      if (kirb.pos.y > level2Layout.pos.y + 900) {
        k.camPos(kirb.pos.x, 900);
        return
      } 
      if (kirb.pos.y < level2Layout.pos.y + 350) {
        k.camPos(kirb.pos.x, 350);
        return
      }
     k.camPos(kirb.pos.x, kirb.pos.y); 
    })

    for (const bird of level2SpawnPoints.bird) {
      const possibleSpeeds = [100, 150, 200];
      k.loop(getRandomNumber(4, 8), () => {
        makeBirdEnemy(k, bird.x, bird.y, possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)]);
      })
    }

    for (const flame of level2SpawnPoints.flame) {
      makeFlameEnemy(k, flame.x, flame.y);
    }

    for (const guy of level2SpawnPoints.guy) {
      makeGuyEnemy(k, guy.x, guy.y);
    }

    for (const coin of level2SpawnPoints.coin) {
      gameState.levelCoins++;
      makeCoin(k, coin.x, coin.y);
    }


  });

  k.go("level-1");

}

gameSetup();