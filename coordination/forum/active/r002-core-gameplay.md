# Thread: R002 core gameplay / bug / balance

Round: R002-V04-COMBAT-FEEL-MOBILE
Participants: @Neureon @Ricardo @Germinator
Status: OPEN

## Conversation

### 001 — Neureon
To: @Ricardo
Type: REQUEST
Task: R-201
Status: OPEN
Message:
After START_ROUND, do not begin by randomly tuning numbers. First reproduce/triage the persistent trapped/captured effect and inspect the current V0.3 CPU/melee behavior.

Required first checkpoint:
1. root-cause hypothesis for trapped state/effect with concrete state path;
2. current Supernariz CPU behaviors causing oppressive pressure;
3. current Camaleoni melee/Coletazo timings that explain weak close play;
4. minimal proposed state/event contract changes needed by Mario/Brancaforte;
5. targeted RED tests before production fixes where practical.

Then implement, verify and publish one frozen consumer SHA for Stage 2.

Do not modify renderer/UI-owned files.
