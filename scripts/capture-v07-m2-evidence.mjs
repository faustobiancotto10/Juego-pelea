import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const ORIGIN = 'http://127.0.0.1:4173';
const DEBUG = 'http://127.0.0.1:9222';
const OUT = 'evidence/v07-m2';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(predicate, label, timeoutMs = 15000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
}

function chromePath() {
  const candidates = [
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error(`Chrome unavailable: ${candidates.join(', ')}`);
  return found;
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'evaluate failed');
  }
  return response.result?.value;
}

async function selector(cdp, value, timeout = 10000) {
  const encoded = JSON.stringify(value);
  return waitFor(
    () => evaluate(cdp, `Boolean(document.querySelector(${encoded}))`),
    value,
    timeout,
  );
}

async function click(cdp, value) {
  const encoded = JSON.stringify(value);
  const clicked = await evaluate(cdp, `(() => {
    const el = document.querySelector(${encoded});
    if (!el) return false;
    el.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Could not click ${value}`);
}

async function key(cdp, code, keyValue, down) {
  const virtual = code === 'KeyS' ? 83 : code === 'KeyK' ? 75 : code === 'KeyD' ? 68 : 0;
  await cdp.send('Input.dispatchKeyEvent', {
    type: down ? 'keyDown' : 'keyUp',
    code,
    key: keyValue,
    windowsVirtualKeyCode: virtual,
    nativeVirtualKeyCode: virtual,
  });
}

async function tap(cdp, code, keyValue, holdMs = 45) {
  await key(cdp, code, keyValue, true);
  await sleep(holdMs);
  await key(cdp, code, keyValue, false);
}

async function shot(cdp, name) {
  const capture = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(capture.data, 'base64'));
}

mkdirSync(OUT, { recursive: true });

