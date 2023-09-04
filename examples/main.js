(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __toBinary = /* @__PURE__ */ (() => {
    var table = new Uint8Array(128);
    for (var i = 0; i < 64; i++)
      table[i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i * 4 - 205] = i;
    return (base64) => {
      var n = base64.length, bytes = new Uint8Array((n - (base64[n - 1] == "=") - (base64[n - 2] == "=")) * 3 / 4 | 0);
      for (var i2 = 0, j = 0; i2 < n; ) {
        var c0 = table[base64.charCodeAt(i2++)], c1 = table[base64.charCodeAt(i2++)];
        var c2 = table[base64.charCodeAt(i2++)], c3 = table[base64.charCodeAt(i2++)];
        bytes[j++] = c0 << 2 | c1 >> 4;
        bytes[j++] = c1 << 4 | c2 >> 2;
        bytes[j++] = c2 << 6 | c3;
      }
      return bytes;
    };
  })();

  // examples/games/squeeze.ts
  var NUM_FLIES = 1;
  var FLY_SPEED = 400;
  var FLY_MARGIN = 160;
  var squeezeGame = {
    prompt: "Squeeze!",
    author: "tga",
    onLoad: (k) => {
      k.loadSound("squeeze", "sounds/squeeze.mp3");
      k.loadSound("fly", "sounds/fly.mp3");
      k.loadSprite("wall", "sprites/wall.png");
      k.loadAseprite("hand", "sprites/hand.png", "sprites/hand.json");
      k.loadAseprite("fly", "sprites/fly.png", "sprites/fly.json");
    },
    onStart: (k) => {
      const buzzSound = k.play("fly", {
        loop: true,
        volume: 0.2
      });
      const scene = k.make();
      scene.add([
        k.sprite("wall", { width: k.width(), height: k.height() })
      ]);
      const makeFly = /* @__PURE__ */ __name(() => {
        const fly = k.make([
          k.pos(
            k.rand(FLY_MARGIN, k.width() - FLY_MARGIN),
            k.rand(FLY_MARGIN, k.height() - FLY_MARGIN)
          ),
          k.sprite("fly", { anim: "fly" }),
          k.anchor("center"),
          "fly"
        ]);
        fly.onUpdate(() => {
          fly.pos.x += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt();
          fly.pos.y += k.rand(-FLY_SPEED, FLY_SPEED) * k.dt();
        });
        return fly;
      }, "makeFly");
      for (let i = 0; i < NUM_FLIES; i++) {
        scene.add(makeFly());
      }
      const handOffset = k.vec2(-30, -140);
      const hand = scene.add([
        k.pos(k.mousePos().add(handOffset)),
        k.sprite("hand")
      ]);
      hand.onUpdate(() => {
        hand.pos = k.mousePos().add(handOffset);
      });
      k.onButtonPress("action", () => {
        k.play("squeeze");
        hand.play("squeeze");
        for (const fly of scene.get("fly")) {
          const pos = hand.pos.sub(handOffset);
          if (pos.dist(fly.pos) <= 20) {
            fly.destroy();
            k.addKaboom(fly.pos);
            if (scene.get("fly").length === 0) {
              buzzSound.stop();
              k.succeed();
            }
            break;
          }
        }
      });
      k.onButtonRelease("action", () => {
        hand.play("idle");
      });
      k.onEnd(() => {
        buzzSound.stop();
      });
      return scene;
    }
  };
  var squeeze_default = squeezeGame;

  // examples/games/getFish.ts
  var SPEED = 240;
  var getFishGame = {
    prompt: "Get Fish!",
    author: "tga",
    onLoad: (k) => {
      k.loadSound("walk", "sounds/walk.mp3");
      k.loadSprite("grass", "sprites/grass.png");
      k.loadAseprite("fish", "sprites/fish.png", "sprites/fish.json");
      k.loadAseprite("bao", "sprites/bao.png", "sprites/bao.json");
      k.loadAseprite("cactus", "sprites/cactus.png", "sprites/cactus.json");
      k.loadAseprite("fire", "sprites/fire.png", "sprites/fire.json");
    },
    onStart: (k) => {
      let gotFish = false;
      let hurt = false;
      const scene = k.make();
      scene.add([
        k.sprite("grass", { width: k.width(), height: k.height() })
      ]);
      scene.add([
        k.pos(320, 240),
        k.sprite("fire", { anim: "burn" }),
        k.area({ scale: 0.6 }),
        k.anchor("center"),
        "danger"
      ]);
      scene.add([
        k.pos(150, 170),
        k.sprite("cactus", { anim: "woohoo" }),
        k.area({ scale: 0.5 }),
        k.anchor("center"),
        "danger"
      ]);
      const fish = scene.add([
        k.pos(480, 120),
        k.sprite("fish"),
        k.area({ scale: 0.6 }),
        k.anchor("center"),
        "fish"
      ]);
      const bao = scene.add([
        k.pos(120, 380),
        k.sprite("bao", { anim: "run" }),
        k.area({ scale: 0.6 }),
        k.anchor("center")
      ]);
      const dirs = {
        "left": k.LEFT,
        "right": k.RIGHT,
        "up": k.UP,
        "down": k.DOWN
      };
      for (const dir in dirs) {
        k.onButtonDown(dir, () => {
          if (gotFish || hurt)
            return;
          bao.move(dirs[dir].scale(SPEED));
        });
      }
      bao.onCollide("danger", () => {
        k.fail();
        hurt = true;
        bao.play("cry");
      });
      bao.onCollide("fish", () => {
        k.succeed();
        gotFish = true;
        bao.play("woohoo");
        fish.play("eaten", { loop: false });
      });
      k.onTimeout(() => {
        bao.play("cry");
        bao.onUpdate(() => {
          k.camPos(k.camPos().lerp(bao.pos.add(30, -30), k.dt() * 2));
          k.camScale(k.camScale().lerp(k.vec2(5), k.dt() * 2));
        });
      });
      bao.onUpdate(() => {
        if (gotFish || hurt) {
          k.camPos(k.camPos().lerp(bao.pos.add(30, -30), k.dt() * 2));
          k.camScale(k.camScale().lerp(k.vec2(5), k.dt() * 2));
        }
      });
      const music = k.play("walk", {
        loop: true,
        volume: 0.2
      });
      k.onEnd(() => {
        music.stop();
        k.camPos(k.center());
        k.camScale(1, 1);
      });
      return scene;
    }
  };
  var getFish_default = getFishGame;

  // node_modules/kaboom/dist/kaboom.mjs
  var hi = Object.defineProperty;
  var o = /* @__PURE__ */ __name((r11, t) => hi(r11, "name", { value: t, configurable: true }), "o");
  var cr = (() => {
    for (var r11 = new Uint8Array(128), t = 0; t < 64; t++)
      r11[t < 26 ? t + 65 : t < 52 ? t + 71 : t < 62 ? t - 4 : t * 4 - 205] = t;
    return (u) => {
      for (var w = u.length, S = new Uint8Array((w - (u[w - 1] == "=") - (u[w - 2] == "=")) * 3 / 4 | 0), B = 0, $ = 0; B < w; ) {
        var j = r11[u.charCodeAt(B++)], H = r11[u.charCodeAt(B++)], ee = r11[u.charCodeAt(B++)], ae = r11[u.charCodeAt(B++)];
        S[$++] = j << 2 | H >> 4, S[$++] = H << 4 | ee >> 2, S[$++] = ee << 6 | ae;
      }
      return S;
    };
  })();
  function Ee(r11) {
    return r11 * Math.PI / 180;
  }
  __name(Ee, "Ee");
  o(Ee, "deg2rad");
  function Ze(r11) {
    return r11 * 180 / Math.PI;
  }
  __name(Ze, "Ze");
  o(Ze, "rad2deg");
  function Pe(r11, t, u) {
    return t > u ? Pe(r11, u, t) : Math.min(Math.max(r11, t), u);
  }
  __name(Pe, "Pe");
  o(Pe, "clamp");
  function Se(r11, t, u) {
    if (typeof r11 == "number" && typeof t == "number")
      return r11 + (t - r11) * u;
    if (r11 instanceof y && t instanceof y)
      return r11.lerp(t, u);
    if (r11 instanceof q && t instanceof q)
      return r11.lerp(t, u);
    throw new Error(`Bad value for lerp(): ${r11}, ${t}. Only number, Vec2 and Color is supported.`);
  }
  __name(Se, "Se");
  o(Se, "lerp");
  function Nt(r11, t, u, w, S) {
    return w + (r11 - t) / (u - t) * (S - w);
  }
  __name(Nt, "Nt");
  o(Nt, "map");
  function hr(r11, t, u, w, S) {
    return Pe(Nt(r11, t, u, w, S), w, S);
  }
  __name(hr, "hr");
  o(hr, "mapc");
  var y = class r {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Vec2");
    }
    x = 0;
    y = 0;
    constructor(t = 0, u = t) {
      this.x = t, this.y = u;
    }
    static fromAngle(t) {
      let u = Ee(t);
      return new r(Math.cos(u), Math.sin(u));
    }
    static LEFT = new r(-1, 0);
    static RIGHT = new r(1, 0);
    static UP = new r(0, -1);
    static DOWN = new r(0, 1);
    clone() {
      return new r(this.x, this.y);
    }
    add(...t) {
      let u = T(...t);
      return new r(this.x + u.x, this.y + u.y);
    }
    sub(...t) {
      let u = T(...t);
      return new r(this.x - u.x, this.y - u.y);
    }
    scale(...t) {
      let u = T(...t);
      return new r(this.x * u.x, this.y * u.y);
    }
    dist(...t) {
      let u = T(...t);
      return this.sub(u).len();
    }
    sdist(...t) {
      let u = T(...t);
      return this.sub(u).slen();
    }
    len() {
      return Math.sqrt(this.dot(this));
    }
    slen() {
      return this.dot(this);
    }
    unit() {
      let t = this.len();
      return t === 0 ? new r(0) : this.scale(1 / t);
    }
    normal() {
      return new r(this.y, -this.x);
    }
    reflect(t) {
      return this.sub(t.scale(2 * this.dot(t)));
    }
    project(t) {
      return t.scale(t.dot(this) / t.len());
    }
    reject(t) {
      return this.sub(this.project(t));
    }
    dot(t) {
      return this.x * t.x + this.y * t.y;
    }
    cross(t) {
      return this.x * t.y - this.y * t.x;
    }
    angle(...t) {
      let u = T(...t);
      return Ze(Math.atan2(this.y - u.y, this.x - u.x));
    }
    angleBetween(...t) {
      let u = T(...t);
      return Ze(Math.atan2(this.cross(u), this.dot(u)));
    }
    lerp(t, u) {
      return new r(Se(this.x, t.x, u), Se(this.y, t.y, u));
    }
    slerp(t, u) {
      let w = this.dot(t), S = this.cross(t), B = Math.atan2(S, w);
      return this.scale(Math.sin((1 - u) * B)).add(t.scale(Math.sin(u * B))).scale(1 / S);
    }
    isZero() {
      return this.x === 0 && this.y === 0;
    }
    toFixed(t) {
      return new r(Number(this.x.toFixed(t)), Number(this.y.toFixed(t)));
    }
    transform(t) {
      return t.multVec2(this);
    }
    eq(t) {
      return this.x === t.x && this.y === t.y;
    }
    bbox() {
      return new le(this, 0, 0);
    }
    toString() {
      return `vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
  };
  function T(...r11) {
    if (r11.length === 1) {
      if (r11[0] instanceof y)
        return new y(r11[0].x, r11[0].y);
      if (Array.isArray(r11[0]) && r11[0].length === 2)
        return new y(...r11[0]);
    }
    return new y(...r11);
  }
  __name(T, "T");
  o(T, "vec2");
  var q = class r2 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Color");
    }
    r = 255;
    g = 255;
    b = 255;
    constructor(t, u, w) {
      this.r = Pe(t, 0, 255), this.g = Pe(u, 0, 255), this.b = Pe(w, 0, 255);
    }
    static fromArray(t) {
      return new r2(t[0], t[1], t[2]);
    }
    static fromHex(t) {
      if (typeof t == "number")
        return new r2(t >> 16 & 255, t >> 8 & 255, t >> 0 & 255);
      if (typeof t == "string") {
        let u = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
        return new r2(parseInt(u[1], 16), parseInt(u[2], 16), parseInt(u[3], 16));
      } else
        throw new Error("Invalid hex color format");
    }
    static fromHSL(t, u, w) {
      if (u == 0)
        return new r2(255 * w, 255 * w, 255 * w);
      let S = o((ae, U, X) => (X < 0 && (X += 1), X > 1 && (X -= 1), X < 1 / 6 ? ae + (U - ae) * 6 * X : X < 1 / 2 ? U : X < 2 / 3 ? ae + (U - ae) * (2 / 3 - X) * 6 : ae), "hue2rgb"), B = w < 0.5 ? w * (1 + u) : w + u - w * u, $ = 2 * w - B, j = S($, B, t + 1 / 3), H = S($, B, t), ee = S($, B, t - 1 / 3);
      return new r2(Math.round(j * 255), Math.round(H * 255), Math.round(ee * 255));
    }
    static RED = new r2(255, 0, 0);
    static GREEN = new r2(0, 255, 0);
    static BLUE = new r2(0, 0, 255);
    static YELLOW = new r2(255, 255, 0);
    static MAGENTA = new r2(255, 0, 255);
    static CYAN = new r2(0, 255, 255);
    static WHITE = new r2(255, 255, 255);
    static BLACK = new r2(0, 0, 0);
    clone() {
      return new r2(this.r, this.g, this.b);
    }
    lighten(t) {
      return new r2(this.r + t, this.g + t, this.b + t);
    }
    darken(t) {
      return this.lighten(-t);
    }
    invert() {
      return new r2(255 - this.r, 255 - this.g, 255 - this.b);
    }
    mult(t) {
      return new r2(this.r * t.r / 255, this.g * t.g / 255, this.b * t.b / 255);
    }
    lerp(t, u) {
      return new r2(Se(this.r, t.r, u), Se(this.g, t.g, u), Se(this.b, t.b, u));
    }
    eq(t) {
      return this.r === t.r && this.g === t.g && this.b === t.b;
    }
    toString() {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
    toHex() {
      return "#" + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
    }
  };
  function J(...r11) {
    if (r11.length === 0)
      return new q(255, 255, 255);
    if (r11.length === 1) {
      if (r11[0] instanceof q)
        return r11[0].clone();
      if (typeof r11[0] == "string")
        return q.fromHex(r11[0]);
      if (Array.isArray(r11[0]) && r11[0].length === 3)
        return q.fromArray(r11[0]);
    }
    return new q(...r11);
  }
  __name(J, "J");
  o(J, "rgb");
  var dr = o((r11, t, u) => q.fromHSL(r11, t, u), "hsl2rgb");
  var ie = class r3 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Quad");
    }
    x = 0;
    y = 0;
    w = 1;
    h = 1;
    constructor(t, u, w, S) {
      this.x = t, this.y = u, this.w = w, this.h = S;
    }
    scale(t) {
      return new r3(this.x + this.w * t.x, this.y + this.h * t.y, this.w * t.w, this.h * t.h);
    }
    pos() {
      return new y(this.x, this.y);
    }
    clone() {
      return new r3(this.x, this.y, this.w, this.h);
    }
    eq(t) {
      return this.x === t.x && this.y === t.y && this.w === t.w && this.h === t.h;
    }
    toString() {
      return `quad(${this.x}, ${this.y}, ${this.w}, ${this.h})`;
    }
  };
  function oe(r11, t, u, w) {
    return new ie(r11, t, u, w);
  }
  __name(oe, "oe");
  o(oe, "quad");
  var be = class r4 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Mat4");
    }
    m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    constructor(t) {
      t && (this.m = t);
    }
    static translate(t) {
      return new r4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t.x, t.y, 0, 1]);
    }
    static scale(t) {
      return new r4([t.x, 0, 0, 0, 0, t.y, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    static rotateX(t) {
      t = Ee(-t);
      let u = Math.cos(t), w = Math.sin(t);
      return new r4([1, 0, 0, 0, 0, u, -w, 0, 0, w, u, 0, 0, 0, 0, 1]);
    }
    static rotateY(t) {
      t = Ee(-t);
      let u = Math.cos(t), w = Math.sin(t);
      return new r4([u, 0, w, 0, 0, 1, 0, 0, -w, 0, u, 0, 0, 0, 0, 1]);
    }
    static rotateZ(t) {
      t = Ee(-t);
      let u = Math.cos(t), w = Math.sin(t);
      return new r4([u, -w, 0, 0, w, u, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    translate(t) {
      return this.m[12] += this.m[0] * t.x + this.m[4] * t.y, this.m[13] += this.m[1] * t.x + this.m[5] * t.y, this.m[14] += this.m[2] * t.x + this.m[6] * t.y, this.m[15] += this.m[3] * t.x + this.m[7] * t.y, this;
    }
    scale(t) {
      return this.m[0] *= t.x, this.m[4] *= t.y, this.m[1] *= t.x, this.m[5] *= t.y, this.m[2] *= t.x, this.m[6] *= t.y, this.m[3] *= t.x, this.m[7] *= t.y, this;
    }
    rotate(t) {
      t = Ee(-t);
      let u = Math.cos(t), w = Math.sin(t), S = this.m[0], B = this.m[1], $ = this.m[4], j = this.m[5];
      return this.m[0] = S * u + B * w, this.m[1] = -S * w + B * u, this.m[4] = $ * u + j * w, this.m[5] = -$ * w + j * u, this;
    }
    mult(t) {
      let u = [];
      for (let w = 0; w < 4; w++)
        for (let S = 0; S < 4; S++)
          u[w * 4 + S] = this.m[0 * 4 + S] * t.m[w * 4 + 0] + this.m[1 * 4 + S] * t.m[w * 4 + 1] + this.m[2 * 4 + S] * t.m[w * 4 + 2] + this.m[3 * 4 + S] * t.m[w * 4 + 3];
      return new r4(u);
    }
    multVec2(t) {
      return new y(t.x * this.m[0] + t.y * this.m[4] + this.m[12], t.x * this.m[1] + t.y * this.m[5] + this.m[13]);
    }
    getTranslation() {
      return new y(this.m[12], this.m[13]);
    }
    getScale() {
      if (this.m[0] != 0 || this.m[1] != 0) {
        let t = this.m[0] * this.m[5] - this.m[1] * this.m[4], u = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
        return new y(u, t / u);
      } else if (this.m[4] != 0 || this.m[5] != 0) {
        let t = this.m[0] * this.m[5] - this.m[1] * this.m[4], u = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
        return new y(t / u, u);
      } else
        return new y(0, 0);
    }
    getRotation() {
      if (this.m[0] != 0 || this.m[1] != 0) {
        let t = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
        return Ze(this.m[1] > 0 ? Math.acos(this.m[0] / t) : -Math.acos(this.m[0] / t));
      } else if (this.m[4] != 0 || this.m[5] != 0) {
        let t = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
        return Ze(Math.PI / 2 - (this.m[5] > 0 ? Math.acos(-this.m[4] / t) : -Math.acos(this.m[4] / t)));
      } else
        return 0;
    }
    getSkew() {
      if (this.m[0] != 0 || this.m[1] != 0) {
        let t = Math.sqrt(this.m[0] * this.m[0] + this.m[1] * this.m[1]);
        return new y(Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5]) / (t * t), 0);
      } else if (this.m[4] != 0 || this.m[5] != 0) {
        let t = Math.sqrt(this.m[4] * this.m[4] + this.m[5] * this.m[5]);
        return new y(0, Math.atan(this.m[0] * this.m[4] + this.m[1] * this.m[5]) / (t * t));
      } else
        return new y(0, 0);
    }
    invert() {
      let t = [], u = this.m[10] * this.m[15] - this.m[14] * this.m[11], w = this.m[9] * this.m[15] - this.m[13] * this.m[11], S = this.m[9] * this.m[14] - this.m[13] * this.m[10], B = this.m[8] * this.m[15] - this.m[12] * this.m[11], $ = this.m[8] * this.m[14] - this.m[12] * this.m[10], j = this.m[8] * this.m[13] - this.m[12] * this.m[9], H = this.m[6] * this.m[15] - this.m[14] * this.m[7], ee = this.m[5] * this.m[15] - this.m[13] * this.m[7], ae = this.m[5] * this.m[14] - this.m[13] * this.m[6], U = this.m[4] * this.m[15] - this.m[12] * this.m[7], X = this.m[4] * this.m[14] - this.m[12] * this.m[6], d = this.m[5] * this.m[15] - this.m[13] * this.m[7], W = this.m[4] * this.m[13] - this.m[12] * this.m[5], fe = this.m[6] * this.m[11] - this.m[10] * this.m[7], De = this.m[5] * this.m[11] - this.m[9] * this.m[7], v = this.m[5] * this.m[10] - this.m[9] * this.m[6], ce = this.m[4] * this.m[11] - this.m[8] * this.m[7], ge = this.m[4] * this.m[10] - this.m[8] * this.m[6], re = this.m[4] * this.m[9] - this.m[8] * this.m[5];
      t[0] = this.m[5] * u - this.m[6] * w + this.m[7] * S, t[4] = -(this.m[4] * u - this.m[6] * B + this.m[7] * $), t[8] = this.m[4] * w - this.m[5] * B + this.m[7] * j, t[12] = -(this.m[4] * S - this.m[5] * $ + this.m[6] * j), t[1] = -(this.m[1] * u - this.m[2] * w + this.m[3] * S), t[5] = this.m[0] * u - this.m[2] * B + this.m[3] * $, t[9] = -(this.m[0] * w - this.m[1] * B + this.m[3] * j), t[13] = this.m[0] * S - this.m[1] * $ + this.m[2] * j, t[2] = this.m[1] * H - this.m[2] * ee + this.m[3] * ae, t[6] = -(this.m[0] * H - this.m[2] * U + this.m[3] * X), t[10] = this.m[0] * d - this.m[1] * U + this.m[3] * W, t[14] = -(this.m[0] * ae - this.m[1] * X + this.m[2] * W), t[3] = -(this.m[1] * fe - this.m[2] * De + this.m[3] * v), t[7] = this.m[0] * fe - this.m[2] * ce + this.m[3] * ge, t[11] = -(this.m[0] * De - this.m[1] * ce + this.m[3] * re), t[15] = this.m[0] * v - this.m[1] * ge + this.m[2] * re;
      let ue = this.m[0] * t[0] + this.m[1] * t[4] + this.m[2] * t[8] + this.m[3] * t[12];
      for (let ye = 0; ye < 4; ye++)
        for (let V = 0; V < 4; V++)
          t[ye * 4 + V] *= 1 / ue;
      return new r4(t);
    }
    clone() {
      return new r4([...this.m]);
    }
    toString() {
      return this.m.toString();
    }
  };
  function On(r11, t, u, w = Math.sin) {
    return r11 + (w(u) + 1) / 2 * (t - r11);
  }
  __name(On, "On");
  o(On, "wave");
  var di = 1103515245;
  var fi = 12345;
  var lr = 2147483648;
  var ft = class {
    static {
      __name(this, "ft");
    }
    static {
      o(this, "RNG");
    }
    seed;
    constructor(t) {
      this.seed = t;
    }
    gen() {
      return this.seed = (di * this.seed + fi) % lr, this.seed / lr;
    }
    genNumber(t, u) {
      return t + this.gen() * (u - t);
    }
    genVec2(t, u) {
      return new y(this.genNumber(t.x, u.x), this.genNumber(t.y, u.y));
    }
    genColor(t, u) {
      return new q(this.genNumber(t.r, u.r), this.genNumber(t.g, u.g), this.genNumber(t.b, u.b));
    }
    genAny(...t) {
      if (t.length === 0)
        return this.gen();
      if (t.length === 1) {
        if (typeof t[0] == "number")
          return this.genNumber(0, t[0]);
        if (t[0] instanceof y)
          return this.genVec2(T(0, 0), t[0]);
        if (t[0] instanceof q)
          return this.genColor(J(0, 0, 0), t[0]);
      } else if (t.length === 2) {
        if (typeof t[0] == "number" && typeof t[1] == "number")
          return this.genNumber(t[0], t[1]);
        if (t[0] instanceof y && t[1] instanceof y)
          return this.genVec2(t[0], t[1]);
        if (t[0] instanceof q && t[1] instanceof q)
          return this.genColor(t[0], t[1]);
      }
    }
  };
  var Tn = new ft(Date.now());
  function fr(r11) {
    return r11 != null && (Tn.seed = r11), Tn.seed;
  }
  __name(fr, "fr");
  o(fr, "randSeed");
  function gt(...r11) {
    return Tn.genAny(...r11);
  }
  __name(gt, "gt");
  o(gt, "rand");
  function Pn(...r11) {
    return Math.floor(gt(...r11));
  }
  __name(Pn, "Pn");
  o(Pn, "randi");
  function mr(r11) {
    return gt() <= r11;
  }
  __name(mr, "mr");
  o(mr, "chance");
  function pr(r11) {
    return r11[Pn(r11.length)];
  }
  __name(pr, "pr");
  o(pr, "choose");
  function gr(r11, t) {
    return r11.pos.x + r11.width > t.pos.x && r11.pos.x < t.pos.x + t.width && r11.pos.y + r11.height > t.pos.y && r11.pos.y < t.pos.y + t.height;
  }
  __name(gr, "gr");
  o(gr, "testRectRect");
  function mi(r11, t) {
    if (r11.p1.x === r11.p2.x && r11.p1.y === r11.p2.y || t.p1.x === t.p2.x && t.p1.y === t.p2.y)
      return null;
    let u = (t.p2.y - t.p1.y) * (r11.p2.x - r11.p1.x) - (t.p2.x - t.p1.x) * (r11.p2.y - r11.p1.y);
    if (u === 0)
      return null;
    let w = ((t.p2.x - t.p1.x) * (r11.p1.y - t.p1.y) - (t.p2.y - t.p1.y) * (r11.p1.x - t.p1.x)) / u, S = ((r11.p2.x - r11.p1.x) * (r11.p1.y - t.p1.y) - (r11.p2.y - r11.p1.y) * (r11.p1.x - t.p1.x)) / u;
    return w < 0 || w > 1 || S < 0 || S > 1 ? null : w;
  }
  __name(mi, "mi");
  o(mi, "testLineLineT");
  function Qe(r11, t) {
    let u = mi(r11, t);
    return u ? T(r11.p1.x + u * (r11.p2.x - r11.p1.x), r11.p1.y + u * (r11.p2.y - r11.p1.y)) : null;
  }
  __name(Qe, "Qe");
  o(Qe, "testLineLine");
  function wr(r11, t) {
    if (mt(r11, t.p1) || mt(r11, t.p2))
      return true;
    let u = r11.points();
    return !!Qe(t, new Oe(u[0], u[1])) || !!Qe(t, new Oe(u[1], u[2])) || !!Qe(t, new Oe(u[2], u[3])) || !!Qe(t, new Oe(u[3], u[0]));
  }
  __name(wr, "wr");
  o(wr, "testRectLine");
  function mt(r11, t) {
    return t.x > r11.pos.x && t.x < r11.pos.x + r11.width && t.y > r11.pos.y && t.y < r11.pos.y + r11.height;
  }
  __name(mt, "mt");
  o(mt, "testRectPoint");
  function vr(r11, t) {
    let u = t.sub(r11.p1), w = r11.p2.sub(r11.p1);
    if (Math.abs(u.cross(w)) > Number.EPSILON)
      return false;
    let S = u.dot(w) / w.dot(w);
    return S >= 0 && S <= 1;
  }
  __name(vr, "vr");
  o(vr, "testLinePoint");
  function Mn(r11, t) {
    let u = r11.p2.sub(r11.p1), w = u.dot(u), S = r11.p1.sub(t.center), B = 2 * u.dot(S), $ = S.dot(S) - t.radius * t.radius, j = B * B - 4 * w * $;
    if (w <= Number.EPSILON || j < 0)
      return false;
    if (j == 0) {
      let H = -B / (2 * w);
      if (H >= 0 && H <= 1)
        return true;
    } else {
      let H = (-B + Math.sqrt(j)) / (2 * w), ee = (-B - Math.sqrt(j)) / (2 * w);
      if (H >= 0 && H <= 1 || ee >= 0 && ee <= 1)
        return true;
    }
    return br(t, r11.p1);
  }
  __name(Mn, "Mn");
  o(Mn, "testLineCircle");
  function br(r11, t) {
    return r11.center.sdist(t) < r11.radius * r11.radius;
  }
  __name(br, "br");
  o(br, "testCirclePoint");
  function yr(r11, t) {
    let u = t.pts[t.pts.length - 1];
    for (let w of t.pts) {
      if (Mn(new Oe(u, w), r11))
        return true;
      u = w;
    }
    return br(r11, t.pts[0]) ? true : Rn(t, r11.center);
  }
  __name(yr, "yr");
  o(yr, "testCirclePolygon");
  function Rn(r11, t) {
    let u = false, w = r11.pts;
    for (let S = 0, B = w.length - 1; S < w.length; B = S++)
      w[S].y > t.y != w[B].y > t.y && t.x < (w[B].x - w[S].x) * (t.y - w[S].y) / (w[B].y - w[S].y) + w[S].x && (u = !u);
    return u;
  }
  __name(Rn, "Rn");
  o(Rn, "testPolygonPoint");
  var Oe = class r5 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Line");
    }
    p1;
    p2;
    constructor(t, u) {
      this.p1 = t.clone(), this.p2 = u.clone();
    }
    transform(t) {
      return new r5(t.multVec2(this.p1), t.multVec2(this.p2));
    }
    bbox() {
      return le.fromPoints(this.p1, this.p2);
    }
    area() {
      return this.p1.dist(this.p2);
    }
    clone() {
      return new r5(this.p1, this.p2);
    }
  };
  var le = class r6 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Rect");
    }
    pos;
    width;
    height;
    constructor(t, u, w) {
      this.pos = t.clone(), this.width = u, this.height = w;
    }
    static fromPoints(t, u) {
      return new r6(t.clone(), u.x - t.x, u.y - t.y);
    }
    center() {
      return new y(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    }
    points() {
      return [this.pos, this.pos.add(this.width, 0), this.pos.add(this.width, this.height), this.pos.add(0, this.height)];
    }
    transform(t) {
      return new He(this.points().map((u) => t.multVec2(u)));
    }
    bbox() {
      return this.clone();
    }
    area() {
      return this.width * this.height;
    }
    clone() {
      return new r6(this.pos.clone(), this.width, this.height);
    }
    distToPoint(t) {
      return Math.sqrt(this.sdistToPoint(t));
    }
    sdistToPoint(t) {
      let u = this.pos, w = this.pos.add(this.width, this.height), S = Math.max(u.x - t.x, 0, t.x - w.x), B = Math.max(u.y - t.y, 0, t.y - w.y);
      return S * S + B * B;
    }
  };
  var pt = class r7 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Circle");
    }
    center;
    radius;
    constructor(t, u) {
      this.center = t.clone(), this.radius = u;
    }
    transform(t) {
      return new An(this.center, this.radius, this.radius).transform(t);
    }
    bbox() {
      return le.fromPoints(this.center.sub(T(this.radius)), this.center.add(T(this.radius)));
    }
    area() {
      return this.radius * this.radius * Math.PI;
    }
    clone() {
      return new r7(this.center, this.radius);
    }
  };
  var An = class r8 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Ellipse");
    }
    center;
    radiusX;
    radiusY;
    constructor(t, u, w) {
      this.center = t.clone(), this.radiusX = u, this.radiusY = w;
    }
    transform(t) {
      return new r8(t.multVec2(this.center), t.m[0] * this.radiusX, t.m[5] * this.radiusY);
    }
    bbox() {
      return le.fromPoints(this.center.sub(T(this.radiusX, this.radiusY)), this.center.add(T(this.radiusX, this.radiusY)));
    }
    area() {
      return this.radiusX * this.radiusY * Math.PI;
    }
    clone() {
      return new r8(this.center, this.radiusX, this.radiusY);
    }
  };
  var He = class r9 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "Polygon");
    }
    pts;
    constructor(t) {
      if (t.length < 3)
        throw new Error("Polygons should have at least 3 vertices");
      this.pts = t;
    }
    transform(t) {
      return new r9(this.pts.map((u) => t.multVec2(u)));
    }
    bbox() {
      let t = T(Number.MAX_VALUE), u = T(-Number.MAX_VALUE);
      for (let w of this.pts)
        t.x = Math.min(t.x, w.x), u.x = Math.max(u.x, w.x), t.y = Math.min(t.y, w.y), u.y = Math.max(u.y, w.y);
      return le.fromPoints(t, u);
    }
    area() {
      let t = 0, u = this.pts.length;
      for (let w = 0; w < u; w++) {
        let S = this.pts[w], B = this.pts[(w + 1) % u];
        t += S.x * B.y * 0.5, t -= B.x * S.y * 0.5;
      }
      return Math.abs(t);
    }
    clone() {
      return new r9(this.pts.map((t) => t.clone()));
    }
  };
  function xr(r11, t) {
    let u = Number.MAX_VALUE, w = T(0);
    for (let S of [r11, t])
      for (let B = 0; B < S.pts.length; B++) {
        let $ = S.pts[B], H = S.pts[(B + 1) % S.pts.length].sub($).normal().unit(), ee = Number.MAX_VALUE, ae = -Number.MAX_VALUE;
        for (let W = 0; W < r11.pts.length; W++) {
          let fe = r11.pts[W].dot(H);
          ee = Math.min(ee, fe), ae = Math.max(ae, fe);
        }
        let U = Number.MAX_VALUE, X = -Number.MAX_VALUE;
        for (let W = 0; W < t.pts.length; W++) {
          let fe = t.pts[W].dot(H);
          U = Math.min(U, fe), X = Math.max(X, fe);
        }
        let d = Math.min(ae, X) - Math.max(ee, U);
        if (d < 0)
          return null;
        if (d < Math.abs(u)) {
          let W = X - ee, fe = U - ae;
          u = Math.abs(W) < Math.abs(fe) ? W : fe, w = H.scale(u);
        }
      }
    return w;
  }
  __name(xr, "xr");
  o(xr, "sat");
  var wt = class extends Map {
    static {
      __name(this, "wt");
    }
    static {
      o(this, "IDList");
    }
    lastID;
    constructor(...t) {
      super(...t), this.lastID = 0;
    }
    push(t) {
      let u = this.lastID;
      return this.set(u, t), this.lastID++, u;
    }
    pushd(t) {
      let u = this.push(t);
      return () => this.delete(u);
    }
  };
  var Me = class r10 {
    static {
      __name(this, "r");
    }
    static {
      o(this, "EventController");
    }
    paused = false;
    cancel;
    constructor(t) {
      this.cancel = t;
    }
    static join(t) {
      let u = new r10(() => t.forEach((w) => w.cancel()));
      return Object.defineProperty(u, "paused", { get: () => t[0].paused, set: (w) => t.forEach((S) => S.paused = w) }), u.paused = false, u;
    }
  };
  var ve = class {
    static {
      __name(this, "ve");
    }
    static {
      o(this, "Event");
    }
    handlers = new wt();
    add(t) {
      let u = this.handlers.pushd((...S) => {
        w.paused || t(...S);
      }), w = new Me(u);
      return w;
    }
    addOnce(t) {
      let u = this.add((...w) => {
        u.cancel(), t(...w);
      });
      return u;
    }
    next() {
      return new Promise((t) => this.addOnce(t));
    }
    trigger(...t) {
      this.handlers.forEach((u) => u(...t));
    }
    numListeners() {
      return this.handlers.size;
    }
    clear() {
      this.handlers.clear();
    }
  };
  var Re = class {
    static {
      __name(this, "Re");
    }
    static {
      o(this, "EventHandler");
    }
    handlers = {};
    on(t, u) {
      return this.handlers[t] || (this.handlers[t] = new ve()), this.handlers[t].add(u);
    }
    onOnce(t, u) {
      let w = this.on(t, (...S) => {
        w.cancel(), u(...S);
      });
      return w;
    }
    next(t) {
      return new Promise((u) => {
        this.onOnce(t, (...w) => u(w[0]));
      });
    }
    trigger(t, ...u) {
      this.handlers[t] && this.handlers[t].trigger(...u);
    }
    remove(t) {
      delete this.handlers[t];
    }
    clear() {
      this.handlers = {};
    }
    numListeners(t) {
      return this.handlers[t]?.numListeners() ?? 0;
    }
  };
  function Dn(r11, t) {
    let u = typeof r11, w = typeof t;
    if (u !== w)
      return false;
    if (u === "object" && w === "object" && r11 !== null && t !== null) {
      let S = Object.keys(r11), B = Object.keys(t);
      if (S.length !== B.length)
        return false;
      for (let $ of S) {
        let j = r11[$], H = t[$];
        if (!(typeof j == "function" && typeof H == "function") && !Dn(j, H))
          return false;
      }
      return true;
    }
    return r11 === t;
  }
  __name(Dn, "Dn");
  o(Dn, "deepEq");
  function pi(r11) {
    let t = window.atob(r11), u = t.length, w = new Uint8Array(u);
    for (let S = 0; S < u; S++)
      w[S] = t.charCodeAt(S);
    return w.buffer;
  }
  __name(pi, "pi");
  o(pi, "base64ToArrayBuffer");
  function Ur(r11) {
    return pi(r11.split(",")[1]);
  }
  __name(Ur, "Ur");
  o(Ur, "dataURLToArrayBuffer");
  function _t(r11, t) {
    let u = document.createElement("a");
    u.href = t, u.download = r11, u.click();
  }
  __name(_t, "_t");
  o(_t, "download");
  function Gn(r11, t) {
    _t(r11, "data:text/plain;charset=utf-8," + t);
  }
  __name(Gn, "Gn");
  o(Gn, "downloadText");
  function Er(r11, t) {
    Gn(r11, JSON.stringify(t));
  }
  __name(Er, "Er");
  o(Er, "downloadJSON");
  function Fn(r11, t) {
    let u = URL.createObjectURL(t);
    _t(r11, u), URL.revokeObjectURL(u);
  }
  __name(Fn, "Fn");
  o(Fn, "downloadBlob");
  var Bn = o((r11) => r11.match(/^data:\w+\/\w+;base64,.+/), "isDataURL");
  var Sr = o((r11) => r11.split(".").pop(), "getExt");
  var Cr = (() => {
    let r11 = 0;
    return () => r11++;
  })();
  var kt = class {
    static {
      __name(this, "kt");
    }
    static {
      o(this, "BinaryHeap");
    }
    _items;
    _compareFn;
    constructor(t = (u, w) => u < w) {
      this._compareFn = t, this._items = [];
    }
    insert(t) {
      this._items.push(t), this.moveUp(this._items.length - 1);
    }
    remove() {
      if (this._items.length === 0)
        return null;
      let t = this._items[0], u = this._items.pop();
      return this._items.length !== 0 && (this._items[0] = u, this.moveDown(0)), t;
    }
    clear() {
      this._items.splice(0, this._items.length);
    }
    moveUp(t) {
      for (; t > 0; ) {
        let u = Math.floor((t - 1) / 2);
        if (!this._compareFn(this._items[t], this._items[u]) && this._items[t] >= this._items[u])
          break;
        this.swap(t, u), t = u;
      }
    }
    moveDown(t) {
      for (; t < Math.floor(this._items.length / 2); ) {
        let u = 2 * t + 1;
        if (u < this._items.length - 1 && !this._compareFn(this._items[u], this._items[u + 1]) && ++u, this._compareFn(this._items[t], this._items[u]))
          break;
        this.swap(t, u), t = u;
      }
    }
    swap(t, u) {
      [this._items[t], this._items[u]] = [this._items[u], this._items[t]];
    }
    get length() {
      return this._items.length;
    }
  };
  var Ln = { "Joy-Con L+R (STANDARD GAMEPAD Vendor: 057e Product: 200e)": { buttons: { "0": "south", "1": "east", "2": "west", "3": "north", "4": "lshoulder", "5": "rshoulder", "6": "ltrigger", "7": "rtrigger", "8": "select", "9": "start", "10": "lstick", "11": "rstick", "12": "dpad-up", "13": "dpad-down", "14": "dpad-left", "15": "dpad-right", "16": "home", "17": "capture" }, sticks: { left: { x: 0, y: 1 }, right: { x: 2, y: 3 } } }, "Joy-Con (L) (STANDARD GAMEPAD Vendor: 057e Product: 2006)": { buttons: { "0": "south", "1": "east", "2": "west", "3": "north", "4": "lshoulder", "5": "rshoulder", "9": "select", "10": "lstick", "16": "start" }, sticks: { left: { x: 0, y: 1 } } }, "Joy-Con (R) (STANDARD GAMEPAD Vendor: 057e Product: 2007)": { buttons: { "0": "south", "1": "east", "2": "west", "3": "north", "4": "lshoulder", "5": "rshoulder", "9": "start", "10": "lstick", "16": "select" }, sticks: { left: { x: 0, y: 1 } } }, "Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)": { buttons: { "0": "south", "1": "east", "2": "west", "3": "north", "4": "lshoulder", "5": "rshoulder", "6": "ltrigger", "7": "rtrigger", "8": "select", "9": "start", "10": "lstick", "11": "rstick", "12": "dpad-up", "13": "dpad-down", "14": "dpad-left", "15": "dpad-right", "16": "home", "17": "capture" }, sticks: { left: { x: 0, y: 1 }, right: { x: 2, y: 3 } } }, default: { buttons: { "0": "south", "1": "east", "2": "west", "3": "north", "4": "lshoulder", "5": "rshoulder", "6": "ltrigger", "7": "rtrigger", "8": "select", "9": "start", "10": "lstick", "11": "rstick", "12": "dpad-up", "13": "dpad-down", "14": "dpad-left", "15": "dpad-right", "16": "home" }, sticks: { left: { x: 0, y: 1 }, right: { x: 2, y: 3 } } } };
  var et = class {
    static {
      __name(this, "et");
    }
    static {
      o(this, "ButtonState");
    }
    pressed = /* @__PURE__ */ new Set([]);
    pressedRepeat = /* @__PURE__ */ new Set([]);
    released = /* @__PURE__ */ new Set([]);
    down = /* @__PURE__ */ new Set([]);
    update() {
      this.pressed.clear(), this.released.clear(), this.pressedRepeat.clear();
    }
    press(t) {
      this.pressed.add(t), this.pressedRepeat.add(t), this.down.add(t);
    }
    pressRepeat(t) {
      this.pressedRepeat.add(t);
    }
    release(t) {
      this.down.delete(t), this.pressed.delete(t), this.released.add(t);
    }
  };
  var In = class {
    static {
      __name(this, "In");
    }
    static {
      o(this, "GamepadState");
    }
    buttonState = new et();
    stickState = /* @__PURE__ */ new Map();
  };
  var Vn = class {
    static {
      __name(this, "Vn");
    }
    static {
      o(this, "FPSCounter");
    }
    dts = [];
    timer = 0;
    fps = 0;
    tick(t) {
      this.dts.push(t), this.timer += t, this.timer >= 1 && (this.timer = 0, this.fps = Math.round(1 / (this.dts.reduce((u, w) => u + w) / this.dts.length)), this.dts = []);
    }
  };
  var Tr = o((r11) => {
    if (!r11.canvas)
      throw new Error("Please provide a canvas");
    let t = { canvas: r11.canvas, loopID: null, stopped: false, dt: 0, time: 0, realTime: 0, fpsCounter: new Vn(), timeScale: 1, skipTime: false, numFrames: 0, mousePos: new y(0), mouseDeltaPos: new y(0), keyState: new et(), mouseState: new et(), mergedGamepadState: new In(), gamepadStates: /* @__PURE__ */ new Map(), gamepads: [], charInputted: [], isMouseMoved: false, lastWidth: r11.canvas.offsetWidth, lastHeight: r11.canvas.offsetHeight, events: new Re() };
    function u() {
      return t.canvas;
    }
    __name(u, "u");
    o(u, "canvas");
    function w() {
      return t.dt * t.timeScale;
    }
    __name(w, "w");
    o(w, "dt");
    function S() {
      return t.time;
    }
    __name(S, "S");
    o(S, "time");
    function B() {
      return t.fpsCounter.fps;
    }
    __name(B, "B");
    o(B, "fps");
    function $() {
      return t.numFrames;
    }
    __name($, "$");
    o($, "numFrames");
    function j() {
      return t.canvas.toDataURL();
    }
    __name(j, "j");
    o(j, "screenshot");
    function H(h) {
      t.canvas.style.cursor = h;
    }
    __name(H, "H");
    o(H, "setCursor");
    function ee() {
      return t.canvas.style.cursor;
    }
    __name(ee, "ee");
    o(ee, "getCursor");
    function ae(h) {
      if (h)
        try {
          let x = t.canvas.requestPointerLock();
          x.catch && x.catch((E) => console.error(E));
        } catch (x) {
          console.error(x);
        }
      else
        document.exitPointerLock();
    }
    __name(ae, "ae");
    o(ae, "setCursorLocked");
    function U() {
      return !!document.pointerLockElement;
    }
    __name(U, "U");
    o(U, "isCursorLocked");
    function X(h) {
      h.requestFullscreen ? h.requestFullscreen() : h.webkitRequestFullscreen && h.webkitRequestFullscreen();
    }
    __name(X, "X");
    o(X, "enterFullscreen");
    function d() {
      document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullScreen && document.webkitExitFullScreen();
    }
    __name(d, "d");
    o(d, "exitFullscreen");
    function W() {
      return document.fullscreenElement || document.webkitFullscreenElement;
    }
    __name(W, "W");
    o(W, "getFullscreenElement");
    function fe(h = true) {
      h ? X(t.canvas) : d();
    }
    __name(fe, "fe");
    o(fe, "setFullscreen");
    function De() {
      return !!W();
    }
    __name(De, "De");
    o(De, "isFullscreen");
    function v() {
      t.stopped = true;
      for (let h in z)
        t.canvas.removeEventListener(h, z[h]);
      for (let h in Ge)
        document.removeEventListener(h, Ge[h]);
      for (let h in Fe)
        window.removeEventListener(h, Fe[h]);
      Q.disconnect();
    }
    __name(v, "v");
    o(v, "quit");
    function ce(h) {
      t.loopID !== null && cancelAnimationFrame(t.loopID);
      let x = 0, E = o((L) => {
        if (t.stopped)
          return;
        if (document.visibilityState !== "visible") {
          t.loopID = requestAnimationFrame(E);
          return;
        }
        let me = L / 1e3, Z = me - t.realTime, Ye = r11.maxFPS ? 1 / r11.maxFPS : 0;
        t.realTime = me, x += Z, x > Ye && (t.skipTime || (t.dt = x, t.time += w(), t.fpsCounter.tick(t.dt)), x = 0, t.skipTime = false, t.numFrames++, Pt(), h(), Mt()), t.loopID = requestAnimationFrame(E);
      }, "frame");
      E(0);
    }
    __name(ce, "ce");
    o(ce, "run");
    function ge() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }
    __name(ge, "ge");
    o(ge, "isTouchscreen");
    function re() {
      return t.mousePos.clone();
    }
    __name(re, "re");
    o(re, "mousePos");
    function ue() {
      return t.mouseDeltaPos.clone();
    }
    __name(ue, "ue");
    o(ue, "mouseDeltaPos");
    function ye(h = "left") {
      return t.mouseState.pressed.has(h);
    }
    __name(ye, "ye");
    o(ye, "isMousePressed");
    function V(h = "left") {
      return t.mouseState.down.has(h);
    }
    __name(V, "V");
    o(V, "isMouseDown");
    function A(h = "left") {
      return t.mouseState.released.has(h);
    }
    __name(A, "A");
    o(A, "isMouseReleased");
    function rt() {
      return t.isMouseMoved;
    }
    __name(rt, "rt");
    o(rt, "isMouseMoved");
    function Ce(h) {
      return h === void 0 ? t.keyState.pressed.size > 0 : t.keyState.pressed.has(h);
    }
    __name(Ce, "Ce");
    o(Ce, "isKeyPressed");
    function Yt(h) {
      return h === void 0 ? t.keyState.pressedRepeat.size > 0 : t.keyState.pressedRepeat.has(h);
    }
    __name(Yt, "Yt");
    o(Yt, "isKeyPressedRepeat");
    function st(h) {
      return h === void 0 ? t.keyState.down.size > 0 : t.keyState.down.has(h);
    }
    __name(st, "st");
    o(st, "isKeyDown");
    function qe(h) {
      return h === void 0 ? t.keyState.released.size > 0 : t.keyState.released.has(h);
    }
    __name(qe, "qe");
    o(qe, "isKeyReleased");
    function Xt(h) {
      return h === void 0 ? t.mergedGamepadState.buttonState.pressed.size > 0 : t.mergedGamepadState.buttonState.pressed.has(h);
    }
    __name(Xt, "Xt");
    o(Xt, "isGamepadButtonPressed");
    function Wt(h) {
      return h === void 0 ? t.mergedGamepadState.buttonState.down.size > 0 : t.mergedGamepadState.buttonState.down.has(h);
    }
    __name(Wt, "Wt");
    o(Wt, "isGamepadButtonDown");
    function $e(h) {
      return h === void 0 ? t.mergedGamepadState.buttonState.released.size > 0 : t.mergedGamepadState.buttonState.released.has(h);
    }
    __name($e, "$e");
    o($e, "isGamepadButtonReleased");
    function Jt(h) {
      return t.events.on("resize", h);
    }
    __name(Jt, "Jt");
    o(Jt, "onResize");
    let ze = o((h, x) => {
      if (typeof h == "function")
        return t.events.on("keyDown", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("keyDown", (E) => E === h && x(h));
    }, "onKeyDown"), Qt = o((h, x) => {
      if (typeof h == "function")
        return t.events.on("keyPress", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("keyPress", (E) => E === h && x(h));
    }, "onKeyPress"), Zt = o((h, x) => {
      if (typeof h == "function")
        return t.events.on("keyPressRepeat", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("keyPressRepeat", (E) => E === h && x(h));
    }, "onKeyPressRepeat"), bt = o((h, x) => {
      if (typeof h == "function")
        return t.events.on("keyRelease", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("keyRelease", (E) => E === h && x(h));
    }, "onKeyRelease");
    function yt(h, x) {
      return typeof h == "function" ? t.events.on("mouseDown", (E) => h(E)) : t.events.on("mouseDown", (E) => E === h && x(E));
    }
    __name(yt, "yt");
    o(yt, "onMouseDown");
    function xt(h, x) {
      return typeof h == "function" ? t.events.on("mousePress", (E) => h(E)) : t.events.on("mousePress", (E) => E === h && x(E));
    }
    __name(xt, "xt");
    o(xt, "onMousePress");
    function Ie(h, x) {
      return typeof h == "function" ? t.events.on("mouseRelease", (E) => h(E)) : t.events.on("mouseRelease", (E) => E === h && x(E));
    }
    __name(Ie, "Ie");
    o(Ie, "onMouseRelease");
    function en(h) {
      return t.events.on("mouseMove", () => h(re(), ue()));
    }
    __name(en, "en");
    o(en, "onMouseMove");
    function tn(h) {
      return t.events.on("charInput", h);
    }
    __name(tn, "tn");
    o(tn, "onCharInput");
    function nn(h) {
      return t.events.on("touchStart", h);
    }
    __name(nn, "nn");
    o(nn, "onTouchStart");
    function rn(h) {
      return t.events.on("touchMove", h);
    }
    __name(rn, "rn");
    o(rn, "onTouchMove");
    function sn(h) {
      return t.events.on("touchEnd", h);
    }
    __name(sn, "sn");
    o(sn, "onTouchEnd");
    function on(h) {
      return t.events.on("scroll", h);
    }
    __name(on, "on");
    o(on, "onScroll");
    function Ut(h) {
      return t.events.on("hide", h);
    }
    __name(Ut, "Ut");
    o(Ut, "onHide");
    function Et(h) {
      return t.events.on("show", h);
    }
    __name(Et, "Et");
    o(Et, "onShow");
    function St(h, x) {
      if (typeof h == "function")
        return t.events.on("gamepadButtonDown", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("gamepadButtonDown", (E) => E === h && x(h));
    }
    __name(St, "St");
    o(St, "onGamepadButtonDown");
    function Ct(h, x) {
      if (typeof h == "function")
        return t.events.on("gamepadButtonPress", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("gamepadButtonPress", (E) => E === h && x(h));
    }
    __name(Ct, "Ct");
    o(Ct, "onGamepadButtonPress");
    function Tt(h, x) {
      if (typeof h == "function")
        return t.events.on("gamepadButtonRelease", h);
      if (typeof h == "string" && typeof x == "function")
        return t.events.on("gamepadButtonRelease", (E) => E === h && x(h));
    }
    __name(Tt, "Tt");
    o(Tt, "onGamepadButtonRelease");
    function an(h, x) {
      return t.events.on("gamepadStick", (E, L) => E === h && x(L));
    }
    __name(an, "an");
    o(an, "onGamepadStick");
    function it(h) {
      t.events.on("gamepadConnect", h);
    }
    __name(it, "it");
    o(it, "onGamepadConnect");
    function un(h) {
      t.events.on("gamepadDisconnect", h);
    }
    __name(un, "un");
    o(un, "onGamepadDisconnect");
    function cn(h) {
      return t.mergedGamepadState.stickState.get(h) || new y(0);
    }
    __name(cn, "cn");
    o(cn, "getGamepadStick");
    function At() {
      return [...t.charInputted];
    }
    __name(At, "At");
    o(At, "charInputted");
    function Ot() {
      return [...t.gamepads];
    }
    __name(Ot, "Ot");
    o(Ot, "getGamepads");
    function Pt() {
      t.events.trigger("input"), t.keyState.down.forEach((h) => t.events.trigger("keyDown", h)), t.mouseState.down.forEach((h) => t.events.trigger("mouseDown", h)), ot();
    }
    __name(Pt, "Pt");
    o(Pt, "processInput");
    function Mt() {
      t.keyState.update(), t.mouseState.update(), t.mergedGamepadState.buttonState.update(), t.mergedGamepadState.stickState.forEach((h, x) => {
        t.mergedGamepadState.stickState.set(x, new y(0));
      }), t.charInputted = [], t.isMouseMoved = false, t.gamepadStates.forEach((h) => {
        h.buttonState.update(), h.stickState.forEach((x, E) => {
          h.stickState.set(E, new y(0));
        });
      });
    }
    __name(Mt, "Mt");
    o(Mt, "resetInput");
    function Ke(h) {
      let x = { index: h.index, isPressed: (E) => t.gamepadStates.get(h.index).buttonState.pressed.has(E), isDown: (E) => t.gamepadStates.get(h.index).buttonState.down.has(E), isReleased: (E) => t.gamepadStates.get(h.index).buttonState.released.has(E), getStick: (E) => t.gamepadStates.get(h.index).stickState.get(E) };
      return t.gamepads.push(x), t.gamepadStates.set(h.index, { buttonState: new et(), stickState: /* @__PURE__ */ new Map([["left", new y(0)], ["right", new y(0)]]) }), x;
    }
    __name(Ke, "Ke");
    o(Ke, "registerGamepad");
    function ln(h) {
      t.gamepads = t.gamepads.filter((x) => x.index !== h.index), t.gamepadStates.delete(h.index);
    }
    __name(ln, "ln");
    o(ln, "removeGamepad");
    function ot() {
      for (let h of navigator.getGamepads())
        h && !t.gamepadStates.has(h.index) && Ke(h);
      for (let h of t.gamepads) {
        let x = navigator.getGamepads()[h.index], L = (r11.gamepads ?? {})[x.id] ?? Ln[x.id] ?? Ln.default, me = t.gamepadStates.get(h.index);
        for (let Z = 0; Z < x.buttons.length; Z++)
          x.buttons[Z].pressed ? (me.buttonState.down.has(L.buttons[Z]) || (t.mergedGamepadState.buttonState.press(L.buttons[Z]), me.buttonState.press(L.buttons[Z]), t.events.trigger("gamepadButtonPress", L.buttons[Z])), t.events.trigger("gamepadButtonDown", L.buttons[Z])) : me.buttonState.down.has(L.buttons[Z]) && (t.mergedGamepadState.buttonState.release(L.buttons[Z]), me.buttonState.release(L.buttons[Z]), t.events.trigger("gamepadButtonRelease", L.buttons[Z]));
        for (let Z in L.sticks) {
          let Ye = L.sticks[Z], Te = new y(x.axes[Ye.x], x.axes[Ye.y]);
          me.stickState.set(Z, Te), t.mergedGamepadState.stickState.set(Z, Te), t.events.trigger("gamepadStick", Z, Te);
        }
      }
    }
    __name(ot, "ot");
    o(ot, "processGamepad");
    let z = {}, Ge = {}, Fe = {};
    z.mousemove = (h) => {
      let x = new y(h.offsetX, h.offsetY), E = new y(h.movementX, h.movementY);
      t.events.onOnce("input", () => {
        t.isMouseMoved = true, t.mousePos = x, t.mouseDeltaPos = E, t.events.trigger("mouseMove");
      });
    };
    let at = ["left", "middle", "right", "back", "forward"];
    z.mousedown = (h) => {
      t.events.onOnce("input", () => {
        let x = at[h.button];
        x && (t.mouseState.press(x), t.events.trigger("mousePress", x));
      });
    }, z.mouseup = (h) => {
      t.events.onOnce("input", () => {
        let x = at[h.button];
        x && (t.mouseState.release(x), t.events.trigger("mouseRelease", x));
      });
    };
    let hn = /* @__PURE__ */ new Set([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"]), Rt = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", " ": "space" };
    z.keydown = (h) => {
      hn.has(h.key) && h.preventDefault(), t.events.onOnce("input", () => {
        let x = Rt[h.key] || h.key.toLowerCase();
        x.length === 1 ? (t.events.trigger("charInput", x), t.charInputted.push(x)) : x === "space" && (t.events.trigger("charInput", " "), t.charInputted.push(" ")), h.repeat ? (t.keyState.pressRepeat(x), t.events.trigger("keyPressRepeat", x)) : (t.keyState.press(x), t.events.trigger("keyPressRepeat", x), t.events.trigger("keyPress", x));
      });
    }, z.keyup = (h) => {
      t.events.onOnce("input", () => {
        let x = Rt[h.key] || h.key.toLowerCase();
        t.keyState.release(x), t.events.trigger("keyRelease", x);
      });
    }, z.touchstart = (h) => {
      h.preventDefault(), t.events.onOnce("input", () => {
        let x = [...h.changedTouches], E = t.canvas.getBoundingClientRect();
        r11.touchToMouse !== false && (t.mousePos = new y(x[0].clientX - E.x, x[0].clientY - E.y), t.mouseState.press("left"), t.events.trigger("mousePress", "left")), x.forEach((L) => {
          t.events.trigger("touchStart", new y(L.clientX - E.x, L.clientY - E.y), L);
        });
      });
    }, z.touchmove = (h) => {
      h.preventDefault(), t.events.onOnce("input", () => {
        let x = [...h.changedTouches], E = t.canvas.getBoundingClientRect();
        r11.touchToMouse !== false && (t.mousePos = new y(x[0].clientX - E.x, x[0].clientY - E.y), t.events.trigger("mouseMove")), x.forEach((L) => {
          t.events.trigger("touchMove", new y(L.clientX - E.x, L.clientY - E.y), L);
        });
      });
    }, z.touchend = (h) => {
      t.events.onOnce("input", () => {
        let x = [...h.changedTouches], E = t.canvas.getBoundingClientRect();
        r11.touchToMouse !== false && (t.mousePos = new y(x[0].clientX - E.x, x[0].clientY - E.y), t.mouseState.release("left"), t.events.trigger("mouseRelease", "left")), x.forEach((L) => {
          t.events.trigger("touchEnd", new y(L.clientX - E.x, L.clientY - E.y), L);
        });
      });
    }, z.touchcancel = (h) => {
      t.events.onOnce("input", () => {
        let x = [...h.changedTouches], E = t.canvas.getBoundingClientRect();
        r11.touchToMouse !== false && (t.mousePos = new y(x[0].clientX - E.x, x[0].clientY - E.y), t.mouseState.release("left"), t.events.trigger("mouseRelease", "left")), x.forEach((L) => {
          t.events.trigger("touchEnd", new y(L.clientX - E.x, L.clientY - E.y), L);
        });
      });
    }, z.wheel = (h) => {
      h.preventDefault(), t.events.onOnce("input", () => {
        t.events.trigger("scroll", new y(h.deltaX, h.deltaY));
      });
    }, z.contextmenu = (h) => h.preventDefault(), Ge.visibilitychange = () => {
      document.visibilityState === "visible" ? (t.skipTime = true, t.events.trigger("show")) : t.events.trigger("hide");
    }, Fe.gamepadconnected = (h) => {
      let x = Ke(h.gamepad);
      t.events.onOnce("input", () => {
        t.events.trigger("gamepadConnect", x);
      });
    }, Fe.gamepaddisconnected = (h) => {
      let x = Ot().filter((E) => E.index === h.gamepad.index)[0];
      ln(h.gamepad), t.events.onOnce("input", () => {
        t.events.trigger("gamepadDisconnect", x);
      });
    };
    for (let h in z)
      t.canvas.addEventListener(h, z[h]);
    for (let h in Ge)
      document.addEventListener(h, Ge[h]);
    for (let h in Fe)
      window.addEventListener(h, Fe[h]);
    let Q = new ResizeObserver((h) => {
      for (let x of h)
        if (x.target === t.canvas) {
          if (t.lastWidth === t.canvas.offsetWidth && t.lastHeight === t.canvas.offsetHeight)
            return;
          t.lastWidth = t.canvas.offsetWidth, t.lastHeight = t.canvas.offsetHeight, t.events.onOnce("input", () => {
            t.events.trigger("resize");
          });
        }
    });
    return Q.observe(t.canvas), { dt: w, time: S, run: ce, canvas: u, fps: B, numFrames: $, quit: v, setFullscreen: fe, isFullscreen: De, setCursor: H, screenshot: j, getGamepads: Ot, getCursor: ee, setCursorLocked: ae, isCursorLocked: U, isTouchscreen: ge, mousePos: re, mouseDeltaPos: ue, isKeyDown: st, isKeyPressed: Ce, isKeyPressedRepeat: Yt, isKeyReleased: qe, isMouseDown: V, isMousePressed: ye, isMouseReleased: A, isMouseMoved: rt, isGamepadButtonPressed: Xt, isGamepadButtonDown: Wt, isGamepadButtonReleased: $e, getGamepadStick: cn, charInputted: At, onResize: Jt, onKeyDown: ze, onKeyPress: Qt, onKeyPressRepeat: Zt, onKeyRelease: bt, onMouseDown: yt, onMousePress: xt, onMouseRelease: Ie, onMouseMove: en, onCharInput: tn, onTouchStart: nn, onTouchMove: rn, onTouchEnd: sn, onScroll: on, onHide: Ut, onShow: Et, onGamepadButtonDown: St, onGamepadButtonPress: Ct, onGamepadButtonRelease: Tt, onGamepadStick: an, onGamepadConnect: it, onGamepadDisconnect: un, events: t.events };
  }, "default");
  var Ht = 2.5949095;
  var Ar = 1.70158 + 1;
  var Or = 2 * Math.PI / 3;
  var Pr = 2 * Math.PI / 4.5;
  var qt = { linear: (r11) => r11, easeInSine: (r11) => 1 - Math.cos(r11 * Math.PI / 2), easeOutSine: (r11) => Math.sin(r11 * Math.PI / 2), easeInOutSine: (r11) => -(Math.cos(Math.PI * r11) - 1) / 2, easeInQuad: (r11) => r11 * r11, easeOutQuad: (r11) => 1 - (1 - r11) * (1 - r11), easeInOutQuad: (r11) => r11 < 0.5 ? 2 * r11 * r11 : 1 - Math.pow(-2 * r11 + 2, 2) / 2, easeInCubic: (r11) => r11 * r11 * r11, easeOutCubic: (r11) => 1 - Math.pow(1 - r11, 3), easeInOutCubic: (r11) => r11 < 0.5 ? 4 * r11 * r11 * r11 : 1 - Math.pow(-2 * r11 + 2, 3) / 2, easeInQuart: (r11) => r11 * r11 * r11 * r11, easeOutQuart: (r11) => 1 - Math.pow(1 - r11, 4), easeInOutQuart: (r11) => r11 < 0.5 ? 8 * r11 * r11 * r11 * r11 : 1 - Math.pow(-2 * r11 + 2, 4) / 2, easeInQuint: (r11) => r11 * r11 * r11 * r11 * r11, easeOutQuint: (r11) => 1 - Math.pow(1 - r11, 5), easeInOutQuint: (r11) => r11 < 0.5 ? 16 * r11 * r11 * r11 * r11 * r11 : 1 - Math.pow(-2 * r11 + 2, 5) / 2, easeInExpo: (r11) => r11 === 0 ? 0 : Math.pow(2, 10 * r11 - 10), easeOutExpo: (r11) => r11 === 1 ? 1 : 1 - Math.pow(2, -10 * r11), easeInOutExpo: (r11) => r11 === 0 ? 0 : r11 === 1 ? 1 : r11 < 0.5 ? Math.pow(2, 20 * r11 - 10) / 2 : (2 - Math.pow(2, -20 * r11 + 10)) / 2, easeInCirc: (r11) => 1 - Math.sqrt(1 - Math.pow(r11, 2)), easeOutCirc: (r11) => Math.sqrt(1 - Math.pow(r11 - 1, 2)), easeInOutCirc: (r11) => r11 < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * r11, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * r11 + 2, 2)) + 1) / 2, easeInBack: (r11) => Ar * r11 * r11 * r11 - 1.70158 * r11 * r11, easeOutBack: (r11) => 1 + Ar * Math.pow(r11 - 1, 3) + 1.70158 * Math.pow(r11 - 1, 2), easeInOutBack: (r11) => r11 < 0.5 ? Math.pow(2 * r11, 2) * ((Ht + 1) * 2 * r11 - Ht) / 2 : (Math.pow(2 * r11 - 2, 2) * ((Ht + 1) * (r11 * 2 - 2) + Ht) + 2) / 2, easeInElastic: (r11) => r11 === 0 ? 0 : r11 === 1 ? 1 : -Math.pow(2, 10 * r11 - 10) * Math.sin((r11 * 10 - 10.75) * Or), easeOutElastic: (r11) => r11 === 0 ? 0 : r11 === 1 ? 1 : Math.pow(2, -10 * r11) * Math.sin((r11 * 10 - 0.75) * Or) + 1, easeInOutElastic: (r11) => r11 === 0 ? 0 : r11 === 1 ? 1 : r11 < 0.5 ? -(Math.pow(2, 20 * r11 - 10) * Math.sin((20 * r11 - 11.125) * Pr)) / 2 : Math.pow(2, -20 * r11 + 10) * Math.sin((20 * r11 - 11.125) * Pr) / 2 + 1, easeInBounce: (r11) => 1 - qt.easeOutBounce(1 - r11), easeOutBounce: (r11) => r11 < 1 / 2.75 ? 7.5625 * r11 * r11 : r11 < 2 / 2.75 ? 7.5625 * (r11 -= 1.5 / 2.75) * r11 + 0.75 : r11 < 2.5 / 2.75 ? 7.5625 * (r11 -= 2.25 / 2.75) * r11 + 0.9375 : 7.5625 * (r11 -= 2.625 / 2.75) * r11 + 0.984375, easeInOutBounce: (r11) => r11 < 0.5 ? (1 - qt.easeOutBounce(1 - 2 * r11)) / 2 : (1 + qt.easeOutBounce(2 * r11 - 1)) / 2 };
  var tt = qt;
  var vt = class {
    static {
      __name(this, "vt");
    }
    static {
      o(this, "Timer");
    }
    time;
    action;
    finished = false;
    paused = false;
    constructor(t, u) {
      this.time = t, this.action = u;
    }
    tick(t) {
      return this.finished || this.paused ? false : (this.time -= t, this.time <= 0 ? (this.action(), this.finished = true, this.time = 0, true) : false);
    }
    reset(t) {
      this.time = t, this.finished = false;
    }
  };
  var Mr = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAA1CAYAAADyMeOEAAAAAXNSR0IArs4c6QAAAoVJREFUaIHdm7txwkAQhheGAqACiCHzOKQDQrqgILpwSAeEDBnEUAF0gCMxZ7G72qce/mec2Lpf9+3unaS78wgSNZ8uX5729+d1FNWXUuGmXlBOUUEIMckEpeQJgBu6C+BSFngztBR2vd+ovY+7g+p6LbgaWgJrAeUkDYIUXgXdBBwNi6kpABJwMTQH3AZsXRR8GHTfgEth8E3gjdAUcNewpbTgY85sCMCUuOokozE0YM0YRzM9NGAAXd8+omAF5h4lnmBRvpSnZHyLoLEbaN+aKB9KWv/KWw0tAbbANnlG+UvB2dm77NxxdwgBpjrF/d7rW9cbmpvio2A5z8iAYpVU8pGZlo6/2+MSco2lHfd3rv9jAP038e1xef9o2mjvYb2OqpqKE81028/jeietlSEVO5FRWsxWsJit1G3aFpW8iWe5RwpiCZAk25QvV6nz6fIlynRGuTd5WqpJ4guAlDfVKBK87hXljflgv1ON6fV+4+5gVlA17SfeG0heKqQd4l4jI/wrmaA9N9R4ar+wpHJDZyrrfcH0nB66PqAzPi76pn+faSyJk/vzOorYhGurQrzj/P68jtBMawHaHBIR9xoD5O34dy0qQOSYHvqExq2TpT2nf76+w7y251OYF0CRaU+J920TwLUa6inx6OxE6g80lu2ux7Y2eJLF/rCXE6zEPdnenk9o+4ih9AEdnW2q81HXl5LuU6OTl2fXUhqganbXAGq3g6jJOWV/OnoesO6YqqEB/GdNsjf7uHtwj2DzmRNpp7iOZfm6D9oAxB6Yi1gC4oIYeo4MIPdopEQRB+cAko5J1tW386HpB2Kz1eop4Epdwls/kgZ1sh8gZsEjdcWkr//D8Qu3Z3l5Nl1NtAAAAABJRU5ErkJggg==";
  var Rr = cr("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L5QNSqT5iiySS9Ja2SV//5ME0ak//+4KgAAABgQBAADAMDgYCAEgCteQ0fZH6+ICXA357+MPfhR/+ywRf/U///LVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+5JknQAFoWhGLm5gBClBmT3GiAAAAAGkHAAAIAAANIOAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
  var Dr = "data:image/png;base64,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";
  var Gr = "data:image/png;base64,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";
  var xi = "3000.1.5";
  var Fr = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  var $t = "topleft";
  var Br = 64;
  var Ui = "monospace";
  var zt = "monospace";
  var Ei = 36;
  var Lr = 64;
  var Ir = 256;
  var Vr = 2048;
  var jr = 2048;
  var Nr = 2048;
  var kr = 2048;
  var _r = 0.1;
  var Si = 64;
  var Hr = "nearest";
  var Ci = 8;
  var Ti = 4;
  var zr = [{ name: "a_pos", size: 2 }, { name: "a_uv", size: 2 }, { name: "a_color", size: 4 }];
  var Kt = zr.reduce((r11, t) => r11 + t.size, 0);
  var Kr = 2048;
  var qr = Kr * 4 * Kt;
  var $r = Kr * 6;
  var Ai = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec4 a_color;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

vec4 def_vert() {
	return vec4(a_pos, 0.0, 1.0);
}

{{user}}

void main() {
	vec4 pos = vert(a_pos, a_uv, a_color);
	v_pos = a_pos;
	v_uv = a_uv;
	v_color = a_color;
	gl_Position = pos;
}
`;
  var Oi = `
precision mediump float;

varying vec2 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

uniform sampler2D u_tex;

vec4 def_frag() {
	return v_color * texture2D(u_tex, v_uv);
}

{{user}}

void main() {
	gl_FragColor = frag(v_pos, v_uv, v_color, u_tex);
	if (gl_FragColor.a == 0.0) {
		discard;
	}
}
`;
  var jn = `
vec4 vert(vec2 pos, vec2 uv, vec4 color) {
	return def_vert();
}
`;
  var Nn = `
vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
	return def_frag();
}
`;
  var Pi = /* @__PURE__ */ new Set(["id", "require"]);
  var Mi = /* @__PURE__ */ new Set(["add", "update", "draw", "destroy", "inspect", "drawInspect"]);
  function nt(r11) {
    switch (r11) {
      case "topleft":
        return new y(-1, -1);
      case "top":
        return new y(0, -1);
      case "topright":
        return new y(1, -1);
      case "left":
        return new y(-1, 0);
      case "center":
        return new y(0, 0);
      case "right":
        return new y(1, 0);
      case "botleft":
        return new y(-1, 1);
      case "bot":
        return new y(0, 1);
      case "botright":
        return new y(1, 1);
      default:
        return r11;
    }
  }
  __name(nt, "nt");
  o(nt, "anchorPt");
  function Ri(r11) {
    switch (r11) {
      case "left":
        return 0;
      case "center":
        return 0.5;
      case "right":
        return 1;
      default:
        return 0;
    }
  }
  __name(Ri, "Ri");
  o(Ri, "alignPt");
  function Di(r11) {
    return r11.createBuffer(1, 1, 44100);
  }
  __name(Di, "Di");
  o(Di, "createEmptyAudioBuffer");
  var ho = o((r11 = {}) => {
    let t = r11.root ?? document.body;
    t === document.body && (document.body.style.width = "100%", document.body.style.height = "100%", document.body.style.margin = "0px", document.documentElement.style.width = "100%", document.documentElement.style.height = "100%");
    let u = r11.canvas ?? (() => {
      let e = document.createElement("canvas");
      return t.appendChild(e), e;
    })(), w = r11.scale ?? 1, S = r11.width && r11.height && !r11.stretch && !r11.letterbox;
    S ? (u.width = r11.width * w, u.height = r11.height * w) : (u.width = u.parentElement.offsetWidth, u.height = u.parentElement.offsetHeight);
    let B = u.width, $ = u.height, j = r11.pixelDensity || window.devicePixelRatio;
    u.width *= j, u.height *= j;
    let H = ["outline: none", "cursor: default"];
    S ? (H.push(`width: ${B}px`), H.push(`height: ${$}px`)) : (H.push("width: 100%"), H.push("height: 100%")), r11.crisp && (H.push("image-rendering: pixelated"), H.push("image-rendering: crisp-edges")), u.style.cssText = H.join(";"), u.tabIndex = 0;
    let ee = document.createElement("canvas");
    ee.width = Ir, ee.height = Ir;
    let ae = ee.getContext("2d", { willReadFrequently: true }), U = Tr({ canvas: u, touchToMouse: r11.touchToMouse, gamepads: r11.gamepads, pixelDensity: r11.pixelDensity, maxFPS: r11.maxFPS }), X = [], d = U.canvas().getContext("webgl", { antialias: true, depth: true, stencil: true, alpha: true, preserveDrawingBuffer: true });
    class W {
      static {
        __name(this, "W");
      }
      static {
        o(this, "Texture");
      }
      src = null;
      glTex;
      width;
      height;
      constructor(n, s, i = {}) {
        this.glTex = d.createTexture(), X.push(() => this.free()), this.bind(), n && s && d.texImage2D(d.TEXTURE_2D, 0, d.RGBA, n, s, 0, d.RGBA, d.UNSIGNED_BYTE, null), this.width = n, this.height = s;
        let a = (() => {
          switch (i.filter ?? r11.texFilter) {
            case "linear":
              return d.LINEAR;
            case "nearest":
              return d.NEAREST;
            default:
              return d.NEAREST;
          }
        })(), c = (() => {
          switch (i.wrap) {
            case "repeat":
              return d.REPEAT;
            case "clampToEdge":
              return d.CLAMP_TO_EDGE;
            default:
              return d.CLAMP_TO_EDGE;
          }
        })();
        d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MIN_FILTER, a), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_MAG_FILTER, a), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_S, c), d.texParameteri(d.TEXTURE_2D, d.TEXTURE_WRAP_T, c), this.unbind();
      }
      static fromImage(n, s = {}) {
        let i = new W(0, 0, s);
        return i.bind(), d.texImage2D(d.TEXTURE_2D, 0, d.RGBA, d.RGBA, d.UNSIGNED_BYTE, n), i.width = n.width, i.height = n.height, i.unbind(), i.src = n, i;
      }
      update(n, s = 0, i = 0) {
        this.bind(), d.texSubImage2D(d.TEXTURE_2D, 0, s, i, d.RGBA, d.UNSIGNED_BYTE, n), this.unbind();
      }
      bind() {
        d.bindTexture(d.TEXTURE_2D, this.glTex);
      }
      unbind() {
        d.bindTexture(d.TEXTURE_2D, null);
      }
      free() {
        d.deleteTexture(this.glTex);
      }
    }
    class fe {
      static {
        __name(this, "fe");
      }
      static {
        o(this, "TexPacker");
      }
      tex;
      canvas;
      ctx;
      x = 0;
      y = 0;
      curHeight = 0;
      constructor(n, s) {
        this.canvas = document.createElement("canvas"), this.canvas.width = n, this.canvas.height = s, this.tex = W.fromImage(this.canvas), this.ctx = this.canvas.getContext("2d");
      }
      add(n) {
        if (n.width > this.canvas.width || n.height > this.canvas.height)
          throw new Error(`Texture size (${n.width} x ${n.height}) exceeds limit (${this.canvas.width} x ${this.canvas.height})`);
        this.x + n.width > this.canvas.width && (this.x = 0, this.y += this.curHeight, this.curHeight = 0), this.y + n.height > this.canvas.height && (this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.tex = W.fromImage(this.canvas), this.x = 0, this.y = 0, this.curHeight = 0);
        let s = new y(this.x, this.y);
        return this.x += n.width, n.height > this.curHeight && (this.curHeight = n.height), n instanceof ImageData ? this.ctx.putImageData(n, s.x, s.y) : this.ctx.drawImage(n, s.x, s.y), this.tex.update(this.canvas), [this.tex, new ie(s.x / this.canvas.width, s.y / this.canvas.height, n.width / this.canvas.width, n.height / this.canvas.height)];
      }
    }
    class De {
      static {
        __name(this, "De");
      }
      static {
        o(this, "FrameBuffer");
      }
      tex;
      glFrameBuffer;
      glRenderBuffer;
      constructor(n, s, i = {}) {
        this.tex = new W(n, s, i), this.glFrameBuffer = d.createFramebuffer(), this.glRenderBuffer = d.createRenderbuffer(), X.push(() => this.free()), this.bind(), d.renderbufferStorage(d.RENDERBUFFER, d.DEPTH_STENCIL, n, s), d.framebufferTexture2D(d.FRAMEBUFFER, d.COLOR_ATTACHMENT0, d.TEXTURE_2D, this.tex.glTex, 0), d.framebufferRenderbuffer(d.FRAMEBUFFER, d.DEPTH_STENCIL_ATTACHMENT, d.RENDERBUFFER, this.glRenderBuffer), this.unbind();
      }
      get width() {
        return this.tex.width;
      }
      get height() {
        return this.tex.height;
      }
      bind() {
        d.bindFramebuffer(d.FRAMEBUFFER, this.glFrameBuffer), d.bindRenderbuffer(d.RENDERBUFFER, this.glRenderBuffer);
      }
      unbind() {
        d.bindFramebuffer(d.FRAMEBUFFER, null), d.bindRenderbuffer(d.RENDERBUFFER, null);
      }
      free() {
        d.deleteFramebuffer(this.glFrameBuffer), d.deleteRenderbuffer(this.glRenderBuffer), this.tex.free();
      }
    }
    let v = (() => {
      let e = Ke(jn, Nn), n = W.fromImage(new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)), s = r11.width && r11.height ? new De(r11.width * j, r11.height * j) : new De(d.drawingBufferWidth, d.drawingBufferHeight), i = null, a = 1;
      r11.background && (i = q.fromArray(r11.background), a = r11.background[3] ?? 1, d.clearColor(i.r / 255, i.g / 255, i.b / 255, a)), d.enable(d.BLEND), d.enable(d.SCISSOR_TEST), d.blendFuncSeparate(d.SRC_ALPHA, d.ONE_MINUS_SRC_ALPHA, d.ONE, d.ONE_MINUS_SRC_ALPHA);
      let c = d.createBuffer();
      d.bindBuffer(d.ARRAY_BUFFER, c), d.bufferData(d.ARRAY_BUFFER, qr * 4, d.DYNAMIC_DRAW), zr.reduce((m, l, p) => (d.vertexAttribPointer(p, l.size, d.FLOAT, false, Kt * 4, m), d.enableVertexAttribArray(p), m + l.size * 4), 0), d.bindBuffer(d.ARRAY_BUFFER, null);
      let f = d.createBuffer();
      d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, f), d.bufferData(d.ELEMENT_ARRAY_BUFFER, $r * 4, d.DYNAMIC_DRAW), d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, null);
      let g = W.fromImage(new ImageData(new Uint8ClampedArray([128, 128, 128, 255, 190, 190, 190, 255, 190, 190, 190, 255, 128, 128, 128, 255]), 2, 2), { wrap: "repeat", filter: "nearest" });
      return { drawCalls: 0, lastDrawCalls: 0, defShader: e, curShader: e, frameBuffer: s, postShader: null, postShaderUniform: null, defTex: n, curTex: n, curUniform: {}, vbuf: c, ibuf: f, vqueue: [], iqueue: [], transform: new be(), transformStack: [], bgTex: g, bgColor: i, bgAlpha: a, width: r11.width ?? d.drawingBufferWidth / j / w, height: r11.height ?? d.drawingBufferHeight / j / w, viewport: { x: 0, y: 0, width: d.drawingBufferWidth, height: d.drawingBufferHeight }, fixed: false };
    })();
    class ce {
      static {
        __name(this, "ce");
      }
      static {
        o(this, "SpriteData");
      }
      tex;
      frames = [new ie(0, 0, 1, 1)];
      anims = {};
      slice9 = null;
      constructor(n, s, i = {}, a = null) {
        this.tex = n, s && (this.frames = s), this.anims = i, this.slice9 = a;
      }
      get width() {
        return this.tex.width * this.frames[0].w;
      }
      get height() {
        return this.tex.height * this.frames[0].h;
      }
      static from(n, s = {}) {
        return typeof n == "string" ? ce.fromURL(n, s) : Promise.resolve(ce.fromImage(n, s));
      }
      static fromImage(n, s = {}) {
        let [i, a] = V.packer.add(n), c = s.frames ? s.frames.map((f) => new ie(a.x + f.x * a.w, a.y + f.y * a.h, f.w * a.w, f.h * a.h)) : bt(s.sliceX || 1, s.sliceY || 1, a.x, a.y, a.w, a.h);
        return new ce(i, c, s.anims, s.slice9);
      }
      static fromURL(n, s = {}) {
        return $e(n).then((i) => ce.fromImage(i, s));
      }
    }
    class ge {
      static {
        __name(this, "ge");
      }
      static {
        o(this, "SoundData");
      }
      buf;
      constructor(n) {
        this.buf = n;
      }
      static fromArrayBuffer(n) {
        return new Promise((s, i) => re.ctx.decodeAudioData(n, s, i)).then((s) => new ge(s));
      }
      static fromURL(n) {
        return Bn(n) ? ge.fromArrayBuffer(Ur(n)) : Wt(n).then((s) => ge.fromArrayBuffer(s));
      }
    }
    let re = (() => {
      let e = new (window.AudioContext || window.webkitAudioContext)(), n = e.createGain();
      n.connect(e.destination);
      let s = new ge(Di(e));
      return e.decodeAudioData(Rr.buffer.slice(0)).then((i) => {
        s.buf = i;
      }).catch((i) => {
        console.error("Failed to load burp: ", i);
      }), { ctx: e, masterNode: n, burpSnd: s };
    })();
    class ue {
      static {
        __name(this, "ue");
      }
      static {
        o(this, "Asset");
      }
      loaded = false;
      data = null;
      error = null;
      onLoadEvents = new ve();
      onErrorEvents = new ve();
      onFinishEvents = new ve();
      constructor(n) {
        n.then((s) => {
          this.data = s, this.onLoadEvents.trigger(s);
        }).catch((s) => {
          if (this.error = s, this.onErrorEvents.numListeners() > 0)
            this.onErrorEvents.trigger(s);
          else
            throw s;
        }).finally(() => {
          this.onFinishEvents.trigger(), this.loaded = true;
        });
      }
      static loaded(n) {
        let s = new ue(Promise.resolve(n));
        return s.data = n, s.loaded = true, s;
      }
      onLoad(n) {
        return this.loaded && this.data ? n(this.data) : this.onLoadEvents.add(n), this;
      }
      onError(n) {
        return this.loaded && this.error ? n(this.error) : this.onErrorEvents.add(n), this;
      }
      onFinish(n) {
        return this.loaded ? n() : this.onFinishEvents.add(n), this;
      }
      then(n) {
        return this.onLoad(n);
      }
      catch(n) {
        return this.onError(n);
      }
      finally(n) {
        return this.onFinish(n);
      }
    }
    class ye {
      static {
        __name(this, "ye");
      }
      static {
        o(this, "AssetBucket");
      }
      assets = /* @__PURE__ */ new Map();
      lastUID = 0;
      add(n, s) {
        let i = n ?? this.lastUID++ + "", a = new ue(s);
        return this.assets.set(i, a), a;
      }
      addLoaded(n, s) {
        let i = n ?? this.lastUID++ + "", a = ue.loaded(s);
        return this.assets.set(i, a), a;
      }
      get(n) {
        return this.assets.get(n);
      }
      progress() {
        if (this.assets.size === 0)
          return 1;
        let n = 0;
        return this.assets.forEach((s) => {
          s.loaded && n++;
        }), n / this.assets.size;
      }
    }
    let V = { urlPrefix: "", sprites: new ye(), fonts: new ye(), bitmapFonts: new ye(), sounds: new ye(), shaders: new ye(), custom: new ye(), packer: new fe(Nr, kr), loaded: false }, A = { events: new Re(), objEvents: new Re(), root: fn([]), gravity: 0, scenes: {}, logs: [], cam: { pos: null, scale: new y(1), angle: 0, shake: 0, transform: new be() } };
    function rt(e) {
      return V.custom.add(null, e);
    }
    __name(rt, "rt");
    o(rt, "load");
    function Ce() {
      let e = [V.sprites, V.sounds, V.shaders, V.fonts, V.bitmapFonts, V.custom];
      return e.reduce((n, s) => n + s.progress(), 0) / e.length;
    }
    __name(Ce, "Ce");
    o(Ce, "loadProgress");
    function Yt(e) {
      return e !== void 0 && (V.urlPrefix = e), V.urlPrefix;
    }
    __name(Yt, "Yt");
    o(Yt, "loadRoot");
    function st(e) {
      let n = V.urlPrefix + e;
      return fetch(n).then((s) => {
        if (!s.ok)
          throw new Error(`Failed to fetch "${n}"`);
        return s;
      });
    }
    __name(st, "st");
    o(st, "fetchURL");
    function qe(e) {
      return st(e).then((n) => n.json());
    }
    __name(qe, "qe");
    o(qe, "fetchJSON");
    function Xt(e) {
      return st(e).then((n) => n.text());
    }
    __name(Xt, "Xt");
    o(Xt, "fetchText");
    function Wt(e) {
      return st(e).then((n) => n.arrayBuffer());
    }
    __name(Wt, "Wt");
    o(Wt, "fetchArrayBuffer");
    function $e(e) {
      let n = new Image();
      return n.crossOrigin = "anonymous", n.src = Bn(e) ? e : V.urlPrefix + e, new Promise((s, i) => {
        n.onload = () => s(n), n.onerror = () => i(new Error(`Failed to load image from "${e}"`));
      });
    }
    __name($e, "$e");
    o($e, "loadImg");
    function Jt(e, n) {
      return V.custom.add(e, qe(n));
    }
    __name(Jt, "Jt");
    o(Jt, "loadJSON");
    class ze {
      static {
        __name(this, "ze");
      }
      static {
        o(this, "FontData");
      }
      fontface;
      outline;
      filter;
      constructor(n, s = {}) {
        this.fontface = n, this.outline = s.outline ?? 0, this.filter = s.filter ?? Hr;
      }
    }
    function Qt(e, n, s = {}) {
      let i = new FontFace(e, typeof n == "string" ? `url(${n})` : n);
      return document.fonts.add(i), V.fonts.add(e, i.load().catch((a) => {
        throw new Error(`Failed to load font from "${n}": ${a}`);
      }).then((a) => new ze(a, s)));
    }
    __name(Qt, "Qt");
    o(Qt, "loadFont");
    function Zt(e, n, s, i, a = {}) {
      return V.bitmapFonts.add(e, $e(n).then((c) => ln(W.fromImage(c, a), s, i, a.chars ?? Fr)));
    }
    __name(Zt, "Zt");
    o(Zt, "loadBitmapFont");
    function bt(e = 1, n = 1, s = 0, i = 0, a = 1, c = 1) {
      let f = [], g = a / e, m = c / n;
      for (let l = 0; l < n; l++)
        for (let p = 0; p < e; p++)
          f.push(new ie(s + p * g, i + l * m, g, m));
      return f;
    }
    __name(bt, "bt");
    o(bt, "slice");
    function yt(e, n) {
      return rt(typeof n == "string" ? new Promise((s, i) => {
        qe(n).then((a) => {
          yt(e, a).then(s).catch(i);
        });
      }) : ce.from(e).then((s) => {
        let i = {};
        for (let a in n) {
          let c = n[a], f = s.frames[0], g = Nr * f.w, m = kr * f.h, l = c.frames ? c.frames.map((C) => new ie(f.x + (c.x + C.x) / g * f.w, f.y + (c.y + C.y) / m * f.h, C.w / g * f.w, C.h / m * f.h)) : bt(c.sliceX || 1, c.sliceY || 1, f.x + c.x / g * f.w, f.y + c.y / m * f.h, c.width / g * f.w, c.height / m * f.h), p = new ce(s.tex, l, c.anims);
          V.sprites.addLoaded(a, p), i[a] = p;
        }
        return i;
      }));
    }
    __name(yt, "yt");
    o(yt, "loadSpriteAtlas");
    function xt(e, n = {}) {
      let s = document.createElement("canvas"), i = e[0].width, a = e[0].height;
      s.width = i * e.length, s.height = a;
      let c = s.getContext("2d");
      e.forEach((g, m) => {
        g instanceof ImageData ? c.putImageData(g, m * i, 0) : c.drawImage(g, m * i, 0);
      });
      let f = c.getImageData(0, 0, e.length * i, a);
      return ce.fromImage(f, { ...n, sliceX: e.length, sliceY: 1 });
    }
    __name(xt, "xt");
    o(xt, "createSpriteSheet");
    function Ie(e, n, s = { sliceX: 1, sliceY: 1, anims: {} }) {
      return Array.isArray(n) ? n.some((i) => typeof i == "string") ? V.sprites.add(e, Promise.all(n.map((i) => typeof i == "string" ? $e(i) : Promise.resolve(i))).then((i) => xt(i, s))) : V.sprites.addLoaded(e, xt(n, s)) : typeof n == "string" ? V.sprites.add(e, ce.from(n, s)) : V.sprites.addLoaded(e, ce.fromImage(n, s));
    }
    __name(Ie, "Ie");
    o(Ie, "loadSprite");
    function en(e, n) {
      return V.sprites.add(e, new Promise(async (s) => {
        let i = typeof n == "string" ? await qe(n) : n, a = await Promise.all(i.frames.map($e)), c = document.createElement("canvas");
        c.width = i.width, c.height = i.height * i.frames.length;
        let f = c.getContext("2d");
        a.forEach((m, l) => {
          f.drawImage(m, 0, l * i.height);
        });
        let g = await Ie(null, c, { sliceY: i.frames.length, anims: i.anims });
        s(g);
      }));
    }
    __name(en, "en");
    o(en, "loadPedit");
    function tn(e, n, s) {
      typeof n == "string" && !s && (s = n.replace(new RegExp(`${Sr(n)}$`), "json"));
      let i = typeof s == "string" ? qe(s) : Promise.resolve(s);
      return V.sprites.add(e, i.then((a) => {
        let c = a.meta.size, f = a.frames.map((m) => new ie(m.frame.x / c.w, m.frame.y / c.h, m.frame.w / c.w, m.frame.h / c.h)), g = {};
        for (let m of a.meta.frameTags)
          m.from === m.to ? g[m.name] = m.from : g[m.name] = { from: m.from, to: m.to, speed: 10, loop: true, pingpong: m.direction === "pingpong" };
        return ce.from(n, { frames: f, anims: g });
      }));
    }
    __name(tn, "tn");
    o(tn, "loadAseprite");
    function nn(e, n, s) {
      return V.shaders.addLoaded(e, Ke(n, s));
    }
    __name(nn, "nn");
    o(nn, "loadShader");
    function rn(e, n, s) {
      let i = o((c) => c ? Xt(c) : Promise.resolve(null), "resolveUrl"), a = Promise.all([i(n), i(s)]).then(([c, f]) => Ke(c, f));
      return V.shaders.add(e, a);
    }
    __name(rn, "rn");
    o(rn, "loadShaderURL");
    function sn(e, n) {
      return V.sounds.add(e, typeof n == "string" ? ge.fromURL(n) : ge.fromArrayBuffer(n));
    }
    __name(sn, "sn");
    o(sn, "loadSound");
    function on(e = "bean") {
      return Ie(e, Mr);
    }
    __name(on, "on");
    o(on, "loadBean");
    function Ut(e) {
      return V.sprites.get(e);
    }
    __name(Ut, "Ut");
    o(Ut, "getSprite");
    function Et(e) {
      return V.sounds.get(e);
    }
    __name(Et, "Et");
    o(Et, "getSound");
    function St(e) {
      return V.fonts.get(e);
    }
    __name(St, "St");
    o(St, "getFont");
    function Ct(e) {
      return V.bitmapFonts.get(e);
    }
    __name(Ct, "Ct");
    o(Ct, "getBitmapFont");
    function Tt(e) {
      return V.shaders.get(e);
    }
    __name(Tt, "Tt");
    o(Tt, "getShader");
    function an(e) {
      return V.custom.get(e);
    }
    __name(an, "an");
    o(an, "getAsset");
    function it(e) {
      if (typeof e == "string") {
        let n = Ut(e);
        if (n)
          return n;
        if (Ce() < 1)
          return null;
        throw new Error(`Sprite not found: ${e}`);
      } else {
        if (e instanceof ce)
          return ue.loaded(e);
        if (e instanceof ue)
          return e;
        throw new Error(`Invalid sprite: ${e}`);
      }
    }
    __name(it, "it");
    o(it, "resolveSprite");
    function un(e) {
      if (typeof e == "string") {
        let n = Et(e);
        if (n)
          return n;
        if (Ce() < 1)
          return null;
        throw new Error(`Sound not found: ${e}`);
      } else {
        if (e instanceof ge)
          return ue.loaded(e);
        if (e instanceof ue)
          return e;
        throw new Error(`Invalid sound: ${e}`);
      }
    }
    __name(un, "un");
    o(un, "resolveSound");
    function cn(e) {
      if (!e)
        return v.defShader;
      if (typeof e == "string") {
        let n = Tt(e);
        if (n)
          return n.data ?? n;
        if (Ce() < 1)
          return null;
        throw new Error(`Shader not found: ${e}`);
      } else if (e instanceof ue)
        return e.data ? e.data : e;
      return e;
    }
    __name(cn, "cn");
    o(cn, "resolveShader");
    function At(e) {
      if (!e)
        return At(r11.font ?? Ui);
      if (typeof e == "string") {
        let n = Ct(e), s = St(e);
        if (n)
          return n.data ?? n;
        if (s)
          return s.data ?? s;
        if (document.fonts.check(`${Lr}px ${e}`))
          return e;
        if (Ce() < 1)
          return null;
        throw new Error(`Font not found: ${e}`);
      } else if (e instanceof ue)
        return e.data ? e.data : e;
      return e;
    }
    __name(At, "At");
    o(At, "resolveFont");
    function Ot(e) {
      return e !== void 0 && (re.masterNode.gain.value = e), re.masterNode.gain.value;
    }
    __name(Ot, "Ot");
    o(Ot, "volume");
    function Pt(e, n = {}) {
      let s = re.ctx, i = n.paused ?? false, a = s.createBufferSource(), c = new ve(), f = s.createGain(), g = n.seek ?? 0, m = 0, l = 0, p = false;
      a.loop = !!n.loop, a.detune.value = n.detune ?? 0, a.playbackRate.value = n.speed ?? 1, a.connect(f), a.onended = () => {
        G() >= a.buffer?.duration && c.trigger();
      }, f.connect(re.masterNode), f.gain.value = n.volume ?? 1;
      let C = o((M) => {
        a.buffer = M.buf, i || (m = s.currentTime, a.start(0, g), p = true);
      }, "start"), R = un(e);
      R instanceof ue && R.onLoad(C);
      let G = o(() => {
        if (!a.buffer)
          return 0;
        let M = i ? l - m : s.currentTime - m, O = a.buffer.duration;
        return a.loop ? M % O : Math.min(M, O);
      }, "getTime"), k = o((M) => {
        let O = s.createBufferSource();
        return O.buffer = M.buffer, O.loop = M.loop, O.playbackRate.value = M.playbackRate.value, O.detune.value = M.detune.value, O.onended = M.onended, O.connect(f), O;
      }, "cloneNode");
      return { stop() {
        this.paused = true, this.seek(0);
      }, set paused(M) {
        if (i !== M)
          if (i = M, M)
            p && (a.stop(), p = false), l = s.currentTime;
          else {
            a = k(a);
            let O = l - m;
            a.start(0, O), p = true, m = s.currentTime - O, l = 0;
          }
      }, get paused() {
        return i;
      }, play(M = 0) {
        this.seek(M), this.paused = false;
      }, seek(M) {
        a.buffer?.duration && (M > a.buffer.duration || (i ? (a = k(a), m = l - M) : (a.stop(), a = k(a), m = s.currentTime - M, a.start(0, M), p = true, l = 0)));
      }, set speed(M) {
        a.playbackRate.value = M;
      }, get speed() {
        return a.playbackRate.value;
      }, set detune(M) {
        a.detune.value = M;
      }, get detune() {
        return a.detune.value;
      }, set volume(M) {
        f.gain.value = Math.max(M, 0);
      }, get volume() {
        return f.gain.value;
      }, set loop(M) {
        a.loop = M;
      }, get loop() {
        return a.loop;
      }, duration() {
        return a.buffer?.duration ?? 0;
      }, time() {
        return G() % this.duration();
      }, onEnd(M) {
        return c.add(M);
      }, then(M) {
        return this.onEnd(M);
      } };
    }
    __name(Pt, "Pt");
    o(Pt, "play");
    function Mt(e) {
      return Pt(re.burpSnd, e);
    }
    __name(Mt, "Mt");
    o(Mt, "burp");
    function Ke(e = jn, n = Nn) {
      let s = Ai.replace("{{user}}", e ?? jn), i = Oi.replace("{{user}}", n ?? Nn), a = d.createShader(d.VERTEX_SHADER), c = d.createShader(d.FRAGMENT_SHADER);
      d.shaderSource(a, s), d.shaderSource(c, i), d.compileShader(a), d.compileShader(c);
      let f = d.createProgram();
      if (X.push(() => d.deleteProgram(f)), d.attachShader(f, a), d.attachShader(f, c), d.bindAttribLocation(f, 0, "a_pos"), d.bindAttribLocation(f, 1, "a_uv"), d.bindAttribLocation(f, 2, "a_color"), d.linkProgram(f), !d.getProgramParameter(f, d.LINK_STATUS)) {
        let g = o((C) => {
          let R = /^ERROR:\s0:(?<line>\d+):\s(?<msg>.+)/, G = C.match(R);
          return { line: Number(G.groups.line), msg: G.groups.msg.replace(/\n\0$/, "") };
        }, "formatShaderError"), m = d.getShaderInfoLog(a), l = d.getShaderInfoLog(c), p = "";
        if (m) {
          let C = g(m);
          p += `Vertex shader line ${C.line - 14}: ${C.msg}`;
        }
        if (l) {
          let C = g(l);
          p += `Fragment shader line ${C.line - 14}: ${C.msg}`;
        }
        throw new Error(p);
      }
      return d.deleteShader(a), d.deleteShader(c), { bind() {
        d.useProgram(f);
      }, unbind() {
        d.useProgram(null);
      }, free() {
        d.deleteProgram(f);
      }, send(g) {
        for (let m in g) {
          let l = g[m], p = d.getUniformLocation(f, m);
          typeof l == "number" ? d.uniform1f(p, l) : l instanceof be ? d.uniformMatrix4fv(p, false, new Float32Array(l.m)) : l instanceof q ? d.uniform3f(p, l.r, l.g, l.b) : l instanceof y && d.uniform2f(p, l.x, l.y);
        }
      } };
    }
    __name(Ke, "Ke");
    o(Ke, "makeShader");
    function ln(e, n, s, i) {
      let a = e.width / n, c = {}, f = i.split("").entries();
      for (let [g, m] of f)
        c[m] = new ie(g % a * n, Math.floor(g / a) * s, n, s);
      return { tex: e, map: c, size: s };
    }
    __name(ln, "ln");
    o(ln, "makeFont");
    function ot(e, n, s, i = v.defTex, a = v.defShader, c = {}) {
      let f = cn(a);
      if (!f || f instanceof ue)
        return;
      (i !== v.curTex || f !== v.curShader || !Dn(v.curUniform, c) || v.vqueue.length + e.length * Kt > qr || v.iqueue.length + n.length > $r) && z();
      let g = v.fixed || s ? v.transform : A.cam.transform.mult(v.transform);
      for (let m of e) {
        let l = hn(g.multVec2(m.pos));
        v.vqueue.push(l.x, l.y, m.uv.x, m.uv.y, m.color.r / 255, m.color.g / 255, m.color.b / 255, m.opacity);
      }
      for (let m of n)
        v.iqueue.push(m + v.vqueue.length / Kt - e.length);
      v.curTex = i, v.curShader = f, v.curUniform = c;
    }
    __name(ot, "ot");
    o(ot, "drawRaw");
    function z() {
      !v.curTex || !v.curShader || v.vqueue.length === 0 || v.iqueue.length === 0 || (d.bindBuffer(d.ARRAY_BUFFER, v.vbuf), d.bufferSubData(d.ARRAY_BUFFER, 0, new Float32Array(v.vqueue)), d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, v.ibuf), d.bufferSubData(d.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(v.iqueue)), v.curShader.bind(), v.curShader.send(v.curUniform), v.curTex.bind(), d.drawElements(d.TRIANGLES, v.iqueue.length, d.UNSIGNED_SHORT, 0), v.curTex.unbind(), v.curShader.unbind(), d.bindBuffer(d.ARRAY_BUFFER, null), d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, null), v.vqueue.length = 0, v.iqueue.length = 0, v.drawCalls++);
    }
    __name(z, "z");
    o(z, "flush");
    function Ge() {
      d.clear(d.COLOR_BUFFER_BIT), v.frameBuffer.bind(), d.viewport(0, 0, v.frameBuffer.width, v.frameBuffer.height), d.clear(d.COLOR_BUFFER_BIT), v.bgColor || Be(() => {
        me({ width: pe(), height: we(), quad: new ie(0, 0, pe() / Br, we() / Br), tex: v.bgTex, fixed: true });
      }), v.drawCalls = 0, v.fixed = false, v.transformStack.length = 0, v.transform = new be();
    }
    __name(Ge, "Ge");
    o(Ge, "frameStart");
    function Fe(e, n) {
      v.postShader = e, v.postShaderUniform = n ?? null;
    }
    __name(Fe, "Fe");
    o(Fe, "usePostEffect");
    function at() {
      z(), v.frameBuffer.unbind(), d.viewport(0, 0, d.drawingBufferWidth, d.drawingBufferHeight), z();
      let e = v.width, n = v.height;
      v.width = d.drawingBufferWidth / j, v.height = d.drawingBufferHeight / j, Z({ flipY: true, tex: v.frameBuffer.tex, pos: new y(v.viewport.x, v.viewport.y), width: v.viewport.width, height: v.viewport.height, shader: v.postShader, uniform: typeof v.postShaderUniform == "function" ? v.postShaderUniform() : v.postShaderUniform, fixed: true }), z(), v.width = e, v.height = n, v.lastDrawCalls = v.drawCalls;
    }
    __name(at, "at");
    o(at, "frameEnd");
    function hn(e) {
      return new y(e.x / pe() * 2 - 1, -e.y / we() * 2 + 1);
    }
    __name(hn, "hn");
    o(hn, "screen2ndc");
    function Rt(e) {
      v.transform = e.clone();
    }
    __name(Rt, "Rt");
    o(Rt, "pushMatrix");
    function Q(...e) {
      if (e[0] === void 0)
        return;
      let n = T(...e);
      n.x === 0 && n.y === 0 || v.transform.translate(n);
    }
    __name(Q, "Q");
    o(Q, "pushTranslate");
    function h(...e) {
      if (e[0] === void 0)
        return;
      let n = T(...e);
      n.x === 1 && n.y === 1 || v.transform.scale(n);
    }
    __name(h, "h");
    o(h, "pushScale");
    function x(e) {
      e && v.transform.rotate(e);
    }
    __name(x, "x");
    o(x, "pushRotate");
    function E() {
      v.transformStack.push(v.transform.clone());
    }
    __name(E, "E");
    o(E, "pushTransform");
    function L() {
      v.transformStack.length > 0 && (v.transform = v.transformStack.pop());
    }
    __name(L, "L");
    o(L, "popTransform");
    function me(e) {
      if (e.width === void 0 || e.height === void 0)
        throw new Error('drawUVQuad() requires property "width" and "height".');
      if (e.width <= 0 || e.height <= 0)
        return;
      let n = e.width, s = e.height, a = nt(e.anchor || $t).scale(new y(n, s).scale(-0.5)), c = e.quad || new ie(0, 0, 1, 1), f = e.color || J(255, 255, 255), g = e.opacity ?? 1, m = e.tex ? _r / e.tex.width : 0, l = e.tex ? _r / e.tex.height : 0, p = c.x + m, C = c.y + l, R = c.w - m * 2, G = c.h - l * 2;
      E(), Q(e.pos), x(e.angle), h(e.scale), Q(a), ot([{ pos: new y(-n / 2, s / 2), uv: new y(e.flipX ? p + R : p, e.flipY ? C : C + G), color: f, opacity: g }, { pos: new y(-n / 2, -s / 2), uv: new y(e.flipX ? p + R : p, e.flipY ? C + G : C), color: f, opacity: g }, { pos: new y(n / 2, -s / 2), uv: new y(e.flipX ? p : p + R, e.flipY ? C + G : C), color: f, opacity: g }, { pos: new y(n / 2, s / 2), uv: new y(e.flipX ? p : p + R, e.flipY ? C : C + G), color: f, opacity: g }], [0, 1, 3, 1, 2, 3], e.fixed, e.tex, e.shader, e.uniform), L();
    }
    __name(me, "me");
    o(me, "drawUVQuad");
    function Z(e) {
      if (!e.tex)
        throw new Error('drawTexture() requires property "tex".');
      let n = e.quad ?? new ie(0, 0, 1, 1), s = e.tex.width * n.w, i = e.tex.height * n.h, a = new y(1);
      if (e.tiled) {
        let c = Math.ceil((e.width || s) / s), f = Math.ceil((e.height || i) / i), m = nt(e.anchor || $t).add(new y(1, 1)).scale(0.5).scale(c * s, f * i);
        for (let l = 0; l < c; l++)
          for (let p = 0; p < f; p++)
            me(Object.assign({}, e, { pos: (e.pos || new y(0)).add(new y(s * l, i * p)).sub(m), scale: a.scale(e.scale || new y(1)), tex: e.tex, quad: n, width: s, height: i, anchor: "topleft" }));
      } else
        e.width && e.height ? (a.x = e.width / s, a.y = e.height / i) : e.width ? (a.x = e.width / s, a.y = a.x) : e.height && (a.y = e.height / i, a.x = a.y), me(Object.assign({}, e, { scale: a.scale(e.scale || new y(1)), tex: e.tex, quad: n, width: s, height: i }));
    }
    __name(Z, "Z");
    o(Z, "drawTexture");
    function Ye(e) {
      if (!e.sprite)
        throw new Error('drawSprite() requires property "sprite"');
      let n = it(e.sprite);
      if (!n || !n.data)
        return;
      let s = n.data.frames[e.frame ?? 0];
      if (!s)
        throw new Error(`Frame not found: ${e.frame ?? 0}`);
      Z(Object.assign({}, e, { tex: n.data.tex, quad: s.scale(e.quad ?? new ie(0, 0, 1, 1)) }));
    }
    __name(Ye, "Ye");
    o(Ye, "drawSprite");
    function Te(e, n, s, i, a, c = 1) {
      i = Ee(i % 360), a = Ee(a % 360), a <= i && (a += Math.PI * 2);
      let f = [], g = Math.ceil((a - i) / Ee(8) * c), m = (a - i) / g;
      for (let l = i; l < a; l += m)
        f.push(e.add(n * Math.cos(l), s * Math.sin(l)));
      return f.push(e.add(n * Math.cos(a), s * Math.sin(a))), f;
    }
    __name(Te, "Te");
    o(Te, "getArcPts");
    function xe(e) {
      if (e.width === void 0 || e.height === void 0)
        throw new Error('drawRect() requires property "width" and "height".');
      if (e.width <= 0 || e.height <= 0)
        return;
      let n = e.width, s = e.height, a = nt(e.anchor || $t).add(1, 1).scale(new y(n, s).scale(-0.5)), c = [new y(0, 0), new y(n, 0), new y(n, s), new y(0, s)];
      if (e.radius) {
        let f = Math.min(Math.min(n, s) / 2, e.radius);
        c = [new y(f, 0), new y(n - f, 0), ...Te(new y(n - f, f), f, f, 270, 360), new y(n, f), new y(n, s - f), ...Te(new y(n - f, s - f), f, f, 0, 90), new y(n - f, s), new y(f, s), ...Te(new y(f, s - f), f, f, 90, 180), new y(0, s - f), new y(0, f), ...Te(new y(f, f), f, f, 180, 270)];
      }
      Ve(Object.assign({}, e, { offset: a, pts: c, ...e.gradient ? { colors: e.horizontal ? [e.gradient[0], e.gradient[1], e.gradient[1], e.gradient[0]] : [e.gradient[0], e.gradient[0], e.gradient[1], e.gradient[1]] } : {} }));
    }
    __name(xe, "xe");
    o(xe, "drawRect");
    function ut(e) {
      let { p1: n, p2: s } = e;
      if (!n || !s)
        throw new Error('drawLine() requires properties "p1" and "p2".');
      let i = e.width || 1, a = s.sub(n).unit().normal().scale(i * 0.5), c = [n.sub(a), n.add(a), s.add(a), s.sub(a)].map((f) => ({ pos: new y(f.x, f.y), uv: new y(0), color: e.color ?? q.WHITE, opacity: e.opacity ?? 1 }));
      ot(c, [0, 1, 3, 1, 2, 3], e.fixed, v.defTex, e.shader, e.uniform);
    }
    __name(ut, "ut");
    o(ut, "drawLine");
    function kn(e) {
      let n = e.pts;
      if (!n)
        throw new Error('drawLines() requires property "pts".');
      if (!(n.length < 2))
        if (e.radius && n.length >= 3) {
          let s = n[0].sdist(n[1]);
          for (let a = 1; a < n.length - 1; a++)
            s = Math.min(n[a].sdist(n[a + 1]), s);
          let i = Math.min(e.radius, Math.sqrt(s) / 2);
          ut(Object.assign({}, e, { p1: n[0], p2: n[1] }));
          for (let a = 1; a < n.length - 2; a++) {
            let c = n[a], f = n[a + 1];
            ut(Object.assign({}, e, { p1: c, p2: f }));
          }
          ut(Object.assign({}, e, { p1: n[n.length - 2], p2: n[n.length - 1] }));
        } else
          for (let s = 0; s < n.length - 1; s++)
            ut(Object.assign({}, e, { p1: n[s], p2: n[s + 1] })), e.join !== "none" && Xe(Object.assign({}, e, { pos: n[s], radius: e.width / 2 }));
    }
    __name(kn, "kn");
    o(kn, "drawLines");
    function _n(e) {
      if (!e.p1 || !e.p2 || !e.p3)
        throw new Error('drawPolygon() requires properties "p1", "p2" and "p3".');
      return Ve(Object.assign({}, e, { pts: [e.p1, e.p2, e.p3] }));
    }
    __name(_n, "_n");
    o(_n, "drawTriangle");
    function Xe(e) {
      if (typeof e.radius != "number")
        throw new Error('drawCircle() requires property "radius".');
      e.radius !== 0 && Hn(Object.assign({}, e, { radiusX: e.radius, radiusY: e.radius, angle: 0 }));
    }
    __name(Xe, "Xe");
    o(Xe, "drawCircle");
    function Hn(e) {
      if (e.radiusX === void 0 || e.radiusY === void 0)
        throw new Error('drawEllipse() requires properties "radiusX" and "radiusY".');
      if (e.radiusX === 0 || e.radiusY === 0)
        return;
      let n = e.start ?? 0, s = e.end ?? 360, i = nt(e.anchor ?? "center").scale(new y(-e.radiusX, -e.radiusY)), a = Te(i, e.radiusX, e.radiusY, n, s, e.resolution);
      a.unshift(i);
      let c = Object.assign({}, e, { pts: a, radius: 0, ...e.gradient ? { colors: [e.gradient[0], ...Array(a.length - 1).fill(e.gradient[1])] } : {} });
      if (s - n >= 360 && e.outline) {
        e.fill !== false && Ve(Object.assign(c, { outline: null })), Ve(Object.assign(c, { pts: a.slice(1), fill: false }));
        return;
      }
      Ve(c);
    }
    __name(Hn, "Hn");
    o(Hn, "drawEllipse");
    function Ve(e) {
      if (!e.pts)
        throw new Error('drawPolygon() requires property "pts".');
      let n = e.pts.length;
      if (!(n < 3)) {
        if (E(), Q(e.pos), h(e.scale), x(e.angle), Q(e.offset), e.fill !== false) {
          let s = e.color ?? q.WHITE, i = e.pts.map((c, f) => ({ pos: new y(c.x, c.y), uv: new y(0, 0), color: e.colors ? e.colors[f] ?? s : s, opacity: e.opacity ?? 1 })), a = [...Array(n - 2).keys()].map((c) => [0, c + 1, c + 2]).flat();
          ot(i, e.indices ?? a, e.fixed, v.defTex, e.shader, e.uniform);
        }
        e.outline && kn({ pts: [...e.pts, e.pts[0]], radius: e.radius, width: e.outline.width, color: e.outline.color, join: e.outline.join, uniform: e.uniform, fixed: e.fixed, opacity: e.opacity }), L();
      }
    }
    __name(Ve, "Ve");
    o(Ve, "drawPolygon");
    function qn(e, n, s) {
      z(), d.clear(d.STENCIL_BUFFER_BIT), d.enable(d.STENCIL_TEST), d.stencilFunc(d.NEVER, 1, 255), d.stencilOp(d.REPLACE, d.REPLACE, d.REPLACE), n(), z(), d.stencilFunc(s, 1, 255), d.stencilOp(d.KEEP, d.KEEP, d.KEEP), e(), z(), d.disable(d.STENCIL_TEST);
    }
    __name(qn, "qn");
    o(qn, "drawStenciled");
    function Yr(e, n) {
      qn(e, n, d.EQUAL);
    }
    __name(Yr, "Yr");
    o(Yr, "drawMasked");
    function Xr(e, n) {
      qn(e, n, d.NOTEQUAL);
    }
    __name(Xr, "Xr");
    o(Xr, "drawSubtracted");
    function $n() {
      return (v.viewport.width + v.viewport.height) / (v.width + v.height);
    }
    __name($n, "$n");
    o($n, "getViewportScale");
    function Be(e) {
      z();
      let n = v.width, s = v.height;
      v.width = v.viewport.width, v.height = v.viewport.height, e(), z(), v.width = n, v.height = s;
    }
    __name(Be, "Be");
    o(Be, "drawUnscaled");
    function zn(e, n) {
      n.pos && (e.pos = e.pos.add(n.pos)), n.scale && (e.scale = e.scale.scale(T(n.scale))), n.angle && (e.angle += n.angle), n.color && (e.color = e.color.mult(n.color)), n.opacity && (e.opacity *= n.opacity);
    }
    __name(zn, "zn");
    o(zn, "applyCharTransform");
    let Kn = /\[(?<style>\w+)\](?<text>.*?)\[\/\k<style>\]/g;
    function Wr(e) {
      let n = {}, s = e.replace(Kn, "$2"), i = 0;
      for (let a of e.matchAll(Kn)) {
        let c = a.index - i;
        for (let f = 0; f < a.groups.text.length; f++)
          n[f + c] = [a.groups.style];
        i += a[0].length - a.groups.text.length;
      }
      return { charStyleMap: n, text: s };
    }
    __name(Wr, "Wr");
    o(Wr, "compileStyledText");
    let dn = {};
    function je(e) {
      if (e.text === void 0)
        throw new Error('formatText() requires property "text".');
      let n = At(e.font);
      if (e.text === "" || n instanceof ue || !n)
        return { width: 0, height: 0, chars: [], opt: e };
      let { charStyleMap: s, text: i } = Wr(e.text + ""), a = i.split("");
      if (n instanceof ze || typeof n == "string") {
        let K = n instanceof ze ? n.fontface.family : n, N = n instanceof ze ? { outline: n.outline, filter: n.filter } : { outline: 0, filter: Hr }, I = dn[K] ?? { font: { tex: new W(Vr, jr, { filter: N.filter }), map: {}, size: Lr }, cursor: new y(0), outline: N.outline };
        dn[K] || (dn[K] = I), n = I.font;
        for (let he of a)
          if (!I.font.map[he]) {
            let b = ae;
            b.clearRect(0, 0, ee.width, ee.height), b.font = `${n.size}px ${K}`, b.textBaseline = "top", b.textAlign = "left", b.fillStyle = "#ffffff";
            let P = b.measureText(he), D = Math.ceil(P.width), F = n.size;
            I.outline && (b.lineJoin = "round", b.lineWidth = I.outline * 2, b.strokeStyle = "#000000", b.strokeText(he, I.outline, I.outline), D += I.outline * 2, F += I.outline * 3), b.fillText(he, I.outline, I.outline);
            let _ = b.getImageData(0, 0, D, F);
            if (I.cursor.x + D > Vr && (I.cursor.x = 0, I.cursor.y += F, I.cursor.y > jr))
              throw new Error("Font atlas exceeds character limit");
            n.tex.update(_, I.cursor.x, I.cursor.y), n.map[he] = new ie(I.cursor.x, I.cursor.y, D, F), I.cursor.x += D;
          }
      }
      let c = e.size || n.size, f = T(e.scale ?? 1).scale(c / n.size), g = e.lineSpacing ?? 0, m = e.letterSpacing ?? 0, l = 0, p = 0, C = 0, R = [], G = [], k = 0, M = null, O = null;
      for (; k < a.length; ) {
        let K = a[k];
        if (K === `
`)
          C += c + g, R.push({ width: l - m, chars: G }), M = null, O = null, l = 0, G = [];
        else {
          let N = n.map[K];
          if (N) {
            let I = N.w * f.x;
            e.width && l + I > e.width && (C += c + g, M != null && (k -= G.length - M, K = a[k], N = n.map[K], I = N.w * f.x, G = G.slice(0, M - 1), l = O), M = null, O = null, R.push({ width: l - m, chars: G }), l = 0, G = []), G.push({ tex: n.tex, width: N.w, height: N.h, quad: new ie(N.x / n.tex.width, N.y / n.tex.height, N.w / n.tex.width, N.h / n.tex.height), ch: K, pos: new y(l, C), opacity: e.opacity ?? 1, color: e.color ?? q.WHITE, scale: T(f), angle: 0 }), K === " " && (M = G.length, O = l), l += I, p = Math.max(p, l), l += m;
          }
        }
        k++;
      }
      R.push({ width: l - m, chars: G }), C += c, e.width && (p = e.width);
      let ne = [];
      for (let K of R) {
        let N = (p - K.width) * Ri(e.align ?? "left");
        for (let I of K.chars) {
          let he = n.map[I.ch], b = ne.length;
          if (I.pos = I.pos.add(N, 0).add(he.w * f.x * 0.5, he.h * f.y * 0.5), e.transform) {
            let P = typeof e.transform == "function" ? e.transform(b, I.ch) : e.transform;
            P && zn(I, P);
          }
          if (s[b]) {
            let P = s[b];
            for (let D of P) {
              let F = e.styles[D], _ = typeof F == "function" ? F(b, I.ch) : F;
              _ && zn(I, _);
            }
          }
          ne.push(I);
        }
      }
      return { width: p, height: C, chars: ne, opt: e };
    }
    __name(je, "je");
    o(je, "formatText");
    function Yn(e) {
      Ne(je(e));
    }
    __name(Yn, "Yn");
    o(Yn, "drawText");
    function Ne(e) {
      E(), Q(e.opt.pos), x(e.opt.angle), Q(nt(e.opt.anchor ?? "topleft").add(1, 1).scale(e.width, e.height).scale(-0.5)), e.chars.forEach((n) => {
        me({ tex: n.tex, width: n.width, height: n.height, pos: n.pos, scale: n.scale, angle: n.angle, color: n.color, opacity: n.opacity, quad: n.quad, anchor: "center", uniform: e.opt.uniform, shader: e.opt.shader, fixed: e.opt.fixed });
      }), L();
    }
    __name(Ne, "Ne");
    o(Ne, "drawFormattedText");
    function pe() {
      return v.width;
    }
    __name(pe, "pe");
    o(pe, "width");
    function we() {
      return v.height;
    }
    __name(we, "we");
    o(we, "height");
    let We = {};
    function Jr(e) {
      return new y((e.x - v.viewport.x) * pe() / v.viewport.width, (e.y - v.viewport.y) * we() / v.viewport.height);
    }
    __name(Jr, "Jr");
    o(Jr, "windowToContent");
    function Qr(e) {
      return new y(e.x * v.viewport.width / v.width, e.y * v.viewport.height / v.height);
    }
    __name(Qr, "Qr");
    o(Qr, "contentToView");
    function Dt() {
      return Jr(U.mousePos());
    }
    __name(Dt, "Dt");
    o(Dt, "mousePos"), We.error = (e) => {
      if (e.error)
        xn(e.error);
      else {
        if (e.message === "Script error.")
          return;
        xn(new Error(e.message));
      }
    }, We.unhandledrejection = (e) => xn(e.reason);
    for (let e in We)
      window.addEventListener(e, We[e]);
    let te = { inspect: false, timeScale: 1, showLog: true, fps: () => U.fps(), numFrames: () => U.numFrames(), stepFrame: or, drawCalls: () => v.drawCalls, clearLog: () => A.logs = [], log: (e) => {
      let n = r11.logMax ?? Ci;
      A.logs.unshift({ msg: e, time: U.time() }), A.logs.length > n && (A.logs = A.logs.slice(0, n));
    }, error: (e) => te.log(new Error(e.toString ? e.toString() : e)), curRecording: null, paused: false, numObjects: () => bn("*", { recursive: true }).length };
    function Ue() {
      return U.dt() * te.timeScale;
    }
    __name(Ue, "Ue");
    o(Ue, "dt");
    function Zr(...e) {
      return e.length > 0 && (A.cam.pos = T(...e)), A.cam.pos ? A.cam.pos.clone() : Vt();
    }
    __name(Zr, "Zr");
    o(Zr, "camPos");
    function es(...e) {
      return e.length > 0 && (A.cam.scale = T(...e)), A.cam.scale.clone();
    }
    __name(es, "es");
    o(es, "camScale");
    function ts(e) {
      return e !== void 0 && (A.cam.angle = e), A.cam.angle;
    }
    __name(ts, "ts");
    o(ts, "camRot");
    function ns(e = 12) {
      A.cam.shake += e;
    }
    __name(ns, "ns");
    o(ns, "shake");
    function Xn(e) {
      return A.cam.transform.multVec2(e);
    }
    __name(Xn, "Xn");
    o(Xn, "toScreen");
    function Wn(e) {
      return A.cam.transform.invert().multVec2(e);
    }
    __name(Wn, "Wn");
    o(Wn, "toWorld");
    function Gt(e) {
      let n = new be();
      return e.pos && n.translate(e.pos), e.scale && n.scale(e.scale), e.angle && n.rotate(e.angle), e.parent ? n.mult(e.parent.transform) : n;
    }
    __name(Gt, "Gt");
    o(Gt, "calcTransform");
    function fn(e = []) {
      let n = /* @__PURE__ */ new Map(), s = {}, i = new Re(), a = [], c = null, f = false, g = { id: Cr(), hidden: false, transform: new be(), children: [], parent: null, set paused(l) {
        if (l !== f) {
          f = l;
          for (let p of a)
            p.paused = l;
        }
      }, get paused() {
        return f;
      }, add(l = []) {
        let p = Array.isArray(l) ? fn(l) : l;
        if (p.parent)
          throw new Error("Cannot add a game obj that already has a parent.");
        return p.parent = this, p.transform = Gt(p), this.children.push(p), p.trigger("add", p), A.events.trigger("add", p), p;
      }, readd(l) {
        let p = this.children.indexOf(l);
        return p !== -1 && (this.children.splice(p, 1), this.children.push(l)), l;
      }, remove(l) {
        let p = this.children.indexOf(l);
        if (p !== -1) {
          l.parent = null, this.children.splice(p, 1);
          let C = o((R) => {
            R.trigger("destroy"), A.events.trigger("destroy", R), R.children.forEach((G) => C(G));
          }, "trigger");
          C(l);
        }
      }, removeAll(l) {
        if (l)
          this.get(l).forEach((p) => this.remove(p));
        else
          for (let p of [...this.children])
            this.remove(p);
      }, update() {
        this.paused || (this.children.sort((l, p) => (l.z ?? 0) - (p.z ?? 0)).forEach((l) => l.update()), this.trigger("update"));
      }, draw() {
        if (this.hidden)
          return;
        let l = v.fixed;
        this.fixed && (v.fixed = true), E(), Q(this.pos), h(this.scale), x(this.angle), this.trigger("draw"), this.children.sort((p, C) => (p.z ?? 0) - (C.z ?? 0)).forEach((p) => p.draw()), L(), v.fixed = l;
      }, drawInspect() {
        this.hidden || (E(), Q(this.pos), h(this.scale), x(this.angle), this.children.sort((l, p) => (l.z ?? 0) - (p.z ?? 0)).forEach((l) => l.drawInspect()), this.trigger("drawInspect"), L());
      }, use(l) {
        if (!l)
          return;
        if (typeof l == "string")
          return this.use({ id: l });
        let p = [];
        l.id && (this.unuse(l.id), s[l.id] = [], p = s[l.id], n.set(l.id, l));
        for (let R in l) {
          if (Pi.has(R))
            continue;
          let G = Object.getOwnPropertyDescriptor(l, R);
          if (typeof G.value == "function" && (l[R] = l[R].bind(this)), G.set && Object.defineProperty(l, R, { set: G.set.bind(this) }), G.get && Object.defineProperty(l, R, { get: G.get.bind(this) }), Mi.has(R)) {
            let k = R === "add" ? () => {
              c = o((M) => p.push(M), "onCurCompCleanup"), l[R](), c = null;
            } : l[R];
            p.push(this.on(R, k).cancel);
          } else if (this[R] === void 0)
            Object.defineProperty(this, R, { get: () => l[R], set: (k) => l[R] = k, configurable: true, enumerable: true }), p.push(() => delete this[R]);
          else
            throw new Error(`Duplicate component property: "${R}"`);
        }
        let C = o(() => {
          if (l.require) {
            for (let R of l.require)
              if (!this.c(R))
                throw new Error(`Component "${l.id}" requires component "${R}"`);
          }
        }, "checkDeps");
        l.destroy && p.push(l.destroy.bind(this)), this.exists() ? (C(), l.add && (c = o((R) => p.push(R), "onCurCompCleanup"), l.add.call(this), c = null)) : l.require && p.push(this.on("add", C).cancel);
      }, unuse(l) {
        s[l] && (s[l].forEach((p) => p()), delete s[l]), n.has(l) && n.delete(l);
      }, c(l) {
        return n.get(l);
      }, get(l, p = {}) {
        let C = p.recursive ? this.children.flatMap(o(/* @__PURE__ */ __name(function R(G) {
          return [G, ...G.children.flatMap(R)];
        }, "R"), "recurse")) : this.children;
        if (C = C.filter((R) => l ? R.is(l) : true), p.liveUpdate) {
          let R = o((G) => p.recursive ? this.isAncestorOf(G) : G.parent === this, "isChild");
          pn((G) => {
            R(G) && G.is(l) && C.push(G);
          }), Jn((G) => {
            if (R(G) && G.is(l)) {
              let k = C.findIndex((M) => M.id === G.id);
              k !== -1 && C.splice(k, 1);
            }
          });
        }
        return C;
      }, isAncestorOf(l) {
        return l.parent ? l.parent === this || this.isAncestorOf(l.parent) : false;
      }, exists() {
        return A.root.isAncestorOf(this);
      }, is(l) {
        if (l === "*")
          return true;
        if (Array.isArray(l)) {
          for (let p of l)
            if (!this.c(p))
              return false;
          return true;
        } else
          return this.c(l) != null;
      }, on(l, p) {
        let C = i.on(l, p.bind(this));
        return c && c(() => C.cancel()), C;
      }, trigger(l, ...p) {
        i.trigger(l, ...p), A.objEvents.trigger(l, this, ...p);
      }, destroy() {
        this.parent && this.parent.remove(this);
      }, inspect() {
        let l = {};
        for (let [p, C] of n)
          l[p] = C.inspect ? C.inspect() : null;
        return l;
      }, onAdd(l) {
        return this.on("add", l);
      }, onUpdate(l) {
        return this.on("update", l);
      }, onDraw(l) {
        return this.on("draw", l);
      }, onDestroy(l) {
        return this.on("destroy", l);
      }, clearEvents() {
        i.clear();
      } }, m = ["onKeyPress", "onKeyPressRepeat", "onKeyDown", "onKeyRelease", "onMousePress", "onMouseDown", "onMouseRelease", "onMouseMove", "onCharInput", "onMouseMove", "onTouchStart", "onTouchMove", "onTouchEnd", "onScroll", "onGamepadButtonPress", "onGamepadButtonDown", "onGamepadButtonRelease", "onGamepadStick"];
      for (let l of m)
        g[l] = (...p) => {
          let C = U[l](...p);
          return a.push(C), g.onDestroy(() => C.cancel()), C;
        };
      for (let l of e)
        g.use(l);
      return g;
    }
    __name(fn, "fn");
    o(fn, "make");
    function Le(e, n, s) {
      return A.objEvents[e] || (A.objEvents[e] = new wt()), A.objEvents.on(e, (i, ...a) => {
        i.is(n) && s(i, ...a);
      });
    }
    __name(Le, "Le");
    o(Le, "on");
    let mn = o((e, n) => {
      if (typeof e == "function" && n === void 0) {
        let s = ht([{ update: e }]);
        return { get paused() {
          return s.paused;
        }, set paused(i) {
          s.paused = i;
        }, cancel: () => s.destroy() };
      } else if (typeof e == "string")
        return Le("update", e, n);
    }, "onUpdate"), rs = o((e, n) => {
      if (typeof e == "function" && n === void 0) {
        let s = ht([{ draw: e }]);
        return { get paused() {
          return s.hidden;
        }, set paused(i) {
          s.hidden = i;
        }, cancel: () => s.destroy() };
      } else if (typeof e == "string")
        return Le("draw", e, n);
    }, "onDraw");
    function pn(e, n) {
      if (typeof e == "function" && n === void 0)
        return A.events.on("add", e);
      if (typeof e == "string")
        return Le("add", e, n);
    }
    __name(pn, "pn");
    o(pn, "onAdd");
    function Jn(e, n) {
      if (typeof e == "function" && n === void 0)
        return A.events.on("destroy", e);
      if (typeof e == "string")
        return Le("destroy", e, n);
    }
    __name(Jn, "Jn");
    o(Jn, "onDestroy");
    function ss(e, n, s) {
      return Le("collide", e, (i, a, c) => a.is(n) && s(i, a, c));
    }
    __name(ss, "ss");
    o(ss, "onCollide");
    function is(e, n, s) {
      return Le("collideUpdate", e, (i, a, c) => a.is(n) && s(i, a, c));
    }
    __name(is, "is");
    o(is, "onCollideUpdate");
    function os(e, n, s) {
      return Le("collideEnd", e, (i, a, c) => a.is(n) && s(i, a, c));
    }
    __name(os, "os");
    o(os, "onCollideEnd");
    function Ft(e, n) {
      bn(e, { recursive: true }).forEach(n), pn(e, n);
    }
    __name(Ft, "Ft");
    o(Ft, "forAllCurrentAndFuture");
    function as(e, n) {
      if (typeof e == "function")
        return U.onMousePress(e);
      {
        let s = [];
        return Ft(e, (i) => {
          if (!i.area)
            throw new Error("onClick() requires the object to have area() component");
          s.push(i.onClick(() => n(i)));
        }), Me.join(s);
      }
    }
    __name(as, "as");
    o(as, "onClick");
    function us(e, n) {
      let s = [];
      return Ft(e, (i) => {
        if (!i.area)
          throw new Error("onHover() requires the object to have area() component");
        s.push(i.onHover(() => n(i)));
      }), Me.join(s);
    }
    __name(us, "us");
    o(us, "onHover");
    function cs(e, n) {
      let s = [];
      return Ft(e, (i) => {
        if (!i.area)
          throw new Error("onHoverUpdate() requires the object to have area() component");
        s.push(i.onHoverUpdate(() => n(i)));
      }), Me.join(s);
    }
    __name(cs, "cs");
    o(cs, "onHoverUpdate");
    function ls(e, n) {
      let s = [];
      return Ft(e, (i) => {
        if (!i.area)
          throw new Error("onHoverEnd() requires the object to have area() component");
        s.push(i.onHoverEnd(() => n(i)));
      }), Me.join(s);
    }
    __name(ls, "ls");
    o(ls, "onHoverEnd");
    function Bt(e, n) {
      let s = 0, i = [];
      n && i.push(n);
      let a = mn(() => {
        s += Ue(), s >= e && (a.cancel(), i.forEach((c) => c()));
      });
      return { paused: a.paused, cancel: a.cancel, onEnd(c) {
        i.push(c);
      }, then(c) {
        return this.onEnd(c), this;
      } };
    }
    __name(Bt, "Bt");
    o(Bt, "wait");
    function hs(e, n) {
      let s = null, i = o(() => {
        s = Bt(e, i), n();
      }, "newAction");
      return s = Bt(0, i), { get paused() {
        return s.paused;
      }, set paused(a) {
        s.paused = a;
      }, cancel: () => s.cancel() };
    }
    __name(hs, "hs");
    o(hs, "loop");
    function Qn() {
      U.onKeyPress("f1", () => {
        te.inspect = !te.inspect;
      }), U.onKeyPress("f2", () => {
        te.clearLog();
      }), U.onKeyPress("f8", () => {
        te.paused = !te.paused;
      }), U.onKeyPress("f7", () => {
        te.timeScale = ct(Pe(te.timeScale - 0.2, 0, 2), 1);
      }), U.onKeyPress("f9", () => {
        te.timeScale = ct(Pe(te.timeScale + 0.2, 0, 2), 1);
      }), U.onKeyPress("f10", () => {
        te.stepFrame();
      });
    }
    __name(Qn, "Qn");
    o(Qn, "enterDebugMode");
    function Zn() {
      U.onKeyPress("b", () => Mt());
    }
    __name(Zn, "Zn");
    o(Zn, "enterBurpMode");
    function ds(e) {
      A.gravity = e;
    }
    __name(ds, "ds");
    o(ds, "setGravity");
    function fs() {
      return A.gravity;
    }
    __name(fs, "fs");
    o(fs, "getGravity");
    function ms(...e) {
      e.length === 1 || e.length === 2 ? (v.bgColor = J(e[0]), e[1] && (v.bgAlpha = e[1])) : (e.length === 3 || e.length === 4) && (v.bgColor = J(e[0], e[1], e[2]), e[3] && (v.bgAlpha = e[3])), d.clearColor(v.bgColor.r / 255, v.bgColor.g / 255, v.bgColor.b / 255, v.bgAlpha);
    }
    __name(ms, "ms");
    o(ms, "setBackground");
    function ps() {
      return v.bgColor.clone();
    }
    __name(ps, "ps");
    o(ps, "getBackground");
    function Lt(...e) {
      return { id: "pos", pos: T(...e), moveBy(...n) {
        this.pos = this.pos.add(T(...n));
      }, move(...n) {
        this.moveBy(T(...n).scale(Ue()));
      }, moveTo(...n) {
        if (typeof n[0] == "number" && typeof n[1] == "number")
          return this.moveTo(T(n[0], n[1]), n[2]);
        let s = n[0], i = n[1];
        if (i === void 0) {
          this.pos = T(s);
          return;
        }
        let a = s.sub(this.pos);
        if (a.len() <= i * Ue()) {
          this.pos = T(s);
          return;
        }
        this.move(a.unit().scale(i));
      }, worldPos() {
        return this.parent ? this.parent.transform.multVec2(this.pos) : this.pos;
      }, screenPos() {
        let n = this.worldPos();
        return lt(this) ? n : Xn(n);
      }, inspect() {
        return `(${Math.round(this.pos.x)}, ${Math.round(this.pos.y)})`;
      }, drawInspect() {
        Xe({ color: J(255, 0, 0), radius: 4 / $n() });
      } };
    }
    __name(Lt, "Lt");
    o(Lt, "pos");
    function It(...e) {
      return e.length === 0 ? It(1) : { id: "scale", scale: T(...e), scaleTo(...n) {
        this.scale = T(...n);
      }, scaleBy(...n) {
        this.scale.scale(T(...n));
      }, inspect() {
        return `(${ct(this.scale.x, 2)}, ${ct(this.scale.y, 2)})`;
      } };
    }
    __name(It, "It");
    o(It, "scale");
    function gs(e) {
      return { id: "rotate", angle: e ?? 0, rotateBy(n) {
        this.angle += n;
      }, rotateTo(n) {
        this.angle = n;
      }, inspect() {
        return `${Math.round(this.angle)}`;
      } };
    }
    __name(gs, "gs");
    o(gs, "rotate");
    function ws(...e) {
      return { id: "color", color: J(...e), inspect() {
        return this.color.toString();
      } };
    }
    __name(ws, "ws");
    o(ws, "color");
    function ct(e, n) {
      return Number(e.toFixed(n));
    }
    __name(ct, "ct");
    o(ct, "toFixed");
    function vs(e) {
      return { id: "opacity", opacity: e ?? 1, inspect() {
        return `${ct(this.opacity, 1)}`;
      }, fadeOut(n = 1, s = tt.linear) {
        return Un(this.opacity, 0, n, (i) => this.opacity = i, s);
      } };
    }
    __name(vs, "vs");
    o(vs, "opacity");
    function gn(e) {
      if (!e)
        throw new Error("Please define an anchor");
      return { id: "anchor", anchor: e, inspect() {
        return typeof this.anchor == "string" ? this.anchor : this.anchor.toString();
      } };
    }
    __name(gn, "gn");
    o(gn, "anchor");
    function bs(e) {
      return { id: "z", z: e, inspect() {
        return `${this.z}`;
      } };
    }
    __name(bs, "bs");
    o(bs, "z");
    function ys(e, n) {
      return { id: "follow", require: ["pos"], follow: { obj: e, offset: n ?? T(0) }, add() {
        e.exists() && (this.pos = this.follow.obj.pos.add(this.follow.offset));
      }, update() {
        e.exists() && (this.pos = this.follow.obj.pos.add(this.follow.offset));
      } };
    }
    __name(ys, "ys");
    o(ys, "follow");
    function xs(e, n) {
      let s = typeof e == "number" ? y.fromAngle(e) : e.unit();
      return { id: "move", require: ["pos"], update() {
        this.move(s.scale(n));
      } };
    }
    __name(xs, "xs");
    o(xs, "move");
    let Us = 200;
    function Es(e = {}) {
      let n = e.distance ?? Us, s = false;
      return { id: "offscreen", require: ["pos"], isOffScreen() {
        let i = this.screenPos(), a = new le(T(0), pe(), we());
        return !mt(a, i) && a.sdistToPoint(i) > n * n;
      }, onExitScreen(i) {
        return this.on("exitView", i);
      }, onEnterScreen(i) {
        return this.on("enterView", i);
      }, update() {
        this.isOffScreen() ? (s || (this.trigger("exitView"), s = true), e.hide && (this.hidden = true), e.pause && (this.paused = true), e.destroy && this.destroy()) : (s && (this.trigger("enterView"), s = false), e.hide && (this.hidden = false), e.pause && (this.paused = false));
      } };
    }
    __name(Es, "Es");
    o(Es, "offscreen");
    function lt(e) {
      return e.fixed ? true : e.parent ? lt(e.parent) : false;
    }
    __name(lt, "lt");
    o(lt, "isFixed");
    function Ss(e = {}) {
      let n = {}, s = /* @__PURE__ */ new Set();
      return { id: "area", collisionIgnore: e.collisionIgnore ?? [], add() {
        this.area.cursor && this.onHover(() => U.setCursor(this.area.cursor)), this.onCollideUpdate((i, a) => {
          n[i.id] || this.trigger("collide", i, a), n[i.id] = a, s.add(i.id);
        });
      }, update() {
        for (let i in n)
          s.has(Number(i)) || (this.trigger("collideEnd", n[i].target), delete n[i]);
        s.clear();
      }, drawInspect() {
        let i = this.localArea();
        E(), h(this.area.scale), Q(this.area.offset);
        let a = { outline: { width: 4 / $n(), color: J(0, 0, 255) }, anchor: this.anchor, fill: false, fixed: lt(this) };
        i instanceof le ? xe({ ...a, pos: i.pos, width: i.width, height: i.height }) : i instanceof He ? Ve({ ...a, pts: i.pts }) : i instanceof pt && Xe({ ...a, pos: i.center, radius: i.radius }), L();
      }, area: { shape: e.shape ?? null, scale: e.scale ? T(e.scale) : T(1), offset: e.offset ?? T(0), cursor: e.cursor ?? null }, isClicked() {
        return U.isMousePressed() && this.isHovering();
      }, isHovering() {
        let i = lt(this) ? Dt() : Wn(Dt());
        return this.hasPoint(i);
      }, checkCollision(i) {
        return n[i.id] ?? null;
      }, getCollisions() {
        return Object.values(n);
      }, isColliding(i) {
        return !!n[i.id];
      }, isOverlapping(i) {
        let a = n[i.id];
        return a && a.hasOverlap();
      }, onClick(i) {
        let a = U.onMousePress("left", () => {
          this.isHovering() && i();
        });
        return this.onDestroy(() => a.cancel()), a;
      }, onHover(i) {
        let a = false;
        return this.onUpdate(() => {
          a ? a = this.isHovering() : this.isHovering() && (a = true, i());
        });
      }, onHoverUpdate(i) {
        return this.onUpdate(() => {
          this.isHovering() && i();
        });
      }, onHoverEnd(i) {
        let a = false;
        return this.onUpdate(() => {
          a ? this.isHovering() || (a = false, i()) : a = this.isHovering();
        });
      }, onCollide(i, a) {
        if (typeof i == "function" && a === void 0)
          return this.on("collide", i);
        if (typeof i == "string")
          return this.onCollide((c, f) => {
            c.is(i) && a(c, f);
          });
      }, onCollideUpdate(i, a) {
        if (typeof i == "function" && a === void 0)
          return this.on("collideUpdate", i);
        if (typeof i == "string")
          return this.on("collideUpdate", (c, f) => c.is(i) && a(c, f));
      }, onCollideEnd(i, a) {
        if (typeof i == "function" && a === void 0)
          return this.on("collideEnd", i);
        if (typeof i == "string")
          return this.on("collideEnd", (c) => c.is(i) && a(c));
      }, hasPoint(i) {
        return Rn(this.worldArea(), i);
      }, resolveCollision(i) {
        let a = this.checkCollision(i);
        a && !a.resolved && (this.pos = this.pos.add(a.displacement), a.resolved = true);
      }, localArea() {
        return this.area.shape ? this.area.shape : this.renderArea();
      }, worldArea() {
        let i = this.localArea();
        if (!(i instanceof He || i instanceof le))
          throw new Error("Only support polygon and rect shapes for now");
        let a = this.transform.clone().scale(T(this.area.scale ?? 1)).translate(this.area.offset);
        if (i instanceof le) {
          let c = nt(this.anchor || $t).add(1, 1).scale(-0.5).scale(i.width, i.height);
          a.translate(c);
        }
        return i.transform(a);
      }, screenArea() {
        let i = this.worldArea();
        return lt(this) ? i : i.transform(A.cam.transform);
      } };
    }
    __name(Ss, "Ss");
    o(Ss, "area");
    function Je(e) {
      return { color: e.color, opacity: e.opacity, anchor: e.anchor, outline: e.outline, shader: e.shader, uniform: e.uniform };
    }
    __name(Je, "Je");
    o(Je, "getRenderProps");
    function wn(e, n = {}) {
      let s = null, i = null, a = null, c = new ve();
      if (!e)
        throw new Error("Please pass the resource name or data to sprite()");
      let f = o((g, m, l, p) => {
        let C = T(1, 1);
        return l && p ? (C.x = l / (g.width * m.w), C.y = p / (g.height * m.h)) : l ? (C.x = l / (g.width * m.w), C.y = C.x) : p && (C.y = p / (g.height * m.h), C.x = C.y), C;
      }, "calcTexScale");
      return { id: "sprite", width: 0, height: 0, frame: n.frame || 0, quad: n.quad || new ie(0, 0, 1, 1), animSpeed: n.animSpeed ?? 1, flipX: n.flipX ?? false, flipY: n.flipY ?? false, draw() {
        if (!s)
          return;
        let g = s.frames[this.frame ?? 0];
        if (!g)
          throw new Error(`Frame not found: ${this.frame ?? 0}`);
        if (s.slice9) {
          let { left: m, right: l, top: p, bottom: C } = s.slice9, R = s.tex.width * g.w, G = s.tex.height * g.h, k = this.width - m - l, M = this.height - p - C, O = m / R, ne = l / R, K = 1 - O - ne, N = p / G, I = C / G, he = 1 - N - I, b = [oe(0, 0, O, N), oe(O, 0, K, N), oe(O + K, 0, ne, N), oe(0, N, O, he), oe(O, N, K, he), oe(O + K, N, ne, he), oe(0, N + he, O, I), oe(O, N + he, K, I), oe(O + K, N + he, ne, I), oe(0, 0, m, p), oe(m, 0, k, p), oe(m + k, 0, l, p), oe(0, p, m, M), oe(m, p, k, M), oe(m + k, p, l, M), oe(0, p + M, m, C), oe(m, p + M, k, C), oe(m + k, p + M, l, C)];
          for (let P = 0; P < 9; P++) {
            let D = b[P], F = b[P + 9];
            Z(Object.assign(Je(this), { pos: F.pos(), tex: s.tex, quad: g.scale(D), flipX: this.flipX, flipY: this.flipY, tiled: n.tiled, width: F.w, height: F.h }));
          }
        } else
          Z(Object.assign(Je(this), { tex: s.tex, quad: g.scale(this.quad ?? new ie(0, 0, 1, 1)), flipX: this.flipX, flipY: this.flipY, tiled: n.tiled, width: this.width, height: this.height }));
      }, add() {
        let g = o((l) => {
          let p = l.frames[0].clone();
          n.quad && (p = p.scale(n.quad));
          let C = f(l.tex, p, n.width, n.height);
          this.width = l.tex.width * p.w * C.x, this.height = l.tex.height * p.h * C.y, n.anim && this.play(n.anim), s = l, c.trigger(s);
        }, "setSpriteData"), m = it(e);
        m ? m.onLoad(g) : vn(() => g(it(e).data));
      }, update() {
        if (!i)
          return;
        let g = s.anims[i.name];
        if (typeof g == "number") {
          this.frame = g;
          return;
        }
        if (g.speed === 0)
          throw new Error("Sprite anim speed cannot be 0");
        i.timer += Ue() * this.animSpeed, i.timer >= 1 / i.speed && (i.timer = 0, this.frame += a, (this.frame < Math.min(g.from, g.to) || this.frame > Math.max(g.from, g.to)) && (i.loop ? i.pingpong ? (this.frame -= a, a *= -1, this.frame += a) : this.frame = g.from : (this.frame = g.to, i.onEnd(), this.stop())));
      }, play(g, m = {}) {
        if (!s) {
          c.add(() => this.play(g, m));
          return;
        }
        let l = s.anims[g];
        if (l === void 0)
          throw new Error(`Anim not found: ${g}`);
        i && this.stop(), i = typeof l == "number" ? { name: g, timer: 0, loop: false, pingpong: false, speed: 0, onEnd: () => {
        } } : { name: g, timer: 0, loop: m.loop ?? l.loop ?? false, pingpong: m.pingpong ?? l.pingpong ?? false, speed: m.speed ?? l.speed ?? 10, onEnd: m.onEnd ?? (() => {
        }) }, a = typeof l == "number" ? null : l.from < l.to ? 1 : -1, this.frame = typeof l == "number" ? l : l.from, this.trigger("animStart", g);
      }, stop() {
        if (!i)
          return;
        let g = i.name;
        i = null, this.trigger("animEnd", g);
      }, numFrames() {
        return s?.frames.length ?? 0;
      }, curAnim() {
        return i?.name;
      }, onAnimEnd(g) {
        return this.on("animEnd", g);
      }, onAnimStart(g) {
        return this.on("animStart", g);
      }, renderArea() {
        return new le(T(0), this.width, this.height);
      }, inspect() {
        if (typeof e == "string")
          return `"${e}"`;
      } };
    }
    __name(wn, "wn");
    o(wn, "sprite");
    function Cs(e, n = {}) {
      function s(i) {
        let a = je(Object.assign(Je(i), { text: i.text + "", size: i.textSize, font: i.font, width: n.width && i.width, align: i.align, letterSpacing: i.letterSpacing, lineSpacing: i.lineSpacing, transform: i.textTransform, styles: i.textStyles }));
        return n.width || (i.width = a.width / (i.scale?.x || 1)), i.height = a.height / (i.scale?.y || 1), a;
      }
      __name(s, "s");
      return o(s, "update"), { id: "text", text: e, textSize: n.size ?? Ei, font: n.font, width: n.width, height: 0, align: n.align, lineSpacing: n.lineSpacing, letterSpacing: n.letterSpacing, textTransform: n.transform, textStyles: n.styles, add() {
        vn(() => s(this));
      }, draw() {
        Ne(s(this));
      }, renderArea() {
        return new le(T(0), this.width, this.height);
      } };
    }
    __name(Cs, "Cs");
    o(Cs, "text");
    function Ts(e, n, s = {}) {
      return { id: "rect", width: e, height: n, radius: s.radius || 0, draw() {
        xe(Object.assign(Je(this), { width: this.width, height: this.height, radius: this.radius }));
      }, renderArea() {
        return new le(T(0), this.width, this.height);
      }, inspect() {
        return `${Math.ceil(this.width)}, ${Math.ceil(this.height)}`;
      } };
    }
    __name(Ts, "Ts");
    o(Ts, "rect");
    function As(e, n) {
      return { id: "rect", width: e, height: n, draw() {
        me(Object.assign(Je(this), { width: this.width, height: this.height }));
      }, renderArea() {
        return new le(T(0), this.width, this.height);
      }, inspect() {
        return `${Math.ceil(this.width)}, ${Math.ceil(this.height)}`;
      } };
    }
    __name(As, "As");
    o(As, "uvquad");
    function Os(e) {
      return { id: "circle", radius: e, draw() {
        Xe(Object.assign(Je(this), { radius: this.radius }));
      }, renderArea() {
        return new le(new y(this.anchor ? 0 : -this.radius), this.radius * 2, this.radius * 2);
      }, inspect() {
        return `${Math.ceil(this.radius)}`;
      } };
    }
    __name(Os, "Os");
    o(Os, "circle");
    function Ps(e = 1, n = J(0, 0, 0)) {
      return { id: "outline", outline: { width: e, color: n } };
    }
    __name(Ps, "Ps");
    o(Ps, "outline");
    function er() {
      return { id: "timer", wait(e, n) {
        let s = [];
        n && s.push(n);
        let i = 0, a = this.onUpdate(() => {
          i += Ue(), i >= e && (s.forEach((c) => c()), a.cancel());
        });
        return { get paused() {
          return a.paused;
        }, set paused(c) {
          a.paused = c;
        }, cancel: a.cancel, onEnd(c) {
          s.push(c);
        }, then(c) {
          return this.onEnd(c), this;
        } };
      }, loop(e, n) {
        let s = null, i = o(() => {
          s = this.wait(e, i), n();
        }, "newAction");
        return s = this.wait(0, i), { get paused() {
          return s.paused;
        }, set paused(a) {
          s.paused = a;
        }, cancel: () => s.cancel() };
      }, tween(e, n, s, i, a = tt.linear) {
        let c = 0, f = [], g = this.onUpdate(() => {
          c += Ue();
          let m = Math.min(c / s, 1);
          i(Se(e, n, a(m))), m === 1 && (g.cancel(), i(n), f.forEach((l) => l()));
        });
        return { get paused() {
          return g.paused;
        }, set paused(m) {
          g.paused = m;
        }, onEnd(m) {
          f.push(m);
        }, then(m) {
          return this.onEnd(m), this;
        }, cancel() {
          g.cancel();
        }, finish() {
          g.cancel(), i(n), f.forEach((m) => m());
        } };
      } };
    }
    __name(er, "er");
    o(er, "timer");
    let Ms = 640, Rs = 65536;
    function Ds(e = {}) {
      let n = T(0), s = null, i = null, a = false;
      return { id: "body", require: ["pos", "area"], jumpForce: e.jumpForce ?? Ms, gravityScale: e.gravityScale ?? 1, isStatic: e.isStatic ?? false, mass: e.mass ?? 1, add() {
        if (this.mass === 0)
          throw new Error("Can't set body mass to 0");
        this.onCollideUpdate((c, f) => {
          if (c.is("body") && !f.resolved && (this.trigger("beforePhysicsResolve", f), c.trigger("beforePhysicsResolve", f.reverse()), !f.resolved && !(this.isStatic && c.isStatic))) {
            if (!this.isStatic && !c.isStatic) {
              let g = this.mass + c.mass;
              this.pos = this.pos.add(f.displacement.scale(c.mass / g)), c.pos = c.pos.add(f.displacement.scale(-this.mass / g)), this.transform = Gt(this), c.transform = Gt(c);
            } else {
              let g = !this.isStatic && c.isStatic ? f : f.reverse();
              g.source.pos = g.source.pos.add(g.displacement), g.source.transform = Gt(g.source);
            }
            f.resolved = true, this.trigger("physicsResolve", f), c.trigger("physicsResolve", f.reverse());
          }
        }), this.onPhysicsResolve((c) => {
          A.gravity && (c.isBottom() && this.isFalling() ? (n.y = 0, s = c.target, i = c.target.pos, a ? a = false : this.trigger("ground", s)) : c.isTop() && this.isJumping() && (n.y = 0, this.trigger("headbutt", c.target)));
        });
      }, update() {
        if (!A.gravity || this.isStatic)
          return;
        if (a && (s = null, i = null, this.trigger("fallOff"), a = false), s)
          if (!this.isOverlapping(s) || !s.exists() || !s.is("body"))
            a = true;
          else {
            !s.pos.eq(i) && e.stickToPlatform !== false && this.moveBy(s.pos.sub(i)), i = s.pos;
            return;
          }
        let c = n.y;
        n.y += A.gravity * this.gravityScale * Ue(), n.y = Math.min(n.y, e.maxVelocity ?? Rs), c < 0 && n.y >= 0 && this.trigger("fall"), this.move(n);
      }, onPhysicsResolve(c) {
        return this.on("physicsResolve", c);
      }, onBeforePhysicsResolve(c) {
        return this.on("beforePhysicsResolve", c);
      }, curPlatform() {
        return s;
      }, isGrounded() {
        return s !== null;
      }, isFalling() {
        return n.y > 0;
      }, isJumping() {
        return n.y < 0;
      }, jump(c) {
        s = null, i = null, n.y = -c || -this.jumpForce;
      }, onGround(c) {
        return this.on("ground", c);
      }, onFall(c) {
        return this.on("fall", c);
      }, onFallOff(c) {
        return this.on("fallOff", c);
      }, onHeadbutt(c) {
        return this.on("headbutt", c);
      } };
    }
    __name(Ds, "Ds");
    o(Ds, "body");
    function Gs(e = 2) {
      let n = e;
      return { id: "doubleJump", require: ["body"], numJumps: e, add() {
        this.onGround(() => {
          n = this.numJumps;
        });
      }, doubleJump(s) {
        n <= 0 || (n < this.numJumps && this.trigger("doubleJump"), n--, this.jump(s));
      }, onDoubleJump(s) {
        return this.on("doubleJump", s);
      }, inspect() {
        return `${n}`;
      } };
    }
    __name(Gs, "Gs");
    o(Gs, "doubleJump");
    function Fs(e, n) {
      return { id: "shader", shader: e, ...typeof n == "function" ? { uniform: n(), update() {
        this.uniform = n();
      } } : { uniform: n } };
    }
    __name(Fs, "Fs");
    o(Fs, "shader");
    function Bs() {
      return { id: "fixed", fixed: true };
    }
    __name(Bs, "Bs");
    o(Bs, "fixed");
    function tr(e) {
      return { id: "stay", stay: true, scenesToStay: e };
    }
    __name(tr, "tr");
    o(tr, "stay");
    function Ls(e) {
      if (e == null)
        throw new Error("health() requires the initial amount of hp");
      let n = e;
      return { id: "health", hurt(s = 1) {
        this.setHP(e - s), this.trigger("hurt", s);
      }, heal(s = 1) {
        this.setHP(e + s), this.trigger("heal", s);
      }, hp() {
        return e;
      }, maxHP() {
        return n;
      }, setHP(s) {
        e = s, e <= 0 && this.trigger("death");
      }, onHurt(s) {
        return this.on("hurt", s);
      }, onHeal(s) {
        return this.on("heal", s);
      }, onDeath(s) {
        return this.on("death", s);
      }, inspect() {
        return `${e}`;
      } };
    }
    __name(Ls, "Ls");
    o(Ls, "health");
    function Is(e, n = {}) {
      if (e == null)
        throw new Error("lifespan() requires time");
      let s = n.fade ?? 0;
      return { id: "lifespan", async add() {
        await Bt(e), s > 0 && this.opacity && await Un(this.opacity, 0, s, (i) => this.opacity = i, tt.linear), this.destroy();
      } };
    }
    __name(Is, "Is");
    o(Is, "lifespan");
    function Vs(e, n, s) {
      if (!e)
        throw new Error("state() requires an initial state");
      let i = {};
      function a(m) {
        i[m] || (i[m] = { enter: new ve(), end: new ve(), update: new ve(), draw: new ve() });
      }
      __name(a, "a");
      o(a, "initStateEvents");
      function c(m, l, p) {
        return a(l), i[l][m].add(p);
      }
      __name(c, "c");
      o(c, "on");
      function f(m, l, ...p) {
        a(l), i[l][m].trigger(...p);
      }
      __name(f, "f");
      o(f, "trigger");
      let g = false;
      return { id: "state", state: e, enterState(m, ...l) {
        if (g = true, n && !n.includes(m))
          throw new Error(`State not found: ${m}`);
        let p = this.state;
        if (s) {
          if (!s?.[p])
            return;
          let C = typeof s[p] == "string" ? [s[p]] : s[p];
          if (!C.includes(m))
            throw new Error(`Cannot transition state from "${p}" to "${m}". Available transitions: ${C.map((R) => `"${R}"`).join(", ")}`);
        }
        f("end", p, ...l), this.state = m, f("enter", m, ...l), f("enter", `${p} -> ${m}`, ...l);
      }, onStateTransition(m, l, p) {
        return c("enter", `${m} -> ${l}`, p);
      }, onStateEnter(m, l) {
        return c("enter", m, l);
      }, onStateUpdate(m, l) {
        return c("update", m, l);
      }, onStateDraw(m, l) {
        return c("draw", m, l);
      }, onStateEnd(m, l) {
        return c("end", m, l);
      }, update() {
        g || (f("enter", e), g = true), f("update", this.state);
      }, draw() {
        f("draw", this.state);
      }, inspect() {
        return this.state;
      } };
    }
    __name(Vs, "Vs");
    o(Vs, "state");
    function js(e = 1) {
      let n = 0, s = false;
      return { require: ["opacity"], add() {
        this.opacity = 0;
      }, update() {
        s || (n += Ue(), this.opacity = Nt(n, 0, e, 0, 1), n >= e && (this.opacity = 1, s = true));
      } };
    }
    __name(js, "js");
    o(js, "fadeIn");
    function vn(e) {
      V.loaded ? e() : A.events.on("load", e);
    }
    __name(vn, "vn");
    o(vn, "onLoad");
    function Ns(e, n) {
      A.scenes[e] = n;
    }
    __name(Ns, "Ns");
    o(Ns, "scene");
    function ks(e, ...n) {
      if (!A.scenes[e])
        throw new Error(`Scene not found: ${e}`);
      A.events.onOnce("frameEnd", () => {
        A.events.trigger("sceneLeave", e), U.events.clear(), A.events.clear(), A.objEvents.clear(), [...A.root.children].forEach((s) => {
          (!s.stay || s.scenesToStay && !s.scenesToStay.includes(e)) && A.root.remove(s);
        }), A.root.clearEvents(), A.cam = { pos: null, scale: T(1), angle: 0, shake: 0, transform: new be() }, A.scenes[e](...n), r11.debug !== false && Qn(), r11.burp && Zn();
      });
    }
    __name(ks, "ks");
    o(ks, "go");
    function _s(e) {
      return A.events.on("sceneLeave", e);
    }
    __name(_s, "_s");
    o(_s, "onSceneLeave");
    function Hs(e, n) {
      try {
        return JSON.parse(window.localStorage[e]);
      } catch {
        return n ? (nr(e, n), n) : null;
      }
    }
    __name(Hs, "Hs");
    o(Hs, "getData");
    function nr(e, n) {
      window.localStorage[e] = JSON.stringify(n);
    }
    __name(nr, "nr");
    o(nr, "setData");
    function rr(e, ...n) {
      let s = e(ke), i;
      typeof s == "function" ? i = s(...n)(ke) : i = s;
      for (let a in i)
        ke[a] = i[a], r11.global !== false && (window[a] = i[a]);
      return ke;
    }
    __name(rr, "rr");
    o(rr, "plug");
    function Vt() {
      return T(pe() / 2, we() / 2);
    }
    __name(Vt, "Vt");
    o(Vt, "center");
    let qs;
    ((O) => (O[O.None = 0] = "None", O[O.Left = 1] = "Left", O[O.Top = 2] = "Top", O[O.LeftTop = 3] = "LeftTop", O[O.Right = 4] = "Right", O[O.Horizontal = 5] = "Horizontal", O[O.RightTop = 6] = "RightTop", O[O.HorizontalTop = 7] = "HorizontalTop", O[O.Bottom = 8] = "Bottom", O[O.LeftBottom = 9] = "LeftBottom", O[O.Vertical = 10] = "Vertical", O[O.LeftVertical = 11] = "LeftVertical", O[O.RightBottom = 12] = "RightBottom", O[O.HorizontalBottom = 13] = "HorizontalBottom", O[O.RightVertical = 14] = "RightVertical", O[O.All = 15] = "All"))(qs ||= {});
    function sr(e = {}) {
      let n = T(0), s = e.isObstacle ?? false, i = e.cost ?? 0, a = e.edges ?? [], c = o(() => {
        let g = { left: 1, top: 2, right: 4, bottom: 8 };
        return a.map((m) => g[m] || 0).reduce((m, l) => m | l, 0);
      }, "getEdgeMask"), f = c();
      return { id: "tile", tilePosOffset: e.offset ?? T(0), set tilePos(g) {
        let m = this.getLevel();
        n = g.clone(), this.pos = T(this.tilePos.x * m.tileWidth(), this.tilePos.y * m.tileHeight()).add(this.tilePosOffset);
      }, get tilePos() {
        return n;
      }, set isObstacle(g) {
        s !== g && (s = g, this.getLevel().invalidateNavigationMap());
      }, get isObstacle() {
        return s;
      }, set cost(g) {
        i !== g && (i = g, this.getLevel().invalidateNavigationMap());
      }, get cost() {
        return i;
      }, set edges(g) {
        a = g, f = c(), this.getLevel().invalidateNavigationMap();
      }, get edges() {
        return a;
      }, get edgeMask() {
        return f;
      }, getLevel() {
        return this.parent;
      }, moveLeft() {
        this.tilePos = this.tilePos.add(T(-1, 0));
      }, moveRight() {
        this.tilePos = this.tilePos.add(T(1, 0));
      }, moveUp() {
        this.tilePos = this.tilePos.add(T(0, -1));
      }, moveDown() {
        this.tilePos = this.tilePos.add(T(0, 1));
      } };
    }
    __name(sr, "sr");
    o(sr, "tile");
    function $s(e, n) {
      if (!n.tileWidth || !n.tileHeight)
        throw new Error("Must provide tileWidth and tileHeight.");
      let s = ht([Lt(n.pos ?? T(0))]), i = e.length, a = 0, c = null, f = null, g = null, m = null, l = o((b) => b.x + b.y * a, "tile2Hash"), p = o((b) => T(Math.floor(b % a), Math.floor(b / a)), "hash2Tile"), C = o(() => {
        c = [];
        for (let b of s.children)
          R(b);
      }, "createSpatialMap"), R = o((b) => {
        let P = l(b.tilePos);
        c[P] ? c[P].push(b) : c[P] = [b];
      }, "insertIntoSpatialMap"), G = o((b) => {
        let P = l(b.tilePos);
        if (c[P]) {
          let D = c[P].indexOf(b);
          D >= 0 && c[P].splice(D, 1);
        }
      }, "removeFromSpatialMap"), k = o(() => {
        let b = false;
        for (let P of s.children) {
          let D = s.pos2Tile(P.pos);
          (P.tilePos.x != D.x || P.tilePos.y != D.y) && (b = true, G(P), P.tilePos.x = D.x, P.tilePos.y = D.y, R(P));
        }
        b && s.trigger("spatial_map_changed");
      }, "updateSpatialMap"), M = o(() => {
        let b = s.getSpatialMap(), P = s.numRows() * s.numColumns();
        f ? f.length = P : f = new Array(P), f.fill(1, 0, P);
        for (let D = 0; D < b.length; D++) {
          let F = b[D];
          if (F) {
            let _ = 0;
            for (let Y of F)
              if (Y.isObstacle) {
                _ = 1 / 0;
                break;
              } else
                _ += Y.cost;
            f[D] = _ || 1;
          }
        }
      }, "createCostMap"), O = o(() => {
        let b = s.getSpatialMap(), P = s.numRows() * s.numColumns();
        g ? g.length = P : g = new Array(P), g.fill(15, 0, P);
        for (let D = 0; D < b.length; D++) {
          let F = b[D];
          if (F) {
            let _ = F.length, Y = 15;
            for (let se = 0; se < _; se++)
              Y |= F[se].edgeMask;
            g[D] = Y;
          }
        }
      }, "createEdgeMap"), ne = o(() => {
        let b = s.numRows() * s.numColumns(), P = o((F, _) => {
          let Y = [];
          for (Y.push(F); Y.length > 0; ) {
            let se = Y.pop();
            I(se).forEach((de) => {
              m[de] < 0 && (m[de] = _, Y.push(de));
            });
          }
        }, "traverse");
        m ? m.length = b : m = new Array(b), m.fill(-1, 0, b);
        let D = 0;
        for (let F = 0; F < f.length; F++) {
          if (m[F] >= 0) {
            D++;
            continue;
          }
          P(F, D), D++;
        }
      }, "createConnectivityMap"), K = o((b, P) => f[P], "getCost"), N = o((b, P) => {
        let D = p(b), F = p(P);
        return D.dist(F);
      }, "getHeuristic"), I = o((b, P) => {
        let D = [], F = Math.floor(b % a), _ = F > 0 && g[b] & 1 && f[b - 1] !== 1 / 0, Y = b >= a && g[b] & 2 && f[b - a] !== 1 / 0, se = F < a - 1 && g[b] & 4 && f[b + 1] !== 1 / 0, de = b < a * i - a - 1 && g[b] & 8 && f[b + a] !== 1 / 0;
        return P ? (_ && (Y && D.push(b - a - 1), D.push(b - 1), de && D.push(b + a - 1)), Y && D.push(b - a), se && (Y && D.push(b - a + 1), D.push(b + 1), de && D.push(b + a + 1)), de && D.push(b + a)) : (_ && D.push(b - 1), Y && D.push(b - a), se && D.push(b + 1), de && D.push(b + a)), D;
      }, "getNeighbours"), he = { id: "level", tileWidth() {
        return n.tileWidth;
      }, tileHeight() {
        return n.tileHeight;
      }, spawn(b, ...P) {
        let D = T(...P), F = (() => {
          if (typeof b == "string") {
            if (n.tiles[b]) {
              if (typeof n.tiles[b] != "function")
                throw new Error("Level symbol def must be a function returning a component list");
              return n.tiles[b](D);
            } else if (n.wildcardTile)
              return n.wildcardTile(b, D);
          } else {
            if (Array.isArray(b))
              return b;
            throw new Error("Expected a symbol or a component list");
          }
        })();
        if (!F)
          return null;
        let _ = false, Y = false;
        for (let de of F)
          de.id === "tile" && (Y = true), de.id === "pos" && (_ = true);
        _ || F.push(Lt()), Y || F.push(sr());
        let se = s.add(F);
        return _ && (se.tilePosOffset = se.pos.clone()), se.tilePos = D, c && (R(se), this.trigger("spatial_map_changed"), this.trigger("navigation_map_invalid")), se;
      }, numColumns() {
        return a;
      }, numRows() {
        return i;
      }, levelWidth() {
        return a * this.tileWidth();
      }, levelHeight() {
        return i * this.tileHeight();
      }, tile2Pos(...b) {
        return T(...b).scale(this.tileWidth(), this.tileHeight());
      }, pos2Tile(...b) {
        let P = T(...b);
        return T(Math.floor(P.x / this.tileWidth()), Math.floor(P.y / this.tileHeight()));
      }, getSpatialMap() {
        return c || C(), c;
      }, onSpatialMapChanged(b) {
        return this.on("spatial_map_changed", b);
      }, onNavigationMapInvalid(b) {
        return this.on("navigation_map_invalid", b);
      }, getAt(b) {
        c || C();
        let P = l(b);
        return c[P] || [];
      }, update() {
        c && k();
      }, invalidateNavigationMap() {
        f = null, g = null, m = null;
      }, onNavigationMapChanged(b) {
        return this.on("navigation_map_changed", b);
      }, getTilePath(b, P, D = {}) {
        if (f || M(), g || O(), m || ne(), b.x < 0 || b.x >= a || b.y < 0 || b.y >= i || P.x < 0 || P.x >= a || P.y < 0 || P.y >= i)
          return null;
        let F = l(b), _ = l(P);
        if (f[_] === 1 / 0)
          return null;
        if (F === _)
          return [];
        if (m[F] != -1 && m[F] !== m[_])
          return null;
        let Y = new kt((Ae, Sn) => Ae.cost < Sn.cost);
        Y.insert({ cost: 0, node: F });
        let se = /* @__PURE__ */ new Map();
        se.set(F, F);
        let de = /* @__PURE__ */ new Map();
        for (de.set(F, 0); Y.length !== 0; ) {
          let Ae = Y.remove()?.node;
          if (Ae === _)
            break;
          let Sn = I(Ae, D.allowDiagonals);
          for (let _e of Sn) {
            let Cn = (de.get(Ae) || 0) + K(Ae, _e) + N(_e, _);
            (!de.has(_e) || Cn < de.get(_e)) && (de.set(_e, Cn), Y.insert({ cost: Cn, node: _e }), se.set(_e, Ae));
          }
        }
        let En = [], dt = _, li = p(dt);
        for (En.push(li); dt !== F; ) {
          dt = se.get(dt);
          let Ae = p(dt);
          En.push(Ae);
        }
        return En.reverse();
      }, getPath(b, P, D = {}) {
        let F = this.tileWidth(), _ = this.tileHeight(), Y = this.getTilePath(this.pos2Tile(b), this.pos2Tile(P), D);
        return Y ? [b, ...Y.slice(1, -1).map((se) => se.scale(F, _).add(F / 2, _ / 2)), P] : null;
      } };
      return s.use(he), s.onNavigationMapInvalid(() => {
        s.invalidateNavigationMap(), s.trigger("navigation_map_changed");
      }), e.forEach((b, P) => {
        let D = b.split("");
        a = Math.max(D.length, a), D.forEach((F, _) => {
          s.spawn(F, T(_, P));
        });
      }), s;
    }
    __name($s, "$s");
    o($s, "addLevel");
    function zs(e = {}) {
      let n = null, s = null, i = null, a = null;
      return { id: "agent", require: ["pos", "tile"], agentSpeed: e.speed ?? 100, allowDiagonals: e.allowDiagonals ?? true, getDistanceToTarget() {
        return n ? this.pos.dist(n) : 0;
      }, getNextLocation() {
        return s && i ? s[i] : null;
      }, getPath() {
        return s ? s.slice() : null;
      }, getTarget() {
        return n;
      }, isNavigationFinished() {
        return s ? i === null : true;
      }, isTargetReachable() {
        return s !== null;
      }, isTargetReached() {
        return n ? this.pos.eq(n) : true;
      }, setTarget(c) {
        n = c, s = this.getLevel().getPath(this.pos, n, { allowDiagonals: this.allowDiagonals }), i = s ? 0 : null, s ? (a || (a = this.getLevel().onNavigationMapChanged(() => {
          s && i !== null && (s = this.getLevel().getPath(this.pos, n, { allowDiagonals: this.allowDiagonals }), i = s ? 0 : null, s ? this.trigger("navigation-next", this, s[i]) : this.trigger("navigation-ended", this));
        }), this.onDestroy(() => a.cancel())), this.trigger("navigation-started", this), this.trigger("navigation-next", this, s[i])) : this.trigger("navigation-ended", this);
      }, update() {
        if (s && i !== null) {
          if (this.pos.sdist(s[i]) < 2)
            if (i === s.length - 1) {
              this.pos = n.clone(), i = null, this.trigger("navigation-ended", this), this.trigger("target-reached", this);
              return;
            } else
              i++, this.trigger("navigation-next", this, s[i]);
          this.moveTo(s[i], this.agentSpeed);
        }
      }, onNavigationStarted(c) {
        return this.on("navigation-started", c);
      }, onNavigationNext(c) {
        return this.on("navigation-next", c);
      }, onNavigationEnded(c) {
        return this.on("navigation-ended", c);
      }, onTargetReached(c) {
        return this.on("target-reached", c);
      }, inspect() {
        return JSON.stringify({ target: JSON.stringify(n), path: JSON.stringify(s) });
      } };
    }
    __name(zs, "zs");
    o(zs, "agent");
    function Ks(e) {
      let n = U.canvas().captureStream(e), s = re.ctx.createMediaStreamDestination();
      re.masterNode.connect(s);
      let i = new MediaRecorder(n), a = [];
      return i.ondataavailable = (c) => {
        c.data.size > 0 && a.push(c.data);
      }, i.onerror = () => {
        re.masterNode.disconnect(s), n.getTracks().forEach((c) => c.stop());
      }, i.start(), { resume() {
        i.resume();
      }, pause() {
        i.pause();
      }, stop() {
        return i.stop(), re.masterNode.disconnect(s), n.getTracks().forEach((c) => c.stop()), new Promise((c) => {
          i.onstop = () => {
            c(new Blob(a, { type: "video/mp4" }));
          };
        });
      }, download(c = "kaboom.mp4") {
        this.stop().then((f) => Fn(c, f));
      } };
    }
    __name(Ks, "Ks");
    o(Ks, "record");
    function Ys() {
      return document.activeElement === U.canvas();
    }
    __name(Ys, "Ys");
    o(Ys, "isFocused");
    function Xs(e) {
      e.destroy();
    }
    __name(Xs, "Xs");
    o(Xs, "destroy");
    let ht = A.root.add.bind(A.root), Ws = A.root.readd.bind(A.root), Js = A.root.removeAll.bind(A.root), bn = A.root.get.bind(A.root);
    function ir(e = 2, n = 1) {
      let s = 0;
      return { id: "boom", require: ["scale"], update() {
        let i = Math.sin(s * e) * n;
        i < 0 && this.destroy(), this.scale = T(i), s += Ue();
      } };
    }
    __name(ir, "ir");
    o(ir, "boom");
    let Qs = Ie(null, Dr), Zs = Ie(null, Gr);
    function ei(e, n = {}) {
      let s = ht([Lt(e), tr()]), i = (n.speed || 1) * 5, a = n.scale || 1;
      s.add([wn(Zs), It(0), gn("center"), ir(i, a), ...n.comps ?? []]);
      let c = s.add([wn(Qs), It(0), gn("center"), er(), ...n.comps ?? []]);
      return c.wait(0.4 / i, () => c.use(ir(i, a))), c.onDestroy(() => s.destroy()), s;
    }
    __name(ei, "ei");
    o(ei, "addKaboom");
    function or() {
      A.root.update();
    }
    __name(or, "or");
    o(or, "updateFrame");
    class yn {
      static {
        __name(this, "yn");
      }
      static {
        o(this, "Collision");
      }
      source;
      target;
      displacement;
      resolved = false;
      constructor(n, s, i, a = false) {
        this.source = n, this.target = s, this.displacement = i, this.resolved = a;
      }
      reverse() {
        return new yn(this.target, this.source, this.displacement.scale(-1), this.resolved);
      }
      hasOverlap() {
        return !this.displacement.isZero();
      }
      isLeft() {
        return this.displacement.x > 0;
      }
      isRight() {
        return this.displacement.x < 0;
      }
      isTop() {
        return this.displacement.y > 0;
      }
      isBottom() {
        return this.displacement.y < 0;
      }
      preventResolution() {
        this.resolved = true;
      }
    }
    function ti() {
      let e = {}, n = r11.hashGridSize || Si, s = new be(), i = [];
      function a(c) {
        if (i.push(s.clone()), c.pos && s.translate(c.pos), c.scale && s.scale(c.scale), c.angle && s.rotate(c.angle), c.transform = s.clone(), c.c("area") && !c.paused) {
          let f = c, m = f.worldArea().bbox(), l = Math.floor(m.pos.x / n), p = Math.floor(m.pos.y / n), C = Math.ceil((m.pos.x + m.width) / n), R = Math.ceil((m.pos.y + m.height) / n), G = /* @__PURE__ */ new Set();
          for (let k = l; k <= C; k++)
            for (let M = p; M <= R; M++)
              if (!e[k])
                e[k] = {}, e[k][M] = [f];
              else if (!e[k][M])
                e[k][M] = [f];
              else {
                let O = e[k][M];
                e:
                  for (let ne of O) {
                    if (ne.paused || !ne.exists() || G.has(ne.id))
                      continue;
                    for (let N of f.collisionIgnore)
                      if (ne.is(N))
                        continue e;
                    for (let N of ne.collisionIgnore)
                      if (f.is(N))
                        continue e;
                    let K = xr(f.worldArea(), ne.worldArea());
                    if (K) {
                      let N = new yn(f, ne, K);
                      f.trigger("collideUpdate", ne, N);
                      let I = N.reverse();
                      I.resolved = N.resolved, ne.trigger("collideUpdate", f, I);
                    }
                    G.add(ne.id);
                  }
                O.push(f);
              }
        }
        c.children.forEach(a), s = i.pop();
      }
      __name(a, "a");
      o(a, "checkObj"), a(A.root);
    }
    __name(ti, "ti");
    o(ti, "checkFrame");
    function ni() {
      let e = A.cam, n = y.fromAngle(gt(0, 360)).scale(e.shake);
      e.shake = Se(e.shake, 0, 5 * Ue()), e.transform = new be().translate(Vt()).scale(e.scale).rotate(e.angle).translate((e.pos ?? Vt()).scale(-1).add(n)), A.root.draw(), z();
    }
    __name(ni, "ni");
    o(ni, "drawFrame");
    function ri() {
      let e = Ce();
      A.events.numListeners("loading") > 0 ? A.events.trigger("loading", e) : Be(() => {
        let n = pe() / 2, s = 24, i = T(pe() / 2, we() / 2).sub(T(n / 2, s / 2));
        xe({ pos: T(0), width: pe(), height: we(), color: J(0, 0, 0) }), xe({ pos: i, width: n, height: s, fill: false, outline: { width: 4 } }), xe({ pos: i, width: n * e, height: s });
      });
    }
    __name(ri, "ri");
    o(ri, "drawLoadScreen");
    function ar(e, n) {
      Be(() => {
        let s = T(8);
        E(), Q(e);
        let i = je({ text: n, font: zt, size: 16, pos: s, color: J(255, 255, 255), fixed: true }), a = i.width + s.x * 2, c = i.height + s.x * 2;
        e.x + a >= pe() && Q(T(-a, 0)), e.y + c >= we() && Q(T(0, -c)), xe({ width: a, height: c, color: J(0, 0, 0), radius: 4, opacity: 0.8, fixed: true }), Ne(i), L();
      });
    }
    __name(ar, "ar");
    o(ar, "drawInspectText");
    function si() {
      if (te.inspect) {
        let e = null;
        for (let n of A.root.get("*", { recursive: true }))
          if (n.c("area") && n.isHovering()) {
            e = n;
            break;
          }
        if (A.root.drawInspect(), e) {
          let n = [], s = e.inspect();
          for (let i in s)
            s[i] ? n.push(`${i}: ${s[i]}`) : n.push(`${i}`);
          ar(Qr(Dt()), n.join(`
`));
        }
        ar(T(8), `FPS: ${te.fps()}`);
      }
      te.paused && Be(() => {
        E(), Q(pe(), 0), Q(-8, 8);
        let e = 32;
        xe({ width: e, height: e, anchor: "topright", color: J(0, 0, 0), opacity: 0.8, radius: 4, fixed: true });
        for (let n = 1; n <= 2; n++)
          xe({ width: 4, height: e * 0.6, anchor: "center", pos: T(-e / 3 * n, e * 0.5), color: J(255, 255, 255), radius: 2, fixed: true });
        L();
      }), te.timeScale !== 1 && Be(() => {
        E(), Q(pe(), we()), Q(-8, -8);
        let e = 8, n = je({ text: te.timeScale.toFixed(1), font: zt, size: 16, color: J(255, 255, 255), pos: T(-e), anchor: "botright", fixed: true });
        xe({ width: n.width + e * 2 + e * 4, height: n.height + e * 2, anchor: "botright", color: J(0, 0, 0), opacity: 0.8, radius: 4, fixed: true });
        for (let s = 0; s < 2; s++) {
          let i = te.timeScale < 1;
          _n({ p1: T(-n.width - e * (i ? 2 : 3.5), -e), p2: T(-n.width - e * (i ? 2 : 3.5), -e - n.height), p3: T(-n.width - e * (i ? 3.5 : 2), -e - n.height / 2), pos: T(-s * e * 1 + (i ? -e * 0.5 : 0), 0), color: J(255, 255, 255), fixed: true });
        }
        Ne(n), L();
      }), te.curRecording && Be(() => {
        E(), Q(0, we()), Q(24, -24), Xe({ radius: 12, color: J(255, 0, 0), opacity: On(0, 1, U.time() * 4), fixed: true }), L();
      }), te.showLog && A.logs.length > 0 && Be(() => {
        E(), Q(0, we()), Q(8, -8);
        let e = 8, n = [];
        for (let i of A.logs) {
          let a = "", c = i.msg instanceof Error ? "error" : "info";
          a += `[time]${i.time.toFixed(2)}[/time]`, a += " ", a += `[${c}]${i.msg?.toString ? i.msg.toString() : i.msg}[/${c}]`, n.push(a);
        }
        A.logs = A.logs.filter((i) => U.time() - i.time < (r11.logTime || Ti));
        let s = je({ text: n.join(`
`), font: zt, pos: T(e, -e), anchor: "botleft", size: 16, width: pe() * 0.6, lineSpacing: e / 2, fixed: true, styles: { time: { color: J(127, 127, 127) }, info: { color: J(255, 255, 255) }, error: { color: J(255, 0, 127) } } });
        xe({ width: s.width + e * 2, height: s.height + e * 2, anchor: "botleft", color: J(0, 0, 0), radius: 4, opacity: 0.8, fixed: true }), Ne(s), L();
      });
    }
    __name(si, "si");
    o(si, "drawDebug"), r11.debug !== false && Qn(), r11.burp && Zn();
    function ii(e) {
      A.events.on("loading", e);
    }
    __name(ii, "ii");
    o(ii, "onLoading");
    function oi(e) {
      U.onResize(e);
    }
    __name(oi, "oi");
    o(oi, "onResize");
    function ai(e) {
      A.events.on("error", e);
    }
    __name(ai, "ai");
    o(ai, "onError");
    function xn(e) {
      re.ctx.suspend(), U.run(() => {
        Be(() => {
          let i = pe(), a = we(), c = { size: 36, width: i - 32 * 2, letterSpacing: 4, lineSpacing: 4, font: zt, fixed: true };
          xe({ width: i, height: a, color: J(0, 0, 255), fixed: true });
          let f = je({ ...c, text: e.name, pos: T(32), color: J(255, 128, 0), fixed: true });
          Ne(f), Yn({ ...c, text: e.message, pos: T(32, 32 + f.height + 16), fixed: true }), L(), A.events.trigger("error", e);
        });
      });
    }
    __name(xn, "xn");
    o(xn, "handleErr");
    function ui(e) {
      X.push(e);
    }
    __name(ui, "ui");
    o(ui, "onCleanup");
    function ci() {
      A.events.onOnce("frameEnd", () => {
        U.quit();
        for (let n in We)
          window.removeEventListener(n, We[n]);
        d.clear(d.COLOR_BUFFER_BIT | d.DEPTH_BUFFER_BIT | d.STENCIL_BUFFER_BIT);
        let e = d.getParameter(d.MAX_TEXTURE_IMAGE_UNITS);
        for (let n = 0; n < e; n++)
          d.activeTexture(d.TEXTURE0 + n), d.bindTexture(d.TEXTURE_2D, null), d.bindTexture(d.TEXTURE_CUBE_MAP, null);
        d.bindBuffer(d.ARRAY_BUFFER, null), d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, null), d.bindRenderbuffer(d.RENDERBUFFER, null), d.bindFramebuffer(d.FRAMEBUFFER, null), X.forEach((n) => n()), d.deleteBuffer(v.vbuf), d.deleteBuffer(v.ibuf);
      });
    }
    __name(ci, "ci");
    o(ci, "quit");
    function Un(e, n, s, i, a = tt.linear) {
      let c = 0, f = [], g = mn(() => {
        c += Ue();
        let m = Math.min(c / s, 1);
        i(Se(e, n, a(m))), m === 1 && (g.cancel(), i(n), f.forEach((l) => l()));
      });
      return { get paused() {
        return g.paused;
      }, set paused(m) {
        g.paused = m;
      }, onEnd(m) {
        f.push(m);
      }, then(m) {
        return this.onEnd(m), this;
      }, cancel() {
        g.cancel();
      }, finish() {
        g.cancel(), i(n), f.forEach((m) => m());
      } };
    }
    __name(Un, "Un");
    o(Un, "tween");
    let jt = true;
    U.run(() => {
      V.loaded || Ce() === 1 && !jt && (V.loaded = true, A.events.trigger("load")), !V.loaded && r11.loadingScreen !== false || jt ? (Ge(), ri(), at()) : (te.paused || or(), ti(), Ge(), ni(), r11.debug !== false && si(), at()), jt && (jt = false), A.events.trigger("frameEnd");
    });
    function ur() {
      let e = j, n = d.drawingBufferWidth / e, s = d.drawingBufferHeight / e;
      if (U.isFullscreen()) {
        let i = window.innerWidth, a = window.innerHeight, c = i / a, f = n / s;
        if (c > f) {
          let g = window.innerHeight * f;
          v.viewport = { x: (i - g) / 2, y: 0, width: g, height: a };
        } else {
          let g = window.innerWidth / f;
          v.viewport = { x: 0, y: (a - g) / 2, width: i, height: g };
        }
        return;
      }
      if (r11.letterbox) {
        if (!r11.width || !r11.height)
          throw new Error("Letterboxing requires width and height defined.");
        let i = n / s, a = r11.width / r11.height;
        if (i > a) {
          let c = s * a, f = (n - c) / 2;
          v.viewport = { x: f, y: 0, width: c, height: s };
        } else {
          let c = n / a, f = (s - c) / 2;
          v.viewport = { x: 0, y: f, width: n, height: c };
        }
        return;
      }
      if (r11.stretch && (!r11.width || !r11.height))
        throw new Error("Stretching requires width and height defined.");
      v.viewport = { x: 0, y: 0, width: n, height: s };
    }
    __name(ur, "ur");
    o(ur, "updateViewport"), U.onHide(() => {
      r11.backgroundAudio || re.ctx.suspend();
    }), U.onShow(() => {
      r11.backgroundAudio || re.ctx.resume();
    }), U.onResize(() => {
      if (U.isFullscreen())
        return;
      let e = r11.width && r11.height;
      e && !r11.stretch && !r11.letterbox || (u.width = u.offsetWidth * j, u.height = u.offsetHeight * j, ur(), e || (v.frameBuffer.free(), v.frameBuffer = new De(d.drawingBufferWidth, d.drawingBufferHeight), v.width = d.drawingBufferWidth / j, v.height = d.drawingBufferHeight / j));
    }), ur();
    let ke = { VERSION: xi, loadRoot: Yt, loadProgress: Ce, loadSprite: Ie, loadSpriteAtlas: yt, loadSound: sn, loadBitmapFont: Zt, loadFont: Qt, loadShader: nn, loadShaderURL: rn, loadAseprite: tn, loadPedit: en, loadBean: on, loadJSON: Jt, load: rt, getSprite: Ut, getSound: Et, getFont: St, getBitmapFont: Ct, getShader: Tt, getAsset: an, Asset: ue, SpriteData: ce, SoundData: ge, width: pe, height: we, center: Vt, dt: Ue, time: U.time, screenshot: U.screenshot, record: Ks, isFocused: Ys, setCursor: U.setCursor, getCursor: U.getCursor, setCursorLocked: U.setCursorLocked, isCursorLocked: U.isCursorLocked, setFullscreen: U.setFullscreen, isFullscreen: U.isFullscreen, isTouchscreen: U.isTouchscreen, onLoad: vn, onLoading: ii, onResize: oi, onGamepadConnect: U.onGamepadConnect, onGamepadDisconnect: U.onGamepadDisconnect, onError: ai, onCleanup: ui, camPos: Zr, camScale: es, camRot: ts, shake: ns, toScreen: Xn, toWorld: Wn, setGravity: ds, getGravity: fs, setBackground: ms, getBackground: ps, getGamepads: U.getGamepads, add: ht, make: fn, destroy: Xs, destroyAll: Js, get: bn, readd: Ws, pos: Lt, scale: It, rotate: gs, color: ws, opacity: vs, anchor: gn, area: Ss, sprite: wn, text: Cs, rect: Ts, circle: Os, uvquad: As, outline: Ps, body: Ds, doubleJump: Gs, shader: Fs, timer: er, fixed: Bs, stay: tr, health: Ls, lifespan: Is, z: bs, move: xs, offscreen: Es, follow: ys, state: Vs, fadeIn: js, tile: sr, agent: zs, on: Le, onUpdate: mn, onDraw: rs, onAdd: pn, onDestroy: Jn, onClick: as, onCollide: ss, onCollideUpdate: is, onCollideEnd: os, onHover: us, onHoverUpdate: cs, onHoverEnd: ls, onKeyDown: U.onKeyDown, onKeyPress: U.onKeyPress, onKeyPressRepeat: U.onKeyPressRepeat, onKeyRelease: U.onKeyRelease, onMouseDown: U.onMouseDown, onMousePress: U.onMousePress, onMouseRelease: U.onMouseRelease, onMouseMove: U.onMouseMove, onCharInput: U.onCharInput, onTouchStart: U.onTouchStart, onTouchMove: U.onTouchMove, onTouchEnd: U.onTouchEnd, onScroll: U.onScroll, onHide: U.onHide, onShow: U.onShow, onGamepadButtonDown: U.onGamepadButtonDown, onGamepadButtonPress: U.onGamepadButtonPress, onGamepadButtonRelease: U.onGamepadButtonRelease, onGamepadStick: U.onGamepadStick, mousePos: Dt, mouseDeltaPos: U.mouseDeltaPos, isKeyDown: U.isKeyDown, isKeyPressed: U.isKeyPressed, isKeyPressedRepeat: U.isKeyPressedRepeat, isKeyReleased: U.isKeyReleased, isMouseDown: U.isMouseDown, isMousePressed: U.isMousePressed, isMouseReleased: U.isMouseReleased, isMouseMoved: U.isMouseMoved, isGamepadButtonPressed: U.isGamepadButtonPressed, isGamepadButtonDown: U.isGamepadButtonDown, isGamepadButtonReleased: U.isGamepadButtonReleased, charInputted: U.charInputted, loop: hs, wait: Bt, play: Pt, volume: Ot, burp: Mt, audioCtx: re.ctx, Timer: vt, Line: Oe, Rect: le, Circle: pt, Polygon: He, Vec2: y, Color: q, Mat4: be, Quad: ie, RNG: ft, rand: gt, randi: Pn, randSeed: fr, vec2: T, rgb: J, hsl2rgb: dr, quad: oe, choose: pr, chance: mr, lerp: Se, tween: Un, easings: tt, map: Nt, mapc: hr, wave: On, deg2rad: Ee, rad2deg: Ze, clamp: Pe, testLineLine: Qe, testRectRect: gr, testRectLine: wr, testRectPoint: mt, testCirclePolygon: yr, testLinePoint: vr, testLineCircle: Mn, drawSprite: Ye, drawText: Yn, formatText: je, drawRect: xe, drawLine: ut, drawLines: kn, drawTriangle: _n, drawCircle: Xe, drawEllipse: Hn, drawUVQuad: me, drawPolygon: Ve, drawFormattedText: Ne, drawMasked: Yr, drawSubtracted: Xr, pushTransform: E, popTransform: L, pushTranslate: Q, pushScale: h, pushRotate: x, pushMatrix: Rt, usePostEffect: Fe, debug: te, scene: Ns, go: ks, onSceneLeave: _s, addLevel: $s, getData: Hs, setData: nr, download: _t, downloadJSON: Er, downloadText: Gn, downloadBlob: Fn, plug: rr, ASCII_CHARS: Fr, canvas: U.canvas(), addKaboom: ei, LEFT: y.LEFT, RIGHT: y.RIGHT, UP: y.UP, DOWN: y.DOWN, RED: q.RED, GREEN: q.GREEN, BLUE: q.BLUE, YELLOW: q.YELLOW, MAGENTA: q.MAGENTA, CYAN: q.CYAN, WHITE: q.WHITE, BLACK: q.BLACK, quit: ci, Event: ve, EventHandler: Re, EventController: Me };
    if (r11.plugins && r11.plugins.forEach(rr), r11.global !== false)
      for (let e in ke)
        window[e] = ke[e];
    return U.canvas().focus(), ke;
  }, "default");

  // src/fonts/apl386.ttf
  var apl386_default = __toBinary("AAEAAAAQAQAABAAARkZUTXzVkicAAuqUAAAAHEdERUYAJwQTAALqbAAAACZPUy8y1r/9XgAAAYgAAABWY21hcCvaC+QAABFsAAALymN2dCAIfwGzAAAe9AAAACBmcGdtyaCxmwAAHTgAAAFTZ2FzcAAXAAkAAupcAAAAEGdseWb7W9QkAAAuzAAClyxoZWFkCjV+pwAAAQwAAAA2aGhlYQXWBP4AAAFEAAAAJGhtdHgFnyIYAAAB4AAAD4psb2NhBRyBwAAAHxQAAA+4bWF4cAYEAtMAAAFoAAAAIG5hbWXrNlTYAALF+AAAAlVwb3N0hne48gACyFAAACILcHJlcEXb3V8AAB6MAAAAZwABAAAAAgAqKz3tj18PPPUAHwPoAAAAAM2Yn/QAAAAA2yOa8/+g/wsCpQOlAAAACAACAAEAAAAAAAEAAAOO/xkAAAJZ/6D/swKlAAEAAAAAAAAAAAAAAAAAAAPYAAEAAAPtASAADAAAAAAAAgAAAAAACgAAAgABsQAAAAAAAQJYAZAABQAAArwCigAAAI8CvAKKAAABxQAyAQMICQILBwkAAgIAAgOAAALHAABc4QAAAAAAAAAAYWNkcwBAACD//wOO/xUAAAOOAOcAAAABAAAAAAAAAlgAfwJYAAACWAAAAlgAAAJYANYCWACwAlgAIQJYAEECWAA3AlgAOAJYAQECWAC7AlgAvAJYAG0CWABfAlgA1AJYAGECWADWAlgAXgJYAFACWACOAlgAXQJYAGICWABQAlgAYwJYAFcCWABuAlgAWAJYAEsCWADbAlgA0wJYAHgCWABxAlgAbAJYAJICWAASAlgAPAJYAGkCWABHAlgARAJYAHMCWAB1AlgAPQJYAGcCWABxAlgASAJYAFQCWABsAlgANAJYAFMCWAAnAlgAWAJYACQCWABUAlgAYwJYAEECWABWAlgAPQJYACACWABOAlgASAJYAHACWACfAlgAXwJYAJ8CWABfAlgAEgJYAMACWABSAlgAXgJYAF8CWABbAlgATwJYAHcCWAA3AlgAYAJYAJICWAB6AlgAhQJYANoCWAAfAlgAXwJYAEgCWABlAlgATQJYAH8CWAB2AlgAdAJYAF4CWABhAlgAQQJYAFkCWABmAlgAcwJYAIECWAEAAlgAggJYADkCWAAQAlgAAAJYAOMCWABfAlgANgJYADkCWABFAlgBAQJYAFECWABUAlj/+gJYAHICWAAkAlgAZAJYAGECWP/5AlgARQJYAIACWABeAlgAKAJYACgCWAC+AlgAGAJYACMCWAD6AlgAxgJYACgCWAAoAlgAJAJY//oCWP//Alj//gJYAJICWABDAlgAQwJYAEMCWABDAlgAQwJYAEMCWAA8AlgATQJYAHMCWABzAlgAcwJYAFICWABxAlgAcQJYAHECWABfAlgAGQJYAFoCWAAnAlgAJwJYACcCWAAnAlgAJwJYAHECWAAnAlgAVgJYAFYCWABWAlgAVgJYAEgCWAA5AlgAawJYAFICWABSAlgAUgJYAFICWABSAlgAUgJYAB4CWABfAlgAWAJYAFgCWABYAlgAWAJYALQCWACxAlgAlgJYAJYCWABdAlgAXwJYAEgCWABIAlgASAJYAEgCWABIAlgATgJYAEgCWABeAlgAXgJYAF4CWABeAlgAYgJYAFUCWABiAlgAQwJYAGcCWABDAlgAZwJYAEMCWABnAlgASgJYAF8CWABHAlgAXwJYAEoCWABfAlgASgJYAF8CWABEAlgAMQJYAAACWABbAlgAYgJYAE8CWABzAlgATwJYAHMCWABPAlgAcwJYAE8CWABzAlgATwJYAD0CWAA3AlgAPQJYADcCWAA9AlgANwJYAD0CWAA3AlgAZwJYAGACWAAuAlgAFgJYAHECWABxAlgAYgJYAGICWABxAlgAhgJYAHECWACSAlgAcQJYALICWAADAlgAPgJYAEgCWACOAlgAVAJYAIUCWACFAlgAbAJYAJgCWABsAlgAmAJYAGwCWACWAlgAbAJYAJgCWAAEAlgAfwJYAFoCWABfAlgAWgJYAF8CWABaAlgAXwJYABICWABEAlgAYgJYACcCWABIAlgAJwJYAEgCWAAnAlgASAJY//8CWP/3AlgAVAJYAGkCWABUAlgAaQJYAFQCWABpAlgAYwJYAHYCWABjAlgAdgJYAGMCWAB2AlgAYwJYAHECWABBAlgAdAJYAEECWAB0AlgAQQJYAFYCWABWAlgAXgJYAFYCWABeAlgAVgJYAF4CWABWAlgAXgJYAFYCWABeAlgAVgJYAF4CWAAgAlgAQQJYAEgCWABmAlgASAJYAHACWABzAlgAcAJYAHMCWABwAlgAcwJYALICWAB0AlgARwJYAE0CWABxAlgAOgJYADwCWABSAlgAcQJYAIMCWAAnAlgASAJYAFYCWABeAlgATAJYADwCWAAeAlgAPQJYADcCWABUAlgAhQJYAHoCWAA9AlgANwJYAFMCWABfAlgAQwJYAFICWAA8AlgAHgJYACcCWABIAlgAZwJYAGACWAA8AlgAUgJYAHMCWABPAlgAJwJYAEgCWABIAlgAYgJYAHoCWABQAlgAKgJY//4CWACOAlgAUAJYAEwCWABgAlgAZQJYAQACWACyAlgAiwJYAIYCWAA5AlgAvAJYALwCWACVAlgAcwJYAGICWABQAlgAhgJYAGUCWABkAlgAjgJYAF8CWACOAlgA0wJYAEgCWAAnAlgA1gJYAAsCWAAPAlgADAJYAA0CWAAGAlgABwJYACYCWABDAlgAaQJYAGwCWAAlAlgAcwJYAHACWABnAlgAJgJYAHECWABUAlgAOAJYADQCWABaAlgAMQJYACcCWP/+AlgAWAJYADoCWABBAlgASAJYADUCWABOAlgAOQJYAA4CWABxAlgAPAJYACoCWABgAlgAYwJYAL8CWAAmAlgAKgJYAHMCWAA8AlgAPgJYAGACWABGAlgAYgJYAEgCWAEAAlgAZwJYAGECWABfAlgAYQJYADkCWABIAlgAQAJYAGsCWABgAlgAIgJYAG8CWABhAlgAMgJYAEwCWAA3AlgAJAJYAJYCWABeAlgAJwJYAFwCWAAjAlgAMAJYAAACWAB1AlgATQJYAFYCWABfAlgAegJYAEICWAB7AlgAqAJYADkCWABVAlgARwJYABACWAB0AlgARwJYAHQCWABzAlgAUgJYAA8CWABrAlgAVAJYAGMCWABxAlgAcQJYAEgCWABUAlgAZQJYAEACWABVAlgAQwJYAGgCWABpAlgAbAJYAAMCWABzAlgADwJYAEMCWABlAlgAWgJYAFQCWAAXAlgADAJYAGcCWAAnAlj//gJYAFgCWABKAlgAQQJYAEECWAA1AlgATgJYABACWABLAlgADwJY//UCWAASAlj//gJYAGICWABVAlgAAgJYAFUCWABSAlgATAJYAIACWACHAlgANwJYAE8CWAAsAlgAZQJYAGQCWABaAlgAagJYAD4CWAAfAlgAZwJYAEgCWABAAlgAUQJYAF8CWABoAlgAZgJYAAkCWABoAlgAOgJYAGcCWAARAlj/+gJYADYCWP//AlgAdgJYAIICWAAAAlgAagJYAFgCWABYAlgAhgJYAHsCWAB2AlgAwAJYAJYCWACOAlgAVgJYAFQCWABUAlgAYQJYAAACWAAAAlgArgJYABICWADDAlgAvQJYANsCWADmAlgAZgJYAGcCWABqAlgAdgJYAFcCWABXAlgAZwJYACACWAAQAlgAnwJYAJ8CWABwAlgAkgJY/+cCWP/yAlgAfAJYAK4CWACGAlgAigJYAHICWACLAlgAfwJYAJMCWACCAlgAeAJYAIgCWACKAlgAlgJYANMCWADSAlgAfAJYAK4CWACGAlgAigJYAHICWACLAlgAfwJYAJMCWACCAlgAeAJYAIgCWACKAlgAlgJYANMCWADSAlgAJQJYAC0CWAA8AlgAAwJYABYCWACNAlgAFgJYAIwCWP/+AlgAjAJYABYCWAALAlgAKAJYADQCWAB7AlgAewJYAGcCWP/+Alj/6gJYAEECWABhAlgAXgJYAF8CWABeAlj/6wJYAG0CWACKAlgAswJY//8CWP+sAlj/oAJYAAoCWAEAAlgArgJY//ICWABfAlgAYAJYAHkCWAB6AlgAPQJYAFQCWAA5AlgAJwJYADkCWAA5AlgAHwJYAD8CWABOAlgATgJYAE4CWABoAlgAagJYAFoCWABZAlgAUQJYAE0CWAAzAlgAMwJYAC8CWAAvAlgALwJYAAsCWAALAlgACwJYAAsCWAALAlgAQgJYAFMCWABQAlgAUQJYAFMCWAAUAlgAUQJYAEUCWABFAlgAQgJYAJsCWABtAlgAeQJYAKACWACgAlgAoAJYAJ8CWACZAlgAAgJYAAICWABPAlgAdwJYABACWAAQAlgAEAJYABACWAAQAlgAMAJYAAsCWABLAlgASgJYABACWAAQAlgAEAJYABACWAAWAlgAFgJYABACWAAQAlgACwJYABICWAA6AlgAEAJYABACWABiAlj//gJYABACWABFAlgAOgJYABACWAAQAlgAYQJYAAACWAAQAlgAEgJYABQCWAASAlgAEgJYAAsCWABpAlgAEAJYAAsCWAAQAlgAUQJYADoCWABUAlgAVAJYAAsCWABUAlgAWgJYADkCWABUAlgAbwJYADoCWAAcAlgAOQJYABICWAAQAlgAEAJYAGACWABfAlgAlwJYAFYCWAA3AlgAEgJYABACWAAEAlgAEgJYACICWAALAlgAEAJZABACWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAEgJYABICWAASAlgAAAJY//UCWADxAlgAxgJYAPICWADxAlgAxgJYAMYCWAAAAlj/9QJY//UCWP/1AlgA8gJYAPECWADGAlgAxgJYAAACWP/1Alj/9QJY//UCWADyAlgA8QJYAMYCWADGAlgAxgJYAMYCWADGAlgAxgJYAAACWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWP/1AlgAAAJY//UCWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWAAAAlj/9QJY//UCWP/1Alj/9QJY//UCWP/1Alj/9QJYAAACWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWP/1Alj/9QJY//UCWAAAAlgAmwJYAJsCWAAAAlgAmwJYAAACWADyAlgAmwJYAJsCWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWP/1AlgAxgJYAPECWADGAlj/9QJYAMYCWP/1AlgAxgJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAAAAlgAAAJYAAACWAFBAlgAAAJY//8CWP//AlgAAAJYAg8CWAAQAlgAQgJYAEICWAALAlgACwJYAJkCWAALAlgACwJYAAsCWAALAlgACwJYACwCWP/tAlgAIAJYAA4CWABXAlj//wJYADYCWABuAlgAKwJYAAoCWABXAlgABgJYADwCWAB6AlgAPgIKABsB/QBDAlgAAQICADUCWAAfAlgATwISAAECWAALABQApQClAL0ArgAWAI0AEQC8ALQAXwBCAC///ABNAD3//QAdAHAANwBeAAAAAAAFAAAAAwAAACwAAAAEAAAD7AABAAAAAAnAAAMAAQAAACwAAwAK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AACupAAArywAAK/IAACwgAAAsTQAALIIAACyvAAAs4wAALREAAC1EAAAtdgAALaAAAC3NAAAt+gAALigAAC5WAAAuiAAALtcAAC8kAAAvYwAAL4cAAC/MAAAv9wAAMD4AADBoAAAwnwAAMNkAADEUAAAxUgAAMY4AADHMAAAyCQAAMlYAADJ7AAAytwAAMuAAADMfAAAzRQAAM4AAADOzAAAz8AAANBkAADRMAAA0eAAANKsAADTaAAA1EQAANT8AADV1AAA1mgAANcMAADXuAAA2HQAANkMAADZrAAA2lwAANrkAADbgAAA3AgAANyoAADdTAAA3gAAAN5gAADe2AAA4AwAAOEIAADhXAAA4cwAAOJYAADjSAAA49gAAORQAADk5AAA5YgAAOYcAADm1AAA5zAAAOfsAADo/AAA6fgAAOrMAADrdAAA7BQAAOyQAADtdAAA7jAAAO60AADvTAAA8BQAAPEwAADx5AAA8vQAAPO0AAD0fAAA9RQAAPW8AAD2NAAA9xAAAPesAAD4WAAA+NgAAPloAAD54AAA+mQAAPqkAAD7VAAA/CQAAPz0AAD9fAAA/dgAAP40AAD/kAABALQAAQD8AAEBSAABAZQAAQH8AAECqAABAugAAQMkAAEDeAABA+wAAQQ0AAEEcAABBLAAAQU8AAEFuAABBkAAAQboAAEHkAABCBAAAQiEAAEJNAABCXwAAQpIAAELBAABC7AAAQywAAENaAABDpAAAQ9EAAEPzAABEMgAAREsAAERhAABEfQAARJsAAES6AABE9QAARRUAAEU5AABFVAAARYAAAEWeAABFyAAARecAAEYMAABGNgAARlYAAEZzAABGkAAARr8AAEblAABHFAAAR1QAAEeFAABHrwAAR+4AAEhIAABIiQAASKcAAEjnAABJGwAASVwAAEl3AABJuwAAShIAAEpZAABKlgAASs0AAErfAABLEAAASzAAAEtlAABLgQAAS9UAAEv1AABMFQAATEgAAEyPAABMugAATNUAAEz6AABNOwAATWoAAE3FAABOEAAATj4AAE5/AABOqgAATs0AAE8iAABPRAAAT48AAE+jAABP2gAAT/8AAFAhAABQOQAAUFcAAFBvAABQhgAAULEAAFDaAABQ+QAAUScAAFFFAABRawAAUZIAAFGvAABR2AAAUhIAAFI2AABSZgAAUpMAAFKwAABS4QAAUwUAAFMsAABTWQAAU5EAAFO8AABT1gAAVAoAAFRGAABUXwAAVJUAAFSvAABVDgAAVWMAAFWNAABVygAAVe4AAFYfAABWSQAAVmgAAFaFAABWqgAAVtMAAFb4AABXEAAAVzUAAFdkAABXgwAAV6sAAFfZAABYBAAAWDkAAFh4AABY0wAAWQsAAFk8AABZfAAAWcMAAFnvAABaRAAAWo4AAFqmAABa2wAAWvsAAFtSAABbogAAW8cAAFwCAABcNQAAXGQAAFyGAABcpgAAXMYAAFzmAABdDgAAXTYAAF1QAABdbgAAXc8AAF3rAABeFAAAXkUAAF5wAABengAAXt4AAF8yAABfbQAAX5QAAF/OAABgDwAAYDUAAGBtAABgkAAAYK0AAGDcAABg9gAAYSQAAGFCAABhcgAAYZoAAGHHAABh1wAAYecAAGHwAABiBgAAYh4AAGIxAABiRAAAYlUAAGJmAABihwAAYqkAAGLGAABi4wAAYxUAAGNTAABjaAAAY40AAGPlAABj/AAAZBAAAGQ7AABkcgAAZJEAAGShAABkwwAAZN8AAGUAAABlMgAAZVYAAGV+AABloAAAZbUAAGXkAABmDwAAZikAAGY3AABmUQAAZnQAAGabAABmvQAAZtoAAGb6AABnLAAAZ08AAGd2AABnmgAAZ64AAGfcAABoAwAAaB0AAGgvAABoSQAAaGwAAGiSAABpFwAAaVEAAGnZAABqEgAAajAAAGpNAABqawAAaokAAGq3AABq4gAAaxgAAGtIAABrXQAAa28AAGuaAABrvQAAa8kAAGvtAABsBwAAbCYAAGw4AABsWwAAbHcAAGyDAABskQAAbL4AAGzWAABs5wAAbP4AAG1RAABtiQAAbbIAAG2/AABt1QAAbfIAAG4IAABuHQAAbjYAAG5SAABucQAAbpwAAG6+AABu8gAAby4AAG93AABvpgAAb84AAG/tAABwEgAAcDIAAHBVAABwdAAAcI4AAHCoAABwzAAAcPAAAHEPAABxLQAAcVgAAHGKAABxogAAccwAAHICAAByMgAAcm4AAHLWAABy9AAAcwgAAHMdAABzMAAAc0QAAHNnAABzggAAc58AAHO7AABzzAAAc90AAHQOAAB0LAAAdEAAAHRSAAB0ZQAAdHUAAHSQAAB0ygAAdQMAAHUoAAB1QgAAdW8AAHWkAAB1xwAAdgEAAHYxAAB2YAAAdoUAAHakAAB2vQAAducAAHcRAAB3PQAAd2MAAHeRAAB3vgAAeAwAAHheAAB4tAAAeNQAAHjzAAB5GgAAeUMAAHl3AAB5pQAAefgAAHoVAAB6NgAAel4AAHqFAAB6tAAAeuMAAHs2AAB7TQAAe2kAAHuFAAB7qgAAe94AAHwJAAB8JgAAfI4AAHzCAAB88gAAfSAAAH1pAAB9mwAAfeMAAH4GAAB+LAAAfmUAAH6QAAB+rgAAftgAAH8PAAB/PwAAf2oAAH+kAAB/4gAAgAoAAIA3AACAWAAAgIUAAIC1AACA7wAAgR0AAIFfAACBmQAAgcsAAIICAACCGQAAglIAAIJ3AACCuwAAguoAAIMQAACDNQAAg1gAAIOpAACD0wAAg/cAAIQnAACEVQAAhHcAAISgAACExgAAhOwAAIUTAACFVgAAhZUAAIXKAACF7AAAhhIAAIYzAACGWQAAhoAAAIahAACGwQAAhvUAAIccAACHRAAAh2wAAIeLAACHvwAAh+0AAIgQAACILQAAiE0AAIhuAACIhwAAiL0AAIjiAACJAwAAiTEAAIljAACJgAAAibAAAIneAACKBAAAiiAAAIpDAACKYAAAin4AAIqaAACKoAAAiq0AAIq5AACKxQAAitkAAIrtAACLAQAAixUAAIspAACLPQAAi1EAAItlAACLeQAAi40AAIuhAACLtQAAi8kAAIvdAACL8QAAjAUAAIweAACMNwAAjFUAAIxyAACMigAAjKgAAIzFAACM3QAAjPUAAI0OAACNLAAAjUkAAI1hAACNfwAAjZwAAI21AACNzgAAjesAAI4HAACOIAAAjjkAAI5WAACOcgAAjosAAI6jAACOwAAAjtwAAI71AACPDQAAjyoAAI9GAACPXwAAj38AAI+hAACPwgAAj+IAAJAFAACQJwAAkEcAAJBuAACQlAAAkLoAAJDfAACRAgAAkSQAAJFGAACRZwAAkYcAAJGYAACRqQAAkb8AAJHUAACR6gAAkgAAAJIVAACSLAAAkkgAAJJcAACScgAAko0AAJKiAACStgAAktEAAJLnAACS/AAAkxcAAJMzAACTTwAAk3UAAJOCAACTjgAAk5sAAJOnAACTtgAAk8UAAJPUAACT4wAAk+0AAJP2AACUAQAAlAwAAJQXAACUIgAAlC0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ANQA1QBoAOsA7QCJAGoAaQBrAG0AbABuAKAAbwBxAHAAcgBzAHUAdAB2AHcA6gB4AHoAeQB7AH0AfAC4AKEBHQEeAR8BIADsAO4AugEhASIBIwEkASUBJgD9AP4BJwEoASkBKgD/AQABKwEsAS0BLgEvATABMQEyATMBNAE1ATYBNwE4ATkBOgD4APkBOwE8AT0BPgE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgD6ANcBSwFMAU0BTgFPAVABUQFSAVMBVAFVAVYBVwFYAVkA4gDjAVoBWwFcAV0BXgFfAWABYQFiAWMBZAFlAWYBZwFoALAAsQFpAWoBawFsAW0BbgFvAXABcQFyAXMBdAF1AXYBdwF4AXkBegF7AXwBfQF+AX8BgAGBAYIBgwGEAYUBhgGHAYgBiQGKAYsBjAGNAY4BjwGQAZEA5gDnAZIBkwGUAZUBlgGXAZgBmQGaAZsBnAGdAZ4BnwGgAaEBogGjAaQBpQGmAacBqAGpAaoBqwGsAa0BrgGvAbABsQGyAbMBtAG1AbYBtwG4AbkBugG7AbwBvQG+Ab8BwAHBAcIBwwHEAcUBxgHHAcgByQHKAcsBzAHNAc4BzwHQAdEB0gHTAdQB1QHWAdcB2AHZAdoB2wHcAd0B3gHfAeAB4QHiAeMB5AHlAeYB5wHoAekB6gHrAewB7QHuAe8B8AHxAfIB8wH0AfUB9gH3AfgB+QH6AfsB/AH9Af4B/wIAAgECAgIDAgQCBQIGAgcCCAIJAgoCCwIMAg0CDgIPAhACEQISAhMCFAIVAhYCFwIYAhkCGgIbAhwCHQIeAh8CIAIhAiICIwIkAiUCJgInAigCKQIqAisCLAItAi4CLwIwAjECMgIzAjQCNQI2AjcCOAI5AjoCOwI8Aj0CPgI/AkACQQJCAkMCRAJFAkYCRwJIAkkCSgJLAkwCTQJOAk8CUAJRAlICUwJUAlUCVgJXAlgCWQJaAlsCXAJdAl4CXwJgAmECYgJjAmQCZQJmAmcCaAJpAmoCawJsAm0CbgJvAnACcQJyAnMCdAJ1AnYCdwJ4AnkCegJ7AnwCfQJ+An8CgAKBAoICgwKEAoUChgKHAogCiQKKAosCjAKNAo4CjwKQApECkgKTApQClQKWApcCmAKZApoCmwKcAp0CngKfAqACoQKiAqMCpAKlAqYCpwKoAqkCqgKrAqwCrQKuAq8CsAKxArICswK0ArUCtgK3ArgCuQK6ArsCvAK9Ar4CvwLAAsECwgLDAsQCxQLGAscCyACoAskCygLLAswCzQLOAs8A7wLQAtEC0gLTAtQC1QLWAKUC1wLYAJIC2QLaAtsC3ALdAt4C3wCcAuAC4QLiAuMC5ALlAuYC5wLoAukC6gLrAuwC7QLuAu8C8ALxAvIC8wL0AvUC9gL3AvgC+QL6AvsC/AL9Av4C/wMAAwEDAgMDAwQDBQMGAwcDCAMJAwoDCwMMAw0DDgMPAxADEQMSAxMDFAMVAxYDFwMYAxkDGgMbAxwDHQMeAx8DIAMhAyIDIwMkAyUDJgMnAygDKQMqAysDLAMtAy4DLwMwAzEDMgMzAzQDNQM2AzcDOAM5AzoDOwM8Az0DPgM/A0ADQQNCA0MDRANFA0YDRwNIA0kDSgNLA0wAnwNNA04DTwNQA1EDUgNTA1QDVQNWA1cDWANZA1oDWwNcA10DXgNfA2ADYQNiA2MDZANlA2YDZwNoA2kDagNrA2wDbQNuA28DcANxA3IDcwN0A3UDdgN3A3gDeQN6A3sDfAN9A34DfwOAA4EDggODA4QDhQOGA4cDiAOJA4oDiwOMA40DjgOPA5ADkQOSA5MDlAOVA5YDlwOYA5kDmgObA5wDnQOeA58DoAOhA6IDowOkA6UDpgOnA6gDqQOqA6sDrAOtA64DrwOwA7EDsgOzA7QDtQO2A7cDuAO5A7oDuwO8A70DvgO/A8ADwQPCA8MDxAPFA8YDxwPIA8kDygPLA8wDzQPOA88D0APRA9ID0wPUA9UD1gPXA9gD2QPaA9sD3APdA94D3wPgA+ED4gPjA+QD5QPmA+cD6APpA+oD6wPsA+0D7gPvA/AD8QPyA/MD9AP1A/YD9wP4A/kD+gP7A/wD/QP+A/8EAAQBBAIEAwQEBAUEBgQHBAgECQQKBAsEDAQNBA4EDwQQBBEEEgQTBBQEFQQWBBcEGAQZBBoEGwQcBB0EHgQfBCAEIQQiBCMEJAQlBCYEJwQoBCkEKgQrBCwELQQuBC8EMAQxBDIEMwQ0BDUENgdGTDAwNUVoB0ZMMDA3RWgHRkwwMDdGaBJzcGFjZV9ub25fYnJlYWtpbmcHRkwwMEExaAdGTDAwQTRoClNwbGl0U3RpbGUHRkwwMEFBaAdGTDAwQUJoA25vdAtzb2Z0X2h5cGhlbghnbHlwaDExNghnbHlwaDExNwhnbHlwaDExOAhnbHlwaDExOQhnbHlwaDEyMANjaDEIZ2x5cGgxMjcIZ2x5cGgxMjgIZ2x5cGgxMjIHRkwwMEJCaAhnbHlwaDEyNAhnbHlwaDEyNghnbHlwaDEyNQZPQWN1dGULT0NpcmN1bWZsZXgGT1RpbGRlB0ZMMDBGOWgHRkwwMEZBaAdGTDAwRkJoB0ZMMDBGQ2gHQU1hY3JvbgdhbWFjcm9uBkFicmV2ZQZhYnJldmUHQW9nb25lawdhb2dvbmVrC0NjaXJjdW1mbGV4C2NjaXJjdW1mbGV4CkNkb3RhY2NlbnQKY2RvdGFjY2VudAZEY2Fyb24GZGNhcm9uB0RtYWNyb24HZG1hY3JvbgdFbWFjcm9uB2VtYWNyb24GRWJyZXZlBmVicmV2ZQpFZG90YWNjZW50CmVkb3RhY2NlbnQHRW9nb25lawdlb2dvbmVrBkVjYXJvbgZlY2Fyb24LR2NpcmN1bWZsZXgLZ2NpcmN1bWZsZXgKR2RvdGFjY2VudApnZG90YWNjZW50DEdjb21tYWFjY2VudAxnY29tbWFhY2NlbnQLSGNpcmN1bWZsZXgLaGNpcmN1bWZsZXgESGJhcgRoYmFyBkl0aWxkZQZpdGlsZGUHSW1hY3JvbgdpbWFjcm9uBklicmV2ZQZpYnJldmUHSW9nb25lawdpb2dvbmVrAklKAmlqC0pjaXJjdW1mbGV4C2pjaXJjdW1mbGV4DEtjb21tYWFjY2VudAxrY29tbWFhY2NlbnQMa2dyZWVubGFuZGljBkxhY3V0ZQZsYWN1dGUMTGNvbW1hYWNjZW50DGxjb21tYWFjY2VudAZMY2Fyb24GbGNhcm9uBExkb3QEbGRvdAZOYWN1dGUGbmFjdXRlDE5jb21tYWFjY2VudAxuY29tbWFhY2NlbnQGTmNhcm9uBm5jYXJvbgtuYXBvc3Ryb3BoZQNFbmcDZW5nB09tYWNyb24Hb21hY3JvbgZPYnJldmUGb2JyZXZlDU9odW5nYXJ1bWxhdXQNb2h1bmdhcnVtbGF1dAZSYWN1dGUGcmFjdXRlDFJjb21tYWFjY2VudAxyY29tbWFhY2NlbnQGUkNhcm9uBnJDYXJvbgZTYWN1dGUGc2FjdXRlC1NjaXJjdW1mbGV4C3NjaXJjdW1mbGV4DFNjb21tYWFjY2VudAxzY29tbWFhY2NlbnQGU0Nhcm9uBnNDYXJvbgxUY29tbWFhY2NlbnQMdGNvbW1hYWNjZW50BlRjYXJvbgZ0Y2Fyb24EVGJhcgR0YmFyBlV0aWxkZQZ1dGlsZGUHVW1hY3Jvbgd1bWFjcm9uBlVicmV2ZQZ1YnJldmUFVXJpbmcFdXJpbmcNVWh1bmdhcnVtbGF1dA11aHVuZ2FydW1sYXV0B1VvZ29uZWsHdW9nb25lawtXY2lyY3VtZmxleAt3Y2lyY3VtZmxleAtZY2lyY3VtZmxleAt5Y2lyY3VtZmxleAlZRGllcmVzaXMGWmFjdXRlBnphY3V0ZQpaZG90YWNjZW50Cnpkb3RhY2NlbnQFbG9uZ3MHdW5pMDE4Ngd1bmkwMTkwB0FsdEZkZWYHdW5pMDE5Ngd1bmkwMUE5B3VuaTAxQ0QHdW5pMDFDRQd1bmkwMUNGB3VuaTAxRDAHdW5pMDFEMQd1bmkwMUQyB3VuaTAxRDMHdW5pMDFENAd1bmkwMUREB3VuaTAxRTIHdW5pMDFFMwZHY2Fyb24GZ2Nhcm9uB3VuaTAxRTgHdW5pMDFFOQd1bmkwMUYwB3VuaTAxRjQHdW5pMDFGNQd1bmkwMUY4B3VuaTAxRjkKQXJpbmdhY3V0ZQphcmluZ2FjdXRlB0FFYWN1dGUHYWVhY3V0ZQtPc2xhc2hhY3V0ZQtvc2xhc2hhY3V0ZQd1bmkwMjFFB3VuaTAyMUYHdW5pMDIyNgd1bmkwMjI3B3VuaTAyMjgHdW5pMDIyOQd1bmkwMjJFB3VuaTAyMkYHdW5pMDIzMgd1bmkwMjMzB3VuaTAyMzcHdW5pMDI1MAd1bmkwMjUxB3VuaTAyNTIHdW5pMDI1NAd1bmkwMjU4B3VuaTAyNTkHRkwwMjVCaAd1bmkwMjVDB0ZMMDI2OWgHdW5pMDI4MwdGTDAyQzZoBWNlbGxzB0ZMMDJEQ2gFR3JhdmUFQWN1dGUKQ2lyY3VtZmxleAVUaWxkZQZNYWNyb24JT3ZlcnNjb3JlBUJyZXZlB3VuaTAzNzYHdW5pMDM3Nwd1bmkwMzdCB3VuaTAzN0MHdW5pMDM3RAd1bmkwMzdFB3VuaTAzN0YHZ2x5cGg5OANBbm8HZ2x5cGg5OQhnbHlwaDEwMAhnbHlwaDEwMQRjaDExCGdseXBoMTAzCGdseXBoMTA0CGdseXBoMTA3B0ZMMDM5MWgHRkwwMzkyaAdGTDAzOTNoB0ZMMDM5NGgHRkwwMzk1aAdGTDAzOTZoB0ZMMDM5N2gHRkwwMzk4aAdGTDAzOTloB0ZMMDM5QWgHRkwwMzlCaAdGTDAzOUNoB0ZMMDM5RGgHRkwwMzlFaAdGTDAzOUZoB0ZMMDNBMGgHRkwwM0ExaAdGTDAzQTNoB0ZMMDNBNGgHRkwwM0E1aAdGTDAzQTZoB0ZMMDNBN2gHRkwwM0E4aAdGTDAzQTloB0ZMMDNBQWgHRkwwM0FCaAdGTDAzQUNoB0ZMMDNBRGgHRkwwM0FFaAdGTDAzQUZoCGdseXBoMTA2B0ZMMDNCMWgHRkwwM0IyaAdGTDAzQjNoB0ZMMDNCNGgHRkwwM0I1aAdGTDAzQjZoB0ZMMDNCN2gHRkwwM0I4aAdGTDAzQjloB0ZMMDNCQWgHRkwwM0JCaAdGTDAzQkNoB0ZMMDNCRGgHRkwwM0JFaAdGTDAzQkZoB0ZMMDNDMGgHRkwwM0MxaAdGTDAzQzJoB0ZMMDNDM2gHRkwwM0M0aAdGTDAzQzVoB0ZMMDNDNmgHRkwwM0M3aAdGTDAzQzhoB0ZMMDNDOWgHRkwwM0NBaAdGTDAzQ0JoB0ZMMDNDQ2gHRkwwM0NEaAdnbHlwaDk3BHBoaTEGb21lZ2ExB3VuaTAzREMHdW5pMDNERAd1bmkwM0YxB3VuaTAzRjIHdW5pMDNGMwd1bmkwM0Y0B3VuaTAzRjUHdW5pMDNGNgd1bmkwM0Y3B3VuaTAzRjgHdW5pMDNGOQd1bmkwM0ZDB3VuaTAzRkQHdW5pMDNGRQd1bmkwM0ZGB3VuaTA0MDAHRkwwNDAxaAdGTDA0MDJoA2NoNwdGTDA0MDRoB0ZMMDQwNWgHRkwwNDA2aAdGTDA0MDdoB0ZMMDQwOGgHdW5pMDQwQwd1bmkwNDBEB0ZMMDQwRWgJYWZpaTEwMTQ1B0ZMMDQxMGgHRkwwNDExaAdGTDA0MTJoB0ZMMDQxM2gHRkwwNDE0aAdGTDA0MTVoB0ZMMDQxNmgHRkwwNDE3aAdGTDA0MThoB0ZMMDQxOWgHRkwwNDFBaAdGTDA0MUJoB0ZMMDQxQ2gHRkwwNDFEaAdGTDA0MUVoB0ZMMDQxRmgHRkwwNDIwaAdGTDA0MjFoB0ZMMDQyMmgHRkwwNDIzaAdGTDA0MjRoB0ZMMDQyNWgHRkwwNDI2aAdGTDA0MjdoB0ZMMDQyOGgHRkwwNDI5aAdGTDA0MkFoB0ZMMDQyQmgHRkwwNDJDaAdGTDA0MkRoB0ZMMDQyRWgHRkwwNDJGaAdGTDA0MzBoB0ZMMDQzMWgHRkwwNDMyaAdGTDA0MzNoB0ZMMDQzNGgHRkwwNDM1aAdGTDA0MzZoB0ZMMDQzN2gHRkwwNDM4aAdGTDA0MzloB0ZMMDQzQWgHRkwwNDNCaAdGTDA0M0NoB0ZMMDQzRGgHRkwwNDNFaAdGTDA0M0ZoB0ZMMDQ0MGgHRkwwNDQxaAdGTDA0NDJoB0ZMMDQ0M2gHRkwwNDQ0aAdGTDA0NDVoB0ZMMDQ0NmgHRkwwNDQ3aAdGTDA0NDhoB0ZMMDQ0OWgHRkwwNDRBaAdGTDA0NEJoB0ZMMDQ0Q2gHRkwwNDREaAdGTDA0NEVoB0ZMMDQ0RmgHdW5pMDQ1MAdGTDA0NTFoB0ZMMDQ1M2gHRkwwNDU0aAdGTDA0NTVoB0ZMMDQ1NmgHRkwwNDU3aAdGTDA0NThoB0ZMMDQ1RWgHdW5pMTQzNQd1bmkxNDQ4B0ZMMjAxM2gHRkwyMDE0aAlhZmlpMDAyMDgHRkwyMDE2aAdGTDIwMTdoCk9wZW5TaW5nbGULQ2xvc2VTaW5nbGUHRkwyMDFBaAdGTDIwMUJoCk9wZW5Eb3VibGULQ2xvc2VEb3VibGUHRkwyMDFFaAdGTDIwMUZoB0ZMMjAyMGgHRkwyMDIxaAdGTDIwMjJoB0ZMMjAyNmgHRkwyMDMwaAdGTDIwMzloB0ZMMjAzQWgHRkwyMDNDaAdGTDIwM0RoB3VuaTIwM0YHRkwyMDQ0aAdGTDIwNzBoB0ZMMjA3MWgHRkwyMDcyaAdGTDIwNzNoB0ZMMjA3NGgHRkwyMDc1aAdGTDIwNzZoB0ZMMjA3N2gHRkwyMDc4aAdGTDIwNzloB0ZMMjA3QWgHRkwyMDdCaAdGTDIwN0NoB0ZMMjA3RGgHRkwyMDdFaAdGTDIwODBoB0ZMMjA4MWgHRkwyMDgyaAdGTDIwODNoB0ZMMjA4NGgHRkwyMDg1aAdGTDIwODZoB0ZMMjA4N2gHRkwyMDg4aAdGTDIwODloB0ZMMjA4QWgHRkwyMDhCaAdGTDIwOENoB0ZMMjA4RGgHRkwyMDhFaAdGTDIwQTdoBGMxMjgCZFIHRkwyMTIyaARnZXRzBHRha2UEZ290bwRkcm9wB0ZMMjE5NGgHRkwyMTk1aAZtb2RpZnkIZW1wdHlzZXQDRGVsCU5vdE1lbWJlcgZNZW1iZXIHdW5pMjIwRQdQcm9kdWN0B3VuaTIyMTADU3VtB3VuaTIyMTMHdW5pMjIxNAtmcmFjdGlvbmJhcgd1bmkyMjE2DGFzdGVyaXNrbWF0aANKb3QKYnVsbGV0bWF0aAd1bmkyMjFCB3VuaTIyMUMFc3RpbGUIUGFyYWxsZWwHdW5pMjIyNgNBTkQCT1IDQ2FwA0N1cANQYXcHV2l0aG91dAd1bmkyMjNFC0FwcHJveEVxdWFsDk5vdEFwcHJveEVxdWFsB3VuaTIyNEQDTkVRBW1hdGNoBW5hdGNoB3VuaTIyNjMCTEUCR0UHRW5jbG9zZQhEaXNjbG9zZQZTdWJzZXQIU3VwZXJzZXQHdW5pMjI4Rgd1bmkyMjkwB3VuaTIyOTEHdW5pMjI5Mgd1bmkyMjk0BlJvdDFzdAd1bmkyMjk4B3VuaTIyOTkHdW5pMjI5QQd1bmkyMjlCB3VuaTIyOUQFUlRhY2sFTFRhY2sGRW5jb2RlBkRlY29kZQd1bmkyMkI4B3VuaTIyQkIHdW5pMjJCQwd1bmkyMkJEB0ZMMjJDNGgDZG90BFN0YXIERm9yawNNYXgHRkwyMzA5aANNaW4HRkwyMzBCaAV0YWJsZQ9TcGxpdEhvcml6b250YWwHdW5pMjMyQgVJQmVhbQVTcXVhZAZRdWFkRVEGRG9taW5vC1F1YWREaWFtb25kB1F1YWRKb3QKUXVhZENpcmNsZQZSb3RhdGUJQ2lyY2xlSm90CFNsYXNoQmFyCFNsb3BlQmFyCVF1YWRTbGFzaAhTYW5kd2ljaAZRdWFkTFQGUXVhZEdUCExlZnRWYW5lCVJpZ2h0VmFuZQhRdWFkTGVmdAlRdWFkUmlnaHQJVHJhbnNwb3NlDEJhc2VVbmRlcmJhcgdHcmFkZVVwBlF1YWRPUglRdWFkRGVsdGEHRXhlY3V0ZQZVcFZhbmUGUXVhZFVwDUVuY29kZU92ZXJiYXIJR3JhZGVEb3duCVF1YWRDYXJldAdRdWFkRGVsBkZvcm1hdAhEb3duVmFuZQhRdWFkRG93bg1RdW90ZVVuZGVyYmFyDURlbHRhVW5kZXJiYXIPRGlhbW9uZFVuZGVyYmFyC0pvdFVuZGVyYmFyDkNpcmNsZVVuZGVyYmFyBExhbXAJUXVhZFF1b3RlA0xvZwlRdWFkQ29sb24FU25vdXQERnJvZwhTb3VycHVzcwRIb290BkhvbGxlcg1Eb3duc2hvZVN0aWxlDUxlZnRzaG9lU3RpbGUFU21pcmsKR1REaWVyZXNpcwhDb21tYUJhcgRMb2NrBVppbGRlClN0aWxlVGlsZGURU2VtaWNvbG9uVW5kZXJiYXIGUXVhZE5FCVF1YWRRdWVyeQNOT1IETkFORARJb3RhA1Jobw1BbHBoYVVuZGVyYmFyBEZpbmQFSW90YV8NT21lZ2FVbmRlcmJhcgVBbHBoYQRyYW5rBFF1YWQHRkwyNDAwaAdGTDI0QjZoB0ZMMjRCN2gHRkwyNEI4aAdGTDI0QjloB0ZMMjRCQWgHRkwyNEJCaAdGTDI0QkNoB0ZMMjRCRGgHRkwyNEJFaAdGTDI0QkZoB0ZMMjRDMGgHRkwyNEMxaAdGTDI0QzJoB0ZMMjRDM2gHRkwyNEM0aAdGTDI0QzVoB0ZMMjRDNmgHRkwyNEM3aAdGTDI0QzhoB0ZMMjRDOWgHRkwyNENBaAdGTDI0Q0JoB0ZMMjRDQ2gHRkwyNENEaAdGTDI0Q0VoB0ZMMjRDRmgHdW5pMjREMAd1bmkyNEQxB3VuaTI0RDIHdW5pMjREMwd1bmkyNEQ0B3VuaTI0RDUHdW5pMjRENgd1bmkyNEQ3B3VuaTI0RDgHdW5pMjREOQd1bmkyNERBB3VuaTI0REIHdW5pMjREQwd1bmkyNEREB3VuaTI0REUHdW5pMjRERgd1bmkyNEUwB3VuaTI0RTEHdW5pMjRFMgd1bmkyNEUzB3VuaTI0RTQHdW5pMjRFNQd1bmkyNEU2B3VuaTI0RTcHdW5pMjRFOAd1bmkyNEU5BWxkSE9SB3VuaTI1MDEGbGRWRVJUB3VuaTI1MDMEbGRUTAd1bmkyNTBEB3VuaTI1MEUHdW5pMjUwRgRsZFRSB3VuaTI1MTEHdW5pMjUxMgd1bmkyNTEzBWJveExMB3VuaTI1MTUHdW5pMjUxNgd1bmkyNTE3BGxkQlIHdW5pMjUxOQd1bmkyNTFBB3VuaTI1MUIGTERUZWVMB3VuaTI1MUQHdW5pMjUxRQd1bmkyNTFGB3VuaTI1MjAHdW5pMjUyMQd1bmkyNTIyB3VuaTI1MjMGbGRUZWVSB3VuaTI1MjUHdW5pMjUyNgd1bmkyNTI3B3VuaTI1MjgHdW5pMjUyOQd1bmkyNTJBB3VuaTI1MkIGTERUZWVUB3VuaTI1MkQHdW5pMjUyRQd1bmkyNTJGB3VuaTI1MzAHdW5pMjUzMQd1bmkyNTMyB3VuaTI1MzMGbGRUZWVCB3VuaTI1MzUHdW5pMjUzNgd1bmkyNTM3B3VuaTI1MzgHdW5pMjUzOQd1bmkyNTNBB3VuaTI1M0IHbGRDUk9TUwd1bmkyNTNEB3VuaTI1M0UHdW5pMjUzRgd1bmkyNTQwB3VuaTI1NDEHdW5pMjU0Mgd1bmkyNTQzB3VuaTI1NDQHdW5pMjU0NQd1bmkyNTQ2B3VuaTI1NDcHdW5pMjU0OAd1bmkyNTQ5B3VuaTI1NEEHdW5pMjU0QghsZERibEhvcglsZERibFZlcnQHRkwyNTU0aAdGTDI1NTdoB0ZMMjU1QWgHRkwyNTVEaAdGTDI1NUVoB0ZMMjU1RmgHRkwyNTYwaAdGTDI1NjFoB0ZMMjU2MmgHRkwyNTYzaAdGTDI1NjRoB0ZMMjU2NWgHRkwyNTY2aAdGTDI1NjdoB0ZMMjU2OGgHRkwyNTY5aAdGTDI1NkFoB0ZMMjU2QmgHRkwyNTZDaAd1bmkyNTc4B3VuaTI1NzkHdW5pMjU3QQd1bmkyNTdCB3VuaTI1N0MHdW5pMjU3RAd1bmkyNTdFB3VuaTI1N0YHRkwyNTgwaAdGTDI1ODFoB0ZMMjU4MmgHRkwyNTgzaAdGTDI1ODRoB0ZMMjU4NWgHRkwyNTg2aAdGTDI1ODdoBUJsb2NrB0ZMMjU4OWgHRkwyNThBaAdGTDI1OEJoB0ZMMjU4Q2gHRkwyNThEaAdGTDI1OEVoB0ZMMjU4RmgHRkwyNTkwaBBzaGFkZV8yNV9wZXJjZW50EHNoYWRlXzUwX3BlcmNlbnQQc2hhZGVfNzVfcGVyY2VudAdGTDI1OTRoB0ZMMjU5NWgFUXVhZDIHRkwyNUM3aAdEaWFtb25kBkNpcmNsZQd1bmkyNUNFCm9wZW5idWxsZXQHdW5pMjVFRgd1bmkyNUY0B3VuaTI1RjUHdW5pMjVGNgd1bmkyNUY3B0ZMMjY0MGgHRkwyNjQyaAdGTDI2NTRoB0ZMMjY1NWgHRkwyNjU2aAdGTDI2NTdoB0ZMMjY1OGgHRkwyNjU5aAdGTDI2NUFoB0ZMMjY1QmgHRkwyNjVDaAdGTDI2NURoB0ZMMjY1RWgHRkwyNjVGaAVzcGFkZQdGTDI2NjFoB0ZMMjY2MmgEY2x1YgdGTDI2NjRoBWhlYXJ0B2RpYW1vbmQHRkwyNjY3aAd1bmkyNjg3B3VuaTI3REMGZGxicmFrBmRyYnJhawd1bmkyN0U4B3VuaTI3RTkFc2hhcGUHdW5pMjk4Mwd1bmkyOTg0B2RscGFyZW4HZHJwYXJlbgd1bmkyOUY1B3VuaTJCMkIGdTFENTY5BnUxRDU2OAZ1MUQ1M0QGdTFENTNFAmRXAmRYAmRmAmRnAmRTAAAAAAMACAACABAAAf//AAMAAQAAAAwAAAAWAB4AAgABAAED7AABAAQAAAACAAAAAQAAAAEAAAAAAAAAAQAAAADUGVc/AAAAAM2Yn/QAAAAA2yOa8w==");

  // src/sounds/cool.mp3
  var cool_default = __toBinary("SUQzAwAAAAAPdlRJVDIAAAAFAAAAY29vbFRTU0UAAAA5AAAAY29tLmFwcGxlLlZvaWNlTWVtb3MgKGlQaG9uZSBWZXJzaW9uIDE2LjYgKEJ1aWxkIDIwRzc1KSkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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");

  // src/sounds/scream.mp3
  var scream_default = __toBinary("SUQzAwAAAAAPdlRJVDIAAAAMAAAARG9uZ2NoZW5nIDZUU1NFAAAAOQAAAGNvbS5hcHBsZS5Wb2ljZU1lbW9zIChpUGhvbmUgVmVyc2lvbiAxNi42IChCdWlsZCAyMEc3NSkpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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");

  // src/kaboomware.ts
  var GAME_TIME = 4;
  var loadAPIs = [
    "loadSprite",
    "loadSpriteAtlas",
    "loadAseprite",
    "loadPedit",
    "loadBean",
    "loadJSON",
    "loadSound",
    "loadFont",
    "loadBitmapFont",
    "loadShader",
    "loadShaderURL",
    "load",
    "loadProgress"
  ];
  var gameAPIs = [
    "make",
    "pos",
    "scale",
    "rotate",
    "color",
    "opacity",
    "sprite",
    "text",
    "rect",
    "circle",
    "uvquad",
    "area",
    "anchor",
    "z",
    "outline",
    "body",
    "doubleJump",
    "move",
    "offscreen",
    "follow",
    "shader",
    "timer",
    "fixed",
    "stay",
    "health",
    "lifespan",
    "state",
    "fadeIn",
    "play",
    "rand",
    "randi",
    "dt",
    "time",
    "vec2",
    "rgb",
    "hsl2rgb",
    "choose",
    "chance",
    "easings",
    "map",
    "mapc",
    "wave",
    "deg2rad",
    "rad2deg",
    "clamp",
    "mousePos",
    "mouseDeltaPos",
    "addKaboom",
    "camPos",
    "camScale",
    "camRot",
    "center",
    "isFocused",
    "isTouchscreen",
    "LEFT",
    "RIGHT",
    "UP",
    "DOWN"
  ];
  function run(games) {
    const k = ho({
      font: "apl386",
      canvas: document.querySelector("#game"),
      width: 640,
      height: 480
    });
    k.loadFont("apl386", apl386_default, {
      outline: 8,
      filter: "linear"
    });
    k.loadSound("cool", cool_default.buffer);
    k.loadSound("scream", scream_default.buffer);
    function buttonToKey(btn) {
      if (btn === "action")
        return "space";
      return btn;
    }
    __name(buttonToKey, "buttonToKey");
    let curGame = 0;
    const root = k.add();
    function nextGame() {
      curGame = (curGame + 1) % games.length;
      runGame(games[curGame]);
    }
    __name(nextGame, "nextGame");
    function runGame(g) {
      k.camPos(k.center());
      k.camRot(0);
      k.camScale(1, 1);
      root.removeAll();
      const scene = root.add([
        k.timer()
      ]);
      const onEndEvent = new k.Event();
      const onTimeoutEvent = new k.Event();
      let done = false;
      const succeed = /* @__PURE__ */ __name(() => {
        if (done)
          return;
        done = true;
        gameTimer.cancel();
        onTimeoutEvent.clear();
        k.play("cool");
        scene.wait(2, () => {
          nextGame();
          onEndEvent.trigger();
        });
      }, "succeed");
      const fail = /* @__PURE__ */ __name(() => {
        if (done)
          return;
        done = true;
        gameTimer.cancel();
        onTimeoutEvent.clear();
        k.play("scream");
        scene.wait(2, () => {
          nextGame();
          onEndEvent.trigger();
        });
      }, "fail");
      const gameTimer = scene.wait(GAME_TIME, () => {
        onTimeoutEvent.trigger();
        fail();
      });
      const ctx = {};
      for (const api of gameAPIs) {
        ctx[api] = k[api];
      }
      const gameScene = g.onStart({
        ...ctx,
        width: () => k.width(),
        height: () => k.height(),
        onButtonPress: (btn, action) => scene.onKeyPress(buttonToKey(btn), action),
        onButtonRelease: (btn, action) => scene.onKeyRelease(buttonToKey(btn), action),
        onButtonDown: (btn, action) => scene.onKeyDown(buttonToKey(btn), action),
        onTimeout: (action) => onTimeoutEvent.add(action),
        onEnd: (action) => onEndEvent.add(action),
        succeed,
        fail
      });
      scene.add(gameScene);
      const speech = new SpeechSynthesisUtterance(g.prompt);
      speechSynthesis.speak(speech);
      const textMargin = 20;
      scene.add([
        k.pos(textMargin, textMargin),
        k.z(100),
        k.text(g.prompt, {
          size: 40,
          width: k.width() - textMargin * 2,
          lineSpacing: 16,
          transform: (idx, ch) => ({
            pos: k.vec2(0, k.wave(-2, 2, k.time() * 6 + idx * 0.5)),
            scale: k.wave(1, 1.1, k.time() * 6 + idx),
            angle: k.wave(-3, 3, k.time() * 6 + idx)
          })
        })
      ]);
    }
    __name(runGame, "runGame");
    const loadCtx = {};
    for (const api of loadAPIs) {
      loadCtx[api] = k[api];
    }
    for (const g of games) {
      if (g.onLoad) {
        g.onLoad(loadCtx);
      }
    }
    if (games[0]) {
      runGame(games[0]);
    }
  }
  __name(run, "run");

  // examples/main.ts
  run([
    squeeze_default,
    getFish_default
  ]);
})();
