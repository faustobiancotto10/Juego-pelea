import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const ORIGIN = 'http://127.0.0.1:4173';
const DEBUG = 'http://127.0.0.1:9222';
const OUT = 'evidence/v07-m1';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`Chrome/Chromium not found; checked: ${candidates.join(', ')}`);
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
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed');
  }
  return result.result?.value;
}

async function click(cdp, selector) {
  const selectorJson = JSON.stringify(selector);
  const clicked = await evaluate(
    cdp,
    `(() => {
      const el = document.querySelector(${selectorJson});
      if (!el) return false;
      el.click();
      return true;
    })()`,
  );
  if (!clicked) throw new Error(`Could not click ${selector}`);
}

async function waitForSelector(cdp, selector, timeoutMs = 10000) {
  const selectorJson = JSON.stringify(selector);
  return waitFor(
    () => evaluate(cdp, `Boolean(document.querySelector(${selectorJson}))`),
    selector,
    timeoutMs,
  );
}

async function key(cdp, code, keyValue, down) {
  const type = down ? 'keyDown' : 'keyUp';
  const virtualKey = code === 'KeyD' ? 68 : code === 'KeyA' ? 65 : code === 'KeyL' ? 76 : 0;
  await cdp.send('Input.dispatchKeyEvent', {
    type,
    code,
    key: keyValue,
    windowsVirtualKeyCode: virtualKey,
    nativeVirtualKeyCode: virtualKey,
  });
}

async function screenshot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(result.data, 'base64'));
}

mkdirSync(OUT, { recursive: true });

const chromePath = findChrome();
const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--hide-scrollbars',
  '--remote-debugging-port=9222',
  '--window-size=844,390',
  '--force-device-scale-factor=1',
  '--no-first-run',
  '--no-default-browser-check',
  `${ORIGIN}/`,
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeErrors = '';
chrome.stderr.on('data', (chunk) => {
  chromeErrors += String(chunk);
});

try {
  const targets = await waitFor(async () => {
    const response = await fetch(`${DEBUG}/json`);
    if (!response.ok) return null;
    const pages = await response.json();
    return pages.find((page) => page.type === 'page' && page.webSocketDebuggerUrl) ?? null;
  }, 'Chrome DevTools target');

  const socket = new WebSocket(targets.webSocketDebuggerUrl);
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

  await waitForSelector(cdp, '[data-game-phase="title"]');

  await click(cdp, '[data-start]');
  await waitForSelector(cdp, '[data-game-phase="select-player"]');
  await click(cdp, '[data-fighter="juanchi"]');
  await click(cdp, '[data-fighter-confirm]');

  await waitForSelector(cdp, '[data-game-phase="select-cpu"]');
  await click(cdp, '[data-fighter="supernariz"]');
  await click(cdp, '[data-fighter-confirm]');

  await waitForSelector(cdp, '[data-game-phase="select-stage"]');
  await click(cdp, '[data-stage="cancha-56"]');
  await click(cdp, '[data-stage-confirm]');

  await waitForSelector(cdp, '[data-game-phase="fight"]', 12000);
  await sleep(350);

  // Real runtime locomotion at a phone-landscape viewport.
  await key(cdp, 'KeyD', 'd', true);
  await sleep(430);
  await screenshot(cdp, 'juanchi-forward-walk-phone');
  await key(cdp, 'KeyD', 'd', false);
  await sleep(180);

  await key(cdp, 'KeyA', 'a', true);
  await sleep(430);
  await screenshot(cdp, 'juanchi-backwalk-phone');
  await key(cdp, 'KeyA', 'a', false);
  await sleep(180);

  // Render the real procedural rig in an authored Ultimate snapshot. This is
  // evidence-only: no simulation state or runtime product code is modified.
  const staged = await evaluate(cdp, `(async () => {
    const [{ CombatSimulation }, fighterRenderer, stageRenderer, stageRegistry, drawUtils] = await Promise.all([
      import('/game/simulation/CombatSimulation.js'),
      import('/game/render/FighterRenderer.js'),
      import('/game/render/StageRenderer.js'),
      import('/game/render/StageRegistry.js'),
      import('/game/render/drawUtils.js'),
    ]);
    const canvas = document.querySelector('[data-fight-canvas]');
    if (!canvas) return false;
    const sim = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true });
    const snapshot = sim.getSnapshot();
    const base = snapshot.fighters[0];
    const fighter = {
      ...base,
      id: 'juanchi',
      x: 640,
      y: 0,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      moveId: 'policeCapRage',
      moveFrame: 24,
      ultimatePhase: 'sequence',
      ultimatePhaseFrame: 10,
      ultimateConnected: true,
      ultimateTarget: 1,
      capturedBy: null,
      stunFrames: 0,
      blockstunFrames: 0,
      guardBreakFrames: 0,
      blocking: false,
      crouching: false,
      dashKind: null,
      clashRecoveryFrames: 0,
    };

    for (const selector of ['.hud', '.touch-layer', '.desktop-hint', '.fight-controls-button', '.combat-hint', '.super-hint']) {
      const node = document.querySelector(selector);
      if (node) node.style.display = 'none';
    }

    const ctx = canvas.getContext('2d');
    const cssW = 844;
    const cssH = 390;
    canvas.width = cssW;
    canvas.height = cssH;
    const scale = Math.min(cssW / drawUtils.WORLD_WIDTH, cssH / drawUtils.WORLD_HEIGHT);
    const offsetX = (cssW - drawUtils.WORLD_WIDTH * scale) * 0.5;
    const offsetY = (cssH - drawUtils.WORLD_HEIGHT * scale) * 0.5;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    stageRenderer.drawStage(ctx, 10 / 60, stageRegistry.DEFAULT_STAGE_REGISTRY.get('cancha-56'), {
      reaction: 0,
      clashDarkening: 0,
    });
    fighterRenderer.resetFighterPresentation();
    fighterRenderer.drawFighter(ctx, fighter, 0, 10, 10, 10 / 60);
    return true;
  })()`);
  if (!staged) throw new Error('Could not stage Juanchi Ultimate evidence frame');
  await screenshot(cdp, 'juanchi-red-rage-aura-phone');

  socket.close();
  console.log('Captured V07-M1 phone evidence:', [
    'juanchi-forward-walk-phone.png',
    'juanchi-backwalk-phone.png',
    'juanchi-red-rage-aura-phone.png',
  ].join(', '));
} catch (error) {
  console.error(chromeErrors.slice(-4000));
  throw error;
} finally {
  chrome.kill('SIGTERM');
}
