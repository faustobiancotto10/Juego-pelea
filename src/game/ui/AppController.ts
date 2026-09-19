import { FIGHTERS } from '../data/fighters.js';
import { GameInput } from '../input/GameInput.js';
import { FightRenderer } from '../render/FightRenderer.js';
import { CombatSimulation } from '../simulation/CombatSimulation.js';
import { CpuController } from '../simulation/CpuController.js';
import type { FighterId, FighterIndex, MatchSnapshot } from '../types.js';
import { backToSelect, chooseFighter, finishFight, initialFlowState, rematch, startFight, type GameFlowState } from './flow.js';

const FIXED_MS = 1000 / 60;
const FIGHTER_ORDER: readonly FighterId[] = ['chameleon', 'supernariz'];

const fighterCopy: Record<FighterId, { kicker: string; role: string; moves: string; mark: string }> = {
  chameleon: {
    kicker: 'CONTROL DE DISTANCIA',
    role: 'Zoner',
    moves: 'Lengua recta · Lengua baja · Garras',
    mark: 'C',
  },
  supernariz: {
    kicker: 'PRESIÓN Y COMBOS',
    role: 'Rushdown',
    moves: 'Combo de nariz · Chorizo · Tramontana',
    mark: 'N',
  },
};

export class AppController {
  private flow: GameFlowState = initialFlowState();
  private raf = 0;
  private vsTimer = 0;
  private input: GameInput | null = null;
  private matchFinished = false;
  private autoplayPlayer = false;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') {
      this.flow = { phase: 'vs', player: 'chameleon', cpu: 'supernariz', winner: null };
      this.autoplayPlayer = true;
      this.showVs(250);
      return;
    }
    this.showCharacterSelect();
  }

  private showCharacterSelect(): void {
    this.cleanupFight();
    const selectingCpu = this.flow.phase === 'select-cpu';
    const title = selectingCpu ? 'ELEGÍ AL RIVAL' : 'ELEGÍ TU LUCHADOR';
    const subtitle = selectingCpu
      ? `Vas con ${this.flow.player ? FIGHTERS[this.flow.player].displayName : ''}. Ahora elegí la CPU.`
      : 'Dos estilos opuestos. El mismo lenguaje de controles.';

    this.root.innerHTML = `
      <main class="select-screen">
        <div class="select-backdrop"></div>
        <header class="select-header">
          <span class="game-badge">FIRST PLAYABLE · V0.1</span>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </header>
        <section class="fighter-grid" aria-label="Selección de luchador">
          ${FIGHTER_ORDER.map((id) => this.fighterCard(id, selectingCpu)).join('')}
        </section>
        <footer class="select-footer">
          ${selectingCpu ? '<button class="text-button" data-back>← Cambiar mi luchador</button>' : '<span>Touch: D-pad + Ataque + Especial + Salto</span>'}
          <span>Bloqueo: mantener atrás</span>
        </footer>
      </main>
      ${this.orientationPrompt()}
    `;

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-fighter]')) {
      button.addEventListener('click', () => {
        const id = button.dataset.fighter as FighterId;
        this.flow = chooseFighter(this.flow, id);
        if (this.flow.phase === 'select-cpu') this.showCharacterSelect();
        else if (this.flow.phase === 'vs') this.showVs();
      });
    }
    this.root.querySelector<HTMLButtonElement>('[data-back]')?.addEventListener('click', () => {
      this.flow = backToSelect(this.flow);
      this.showCharacterSelect();
    });
  }

  private fighterCard(id: FighterId, cpuSelection: boolean): string {
    const info = fighterCopy[id];
    const selected = this.flow.player === id;
    return `
      <button class="fighter-card fighter-card--${id}${selected ? ' is-player' : ''}" data-fighter="${id}" type="button">
        <span class="fighter-kicker">${info.kicker}</span>
        <span class="fighter-portrait fighter-portrait--${id}" aria-hidden="true">
          <span class="portrait-mark">${info.mark}</span>
          <span class="portrait-detail"></span>
        </span>
        <span class="fighter-name">${FIGHTERS[id].displayName}</span>
        <span class="fighter-role">${info.role}</span>
        <span class="fighter-moves">${info.moves}</span>
        <span class="fighter-pick">${cpuSelection ? 'ELEGIR COMO RIVAL' : 'ELEGIR'}</span>
      </button>
    `;
  }

  private showVs(delay = 900): void {
    if (!this.flow.player || !this.flow.cpu) return;
    const p1 = this.flow.player;
    const p2 = this.flow.cpu;
    this.root.innerHTML = `
      <main class="vs-screen">
        <div class="vs-side vs-side--left fighter-card--${p1}">
          <span class="vs-label">JUGADOR</span><strong>${FIGHTERS[p1].displayName}</strong><span>${fighterCopy[p1].role}</span>
        </div>
        <div class="vs-mark">VS</div>
        <div class="vs-side vs-side--right fighter-card--${p2}">
          <span class="vs-label">CPU</span><strong>${FIGHTERS[p2].displayName}</strong><span>${fighterCopy[p2].role}</span>
        </div>
      </main>
      ${this.orientationPrompt()}
    `;
    clearTimeout(this.vsTimer);
    this.vsTimer = window.setTimeout(() => {
      this.flow = startFight(this.flow);
      this.mountFight();
    }, delay);
  }

  private mountFight(): void {
    if (this.flow.phase !== 'fight' || !this.flow.player || !this.flow.cpu) return;
    this.matchFinished = false;
    this.root.innerHTML = `
      <main class="fight-shell" data-game-phase="fight">
        <canvas class="fight-canvas" data-fight-canvas aria-label="Arena de combate"></canvas>
        <div class="hud" aria-live="polite">
          ${this.hudFighter(0, this.flow.player)}
          <div class="hud-center"><span class="round-label" data-round>R1</span><strong class="timer" data-timer>60</strong></div>
          ${this.hudFighter(1, this.flow.cpu)}
        </div>
        <div class="touch-layer" data-touch-controls>
          <div class="dpad" data-dpad aria-label="D-pad de 8 direcciones">
            <span class="dpad-cross dpad-cross--h"></span><span class="dpad-cross dpad-cross--v"></span><span class="dpad-center"></span>
          </div>
          <div class="action-cluster">
            <button class="action-button action-button--jump" data-action="jump" type="button"><span>JUMP</span></button>
            <button class="action-button action-button--special" data-action="special" type="button"><span>SPECIAL</span></button>
            <button class="action-button action-button--attack" data-action="attack" type="button"><span>ATTACK</span></button>
          </div>
        </div>
        <div class="desktop-hint">A/D mover · S agachar · W/Space salto · J ataque · K especial</div>
      </main>
      ${this.orientationPrompt()}
    `;

    const canvas = this.root.querySelector<HTMLCanvasElement>('[data-fight-canvas]');
    const touchRoot = this.root.querySelector<HTMLElement>('[data-touch-controls]');
    if (!canvas || !touchRoot) throw new Error('Fight UI failed to mount');

    const simulation = new CombatSimulation(this.flow.player, this.flow.cpu);
    const renderer = new FightRenderer(canvas);
    const cpu = new CpuController(1);
    const playerCpu = this.autoplayPlayer ? new CpuController(0) : null;
    this.input = new GameInput(touchRoot);

    let previous = performance.now();
    let accumulator = 0;
    let snapshot = simulation.getSnapshot();
    renderer.consumeEvents(snapshot);

    const frame = (now: number) => {
      const elapsed = Math.min(100, now - previous);
      previous = now;
      accumulator += elapsed;
      while (accumulator >= FIXED_MS) {
        const humanInput = playerCpu ? playerCpu.nextInput(snapshot) : this.input?.getFrame() ?? { left: false, right: false, down: false, up: false, jump: false, attack: false, special: false };
        const cpuInput = cpu.nextInput(snapshot);
        snapshot = simulation.step(humanInput, cpuInput);
        renderer.consumeEvents(snapshot);
        accumulator -= FIXED_MS;
        this.updateHud(snapshot);
      }
      renderer.render(snapshot, now / 1000);
      if (snapshot.phase === 'match-over' && snapshot.winner !== null) {
        if (!this.matchFinished) {
          this.matchFinished = true;
          const winner = snapshot.winner;
          window.setTimeout(() => this.showResult(winner), 650);
        }
        return;
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  private hudFighter(index: FighterIndex, id: FighterId): string {
    return `
      <section class="hud-fighter hud-fighter--${index === 0 ? 'left' : 'right'}">
        <div class="hud-meta"><strong>${FIGHTERS[id].displayName}</strong><span>${index === 0 ? 'P1' : 'CPU'}</span></div>
        <div class="health-track"><span class="health-fill" data-health="${index}"></span></div>
        <div class="round-pips"><i data-win="${index}-0"></i><i data-win="${index}-1"></i></div>
      </section>
    `;
  }

  private updateHud(snapshot: MatchSnapshot): void {
    for (const index of [0, 1] as const) {
      const fighter = snapshot.fighters[index];
      const health = this.root.querySelector<HTMLElement>(`[data-health="${index}"]`);
      if (health) health.style.transform = `scaleX(${Math.max(0, fighter.health / fighter.maxHealth)})`;
      for (let pip = 0; pip < 2; pip += 1) {
        this.root.querySelector<HTMLElement>(`[data-win="${index}-${pip}"]`)?.classList.toggle('is-won', pip < fighter.roundWins);
      }
    }
    const timer = this.root.querySelector<HTMLElement>('[data-timer]');
    if (timer) timer.textContent = String(Math.ceil(snapshot.roundTimerFrames / 60));
    const round = this.root.querySelector<HTMLElement>('[data-round]');
    if (round) round.textContent = `R${snapshot.round}`;
    const shell = this.root.querySelector<HTMLElement>('[data-game-phase]');
    if (shell) shell.dataset.gamePhase = snapshot.phase;
  }

  private showResult(winner: FighterIndex): void {
    if (this.flow.phase !== 'fight' || !this.flow.player || !this.flow.cpu) return;
    const playerId = this.flow.player;
    const cpuId = this.flow.cpu;
    this.cleanupFight();
    this.flow = finishFight(this.flow, winner);
    const playerWon = winner === 0;
    const winnerId: FighterId = playerWon ? playerId : cpuId;
    this.root.innerHTML = `
      <main class="result-screen fighter-card--${winnerId}">
        <span class="result-kicker">RESULTADO</span>
        <h1>${playerWon ? 'VICTORIA' : 'DERROTA'}</h1>
        <p><strong>${FIGHTERS[winnerId].displayName}</strong> gana el duelo.</p>
        <div class="result-actions">
          <button class="primary-button" data-rematch>REVANCHA</button>
          <button class="secondary-button" data-select>SELECCIÓN</button>
        </div>
      </main>
      ${this.orientationPrompt()}
    `;
    this.root.querySelector<HTMLButtonElement>('[data-rematch]')?.addEventListener('click', () => {
      this.flow = rematch(this.flow);
      this.showVs(500);
    });
    this.root.querySelector<HTMLButtonElement>('[data-select]')?.addEventListener('click', () => {
      this.flow = backToSelect(this.flow);
      this.autoplayPlayer = false;
      this.showCharacterSelect();
    });
  }

  private cleanupFight(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    clearTimeout(this.vsTimer);
    this.input?.destroy();
    this.input = null;
  }

  private orientationPrompt(): string {
    return '<aside class="orientation-prompt"><div class="phone-icon">↻</div><strong>GIRÁ EL TELÉFONO</strong><span>Este prototipo se juega en horizontal.</span></aside>';
  }
}
