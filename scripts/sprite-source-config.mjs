export const BODY_CANVAS = Object.freeze({ width: 320, height: 320, margin: 20, pivotX: 160, pivotY: 300 });
export const FX_CANVAS = Object.freeze({ width: 320, height: 320, margin: 20, centerX: 160, centerY: 160 });
export const REJECTED_ALTERNATE = '13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG';

const rightRows = [
  ['IMG-00','el-toro__IMG-00__master-seed.png','b22e581da861bee4c98601d9ceb53d5c1ea79993a0bc0f4b50a72cf5e9ca5752','master',1,1,1],
  ['IMG-01','el-toro__IMG-01__idle.png','396e43959c197c5e57a3021751dfe752f27dd70fa89bdd81e0c22422ee8f0585','body',2,4,8],
  ['IMG-02','el-toro__IMG-02__forward-shuffle.png','20cbc7c2c55c0b38a3195957fe7e68cc6f07386428c43ea999170cbce99523fc','body',2,4,8],
  ['IMG-03','el-toro__IMG-03__backward-shuffle.png','26d3e001a9902f66c606e720f3bf8410d7c630bbd99880369b3590dfc3b00a43','body',2,4,8],
  ['IMG-04','el-toro__IMG-04__crouch.png','ba844bb600f903c62d918c6e3aab4365c1372af6f36ba54d31c736ff0ed398c3','body',1,4,4],
  ['IMG-05','el-toro__IMG-05__jump.png','9bf5fd065e3241e978334791c291a06f2a001d58f789a3b4e6d7163392dd54d3','body',2,3,6],
  ['IMG-06','el-toro__IMG-06__basic-attack.png','453e2a9a4983c94dc9579892181ae4e2cd6f214fedbb184d7628d7871b5b05ba','body',2,3,6],
  ['IMG-07','el-toro__IMG-07__low-attack.png','53fe7886c66a4a2ac7cecc18e9bf095faa0c174a1c5ce738b4b2f7c265dcdfa4','body',2,3,6],
  ['IMG-08','el-toro__IMG-08__block.png','194ee89d805154b1cdfe41f55c5751fb7f829e1ac14a5ea51d569c473704693c','body',1,4,4],
  ['IMG-09','el-toro__IMG-09__hurt-knockdown.png','9f926012b8bb8e11711b572463787a7601fa2fd1d3b32ea91c5bfaff38add572','body',2,4,8],
  ['IMG-10','el-toro__IMG-10__topete.png','bbc0eceb11a903237d12a20a5b7b1c2eef60a02c19c836c474def1dbf7b3d8f1','body',2,4,8],
  ['IMG-11','el-toro__IMG-11__shawarmazo.png','3bc8567f72aa50cf0df8650fcb172db385e74f8706b1f7d53cf95e4b51eeca2b','body',2,4,8],
  ['IMG-12','el-toro__IMG-12__super-eructo.png','f91465638ff69f9a568fb4e168ad755fdc52883ae9d4cade093350ec20bc1ef5','body',2,5,10],
  ['FX-01','el-toro__FX-01__topete-impact.png','3df8e51df3387112e611e138b577db75f283286b47bab86c43edef5b38b0dab1','fx',1,4,4],
  ['FX-02','el-toro__FX-02__shawarmazo-projectile.png','df2bfdc4dfd0a388a70693522c5b6c125c70437dbac41effd2bd0eb02cfd7e4c','fx',2,4,8],
  ['FX-03','el-toro__FX-03__shawarmazo-impact.png','a06588de862d431074957915770d387259d77c322425a1d02f3839e52b5bc9b5','fx',1,4,4],
  ['FX-04','el-toro__FX-04__super-eructo-effect.png','d1f69195f325d59036176eb13a48b21e595d536e56ce32930a4100ee0d4e701b','fx',2,3,6],
];

const leftRows = [
  ['IMG-00','el-toro__LEFT-IMG-00__master-seed.png','e7443e36846989c8ae303e0ace735fa2ff274741c1964cbbde63ad8acd0fc3c2','master',1,1,1],
  ['IMG-01','el-toro__LEFT-IMG-01__idle.png','1dbe4afc9f1f5564eddd18e802af2f4f41454f7c5c54266466a90949106ebac7','body',2,4,8],
  ['IMG-02','el-toro__LEFT-IMG-02__forward-shuffle.png','63132b6519162c9ce160db35c408a0faf3557f07f00ec7b1e72f45264e106c2a','body',2,4,8],
  ['IMG-03','el-toro__LEFT-IMG-03__backward-shuffle.png','8a5885b29140af5d04ffcbaf155153aa624c0f4f636c68ca6a1ff682f1c78cb4','body',2,4,8],
  ['IMG-04','el-toro__LEFT-IMG-04__crouch.png','196d38b07b9e7d1ce86ae1401d86b5594a815e576217543f2bddc04d0acc8e46','body',1,4,4],
  ['IMG-05','el-toro__LEFT-IMG-05__jump.png','94ebdf8f481cea45c40a928bc0021ee5a877bcf6ad8d9e7e05978bee6956a8fa','body',2,3,6],
  ['IMG-06','el-toro__LEFT-IMG-06__basic-attack.png','ea8804c31eb723075fb22239723c94c1336f490dc97ae84222375038113e71ff','body',2,3,6],
  ['IMG-07','el-toro__LEFT-IMG-07__low-attack.png','3e178185d240aebc7d4620db5919735a900506c824d4955e6be31601b3c35887','body',2,3,6],
  ['IMG-08','el-toro__LEFT-IMG-08__block.png','f6f35fa68b92cd2ae65c1a6b5841ae387459caa120efdeed918406ffaa15531f','body',1,4,4],
  ['IMG-09','el-toro__LEFT-IMG-09__hurt-knockdown.png','3d1d8f625fca16e60de5ce70dc5c1e3c2f3c3a7e6a64e58a4cfd8e2f2e59997e','body',2,4,8],
  ['IMG-10','el-toro__LEFT-IMG-10__topete.png','15d835f901cbc25f7eddaf8a8603d33129980fcb403ece3a550287b404d8dca9','body',2,4,8],
  ['IMG-11','el-toro__LEFT-IMG-11__shawarmazo.png','5213959e0e3a86ff1481fee818f13c0ade02bff9042b68a22d305e179401f428','body',2,4,8],
  ['IMG-12','el-toro__LEFT-IMG-12__super-eructo.png','d64d269d8191b11a8a6cc7afaaba01905596516ccb6c57c5b78c9fd3002b385d','body',2,5,10],
];

function freezeRows(rows) {
  return Object.freeze(rows.map(([id,file,hash,kind,gridRows,cols,expectedFrames]) => Object.freeze({
    id, file, hash, kind, rows: gridRows, cols, expectedFrames,
  })));
}

export const RIGHT_SHEETS = freezeRows(rightRows);
export const LEFT_SHEETS = freezeRows(leftRows);

// Backward-compatible alias: existing callers without a facing remain RIGHT.
export const SHEETS = RIGHT_SHEETS;

export function sheetsForFacing(facing='right') {
  if (facing === 'right') return RIGHT_SHEETS;
  if (facing === 'left') return LEFT_SHEETS;
  throw new Error('unsupported sprite facing '+facing);
}