const chrome = spawn(chromePath(), [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  '--remote-debugging-port=9222',
  '--window-size=844,390',
  '--force-device-scale-factor=1',
  '--no-first-run',
  `${ORIGIN}/`,
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeLog = '';
chrome.stderr.on('data', (chunk) => { chromeLog += String(chunk); });

try {
  const target = await waitFor(async () => {
    const response = await fetch(`${DEBUG}/json`);
    if (!response.ok) return null;
    const pages = await response.json();
    return pages.find((page) => page.type === 'page' && page.webSocketDebuggerUrl) ?? null;
  }, 'Chrome target');

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  const cdp = new Cdp(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 844,
    height: 390,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 844,
    screenHeight: 390,
  });

  await selector(cdp, '#app');

  // Portrait source surface: real PortraitRenderer at phone landscape size.
  const portraitOk = await evaluate(cdp, `(async () => {
    const portraits = await import('/game/render/PortraitRenderer.js');
    const app = document.querySelector('#app');
    if (!app) return false;
    document.body.style.margin = '0';
    document.body.style.background = '#07090e';
    app.innerHTML = '<main id="portrait-proof" style="height:390px;box-sizing:border-box;padding:18px;background:linear-gradient(135deg,#080b10,#161d28);color:white;font:700 13px system-ui"><div style="font-size:14px;letter-spacing:.12em;margin-bottom:12px">V0.7 · PROCEDURAL PORTRAITS</div><div id="portrait-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"></div></main>';
    const grid = document.querySelector('#portrait-grid');
    for (const key of portraits.PORTRAIT_KEYS) {
      const card = document.createElement('section');
      card.style.cssText = 'background:#111721;border:1px solid #324158;border-radius:10px;padding:8px;text-align:center;overflow:hidden';
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 168;
      canvas.style.cssText = 'width:100%;height:270px;max-height:270px;object-fit:contain';
      card.appendChild(canvas);
      const label = document.createElement('div');
      label.textContent = key.toUpperCase();
      label.style.cssText = 'margin-top:5px;letter-spacing:.08em';
      card.appendChild(label);
      grid.appendChild(card);
      const ctx = canvas.getContext('2d');
      if (!ctx || !portraits.drawFighterPortrait(ctx, key, canvas.width, canvas.height)) return false;
    }
    return true;
  })()`);
  if (!portraitOk) throw new Error('Portrait proof render failed');
  await shot(cdp, 'four-procedural-portraits-phone');

  // Reload the real application and navigate to El Toro fight.
  await cdp.send('Page.navigate', { url: `${ORIGIN}/` });
  await selector(cdp, '[data-game-phase="title"]');
  await click(cdp, '[data-start]');
  await selector(cdp, '[data-game-phase="select-player"]');
  await click(cdp, '[data-fighter="el-toro"]');
  await click(cdp, '[data-fighter-confirm]');
  await selector(cdp, '[data-game-phase="select-cpu"]');
  await click(cdp, '[data-fighter="juanchi"]');
  await click(cdp, '[data-fighter-confirm]');
  await selector(cdp, '[data-game-phase="select-stage"]');
  await click(cdp, '[data-stage="cancha-56"]');
  await click(cdp, '[data-stage-confirm]');
  await selector(cdp, '[data-game-phase="fight"]', 12000);
  await sleep(350);

  // Topete is the close Special: down + SPECIAL. Capture during committed drive.
  await key(cdp, 'KeyS', 's', true);
  await tap(cdp, 'KeyK', 'k', 40);
  await key(cdp, 'KeyS', 's', false);
  await sleep(205);
  await shot(cdp, 'el-toro-topete-phone');
  await sleep(650);

  // Neutral SPECIAL launches Shawarmazo. Capture after authored spawn frame.
  await tap(cdp, 'KeyK', 'k', 40);
  await sleep(270);
  await shot(cdp, 'el-toro-shawarmazo-phone');
  await sleep(300);

  // Authoritative presentation snapshot through the real FightRenderer for Super Eructo.
  const ultimateOk = await evaluate(cdp, `(async () => {
    const [{ CombatSimulation }, { FightRenderer }, stageRegistry] = await Promise.all([
      import('/game/simulation/CombatSimulation.js'),
      import('/game/render/FightRenderer.js'),
      import('/game/render/StageRegistry.js'),
    ]);
    const canvas = document.querySelector('[data-fight-canvas]');
    if (!canvas) return false;
    const sim = new CombatSimulation('el-toro', 'juanchi', { skipIntro: true });
    const base = sim.getSnapshot();
    const toro = {
      ...base.fighters[0],
      x: 410,
      facing: 1,
      grounded: true,
      y: 0,
      vx: 0,
      vy: 0,
      moveId: 'superEructo',
      moveFrame: 36,
      ultimatePhase: 'sequence',
      ultimatePhaseFrame: 9,
      ultimateConnected: true,
      ultimateTarget: null,
      ultimateEffectiveTick: base.combatTick,
      capturedBy: null,
      blocking: false,
      crouching: false,
      stunFrames: 0,
      blockstunFrames: 0,
      guardBreakFrames: 0,
      clashRecoveryFrames: 0,
    };
    const target = {
      ...base.fighters[1],
      x: 780,
      facing: -1,
      capturedBy: null,
      stunFrames: 0,
      blockstunFrames: 0,
      guardBreakFrames: 0,
    };
    const snapshot = {
      ...base,
      frame: 120,
      combatTick: 120,
      phase: 'fight',
      fighters: [toro, target],
      events: [],
      projectiles: [],
      clash: null,
    };
    const renderer = new FightRenderer(canvas, stageRegistry.DEFAULT_STAGE_REGISTRY.get('cancha-56'));
    renderer.render(snapshot, 2);
    return true;
  })()`);
  if (!ultimateOk) throw new Error('Super Eructo presentation proof failed');
  await shot(cdp, 'el-toro-super-eructo-phone');

  console.log('Captured V07-M2 phone evidence.');
  socket.close();
} catch (error) {
  console.error(chromeLog.slice(-3500));
  throw error;
} finally {
  chrome.kill('SIGTERM');
}
