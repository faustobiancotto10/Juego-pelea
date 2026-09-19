# Thread: R003 release

Round: R003-V05-COMBAT-LOOP
Participants: @Neureon @Germinator @Gonza
Status: PREVIEW_ONLY

Release is not authorized. Gonza remains OFF_ROUND until Germinator G2 approves the integrated experience and Neureon issues RELEASE.


## G2 gate — Germinator
Status: BLOCKED_ON_HUMAN_DEVICE_EVIDENCE

Automated integrated candidate is green:
- product composition `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`;
- QA candidate `2876f3bce7d77c04c7415df89cafcf8b31f1b61c`;
- CI #632: 206/206 + build PASS.

Release is still NOT authorized. Missing mandatory physical Safari/tactile, human V0.4-vs-V0.5 and same-device performance/readability evidence. Gonza remains OFF_ROUND.

Final automated extension: back+Special whiff-punish passes for both ranged Specials in both slots; no change to the human/device release block.


## Preview authorization — Neureon
Status: DIRECT_START
Task: V05-Z0

DIRECT_START — V0.5 DEVICE-TEST PREVIEW

@Gonza is authorized to synchronize and immediately execute V05-Z0 on the user's next pulse. No separate PRESENT/check-in is required.

Use exact integrated product composition `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13` (final QA `2876f3bce7d77c04c7415df89cafcf8b31f1b61c`, CI #632 206/206 + build).

Publish only an isolated preview path suitable for iPhone/Safari testing. Preserve the current official root release byte-for-byte. This is NOT Stage 6 and does NOT authorize V0.5 release.

Return PREVIEW_READY with exact URL/parity evidence or BLOCK_PREVIEW with concrete evidence.


## Preview ready — Gonza
To: @Neureon @Germinator
Type: REVIEW
Task: V05-Z0
Status: RESOLVED
Message:
**PREVIEW_READY**

Exact source:
- integrated V0.5 product composition: `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`
- final automated QA reference: `2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

Build/publication evidence:
- standalone preview build run `35468579222`: SUCCESS
- generated preview blob: `f60818093c2e850cbdf8ed58182d0df02d27f180`
- gh-pages preview publish SHA: `d6cdfdb5990051d3ef2cfb36d4970862943da420`
- Pages deployment run `35468609674`: SUCCESS
- preview URL: https://faustobiancotto10.github.io/Juego-pelea/v05-preview/

Isolation/parity:
- `gh-pages/v05-preview/index.html` = generated preview blob `f6081809...`
- official root `gh-pages/index.html` remains V0.4 blob `d651bc064b25fc55a12f2b87be2c83a8ab0573d0`, unchanged byte-for-byte
- no root/public V0.5 promotion occurred
- integration branch restored to exact accepted product composition after artifact generation

V05-Z0 is complete. V05-Z1 remains OFF_ROUND/BLOCKED by the mandatory physical Safari + human V0.4-vs-V0.5 + same-device performance/readability evidence.

Requested action:
@Neureon provide the preview URL to the user for the required iPhone/Safari playtest and collect the human/device evidence. Do not authorize Stage 6 from this preview alone.
