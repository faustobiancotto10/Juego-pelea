import { DEFAULT_COMBAT_REGISTRY } from '../data/combatRegistry.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../data/presentationRegistry.js';
import { GameInput } from '../input/GameInput.js';
import { FightRenderer } from '../render/FightRenderer.js';
import { DEFAULT_STAGE_REGISTRY } from '../render/StageRegistry.js';
import { CombatSimulation } from '../simulation/CombatSimulation.js';
import { CpuController } from '../simulation/CpuController.js';
import { EMPTY_INPUT, type FighterId, type FighterIndex, type MatchSnapshot } from '../types.js';
import {
  DEFAULT_STAGE,
  backFlow,
  beginSelection,
  changeFighters,
  changeStage,
  chooseCpuDifficulty,
  chooseFighter,
  chooseStage,
  finishFight,
  initialFlowState,
  rematch,
  rosterDensity,
  startFight,
  type GameFlowState,
  type StageSelectionId,
} from './flow.js';

const FIXED_MS = 1000 / 60;
const FIGHTER_ORDER: readonly FighterId[] = DEFAULT_COMBAT_REGISTRY.playableIds;

interface StageSelectOption {
  id: StageSelectionId;
  label: string;
  kicker: string;
  description: string;
  accent: string;
}

const STAGE_OPTIONS: readonly StageSelectOption[] = Object.freeze([
  {
    id: 'tramontana-dusk',
    label: 'Tramontana',
    kicker: 'ATELIER AL ATARDECER',
    description: 'El escenario clásico: siluetas claras y cielo cálido.',
    accent: '#d39a52',
  },
  {
    id: 'cancha-56',
    label: 'Cancha 56',
    kicker: 'RUGBY · NOCHE · LA 56',
    description: 'Cancha nocturna, reflectores y gente alrededor del campo.',
    accent: '#6ba0d7',
  },
]);

function fighterDefinition(id: FighterId) {
  return DEFAULT_COMBAT_REGISTRY.getFighter(id);
}

function fighterPresentation(id: FighterId) {
  return DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation(id);
}

function playableFighterId(value: string | undefined): FighterId | null {
  if (!value) return null;
  return DEFAULT_COMBAT_REGISTRY.playableIds.includes(value) ? value : null;
}

function stageId(value: string | undefined): StageSelectionId | null {
  if (!value) return null;
  return STAGE_OPTIONS.some((stage) => stage.id === value) ? value as StageSelectionId : null;
}

function stageDefinition(id: StageSelectionId): StageSelectOption {
  const stage = STAGE_OPTIONS.find((entry) => entry.id === id);
  if (!stage) throw new Error(`Unknown stage ${id}`);
  return stage;
}

function stageLabel(id: StageSelectionId): string {
  return stageDefinition(id).label;
}

function defaultFighter(): FighterId {
  const first = FIGHTER_ORDER[0];
  if (!first) throw new Error('Released roster cannot be empty');
  return first;
}

function rangedStateLabel(snapshot: MatchSnapshot['fighters'][number]): string {
  if (snapshot.rangedAvailability === 'ready') return 'LISTA';
  if (snapshot.rangedAvailability === 'inFlight') return 'EN VUELO';
  const remaining = Math.max(0, snapshot.rangedRecoveryFrames || snapshot.projectileCooldown);
  return remaining > 0 ? `REARME ${remaining}` : 'REARME';
}

export class AppController {
  private flow: GameFlowState = initialFlowState();
  private raf = 0;
  private vsTimer = 0;
  private input: GameInput | null = null;
  private matchFinished = false;
  private autoplayPlayer = false;
  private paused = false;
  private hasShownCombatHint = false;
  private hintTimer = 0;
  private hasShownSuperReadyHint = false;
  private superHintTimer = 0;
  private pendingFighter: FighterId | null = null;
  private pendingStage: StageSelectionId = DEFAULT_STAGE;

  constructor(private readonly root: HTMLElement) {}

