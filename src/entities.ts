import { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";
import { gameState } from "./state";

type PlayerGameObj = GameObj<
  SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
      speed: number;
      direction: string;
      isInhaling: boolean;
      isFull: boolean;
    }
>

export function makePlayer(k: KaboomCtx, posX: number, posY: number) {
  const player = k.make([
    k.sprite("assets", { anim: "kirbIdle"}),
    k.area({ shape: new k.Rect(k.vec2(3, 5.5), 10, 11), collisionIgnore: ["guy-barrier"] }),
    k.body(),
    k.pos(posX * scale, posY * scale),
    k.scale(scale),
    k.doubleJump(4),
    k.health(3),
    k.opacity(1),
    {
      speed: 300,
      direction: "right",
      isInhaling: false,
      isFull: false,
    },
    "player",
  ]);

  player.onCollide("enemy", async (enemy : GameObj) => {
    if (player.isInhaling && enemy.isInhalable) {
      enemy.consumed = true;
      player.isInhaling = false;
      k.destroy(enemy);
      player.isFull = true;
      return;
    }

    if (player.hp() === 0) {
      k.destroy(player);
      gameState.levelCoins = 0;
      k.go(gameState.currentScene);
      return;
    }
    if (enemy.consumed) return;
      player.hurt();
      await k.tween(
        player.opacity,
        0,
        0.05,
        (val) => (player.opacity = val),
        k.easings.linear
      );
      await k.tween(
        player.opacity,
        1,
        0.05,
        (val) => (player.opacity = val),
        k.easings.linear
      );
  })

  player.onCollideUpdate("enemy", async (enemy : GameObj) => {
    if (player.isInhaling && enemy.isInhalable) {
      enemy.consumed = true;
      player.isInhaling = false;
      k.destroy(enemy);
      player.isFull = true;
      return;
    }
  })

  player.onCollide("coin", (coin: GameObj) => {
    gameState.levelCoins -= 1;
    k.destroy(coin);
  })

  player.onCollide("exit", () => {
    if (!gameState.isLevelComplete()) return;
    k.go(gameState.nextScene);
  });

  const inhaleEffect = k.add([
    k.sprite("assets", { anim: "kirbInhaleEffect"}),
    k.pos(),
    k.scale(scale),
    k.opacity(0),
    "inhaleEffect",
  ]);

  const inahleZone = player.add([
    k.area({ shape: new k.Rect(k.vec2(0, -4), 18, 10) }),
    k.pos(),
    "inhaleZone",
  ])

  inahleZone.onUpdate(() => {
    if (player.direction === "left") {
      inahleZone.pos = k.vec2(-12, 10);
      inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
      inhaleEffect.flipX = true;
      return;
    }
    inahleZone.pos = k.vec2(12, 10);
    inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0)
    inhaleEffect.flipX = false;
  })

  player.onUpdate(() => {
    
    if (player.pos.y > 2000) {
      gameState.levelCoins = 0;
      k.go(gameState.currentScene);
    }
  });

  return player;
}

export function setControls(k: KaboomCtx, player: PlayerGameObj) {
  const inhaleEffectRef = k.get("inhaleEffect")[0];

  k.onKeyDown((key) => {
    switch (key) {
      case "a":
        player.direction = "left";
        player.flipX = true;
        player.move(-player.speed, 0);
        break;
      case "d":
        player.direction = "right";
        player.flipX = false;
        player.move(player.speed, 0);
        break;
      case "down":
        if (player.isFull) {
          player.play("kirbFull");
          inhaleEffectRef.opacity = 0;
          break;
        }
        
        player.isInhaling = true;
        player.play("kirbInhaling");
        inhaleEffectRef.opacity = 1;
        break;
      
    }
  })

  k.onKeyPress("space", () => {
    player.doubleJump();
  })

  k.onKeyRelease("down", () => {
    if (player.isFull) {
      player.play("kirbInhaling");
      const shootingStar = k.add([
        k.sprite("assets", {
          anim: "shootingStar",
          flipX: player.direction === "right",
        }),
        k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
        k.pos(
          player.direction === "left"
            ? player.pos.x - 5
            : player.pos.x + 5,
          player.pos.y + 5
        ),
        k.scale(scale),
        k.offscreen({ destroy: true, distance: 400 }),
        player.direction === "left"
          ? k.move(k.LEFT, 650)
          : k.move(k.RIGHT, 650),
        "shootingStar",
      ]);
      shootingStar.onCollide("platform", () => {
        k.destroy(shootingStar);
      })
      player.isFull = false;
      k.wait(0.25, () => player.play("kirbIdle"));
      return;
    }

    inhaleEffectRef.opacity = 0;
    player.isInhaling = false;
    player.play("kirbIdle");
  })
}

export function makeInhalable(k: KaboomCtx, enemy: GameObj) {
  enemy.onCollide("inhaleZone", () => {
    enemy.isInhalable = true;
  })

  enemy.onCollideEnd("inhaleZone", () => {
    enemy.isInhalable = false;
  })

  enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
    k.destroy(enemy);
    k.destroy(shootingStar);
  })

  const playerRef = k.get("player")[0];
  enemy.onUpdate(() => {
    if (playerRef.isInhaling && enemy.isInhalable) {
      if (playerRef.direction === "right") {
        enemy.move(-800, 0);
        return;
      }
      enemy.move(800, 0);
    }
  })
}

export function makeFlameEnemy(k: KaboomCtx, posX: number, posY: number) {
  const flame = k.add([
    k.sprite("assets", {
      anim: "flame" }),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      collisionIgnore: ["enemy"],
    }),
    k.body(),
    k.state("idle", ["idle", "jump"]),{
      makeInhalable: false,
      consumed: false,
    },
    "enemy",
  ]);

  makeInhalable(k, flame);

  flame.onStateEnter("idle", async () => {
    await k.wait(Math.floor(((Math.random() * 3)*10)/10) + 1);
    flame.enterState("jump");
  });

  flame.onStateEnter("jump", async () => {
    flame.jump(800);
  })

  flame.onStateUpdate("jump", async () => {
    if (flame.isGrounded()) {
      flame.enterState("idle");
    }
  });

  return flame;
}

export function makeGuyEnemy(k: KaboomCtx, posX: number, posY: number) {
  const guy = k.add([
    k.sprite("assets", { anim: "guyIdle" }),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(2, 4), 12, 12),
      collisionIgnore: ["enemy"],
    }),
    k.body(),
    k.state("idle", ["idle", "left", "right"]),
    {
      isInhalable: false,
      consumed: false,
      speed: 100,
    },
    "enemy",
  ]);
  makeInhalable(k, guy);
  guy.onStateEnter("idle", async () => {
    guy.play("guyIdle");
    
    await k.wait(Math.random());
    guy.flipX = !guy.flipX
    await k.wait(Math.random());
    if (guy.flipX) {
      guy.enterState("right");
      return;
    }
    guy.enterState("left");
  });

  guy.onStateEnter("left", async () => {
    guy.play("guyWalk");
  });

  guy.onStateUpdate("left", () => {
    guy.move(-guy.speed, 0);
  })

  guy.onStateEnter("right", async () => {
    guy.play("guyWalk");
  })

  guy.onStateUpdate("right", () => {
    guy.move(guy.speed, 0);
  });

  guy.onCollide("guy-barrier", async () => {
    guy.enterState("idle")
  })
  
  

  return guy;
}

export function makeBirdEnemy(k: KaboomCtx, posX: number, posY: number, speed: number) {
  const bird = k.add([
    k.sprite("assets", { anim: "bird" }),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(4, 4), 8, 10),
      collisionIgnore: ["enemy", "guy-barrier"],
    }),
    k.body({
      isStatic: true,
    }),
    k.move(k.LEFT, speed),
    k.offscreen({
      destroy: true, 
      distance: 1200,
    }),{
      isInhalable: false,
      consumed: false,
    },
    "enemy",
  ])

  makeInhalable(k, bird);

  return bird;
}

export function makeCoin(k: KaboomCtx, posX: number, posY: number) {
  const coin = k.add([
    k.sprite("coin", { anim: "coinSpin" }),
    k.scale(2),
    k.pos((posX * scale) + 18, (posY * scale) + 18),
    k.area({
      shape: new k.Rect(k.vec2(3, 3), 12, 12),
      collisionIgnore: ["enemy"],
    }),

    k.body({ isStatic: true }),
    "coin",
  ])

  return coin
}