  start(): void {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') {
      this.flow = {
        phase: 'vs',
        player: 'chameleon',
        cpu: 'supernariz',
        stage: DEFAULT_STAGE,
        winner: null,
        cpuDifficulty: 'normal',
      };
      this.autoplayPlayer = true;
      this.showVs(250);
      return;
    }
    this.showTitle();
  }

  private showTitle(): void {
    this.cleanupFight();
    this.root.innerHTML = `
      <main class="cover-screen" data-game-phase="title">
        <div class="cover-grid" aria-hidden="true"></div>
        <div class="cover-duel" aria-hidden="true">
          <span class="cover-sigil cover-sigil--left">C</span>
          <span class="cover-slash">×</span>
          <span class="cover-sigil cover-sigil--right">J</span>
        </div>
        <section class="cover-copy">
          <span class="cover-kicker">V0.7 · CUATRO LUCHADORES · DOS ESCENARIOS</span>
          <h1><span>JUEGO</span><strong>PELEA</strong></h1>
          <p>Elegí luchador, rival y escenario. Después resolvelo en la cancha.</p>
          <div class="cover-actions">
            <button class="cover-start primary-button" data-start data-primary type="button">COMENZAR</button>
            <button class="cover-controls secondary-button" data-controls-button type="button">CONTROLES</button>
          </div>
        </section>
        <div class="cover-footer"><span>Touch + teclado</span><span>Mobile landscape</span></div>
      </main>
      ${this.controlsPanel()}
      ${this.orientationPrompt()}
    `;

    this.root.querySelector<HTMLButtonElement>('[data-start]')?.addEventListener('click', () => {
      this.flow = beginSelection(this.flow);
      this.pendingFighter = this.flow.player ?? defaultFighter();
      this.showRosterSelect();
    });
    this.bindControlsPanel(false);
    this.root.onkeydown = null;
    this.root.querySelector<HTMLButtonElement>('[data-primary]')?.focus();
  }

  private showRosterSelect(): void {
    this.cleanupFight();
    const selectingCpu = this.flow.phase === 'select-cpu';
    if (this.flow.phase !== 'select-player' && !selectingCpu) return;

    const current = this.pendingFighter
      ?? (selectingCpu ? this.flow.cpu : this.flow.player)
      ?? defaultFighter();
    this.pendingFighter = playableFighterId(current) ?? defaultFighter();

    const title = selectingCpu ? 'ELEGÍ AL RIVAL' : 'ELEGÍ TU LUCHADOR';
    const owner = selectingCpu ? 'CPU' : 'JUGADOR';
    const density = rosterDensity(FIGHTER_ORDER.length);
    const selectedId = this.pendingFighter;
    const selected = fighterDefinition(selectedId);
    const selectedPresentation = fighterPresentation(selectedId).select;
    const difficulty = this.flow.cpuDifficulty;

    this.root.innerHTML = `
      <main class="roster-screen" data-game-phase="${selectingCpu ? 'select-cpu' : 'select-player'}">
        <header class="fight-menu-header">
          <button class="menu-back" data-back type="button" aria-label="Volver">←</button>
          <div><span>${owner}</span><h1>${title}</h1></div>
          <span class="step-chip">${selectingCpu ? '02' : '01'} / 03</span>
        </header>
        <section class="roster-layout">
          <div class="roster-grid roster-grid--${density}" aria-label="${title}">
            ${FIGHTER_ORDER.map((id) => this.fighterTile(id, id === selectedId)).join('')}
          </div>
          <aside class="fighter-info" style="--fighter-accent:${fighterPresentation(selectedId).accent}">
            <span class="fighter-info-kicker">${selectedPresentation.kicker}</span>
            ${this.fighterPortrait(selectedId, 'fighter-info-portrait')}
            <div class="fighter-info-mark fighter-info-mark--accent" aria-hidden="true">${selectedPresentation.mark}</div>
            <h2>${selected.displayName}</h2>
            <strong>${selectedPresentation.role}</strong>
            <p>${selectedPresentation.moves}</p>
            ${selectingCpu ? this.difficultySelector(difficulty) : ''}
            <div class="fighter-info-actions">
              <button class="primary-button" data-fighter-confirm data-primary type="button">
                ${selectingCpu ? 'CONFIRMAR RIVAL' : 'CONFIRMAR LUCHADOR'}
              </button>
              <button class="text-button controls-link" data-controls-button type="button">? CONTROLES</button>
            </div>
          </aside>
        </section>
        <footer class="fight-menu-footer">
          <span>Mirror match permitido</span>
          <span>Seleccioná → confirmá</span>
        </footer>
      </main>
      ${this.controlsPanel()}
      ${this.orientationPrompt()}
    `;

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-fighter]')) {
      button.addEventListener('click', () => {
        const id = playableFighterId(button.dataset.fighter);
        if (!id) throw new Error(`Unknown playable fighter ${String(button.dataset.fighter)}`);
        this.pendingFighter = id;
        this.showRosterSelect();
      });
    }

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-difficulty]')) {
      button.addEventListener('click', () => {
        const difficulty = button.dataset.difficulty;
        if (difficulty !== 'easy' && difficulty !== 'normal' && difficulty !== 'hard') return;
        this.flow = chooseCpuDifficulty(this.flow, difficulty);
        this.showRosterSelect();
      });
    }

    this.root.querySelector<HTMLButtonElement>('[data-fighter-confirm]')?.addEventListener('click', () => {
      if (!this.pendingFighter) return;
      this.flow = chooseFighter(this.flow, this.pendingFighter);
      this.pendingFighter = null;
      if (this.flow.phase === 'select-cpu') {
        this.pendingFighter = this.flow.cpu ?? defaultFighter();
        this.showRosterSelect();
      } else if (this.flow.phase === 'select-stage') {
        this.pendingStage = this.flow.stage;
        this.showStageSelect();
      }
    });

    this.root.querySelector<HTMLButtonElement>('[data-back]')?.addEventListener('click', () => {
      this.flow = backFlow(this.flow);
      this.routeFlow();
    });

    this.bindScreenBack();
    this.bindControlsPanel(false);
    this.root.querySelector<HTMLButtonElement>('[data-fighter].is-selected')?.focus();
  }

  private fighterTile(id: FighterId, selected: boolean): string {
    const info = fighterPresentation(id);
    return `
      <button
        class="roster-tile fighter-card--${id}${selected ? ' is-selected' : ''}"
        data-fighter="${id}"
        type="button"
        aria-pressed="${selected ? 'true' : 'false'}"
        style="--fighter-accent:${info.accent}"
      >
        <span class="roster-tile-kicker">${info.select.kicker}</span>
        ${this.fighterPortrait(id, 'roster-tile-portrait')}
        <span class="roster-tile-mark roster-tile-mark--accent" aria-hidden="true">${info.select.mark}</span>
        <strong>${fighterDefinition(id).displayName}</strong>
        <span>${info.select.role}</span>
      </button>
    `;
  }

  private fighterPortrait(id: FighterId, extraClass: string): string {
    const portraitKey = fighterPresentation(id).portraitKey;
    return `<span class="fighter-portrait-v07 ${extraClass}" data-portrait-key="${portraitKey}" aria-hidden="true"><i class="portrait-body"></i><i class="portrait-head"></i><i class="portrait-detail"></i></span>`;
  }

  private difficultySelector(selected: 'easy' | 'normal' | 'hard'): string {
    const options = [['easy', 'FÁCIL'], ['normal', 'NORMAL'], ['hard', 'DIFÍCIL']] as const;
    return `<fieldset class="difficulty-selector" aria-label="Dificultad CPU"><legend>DIFICULTAD CPU</legend><div>${options.map(([value, label]) => `<button type="button" data-difficulty="${value}" class="${value === selected ? 'is-selected' : ''}" aria-pressed="${value === selected}">${label}</button>`).join('')}</div></fieldset>`;
  }

  private showStageSelect(): void {
    this.cleanupFight();
    if (this.flow.phase !== 'select-stage' || !this.flow.player || !this.flow.cpu) return;
    this.pendingStage = this.pendingStage ?? this.flow.stage;
    const selected = stageDefinition(this.pendingStage);

    this.root.innerHTML = `
      <main class="stage-screen" data-game-phase="select-stage">
        <header class="fight-menu-header">
          <button class="menu-back" data-back type="button" aria-label="Volver">←</button>
          <div><span>ESCENARIO</span><h1>ELEGÍ DÓNDE PELEAR</h1></div>
          <span class="step-chip">03 / 03</span>
        </header>
        <section class="stage-layout">
          <div class="stage-list">
            ${STAGE_OPTIONS.map((stage) => `
              <button
                class="stage-tile stage-tile--${stage.id}${stage.id === this.pendingStage ? ' is-selected' : ''}"
                data-stage="${stage.id}"
                type="button"
                aria-pressed="${stage.id === this.pendingStage ? 'true' : 'false'}"
                style="--stage-accent:${stage.accent}"
              >
                <span class="stage-thumb" aria-hidden="true"><i></i><b></b></span>
                <span class="stage-tile-copy"><small>${stage.kicker}</small><strong>${stage.label}</strong></span>
              </button>
            `).join('')}
          </div>
          <aside class="stage-preview" style="--stage-accent:${selected.accent}">
            <div class="stage-preview-art stage-preview-art--${selected.id}" aria-hidden="true">
              <span class="stage-horizon"></span><span class="stage-line"></span><span class="stage-post"></span>
            </div>
            <span class="stage-preview-kicker">${selected.kicker}</span>
            <h2 data-stage-name>${selected.label}</h2>
            <p>${selected.description}</p>
            <button class="primary-button" data-stage-confirm data-primary type="button">CONFIRMAR ESCENARIO</button>
          </aside>
        </section>
      </main>
      ${this.orientationPrompt()}
    `;

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-stage]')) {
      button.addEventListener('click', () => {
        const id = stageId(button.dataset.stage);
        if (!id) throw new Error(`Unknown stage ${String(button.dataset.stage)}`);
        this.pendingStage = id;
        this.showStageSelect();
      });
    }

    this.root.querySelector<HTMLButtonElement>('[data-stage-confirm]')?.addEventListener('click', () => {
      this.flow = chooseStage(this.flow, this.pendingStage);
      if (this.flow.phase === 'vs') this.showVs();
    });
    this.root.querySelector<HTMLButtonElement>('[data-back]')?.addEventListener('click', () => {
      this.flow = backFlow(this.flow);
      this.pendingFighter = this.flow.cpu ?? defaultFighter();
      this.routeFlow();
    });

    this.bindScreenBack();
    this.root.querySelector<HTMLButtonElement>('[data-stage].is-selected')?.focus();
  }

  private showVs(delay = 800): void {
    this.cleanupFight();
    if (!this.flow.player || !this.flow.cpu) return;
    const p1 = this.flow.player;
    const p2 = this.flow.cpu;
    const stage = stageDefinition(this.flow.stage);
    this.root.innerHTML = `
      <main class="vs-screen" data-game-phase="vs" style="--stage-accent:${stage.accent}">
        <div class="vs-stage" data-stage-name>${stage.label}</div>
        <div class="vs-side vs-side--left fighter-card--${p1}">
          <span class="vs-label">JUGADOR</span>
          ${this.fighterPortrait(p1, 'vs-portrait')}
          <span class="vs-portrait-mark" aria-hidden="true">${fighterPresentation(p1).select.mark}</span>
          <strong>${fighterDefinition(p1).displayName}</strong>
          <span>${fighterPresentation(p1).select.role}</span>
        </div>
        <div class="vs-mark">VS</div>
        <div class="vs-side vs-side--right fighter-card--${p2}">
          <span class="vs-label">CPU · ${this.flow.cpuDifficulty.toUpperCase()}</span>
          ${this.fighterPortrait(p2, 'vs-portrait')}
          <span class="vs-portrait-mark" aria-hidden="true">${fighterPresentation(p2).select.mark}</span>
          <strong>${fighterDefinition(p2).displayName}</strong>
          <span>${fighterPresentation(p2).select.role}</span>
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
    this.hasShownSuperReadyHint = false;
    this.root.onkeydown = null;
    this.root.innerHTML = `
      <main class="fight-shell" data-game-phase="fight" data-stage="${this.flow.stage}">
        <canvas class="fight-canvas" data-fight-canvas aria-label="Arena de combate"></canvas>
        <div class="hud" aria-live="polite">
          ${this.hudFighter(0, this.flow.player)}
          <div class="hud-center"><span class="round-label" data-round>R1</span><strong class="timer" data-timer>60</strong></div>
          ${this.hudFighter(1, this.flow.cpu)}
        </div>
        <button class="fight-controls-button" data-controls-button type="button" aria-label="Ver controles">?</button>
        ${this.hasShownCombatHint ? '' : '<div class="combat-hint" data-combat-hint><strong>Atrás = retroceder / bloquear</strong><span>Doble atrás = BACKDASH · Bloquear consume GUARD</span></div>'}
        <div class="super-hint is-hidden" data-super-hint><strong>SUPER READY</strong><span>TOCÁ ULTIMATE · teclado L</span></div>
        <div class="touch-layer" data-touch-controls>
          <div class="dpad" data-dpad aria-label="D-pad de 8 direcciones">
            <span class="dpad-cross dpad-cross--h"></span><span class="dpad-cross dpad-cross--v"></span><span class="dpad-center"></span>
          </div>
          <div class="action-cluster">
            <button class="action-button action-button--ultimate" data-action="ultimate" data-ultimate-button type="button" aria-label="Ultimate: requiere SUPER READY" disabled><span>ULTIMATE</span></button>
            <button class="action-button action-button--jump" data-action="jump" type="button"><span>JUMP</span></button>
            <button class="action-button action-button--special" data-action="special" type="button"><span>SPECIAL</span></button>
            <button class="action-button action-button--attack" data-action="attack" type="button"><span>ATTACK</span></button>
          </div>
        </div>
        <div class="desktop-hint">A/D mover · S agachar · W/Space salto · J ataque · K especial · L ultimate</div>
      </main>
      ${this.controlsPanel()}
      ${this.orientationPrompt()}
    `;

    this.bindControlsPanel(true);
    if (!this.hasShownCombatHint) {
      this.hasShownCombatHint = true;
      clearTimeout(this.hintTimer);
      this.hintTimer = window.setTimeout(
        () => this.root.querySelector<HTMLElement>('[data-combat-hint]')?.classList.add('is-hidden'),
        4200,
      );
    }

    const canvas = this.root.querySelector<HTMLCanvasElement>('[data-fight-canvas]');
    const touchRoot = this.root.querySelector<HTMLElement>('[data-touch-controls]');
    if (!canvas || !touchRoot) throw new Error('Fight UI failed to mount');

    const simulation = new CombatSimulation(this.flow.player, this.flow.cpu);
    const renderer = new FightRenderer(canvas, DEFAULT_STAGE_REGISTRY.get(this.flow.stage));
    const cpu = new CpuController(1, { difficulty: this.flow.cpuDifficulty });
    const playerCpu = this.autoplayPlayer ? new CpuController(0) : null;
    this.input = new GameInput(touchRoot, {
      onReset: () => simulation.resetInputState(),
    });

    let previous = performance.now();
    let accumulator = 0;
    let snapshot = simulation.getSnapshot();
    renderer.consumeEvents(snapshot);

    const frame = (now: number) => {
      const elapsed = Math.min(100, now - previous);
      previous = now;
      if (!this.paused) {
        accumulator += elapsed;
        while (accumulator >= FIXED_MS) {
          const playerState = snapshot.fighters[0];
          const humanInput = playerCpu
            ? playerCpu.nextInput(snapshot)
            : this.input?.getFrame({
                superReady: playerState.superReady,
                defensiveContext: playerState.blocking || playerState.blockstunFrames > 0,
                nowMs: now,
              }) ?? EMPTY_INPUT;
          const cpuInput = cpu.nextInput(snapshot);
          snapshot = simulation.step(humanInput, cpuInput);
          renderer.consumeEvents(snapshot);
          accumulator -= FIXED_MS;
          this.updateHud(snapshot);
        }
      } else {
        accumulator = 0;
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
    const availabilityLabel = fighterPresentation(id).rangedAvailabilityLabel;
    return `
      <section class="hud-fighter hud-fighter--${index === 0 ? 'left' : 'right'}">
        <div class="hud-meta"><strong>${fighterDefinition(id).displayName}</strong><span>${index === 0 ? 'P1' : 'CPU'}</span></div>
        <div class="health-track"><span class="health-fill" data-health="${index}"></span></div>
        <div class="guard-row"><span class="guard-label">GUARD</span><div class="guard-track" data-guard-track="${index}"><span class="guard-fill" data-guard="${index}"></span></div></div>
        <div class="super-row"><span class="super-label">SUPER</span><div class="super-track" data-super-track="${index}"><span class="super-fill" data-super="${index}"></span></div></div>
        ${availabilityLabel ? `
          <div class="special-cooldown ranged-status" data-special-cooldown="${index}">
            <span>${availabilityLabel}</span>
            <strong class="ranged-status-value" data-ranged-state="${index}">LISTA</strong>
            <span class="special-cooldown-track"><i class="special-cooldown-fill" data-special-cooldown-fill="${index}"></i></span>
          </div>
        ` : ''}
        <div class="round-pips"><i data-win="${index}-0"></i><i data-win="${index}-1"></i></div>
      </section>
    `;
  }

  private updateHud(snapshot: MatchSnapshot): void {
    for (const index of [0, 1] as const) {
      const fighter = snapshot.fighters[index];
      const health = this.root.querySelector<HTMLElement>(`[data-health="${index}"]`);
      if (health) health.style.transform = `scaleX(${Math.max(0, fighter.health / fighter.maxHealth)})`;
      const guard = this.root.querySelector<HTMLElement>(`[data-guard="${index}"]`);
      if (guard) guard.style.transform = `scaleX(${Math.max(0, fighter.guard / fighter.maxGuard)})`;
      this.root.querySelector<HTMLElement>(`[data-guard-track="${index}"]`)?.classList.toggle('is-broken', fighter.guardBreakFrames > 0);

      const superFill = this.root.querySelector<HTMLElement>(`[data-super="${index}"]`);
      if (superFill) superFill.style.transform = `scaleX(${Math.max(0, Math.min(1, fighter.superMeter / Math.max(1, fighter.maxSuper)))})`;
      this.root.querySelector<HTMLElement>(`[data-super-track="${index}"]`)?.classList.toggle('is-ready', fighter.superReady);

      const cooldownFill = this.root.querySelector<HTMLElement>(`[data-special-cooldown-fill="${index}"]`);
      if (cooldownFill) {
        const cooldownReady = fighter.projectileCooldownMax <= 0
          ? 1
          : Math.max(0, Math.min(1, 1 - fighter.projectileCooldown / fighter.projectileCooldownMax));
        cooldownFill.style.transform = `scaleX(${cooldownReady})`;
      }
      const rangedStatus = this.root.querySelector<HTMLElement>(`[data-special-cooldown="${index}"]`);
      rangedStatus?.classList.toggle('is-ready', fighter.rangedAvailability === 'ready');
      rangedStatus?.classList.toggle('is-flight', fighter.rangedAvailability === 'inFlight');
      const rangedValue = this.root.querySelector<HTMLElement>(`[data-ranged-state="${index}"]`);
      if (rangedValue) rangedValue.textContent = rangedStateLabel(fighter);

      for (let pip = 0; pip < 2; pip += 1) {
        this.root.querySelector<HTMLElement>(`[data-win="${index}-${pip}"]`)?.classList.toggle('is-won', pip < fighter.roundWins);
      }
    }

    const ultimateButton = this.root.querySelector<HTMLButtonElement>('[data-ultimate-button]');
    if (ultimateButton) {
      ultimateButton.disabled = !snapshot.fighters[0].superReady;
      ultimateButton.classList.toggle('is-ready', snapshot.fighters[0].superReady);
      ultimateButton.setAttribute(
        'aria-label',
        snapshot.fighters[0].superReady ? 'Ultimate READY' : 'Ultimate: requiere SUPER READY',
      );
    }

    if (!this.hasShownSuperReadyHint && snapshot.fighters[0].superReady) {
      this.hasShownSuperReadyHint = true;
      const hint = this.root.querySelector<HTMLElement>('[data-super-hint]');
      hint?.classList.remove('is-hidden');
      clearTimeout(this.superHintTimer);
      this.superHintTimer = window.setTimeout(() => hint?.classList.add('is-hidden'), 2600);
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
      <main class="result-screen fighter-card--${winnerId}" data-game-phase="result">
        <span class="result-kicker">RESULTADO · ${stageLabel(this.flow.stage)}</span>
        <h1>${playerWon ? 'VICTORIA' : 'DERROTA'}</h1>
        <p><strong>${fighterDefinition(winnerId).displayName}</strong> gana el duelo.</p>
        <div class="result-actions">
          <button class="primary-button" data-rematch data-primary type="button">REVANCHA</button>
          <button class="secondary-button" data-change-fighter type="button">CAMBIAR LUCHADORES</button>
          <button class="secondary-button" data-change-stage type="button">CAMBIAR ESCENARIO</button>
        </div>
      </main>
      ${this.orientationPrompt()}
    `;

    this.root.querySelector<HTMLButtonElement>('[data-rematch]')?.addEventListener('click', () => {
      this.flow = rematch(this.flow);
      this.showVs(500);
    });
    this.root.querySelector<HTMLButtonElement>('[data-change-fighter]')?.addEventListener('click', () => {
      this.flow = changeFighters(this.flow);
      this.autoplayPlayer = false;
      this.pendingFighter = defaultFighter();
      this.showRosterSelect();
    });
    this.root.querySelector<HTMLButtonElement>('[data-change-stage]')?.addEventListener('click', () => {
      this.flow = changeStage(this.flow);
      this.pendingStage = this.flow.stage;
      this.showStageSelect();
    });
    this.root.querySelector<HTMLButtonElement>('[data-primary]')?.focus();
  }

  private routeFlow(): void {
    if (this.flow.phase === 'title') {
      this.showTitle();
    } else if (this.flow.phase === 'select-player' || this.flow.phase === 'select-cpu') {
      this.pendingFighter = (this.flow.phase === 'select-cpu' ? this.flow.cpu : this.flow.player) ?? defaultFighter();
      this.showRosterSelect();
    } else if (this.flow.phase === 'select-stage') {
      this.pendingStage = this.flow.stage;
      this.showStageSelect();
    } else if (this.flow.phase === 'vs') {
      this.showVs();
    } else if (this.flow.phase === 'fight') {
      this.mountFight();
    }
  }

  private bindScreenBack(): void {
    this.root.onkeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      this.flow = backFlow(this.flow);
      this.routeFlow();
    };
  }

  private cleanupFight(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    clearTimeout(this.vsTimer);
    this.input?.destroy();
    this.input = null;
    this.paused = false;
    this.root.onkeydown = null;
    clearTimeout(this.hintTimer);
    this.hintTimer = 0;
    clearTimeout(this.superHintTimer);
    this.superHintTimer = 0;
  }

  private bindControlsPanel(pausesFight: boolean): void {
    const panel = this.root.querySelector<HTMLElement>('[data-controls-panel]');
    const closeButton = this.root.querySelector<HTMLButtonElement>('[data-controls-close]');
    const open = () => {
      panel?.classList.add('is-open');
      panel?.setAttribute('aria-hidden', 'false');
      if (pausesFight) {
        this.input?.reset();
        this.paused = true;
      }
      closeButton?.focus();
    };
    const close = () => {
      panel?.classList.remove('is-open');
      panel?.setAttribute('aria-hidden', 'true');
      if (pausesFight) {
        this.input?.reset();
        this.paused = false;
      }
    };
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-controls-button]')) {
      button.addEventListener('click', open);
    }
    closeButton?.addEventListener('click', close);
  }

  private controlsPanel(): string {
    return `
      <aside class="controls-panel" data-controls-panel aria-hidden="true">
        <div class="controls-card">
          <div class="controls-heading"><span>GUÍA RÁPIDA</span><strong>CONTROLES</strong><button data-controls-close type="button" aria-label="Cerrar controles">×</button></div>
          <div class="controls-grid">
            <section><h3>MOVIMIENTO</h3><p><b>D-pad</b><span>Moverse</span></p><p><b>Atrás</b><span>Retroceder / bloquear</span></p><p><b>Abajo + atrás</b><span>Bloqueo bajo</span></p><p><b>Doble adelante</b><span>Dash</span></p><p><b>Doble atrás</b><span>Backdash / esquiva</span></p></section>
            <section><h3>ACCIONES</h3><p><b>JUMP</b><span>Saltar / ataque aéreo con ATTACK</span></p><p><b>ATTACK</b><span>Ataque normal / cadena corta</span></p><p><b>Abajo + ATTACK</b><span>Low normal en el suelo</span></p><p><b>SPECIAL sin dirección</b><span>Especial a distancia según luchador</span></p><p><b>Abajo + SPECIAL</b><span>Especial cercano según luchador</span></p><p><b>SPECIAL bloqueando</b><span>Push Guard: pide separación usando GUARD</span></p><p><b>ULTIMATE (Touch)</b><span>Intento de Ultimate; requiere SUPER READY</span></p><p><b>L (teclado)</b><span>Ultimate dedicado en desktop</span></p></section>
          </div>
          <div class="controls-tips"><strong>COMBATE</strong><span>Bloquear consume GUARD · El low vence guardia alta · Saltar evita lows · SPECIAL neutro controla distancia · Abajo + SPECIAL es la opción cercana · La disponibilidad del proyectil se muestra en HUD cuando aplica · Touch: ULTIMATE · Teclado: L</span></div>
        </div>
      </aside>
    `;
  }

  private orientationPrompt(): string {
    return '<aside class="orientation-prompt"><div class="phone-icon">↻</div><strong>GIRÁ EL TELÉFONO</strong><span>Este prototipo se juega en horizontal.</span></aside>';
  }
}
