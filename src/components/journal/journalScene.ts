import * as THREE from "three";

// A journal made of real sheets: every sheet is one double-sided mesh whose
// vertex shader curls it around the spine as it turns. Pages are textures
// captured from journalPages.tsx (see scripts/capture-journal-pages.mjs).

export interface JournalHotspot {
  side: number;
  // Normalised to the page side, measured from its top-left corner.
  x: number;
  y: number;
  width: number;
  height: number;
  href?: string;
  action?: string;
}

export interface JournalSceneOptions {
  // Where the closed journal rests on the page. The canvas lives here, centred
  // on the cover, and scrolls with it.
  restHost: HTMLElement;
  // Covers the viewport. The canvas moves here while the journal is open.
  stageHost: HTMLElement;
  // Width of the closed cover on the page, in pixels.
  restWidth: number;
  // "spread" is a book lying open, with a page on each side of the spine.
  // "single" is for narrow screens: one page fills the view, every side is a
  // page of its own, and a turned page wraps round the spine and tucks behind.
  layout: "spread" | "single";
  sides: string[];
  // Shown on the back of the last page in the single layout, so the final turn reveals a cover rather than blank paper.
  backCover?: string;
  // The cover without its name sticker, and where the sticker belongs on it
  // (centre and width as fractions of the page, rotation in CSS degrees).
  // The sticker is stuck on by `stickOn` and then becomes part of the cover.
  coverBare: string;
  coverSticker: { src: string; x: number; y: number; width: number; aspect: number; rotation: number };
  hotspots: JournalHotspot[];
  pageWidth: number;
  pageHeight: number;
  // Texture alpha on a sticker (0..255); bare paper is 255.
  glossAlpha: number;
  reducedMotion: boolean;
  onReady: () => void;
  onError: (error: unknown) => void;
  onDismiss: () => void;
  onHotspot: (hotspot: JournalHotspot) => void;
}

export interface JournalScene {
  // Sticks the name sticker onto the cover: left edge first, then pressed flat.
  stickOn: () => void;
  // Points the resting cover at the cursor (viewport coordinates), or lets it settle.
  hover: (point: { x: number; y: number } | null) => void;
  open: () => void;
  // Closes the book and flies it back. `onReturn` fires once the pages are shut
  // and the book starts travelling home; the promise resolves when it lands.
  close: (onReturn: () => void) => Promise<void>;
  flipNext: () => void;
  flipPrev: () => void;
  dispose: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Curve {
  arc: number;
  angleDeg: number;
}

interface Flight {
  from: number | null;
  to: number;
  start: number;
  duration: number;
  ease: (t: number) => number;
}

interface Zone {
  sheet: number;
  forward: boolean;
}

// One world unit is one page width, so the spine is the y axis and an open
// spread spans x = -1..1.
const CAMERA_DISTANCE = 4.6;
const SPREAD_MARGIN_PX = 16;
const MAX_CANVAS_PIXELS = 10e6;
const SHEET_GAP = 0.004;
const GUTTER_LIFT = 0.03;
const PAGE_CORNER_PX = 16;
const COVER_CORNER_PX = 12;
const COVER_FLEX = 0.3;

const CURL = { arc: 0.6, maxAngleDeg: 40, cornerRollMax: 2.3, smoothTime: 0.4, directionSmoothTime: 0.4 };
const FLIP = { time: 0.85, dragPages: 1.5, dragSmoothTime: 0.25, commitProgress: 0.2, clickSlopPx: 5 };
const PEEK = { progress: 0.045, smoothTime: 0.9 };
// The hovered page also lifts toward the cursor: evenly at mid-height, and more
// at whichever end (top or bottom) the cursor is nearer.
const HOVER = { lift: 0.07, bias: 0.9, smoothTime: 0.35 };
// Pressing and holding a side keeps turning pages, faster the longer it's held.
const HOLD = { delayMs: 350, firstGapMs: 300, fastestGapMs: 130, speedUpSheets: 8 };
// Light catching the gutter side of the right-hand page.
const CREASE = { glow: 0.22, glowWidth: 0.09, shade: 0.04, shadeCentre: 0.2, shadeWidth: 0.12 };
const CLOSE = { time: 0.5, staggerMs: 70, maxStaggerTotalMs: 600 };
// In the single layout a turned page swings over to the left, then rolls round
// the spine and under the book. The fold is deliberately loose: each page rolls
// a little wider than the last and lands slightly askew, so the folded pages fan
// out past the top edge instead of hiding squarely behind.
const FOLD = {
  // Share of the turn spent swinging over, and where the roll under begins.
  swingEnd: 0.55,
  rollStart: 0.4,
  // Radius of the roll at the spine for the first page, and how much each later page adds.
  radius: 0.055,
  radiusStep: 0.003,
  // How far askew a folded page lands, in degrees.
  skew: 4.5,
  skewStep: 0.9,
  skewStepMax: 9,
  skewJitter: 0.7,
  // Room kept beside the page for the roll, as a share of the page width.
  margin: 0.16,
  // The stretch of the last page's turn over which the folded pages square up
  // into a closed book. It ends before that page starts rolling under, so the
  // back cover wraps a tidy pile and none of the paper behind it shows past its edge.
  squareUpStart: 0.05,
  squareUpEnd: 0.4,
  // A page lifts less on hover here, since the swing-over starts faster than a spread's turn.
  peekScale: 0.4,
};
const TRAVEL = { stiffness: 170, damping: 26 };
const TILT = { x: 0.06, y: 0.085, smoothTime: 0.6 };
// The closed cover leans the way the DOM one did, and reacts more strongly to
// the cursor since it is a much smaller target than the open book.
const REST = {
  rotation: THREE.MathUtils.degToRad(3),
  hoverRotation: THREE.MathUtils.degToRad(-3),
  rotationSmoothTime: 0.5,
  tilt: 2.8,
  peekProgress: 0.09,
};
const TEXTURES = { loadRadius: 2, keepRadius: 3, pinnedSheets: 2 };

// Stickers catch the light: a soft sheen plus a tight glint. `dome` bows the
// surface used for the reflection, so the glint is a spot that slides across
// the stickers as the page turns or tilts, rather than the whole page flashing.
const GLOSS = { sheen: 0.05, sheenPower: 14, glint: 0.2, glintPower: 45, dome: 0.9, fadeInTime: 1.2 };

// The name sticker going onto the cover. It arrives curled up off the surface,
// held down at its bottom-left corner, and is pressed flat toward the top-right.
const STICKER = {
  columns: 28,
  rows: 20,
  // Samples along the diagonal used to work out the curl
  samples: 56,
  // Light catches the lifted part: a bright band where it bends through this
  // angle, which travels across the sticker ahead of the press.
  shineAngle: THREE.MathUtils.degToRad(30),
  shinePower: 40,
  shine: 0.4,
  // How far the far end starts curled up, in degrees
  curl: 84,
  // The press runs along the sticker like a thumb; this is how much of its length is bending at once
  band: 1 / 7,
  arriveTime: 0.16,
  pressTime: 0.6,
  // Where it starts from before settling: a little big, turned, and above its place
  startScale: 1.12,
  startTurn: THREE.MathUtils.degToRad(6),
  startRise: 14 / 420,
  clearance: 0.002,
};

// Lit so that a flat sheet facing the camera shows its texture at exactly
// full brightness, which keeps the 3D cover identical to the DOM one.
const SKY_INTENSITY = 2.2;
const SUN_POSITION = new THREE.Vector3(-2.2, 1.6, 4.0);

const GROUND_SHADOW = 0.22;

const SETTLE = 1e-4;

const easeInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

function sheetVertexPrelude(aspect: number) {
  return /* glsl */ `
    uniform float uBendAngle;
    uniform vec2 uFold;
    uniform vec2 uCurl;
    uniform vec2 uFlipRotation;
    uniform float uDirection;
    uniform float uLift;
    uniform float uDepth;
    uniform vec2 uHover;
    uniform vec2 uRoll;
    uniform float uSkew;
    varying vec2 vSheetUv;

    const float SHEET_ASPECT = ${aspect.toFixed(5)};
    const float NORMAL_EPSILON = 0.02;

    // uv.x is the distance from the spine, uv.y runs bottom to top.
    vec3 sheetPosition(vec2 st) {
      float flatX = st.x;
      float flatY = (st.y - 0.5) * SHEET_ASPECT;

      // Pages rise out of the gutter, then relax toward the fore-edge.
      float rise = sin(min(flatX / 0.14, 1.0) * 1.57079633);
      float lift = uLift * rise * mix(1.0, 0.4, smoothstep(0.14, 1.0, flatX));

      // Curl around a cylinder whose axis is tilted by the fold angle, starting
      // far enough out that the bound edge stays on the spine.
      float localU = flatX * uFold.x + flatY * uFold.y;
      float localV = -flatX * uFold.y + flatY * uFold.x;
      float beyondCurl = max(0.0, localU - uCurl.x);
      float cylinderAngle = beyondCurl / uCurl.y * uBendAngle;
      float sinc = abs(cylinderAngle) < 1e-4 ? 1.0 : sin(cylinderAngle) / cylinderAngle;
      float versine = abs(cylinderAngle) < 1e-4 ? 0.0 : (1.0 - cos(cylinderAngle)) / cylinderAngle;
      float curledU = localU - beyondCurl + beyondCurl * sinc;
      float curledZ = -uDirection * beyondCurl * versine;

      float px = curledU * uFold.x - localV * uFold.y;
      float py = curledU * uFold.y + localV * uFold.x;

      // Roll the sheet round the spine: the first stretch (uRoll.y long) bends
      // through uRoll.x radians and the rest carries on straight.
      float rolled = clamp(px / uRoll.y, 0.0, 1.0);
      float rollAngle = uRoll.x * rolled;
      float rollX = px;
      float rollZ = 0.0;
      if (uRoll.x > 1e-4) {
        float rollRadius = uRoll.y / uRoll.x;
        float beyondRoll = max(px - uRoll.y, 0.0);
        rollX = rollRadius * sin(rollAngle) + beyondRoll * cos(uRoll.x);
        rollZ = rollRadius * (1.0 - cos(rollAngle)) + beyondRoll * sin(uRoll.x);
      }
      rollX -= curledZ * sin(rollAngle);
      rollZ += curledZ * cos(rollAngle);

      // Swing the whole sheet around the spine.
      float x = rollX * uFlipRotation.x - rollZ * uFlipRotation.y;
      float z = rollX * uFlipRotation.y + rollZ * uFlipRotation.x;

      // A loosely folded page lands askew, pivoting about the foot of the spine.
      float skew = uSkew * rolled;
      vec2 fromFoot = vec2(x, py + 0.5 * SHEET_ASPECT);
      x = fromFoot.x * cos(skew) - fromFoot.y * sin(skew);
      py = fromFoot.x * sin(skew) + fromFoot.y * cos(skew) - 0.5 * SHEET_ASPECT;

      // Hover lift grows toward the fore-edge, weighted to the cursor's end of the page.
      float hoverLift = uHover.x * flatX * flatX * (1.0 + uHover.y * (st.y * 2.0 - 1.0));

      return vec3(x, py, z + lift + hoverLift - uDepth);
    }
  `;
}

// Cuts the two fore-edge corners off a sheet.
const ROUNDED_CORNERS = /* glsl */ `
  vec2 sheetPx = vSheetUv * uPageSize;
  vec2 fromCorner = vec2(uPageSize.x - sheetPx.x, min(sheetPx.y, uPageSize.y - sheetPx.y));
  if (fromCorner.x < uCornerRadius && fromCorner.y < uCornerRadius && distance(fromCorner, vec2(uCornerRadius)) > uCornerRadius) discard;
`;

const SHEET_FRAGMENT_PRELUDE = /* glsl */ `
  uniform sampler2D uFrontMap;
  uniform sampler2D uBackMap;
  uniform vec2 uPageSize;
  uniform float uCornerRadius;
  uniform float uCrease;
  uniform float uGlossRange;
  uniform float uGlossAmount;
  varying vec2 vSheetUv;
`;

function createSheetUniforms(
  paper: THREE.Texture,
  pageSize: THREE.Vector2,
  cornerRadius: number,
  glossRange: number,
  // Shared by every sheet, so the shine can be faded in as one
  glossAmount: { value: number }
) {
  return {
    uBendAngle: { value: 0 },
    uFold: { value: new THREE.Vector2(1, 0) },
    uCurl: { value: new THREE.Vector2(0, 1) },
    uFlipRotation: { value: new THREE.Vector2(1, 0) },
    uDirection: { value: 1 },
    uLift: { value: 0 },
    uDepth: { value: 0 },
    uHover: { value: new THREE.Vector2(0, 0) },
    uRoll: { value: new THREE.Vector2(0, 1) },
    uSkew: { value: 0 },
    uCrease: { value: 0 },
    uFrontMap: { value: paper },
    uBackMap: { value: paper },
    uPageSize: { value: pageSize },
    uCornerRadius: { value: cornerRadius },
    uGlossRange: { value: glossRange },
    uGlossAmount: glossAmount,
  };
}

type SheetUniforms = ReturnType<typeof createSheetUniforms>;

interface Sheet {
  mesh: THREE.Mesh;
  material: THREE.MeshLambertMaterial;
  depthMaterial: THREE.MeshDepthMaterial;
  uniforms: SheetUniforms;
  // 0 = lying on the right-hand stack, 1 = turned over onto the left.
  progress: number;
  flight: Flight | null;
  direction: number;
  directionSmooth: number;
  curve: Curve;
  curveTarget: Curve;
  // How much the cursor is lifting this sheet (0..1), and toward which end (-1 bottom..1 top).
  hover: { amount: number; y: number };
  // Covers are stiffer than pages.
  flex: number;
  // Each folded page lands a touch differently.
  skewJitter: number;
}

export function createJournalScene(options: JournalSceneOptions): JournalScene {
  const { restHost, stageHost, restWidth, sides, hotspots, pageWidth, pageHeight, reducedMotion } = options;
  const single = options.layout === "single";
  const sheetCount = single ? sides.length : Math.ceil(sides.length / 2);
  const maxTurned = sheetCount;
  const aspect = pageHeight / pageWidth;
  const halfHeight = aspect / 2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline:none";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, CAMERA_DISTANCE + 10);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const sky = new THREE.HemisphereLight("#ffffff", "#bdb7ae", SKY_INTENSITY);
  sky.position.set(0, 0, 1);
  scene.add(sky);

  const sunDirection = SUN_POSITION.clone().normalize();
  const sun = new THREE.DirectionalLight("#ffffff", (Math.PI - SKY_INTENSITY) / sunDirection.z);
  sun.position.copy(sunDirection).multiplyScalar(6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -1.8;
  sun.shadow.camera.right = 1.8;
  sun.shadow.camera.top = 1.5;
  sun.shadow.camera.bottom = -1.5;
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 10;
  sun.shadow.bias = -0.0015;
  sun.shadow.radius = 6;
  scene.add(sun, sun.target);

  const groundGeometry = new THREE.PlaneGeometry(8, 8);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: GROUND_SHADOW });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.z = -SHEET_GAP * (sheetCount + 1);
  ground.receiveShadow = true;
  scene.add(ground);

  // `rig` carries the book between the page and the centre of the screen;
  // `book` slides sideways so a closed cover and an open spread both sit centred.
  const rig = new THREE.Group();
  const book = new THREE.Group();
  rig.add(book);
  scene.add(rig);

  const paper = new THREE.DataTexture(new Uint8Array([245, 245, 244, 255]), 1, 1);
  paper.colorSpace = THREE.SRGBColorSpace;
  paper.needsUpdate = true;

  // The shine starts off, so the 3D cover matches the flat one it replaces, then eases in.
  const glossAmount = { value: 0 };
  let glossTarget = 0;

  const sheetGeometry = new THREE.PlaneGeometry(1, aspect, 64, 32);
  // The shader places vertices by uv alone. Bunch them toward the spine, where a
  // page rolls tightest, so a tight roll stays round instead of faceted and
  // nested rolls don't cut through one another.
  const sheetUv = sheetGeometry.attributes.uv;
  for (let index = 0; index < sheetUv.count; index++) {
    sheetUv.setX(index, Math.pow(sheetUv.getX(index), 2));
  }
  const vertexPrelude = sheetVertexPrelude(aspect);
  const pageSize = new THREE.Vector2(pageWidth, pageHeight);

  function createSheet(index: number): Sheet {
    const isCover = index === 0 || (!single && index === sheetCount - 1);
    const uniforms = createSheetUniforms(paper, pageSize, isCover ? COVER_CORNER_PX : PAGE_CORNER_PX, 1 - options.glossAlpha / 255, glossAmount);

    // Lambert has no specular term, which would otherwise wash out the dark cover.
    const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = vertexPrelude + shader.vertexShader
        .replace("#include <beginnormal_vertex>", /* glsl */ `
          vec3 sheetP = sheetPosition(uv);
          vec3 sheetPx = sheetPosition(uv + vec2(NORMAL_EPSILON, 0.0));
          vec3 sheetPy = sheetPosition(uv + vec2(0.0, NORMAL_EPSILON / SHEET_ASPECT));
          vec3 objectNormal = normalize(cross(sheetPx - sheetP, sheetPy - sheetP));
        `)
        .replace("#include <begin_vertex>", /* glsl */ `
          vec3 transformed = sheetP;
          vSheetUv = uv;
        `);
      shader.fragmentShader = SHEET_FRAGMENT_PRELUDE + shader.fragmentShader
        .replace("#include <map_fragment>", /* glsl */ `
          ${ROUNDED_CORNERS}

          vec4 frontColor = texture2D(uFrontMap, vSheetUv);
          vec4 backColor = texture2D(uBackMap, vec2(1.0 - vSheetUv.x, vSheetUv.y));
          vec4 sheetColor = gl_FrontFacing ? frontColor : backColor;
          diffuseColor.rgb *= sheetColor.rgb;
          // The texture's alpha marks the stickers.
          float sheetGloss = clamp((1.0 - sheetColor.a) / uGlossRange, 0.0, 1.0);

          // A bright strip where light lands beside the crease, easing into a soft shade.
          float crease = gl_FrontFacing ? uCrease : 0.0;
          float creaseGlow = exp(-pow(vSheetUv.x / ${CREASE.glowWidth.toFixed(3)}, 2.0));
          float creaseShade = exp(-pow((vSheetUv.x - ${CREASE.shadeCentre.toFixed(3)}) / ${CREASE.shadeWidth.toFixed(3)}, 2.0));
          // Brighten rather than wash toward white, so ink crossing the gutter keeps its weight.
          diffuseColor.rgb = min(diffuseColor.rgb * (1.0 + ${CREASE.glow.toFixed(3)} * creaseGlow * crease), vec3(1.0));
          diffuseColor.rgb *= 1.0 - ${CREASE.shade.toFixed(3)} * creaseShade * crease;
        `)
        // Light whichever face is toward the camera, whatever the curl does to the winding.
        .replace("#include <normal_fragment_begin>", /* glsl */ `
          vec3 normal = normalize(vNormal);
          float faceDirection = normal.z >= 0.0 ? 1.0 : -1.0;
          normal *= faceDirection;
          vec3 nonPerturbedNormal = normal;
        `)
        .replace("#include <opaque_fragment>", /* glsl */ `
          #if NUM_DIR_LIGHTS > 0
            vec2 glossBow = vec2((vSheetUv.x - 0.5) * (gl_FrontFacing ? 1.0 : -1.0), (vSheetUv.y - 0.5) * uPageSize.y / uPageSize.x);
            vec3 glossNormal = normalize(normal + ${GLOSS.dome.toFixed(3)} * vec3(glossBow, 0.0));
            vec3 glossHalf = normalize(directionalLights[0].direction + normalize(vViewPosition));
            float glossFacing = max(dot(glossNormal, glossHalf), 0.0);

            // The shine is the sun's reflection, so a shadowed sticker doesn't get one.
            float glossLit = 1.0;
            #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
              DirectionalLightShadow glossShadow = directionalLightShadows[0];
              glossLit = receiveShadow ? getShadow(directionalShadowMap[0], glossShadow.shadowMapSize, glossShadow.shadowIntensity, glossShadow.shadowBias, glossShadow.shadowRadius, vDirectionalShadowCoord[0]) : 1.0;
            #endif

            outgoingLight += sheetGloss * uGlossAmount * glossLit * (
              ${GLOSS.sheen.toFixed(3)} * pow(glossFacing, ${GLOSS.sheenPower.toFixed(1)}) +
              ${GLOSS.glint.toFixed(3)} * pow(glossFacing, ${GLOSS.glintPower.toFixed(1)})
            );
          #endif
          #include <opaque_fragment>
        `);
    };

    const depthMaterial = new THREE.MeshDepthMaterial({ side: THREE.DoubleSide });
    depthMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = vertexPrelude + shader.vertexShader.replace("#include <begin_vertex>", /* glsl */ `
        vec3 transformed = sheetPosition(uv);
        vSheetUv = uv;
      `);
      // Cast the same rounded corners the page is drawn with.
      shader.fragmentShader = SHEET_FRAGMENT_PRELUDE + shader.fragmentShader.replace("void main() {", /* glsl */ `void main() {
        ${ROUNDED_CORNERS}
      `);
    };

    const mesh = new THREE.Mesh(sheetGeometry, material);
    mesh.customDepthMaterial = depthMaterial;
    // Every sheet casts all the time, so shadows don't pop as pages settle.
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // The shader moves vertices far from the flat geometry's bounds.
    mesh.frustumCulled = false;
    book.add(mesh);

    return {
      mesh,
      material,
      depthMaterial,
      uniforms,
      progress: 0,
      flight: null,
      direction: 1,
      directionSmooth: 1,
      curve: { arc: 0, angleDeg: 0 },
      curveTarget: { arc: 0, angleDeg: 0 },
      hover: { amount: 0, y: 0 },
      flex: isCover ? COVER_FLEX : 1,
      skewJitter: (Math.random() * 2 - 1) * FOLD.skewJitter,
    };
  }

  const sheets = Array.from({ length: sheetCount }, (_, index) => createSheet(index));

  // ── Name sticker ──

  // A separate strip of mesh while it is being stuck on. Once flat it is
  // swapped for the cover texture that already has the sticker printed on it.
  function createSticker() {
    const { x, y, width, aspect: stickerAspect, rotation } = options.coverSticker;
    const height = width / stickerAspect;
    const geometry = new THREE.PlaneGeometry(width, height, STICKER.columns, STICKER.rows);
    const flat = Float32Array.from(geometry.attributes.position.array);
    const shineDirection = { value: new THREE.Vector3(0, 0, 1) };

    const material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, transparent: true, alphaTest: 0.01, opacity: 0 });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uShineDirection = shineDirection;
      shader.fragmentShader = "uniform vec3 uShineDirection;\n" + shader.fragmentShader.replace("#include <opaque_fragment>", /* glsl */ `
        float shine = pow(max(dot(normal, uShineDirection), 0.0), ${STICKER.shinePower.toFixed(1)});
        outgoingLight += ${STICKER.shine.toFixed(3)} * shine * (gl_FrontFacing ? 1.0 : 0.0);
        #include <opaque_fragment>
      `);
    };
    const depthMaterial = new THREE.MeshDepthMaterial({ alphaTest: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.customDepthMaterial = depthMaterial;
    mesh.castShadow = true;
    mesh.visible = false;
    mesh.renderOrder = 1;
    const home = new THREE.Vector3(x, (0.5 - y) * aspect, STICKER.clearance);
    const turn = -THREE.MathUtils.degToRad(rotation);
    book.add(mesh);

    // The press runs along the diagonal from the bottom-left corner to the top-right.
    const diagonal = Math.hypot(width, height);
    const along = new THREE.Vector2(width / diagonal, height / diagonal);
    return { mesh, geometry, material, depthMaterial, home, turn, width, height, flat, diagonal, along, shineDirection };
  }

  const sticker = createSticker();
  let stickerState: "waiting" | "sticking" | "done" = "waiting";
  let stickerStart = 0;

  // Lays the sticker out for `pressed` (0 = curled up off its bottom-left corner,
  // 1 = flat). The bend is confined to a band that travels along the diagonal as
  // the sticker is pressed down.
  const curlProfile = new Float32Array((STICKER.samples + 1) * 2);
  function curlSticker(pressed: number) {
    // Where each point along the diagonal ends up: distance along it, and height off the cover.
    const step = sticker.diagonal / STICKER.samples;
    const totalCurl = THREE.MathUtils.degToRad(STICKER.curl);
    let angle = 0;
    let reach = 0;
    let lift = 0;
    for (let sample = 1; sample <= STICKER.samples; sample++) {
      // How much of this stretch is still lifted, from 0 behind the press to 1 ahead of it
      const position = (sample - 0.5) / STICKER.samples;
      const lifted = clamp((position + STICKER.band - pressed * (1 + STICKER.band)) / STICKER.band, 0, 1);
      angle += (totalCurl / STICKER.samples) * lifted;
      reach += Math.cos(angle) * step;
      lift += Math.sin(angle) * step;
      curlProfile[sample * 2] = reach;
      curlProfile[sample * 2 + 1] = lift;
    }

    const position = sticker.geometry.attributes.position;
    const { flat, along } = sticker;
    const cornerX = -sticker.width / 2;
    const cornerY = -sticker.height / 2;
    for (let vertex = 0; vertex < position.count; vertex++) {
      const fromCornerX = flat[vertex * 3] - cornerX;
      const fromCornerY = flat[vertex * 3 + 1] - cornerY;
      const distance = fromCornerX * along.x + fromCornerY * along.y;
      const across = -fromCornerX * along.y + fromCornerY * along.x;
      const at = clamp(distance / step, 0, STICKER.samples);
      const sample = Math.min(Math.floor(at), STICKER.samples - 1);
      const blend = at - sample;
      const curledDistance = lerp(curlProfile[sample * 2], curlProfile[sample * 2 + 2], blend);
      const curledLift = lerp(curlProfile[sample * 2 + 1], curlProfile[sample * 2 + 3], blend);
      position.setXYZ(
        vertex,
        cornerX + along.x * curledDistance - along.y * across,
        cornerY + along.y * curledDistance + along.x * across,
        curledLift
      );
    }
    position.needsUpdate = true;
    sticker.geometry.computeVertexNormals();
  }

  function finishSticker() {
    if (stickerState === "done") return;
    stickerState = "done";
    sticker.mesh.visible = false;
    if (textures[0]) sheets[0].uniforms.uFrontMap.value = textures[0];
    // The stickers' shine eases in from here, rather than switching on.
    glossTarget = 1;
    invalidate();
  }

  function stickOn() {
    if (stickerState !== "waiting") return;
    if (reducedMotion) {
      finishSticker();
      return;
    }
    stickerState = "sticking";
    stickerStart = performance.now();
    invalidate();
  }

  const shineLean = new THREE.Vector3();

  // Returns whether the sticker is still on its way down.
  function updateSticker(now: number) {
    if (stickerState !== "sticking") return false;
    const elapsed = (now - stickerStart) / 1000;
    const arrived = easeOut(clamp(elapsed / STICKER.arriveTime, 0, 1));
    const pressed = easeInOut(clamp((elapsed - STICKER.arriveTime * 0.5) / STICKER.pressTime, 0, 1));
    curlSticker(pressed);
    sticker.mesh.visible = true;
    sticker.material.opacity = arrived;
    sticker.mesh.scale.setScalar(lerp(STICKER.startScale, 1, arrived));
    sticker.mesh.rotation.z = sticker.turn + (1 - arrived) * STICKER.startTurn;
    sticker.mesh.position.set(sticker.home.x, sticker.home.y + (1 - arrived) * STICKER.startRise, sticker.home.z);

    // The lifted part leans back toward the corner it is stuck by. Aim the
    // highlight at wherever it has bent through the shine angle.
    sticker.mesh.updateWorldMatrix(true, false);
    shineLean.set(-sticker.along.x, -sticker.along.y, 0).transformDirection(sticker.mesh.matrixWorld);
    sticker.shineDirection.value
      .set(0, 0, Math.cos(STICKER.shineAngle))
      .addScaledVector(shineLean, Math.sin(STICKER.shineAngle))
      .normalize();
    if (pressed >= 1) {
      finishSticker();
      return false;
    }
    return true;
  }

  // ── State ──

  let phase: "rest" | "opening" | "open" | "closing" = "rest";
  // How many sheets are (or are on their way to being) turned over.
  let current = 0;
  // Whichever host the canvas is in right now.
  let host = restHost;
  // Where the closed cover belongs, in the current host's pixels, and its CSS rotation.
  const origin = { x: 0, y: 0, rotation: REST.rotation };
  const travel = { value: 0, velocity: 0, target: 0 };
  // How loosely the single layout's folded pages sit (1), down to squared up (0).
  let looseness = 1;
  let groundFade = 1;
  let returning = false;
  let onReturn: (() => void) | null = null;
  let resolveClose: (() => void) | null = null;

  let hostLeft = 0;
  let hostTop = 0;
  let viewportWidth = 1;
  let viewportHeight = 1;
  let unitPx = pageWidth;

  const pointer = { x: 0, y: 0, inside: false, isMouse: false };
  const tilt = { x: 0, y: 0 };
  let press: {
    x: number;
    y: number;
    zone: Zone | null;
    hotspot: JournalHotspot | null;
    moved: boolean;
    // Set once a held press has started turning pages on its own.
    holding: boolean;
  } | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let holdCount = 0;
  let drag: { index: number; forward: boolean; base: number; target: number } | null = null;

  let frame = 0;
  let lastTime = 0;
  let ready = false;
  let disposed = false;

  // ── Textures ──

  const loader = new THREE.TextureLoader();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures: (THREE.Texture | null)[] = sides.map(() => null);
  const requested = new Set<number>();

  function mapUniform(side: number) {
    if (single) return sheets[side].uniforms.uFrontMap;
    const { uniforms } = sheets[side >> 1];
    return side % 2 === 0 ? uniforms.uFrontMap : uniforms.uBackMap;
  }

  function loadSide(side: number) {
    if (side >= sides.length || requested.has(side)) return;
    requested.add(side);
    loader.load(
      sides[side],
      (texture) => {
        if (disposed || !requested.has(side)) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        renderer.initTexture(texture);
        textures[side] = texture;
        // The cover stays bare until its sticker has been stuck on.
        if (side !== 0 || stickerState === "done") mapUniform(side).value = texture;
        checkReady();
        invalidate();
      },
      undefined,
      (error) => {
        if (!disposed) options.onError(error);
      }
    );
  }

  // The single layout's back cover belongs to no page, so it is loaded once and kept.
  let backCoverTexture: THREE.Texture | null = null;
  if (single && options.backCover) {
    loader.load(options.backCover, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      backCoverTexture = texture;
      sheets[sheetCount - 1].uniforms.uBackMap.value = texture;
      invalidate();
    });
  }

  function checkReady() {
    if (ready || !bareCoverTexture || !sticker.material.map) return;
    if (![0, 1, 2].every((first) => first >= sides.length || textures[first])) return;
    ready = true;
    // Draw the resting cover, which also compiles the shaders ahead of the first open.
    update(0, performance.now());
    renderer.render(scene, camera);
    options.onReady();
  }

  function loadExtra(src: string, onLoad: (texture: THREE.Texture) => void) {
    loader.load(
      src,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        renderer.initTexture(texture);
        onLoad(texture);
        checkReady();
        invalidate();
      },
      undefined,
      (error) => {
        if (!disposed) options.onError(error);
      }
    );
  }

  let bareCoverTexture: THREE.Texture | null = null;
  loadExtra(options.coverBare, (texture) => {
    bareCoverTexture = texture;
    if (stickerState !== "done") sheets[0].uniforms.uFrontMap.value = texture;
  });
  loadExtra(options.coverSticker.src, (texture) => {
    sticker.material.map = texture;
    sticker.material.needsUpdate = true;
    sticker.depthMaterial.map = texture;
    sticker.depthMaterial.needsUpdate = true;
  });

  function unloadSide(side: number) {
    if (!requested.delete(side)) return;
    textures[side]?.dispose();
    textures[side] = null;
    mapUniform(side).value = paper;
  }

  // Keep the spreads around the open one in memory and drop the rest. The first
  // sheets always stay, since closing the book lands on them without warning.
  function updateTextureWindow(unload = true) {
    // A sheet carries two sides in a spread and one in the single layout.
    const perSheet = single ? 1 : 2;
    const reach = 2 / perSheet;
    for (let index = 0; index < sheetCount; index++) {
      const distance = Math.min(Math.abs(index - current), Math.abs(index - (current - 1)));
      if (distance <= TEXTURES.loadRadius * reach) {
        for (let face = 0; face < perSheet; face++) loadSide(index * perSheet + face);
      } else if (unload && distance > TEXTURES.keepRadius * reach && index >= TEXTURES.pinnedSheets * reach) {
        for (let face = 0; face < perSheet; face++) unloadSide(index * perSheet + face);
      }
    }
  }

  // ── Pointer ──

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const bookInverse = new THREE.Matrix4();
  const localRay = new THREE.Ray();

  // Where the pointer hits the book's own plane, in page widths from the spine.
  function pointerToBook(clientX: number, clientY: number): Point | null {
    const rect = canvas.getBoundingClientRect();
    hostLeft = rect.left;
    hostTop = rect.top;
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    book.updateWorldMatrix(true, false);
    localRay.copy(raycaster.ray).applyMatrix4(bookInverse.copy(book.matrixWorld).invert());
    if (Math.abs(localRay.direction.z) < 1e-6) return null;
    const distance = -localRay.origin.z / localRay.direction.z;
    return {
      x: localRay.origin.x + localRay.direction.x * distance,
      y: localRay.origin.y + localRay.direction.y * distance,
    };
  }

  // The sheet a press at `point` would turn, or null when it misses the book.
  function zoneAt(point: Point | null): Zone | null {
    if (!point || Math.abs(point.y) > halfHeight) return null;
    if (single) {
      // One page on screen: its right half turns on, its left half turns back.
      if (point.x < 0 || point.x > 1) return null;
      if (current === 0 || point.x >= 0.5) return { sheet: current, forward: true };
      return { sheet: current - 1, forward: false };
    }
    if (point.x >= 0 && point.x <= 1 && current < sheetCount) return { sheet: current, forward: true };
    if (point.x < 0 && point.x >= -1 && current > 0) return { sheet: current - 1, forward: false };
    return null;
  }

  function isAtRest() {
    return !drag && sheets.every((sheet) => !sheet.flight);
  }

  function hotspotAt(point: Point, zone: Zone): JournalHotspot | null {
    if (!isAtRest()) return null;
    const side = single ? current : zone.forward ? zone.sheet * 2 : zone.sheet * 2 + 1;
    const u = single || zone.forward ? point.x : 1 + point.x;
    const v = 0.5 - point.y / aspect;
    return hotspots.find((spot) =>
      spot.side === side && u >= spot.x && u <= spot.x + spot.width && v >= spot.y && v <= spot.y + spot.height
    ) ?? null;
  }

  // ── Curl ──

  // Limits the curl so a sharply folded corner never rolls past itself.
  function maxArcFor(angleDeg: number) {
    const angle = THREE.MathUtils.degToRad(Math.abs(angleDeg));
    const curlLength = 1 - halfHeight * Math.sin(angle);
    return CURL.cornerRollMax / (Math.PI * (Math.cos(angle) / curlLength));
  }

  // The page folds toward whichever corner the pointer is pulling.
  function curveAt(point: Point): Curve {
    let degrees = THREE.MathUtils.radToDeg(Math.atan2(point.y, point.x));
    if (degrees > 90) degrees = 180 - degrees;
    if (degrees < -90) degrees = -180 - degrees;
    const angleDeg = clamp(
      -(degrees / 90) * CURL.maxAngleDeg * Math.hypot(point.x, point.y),
      -CURL.maxAngleDeg,
      CURL.maxAngleDeg
    );
    return { arc: Math.min(CURL.arc, maxArcFor(angleDeg)), angleDeg };
  }

  function setCurve(sheet: Sheet, curve: Curve, immediate: boolean) {
    sheet.curveTarget = curve;
    if (immediate) sheet.curve = { ...curve };
  }

  // ── Turning ──

  function startFlight(index: number, to: number, seconds: number, delayMs = 0, ease = easeInOut) {
    const sheet = sheets[index];
    sheet.flight = {
      from: null,
      to,
      start: performance.now() + delayMs,
      duration: seconds * 1000 * (reducedMotion ? 0.6 : 1),
      ease,
    };
  }

  function turn(index: number, forward: boolean, point: Point) {
    const sheet = sheets[index];
    const resting = !sheet.flight && (sheet.progress < SETTLE || sheet.progress > 1 - SETTLE);
    setCurve(sheet, curveAt(point), resting);
    sheet.direction = forward ? 1 : -1;
    current = forward ? index + 1 : index;
    startFlight(index, forward ? 1 : 0, FLIP.time);
    updateTextureWindow();
    invalidate();
  }

  // Keyboard turns have no pointer to follow, so vary the fold a little.
  function keyboardPoint(forward: boolean): Point {
    return { x: forward ? 0.9 : -0.9, y: (Math.random() - 0.5) * 0.7 };
  }

  // Leafs every turned page back, top of the pile first, ending on the cover.
  function rewind(seconds = CLOSE.time) {
    const turned = current;
    const stagger = Math.min(CLOSE.staggerMs, CLOSE.maxStaggerTotalMs / Math.max(turned, 1));
    for (let index = turned - 1; index >= 0; index--) {
      startFlight(index, 0, seconds, (turned - 1 - index) * stagger);
    }
    current = 0;
    // The pages on their way back are still on screen, so nothing is unloaded here.
    updateTextureWindow(false);
    invalidate();
  }

  function flipNext() {
    if (phase !== "open" || drag || current >= maxTurned) return;
    turn(current, true, keyboardPoint(true));
  }

  function flipPrev() {
    if (phase !== "open" || drag || current <= 0 || isComingFullCircle()) return;
    turn(current - 1, false, keyboardPoint(false));
  }

  function stopHold() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
  }

  // Turns the next page in the held direction, then queues another.
  function holdTurn(forward: boolean) {
    holdTimer = null;
    if (!press || press.moved || phase !== "open") return;
    if (forward ? current >= maxTurned : current <= 0) return;
    press.holding = true;
    drag = null;
    turn(forward ? current : current - 1, forward, keyboardPoint(forward));
    const speed = Math.min(holdCount++ / HOLD.speedUpSheets, 1);
    holdTimer = setTimeout(() => holdTurn(forward), lerp(HOLD.firstGapMs, HOLD.fastestGapMs, speed));
  }

  // In the single layout, turning the last page brings the cover back to the
  // top. While the folded pages square up behind it, input waits.
  function isComingFullCircle() {
    return single && current === sheetCount;
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || phase !== "open" || isComingFullCircle()) return;
    const point = pointerToBook(event.clientX, event.clientY);
    const zone = zoneAt(point);
    const hotspot = point && zone ? hotspotAt(point, zone) : null;
    press = { x: event.clientX, y: event.clientY, zone, hotspot, moved: false, holding: false };

    if (point && zone && !hotspot) {
      const sheet = sheets[zone.sheet];
      const resting = !sheet.flight && (sheet.progress < SETTLE || sheet.progress > 1 - SETTLE);
      setCurve(sheet, curveAt(point), resting);
      sheet.flight = null;
      sheet.direction = zone.forward ? 1 : -1;
      drag = { index: zone.sheet, forward: zone.forward, base: sheet.progress, target: sheet.progress };
      const { forward } = zone;
      holdCount = 0;
      stopHold();
      holdTimer = setTimeout(() => holdTurn(forward), HOLD.delayMs);
    }
    canvas.setPointerCapture(event.pointerId);
    invalidate();
  }

  function onPointerMove(event: PointerEvent) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.inside = true;
    pointer.isMouse = event.pointerType === "mouse";

    if (press) {
      const dx = event.clientX - press.x;
      const dy = event.clientY - press.y;
      if (!press.holding && dx * dx + dy * dy > FLIP.clickSlopPx * FLIP.clickSlopPx) press.moved = true;
      if (press.moved) stopHold();
      if (drag && press.moved) {
        drag.target = clamp(drag.base - dx / (unitPx * FLIP.dragPages), 0, 1);
        const point = pointerToBook(event.clientX, event.clientY);
        if (point) setCurve(sheets[drag.index], curveAt(point), false);
      }
    }
    invalidate();
  }

  function releasePress(event: PointerEvent, cancelled: boolean) {
    if (!press) return;
    const { zone, hotspot, moved, holding } = press;
    const held = drag;
    press = null;
    drag = null;
    stopHold();
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    invalidate();

    // A held press has already turned its pages; letting go just stops it.
    if (holding) return;

    if (!held) {
      if (cancelled || moved) return;
      if (hotspot) options.onHotspot(hotspot);
      else if (!zone) options.onDismiss();
      return;
    }


    if (!moved && !cancelled) {
      turn(held.index, held.forward, pointerToBook(event.clientX, event.clientY) ?? keyboardPoint(held.forward));
      return;
    }

    // A drag commits once it has carried the sheet far enough; otherwise it falls back.
    const advanced = held.forward ? held.target - held.base : held.base - held.target;
    const committed = !cancelled && advanced >= FLIP.commitProgress;
    const endsTurned = held.forward === committed;
    sheets[held.index].direction = endsTurned ? 1 : -1;
    current = endsTurned ? held.index + 1 : held.index;
    startFlight(held.index, endsTurned ? 1 : 0, FLIP.time * 0.8, 0, easeOut);
    updateTextureWindow();
  }

  const onPointerUp = (event: PointerEvent) => releasePress(event, false);
  const onPointerCancel = (event: PointerEvent) => releasePress(event, true);
  const onPointerLeave = () => {
    pointer.inside = false;
    invalidate();
  };

  // ── Frame ──

  function resize() {
    viewportWidth = host.clientWidth || 1;
    viewportHeight = host.clientHeight || 1;

    // Same fit as the page itself: shrink until an open spread fits the viewport.
    const scale = Math.min(
      1,
      (stageHost.clientWidth - SPREAD_MARGIN_PX) / (pageWidth * (single ? 1 + FOLD.margin : 2)),
      (stageHost.clientHeight - SPREAD_MARGIN_PX) / pageHeight
    );
    unitPx = pageWidth * Math.max(scale, 0.1);
    if (phase === "rest") {
      origin.x = viewportWidth / 2;
      origin.y = viewportHeight / 2;
    }

    camera.aspect = viewportWidth / viewportHeight;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(viewportHeight / unitPx / (2 * CAMERA_DISTANCE)));
    camera.updateProjectionMatrix();

    const pixelRatio = Math.min(window.devicePixelRatio, 2, Math.sqrt(MAX_CANVAS_PIXELS / (viewportWidth * viewportHeight)));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(viewportWidth, viewportHeight, false);
    invalidate();
  }

  function applySheet(sheet: Sheet, stackDepth: number, openness: number, turnedBefore: number) {
    const { uniforms, curve } = sheet;
    // A spread turns a page half way round. The single layout swings it over and
    // then rolls it under, overlapping the two so the motion stays continuous.
    // The swing leads from the very start, so a page never curls down into the ones beneath it.
    const swing01 = single ? Math.sin(clamp(sheet.progress / FOLD.swingEnd, 0, 1) * Math.PI * 0.5) : sheet.progress;
    const roll01 = single ? smooth(clamp((sheet.progress - FOLD.rollStart) / (1 - FOLD.rollStart), 0, 1)) : 0;
    const flipAngle = swing01 * Math.PI;
    // The trailing curl belongs to the swing-over. It eases out as the page rolls
    // under, or its lag would tip the page down through the ones already folded.
    const bendAngle = Math.sin(sheet.progress * Math.PI) * Math.PI * curve.arc * sheet.flex * (1 - roll01);
    const foldAngle = THREE.MathUtils.degToRad(curve.angleDeg * sheet.flex);
    const cosFold = Math.cos(foldAngle);
    const sinFold = Math.sin(foldAngle);
    const curlLength = 1 - halfHeight * Math.sin(Math.abs(foldAngle));
    const curlStart = 1 - curlLength;

    // A curled sheet's fore-edge trails behind its spine, so lead the swing by
    // half of that lag to keep the turn feeling tied to its progress.
    const cornerReach = Math.max(0, cosFold + sinFold * halfHeight * Math.sign(sinFold) - curlStart);
    const cornerAngle = (cornerReach / curlLength) * bendAngle;
    const lag = Math.abs(cornerAngle) < 1e-4 ? 0 : cornerReach * ((1 - Math.cos(cornerAngle)) / cornerAngle);
    // In the single layout the page must never tip past flat, or it would dip
    // under the pages already folded round the spine.
    const swing = Math.min(flipAngle + 0.5 * sheet.directionSmooth * lag, single ? Math.PI : Infinity);

    uniforms.uBendAngle.value = bendAngle;
    uniforms.uFold.value.set(cosFold, sinFold);
    uniforms.uCurl.value.set(curlStart, curlLength);
    uniforms.uFlipRotation.value.set(Math.cos(swing), Math.sin(swing));
    uniforms.uDirection.value = sheet.directionSmooth;
    // Squared up, a folded page sits exactly where it would in the closed stack.
    // A page still on its way round keeps a wide roll until it is nearly home,
    // so it always wraps outside the pages already folded.
    const ownLooseness = Math.max(looseness, 1 - Math.pow(roll01, 4));
    const rollRadius = lerp(SHEET_GAP * turnedBefore * 0.5, FOLD.radius + FOLD.radiusStep * turnedBefore, ownLooseness);
    uniforms.uRoll.value.set(Math.PI * roll01, Math.PI * Math.max(rollRadius, 1e-4));
    uniforms.uSkew.value = roll01 * looseness * THREE.MathUtils.degToRad(
      FOLD.skew + FOLD.skewStep * Math.min(turnedBefore, FOLD.skewStepMax) + sheet.skewJitter
    );
    // A page on its way round the spine rides a hair above the folded ones it passes over.
    const clearance = single ? 0.75 * Math.sin(sheet.progress * Math.PI) : 0;
    uniforms.uDepth.value = SHEET_GAP * (stackDepth - clearance);
    // Pages folded under lie flat against each other, so only the facing stack lifts at the gutter.
    uniforms.uLift.value = GUTTER_LIFT * openness * sheet.flex * (1 - roll01) * (0.3 + 0.7 * Math.exp(-0.4 * stackDepth));
    uniforms.uHover.value.set(HOVER.lift * sheet.hover.amount * Math.max(sheet.flex, 0.5), HOVER.bias * sheet.hover.y);
    uniforms.uCrease.value = openness * clamp(1 - sheet.progress * 4, 0, 1);

  }

  // Advances everything by `dt` seconds. Returns whether anything is still moving.
  function update(dt: number, now: number) {
    let active = false;

    // Sheets in flight.
    for (const sheet of sheets) {
      const flight = sheet.flight;
      if (!flight) continue;
      active = true;
      if (now < flight.start) continue;
      flight.from ??= sheet.progress;
      const span = Math.max(0.25, Math.abs(flight.to - flight.from));
      const t = clamp((now - flight.start) / (flight.duration * span), 0, 1);
      sheet.direction = flight.to >= flight.from ? 1 : -1;
      sheet.progress = lerp(flight.from, flight.to, flight.ease(t));
      if (t >= 1) sheet.flight = null;
    }

    // The sheet under the pointer.
    if (drag) {
      const sheet = sheets[drag.index];
      sheet.progress += (drag.target - sheet.progress) * (1 - Math.pow(0.01, dt / FLIP.dragSmoothTime));
      active = true;
    }

    const resting = phase === "rest";
    const interactive = (phase === "open" || resting) && pointer.inside;
    const hoverPoint = interactive ? pointerToBook(pointer.x, pointer.y) : null;
    // Anywhere over the resting cover lifts it; the open book lifts the page under the cursor.
    const hoverZone = resting ? (hoverPoint ? { sheet: 0, forward: true } : null) : zoneAt(hoverPoint);
    const hoverHotspot = !resting && hoverPoint && hoverZone ? hotspotAt(hoverPoint, hoverZone) : null;
    canvas.style.cursor = hoverZone ? "pointer" : "";

    // Everything else settles onto its stack; the page under the cursor lifts a little.
    const canPeek = hoverZone && (hoverZone.forward || !single);
    // The cover doesn't lift under the cursor until its sticker is on, since the sticker couldn't follow it.
    const settled = !resting || stickerState === "done";
    const peek = hoverZone && canPeek && settled && !hoverHotspot && !press && pointer.isMouse && !reducedMotion ? hoverZone : null;
    const peekProgress = (resting ? REST.peekProgress : PEEK.progress) * (single ? FOLD.peekScale : 1);
    const restEase = 1 - Math.pow(0.001, dt / PEEK.smoothTime);
    sheets.forEach((sheet, index) => {
      if (sheet.flight || drag?.index === index) return;
      const stack = index < current ? 1 : 0;
      let target = stack;
      if (peek?.sheet === index && hoverPoint) {
        target = stack === 0 ? peekProgress : 1 - peekProgress;
        setCurve(sheet, curveAt(hoverPoint), Math.abs(sheet.progress - stack) < SETTLE);
      }
      const remaining = target - sheet.progress;
      if (Math.abs(remaining) < SETTLE) {
        sheet.progress = target;
      } else {
        sheet.progress += remaining * restEase;
        active = true;
      }
      sheet.direction = stack === 1 && sheet.progress !== stack ? -1 : 1;
      sheet.directionSmooth = sheet.direction;
    });

    // A sheet can never be further over than the one on top of it.
    for (let index = 1; index < sheetCount; index++) {
      sheets[index].progress = Math.min(sheets[index].progress, sheets[index - 1].progress);
    }

    // Every page folded round means the cover is on top again. The pile squares
    // up as the last page goes over, and once that lands it is exactly a closed
    // book, so it can start over as one.
    if (single) {
      const last = sheets[sheetCount - 1];
      looseness = 1 - smooth(clamp((last.progress - FOLD.squareUpStart) / (FOLD.squareUpEnd - FOLD.squareUpStart), 0, 1));
      if (isComingFullCircle() && !last.flight && last.progress > 1 - SETTLE) {
        for (const sheet of sheets) {
          sheet.progress = 0;
          sheet.direction = 1;
          sheet.directionSmooth = 1;
        }
        current = 0;
        looseness = 1;
        updateTextureWindow();
      }
    }

    const curveEase = 1 - Math.pow(0.001, dt / CURL.smoothTime);
    const directionEase = 1 - Math.pow(0.001, dt / CURL.directionSmoothTime);
    let turned = 0;
    for (const sheet of sheets) turned += sheet.progress;
    const openness = clamp(turned, 0, 1) * (single ? looseness : clamp(sheetCount - turned, 0, 1));
    // Turned pages swing beneath the book in the single layout, so the ground's shadow fades out while it's open.
    const wantGround = !single || turned < SETTLE ? 1 : 0;
    groundFade += (wantGround - groundFade) * (1 - Math.pow(0.001, dt / 0.4));
    if (Math.abs(wantGround - groundFade) > 0.005) active = true;
    else groundFade = wantGround;
    groundMaterial.opacity = GROUND_SHADOW * groundFade;
    ground.visible = groundFade > 0;

    if (updateSticker(now)) active = true;

    glossAmount.value += (glossTarget - glossAmount.value) * (1 - Math.pow(0.001, dt / GLOSS.fadeInTime));
    if (Math.abs(glossTarget - glossAmount.value) > 0.002) active = true;
    else glossAmount.value = glossTarget;

    const hoverEase = 1 - Math.pow(0.001, dt / HOVER.smoothTime);
    const hoverY = hoverPoint ? clamp(hoverPoint.y / halfHeight, -1, 1) : 0;

    let above = 0;
    sheets.forEach((sheet, index) => {
      const hovered = peek?.sheet === index && hoverPoint !== null && !sheet.flight;
      const wantHover = hovered ? 1 : 0;
      if (hovered) sheet.hover.y += (hoverY - sheet.hover.y) * hoverEase;
      sheet.hover.amount += (wantHover - sheet.hover.amount) * hoverEase;
      if (Math.abs(wantHover - sheet.hover.amount) > SETTLE || (hovered && Math.abs(hoverY - sheet.hover.y) > SETTLE)) active = true;

      const midTurn = sheet.progress > SETTLE && sheet.progress < 1 - SETTLE;
      sheet.curve.arc += (sheet.curveTarget.arc - sheet.curve.arc) * curveEase;
      sheet.curve.angleDeg += (sheet.curveTarget.angleDeg - sheet.curve.angleDeg) * curveEase;
      sheet.directionSmooth += (sheet.direction - sheet.directionSmooth) * directionEase;
      if (midTurn && Math.abs(sheet.direction - sheet.directionSmooth) > SETTLE) active = true;

      // Sheets above this one on the right-hand stack, and on the left-hand one.
      const aboveOnRight = above;
      // Turned sheets pile up on the left in a spread. In the single layout the
      // roll itself carries them under the book, so they need no extra depth.
      const turnedBefore = index - above;
      const aboveOnLeft = single ? 0 : turned - turnedBefore - sheet.progress;
      above += 1 - sheet.progress;
      applySheet(sheet, lerp(aboveOnRight, aboveOnLeft, sheet.progress), openness, turnedBefore);
    });

    book.position.x = single
      ? -0.5 + 0.5 * FOLD.margin * smooth(sheets[0].progress) * looseness
      : -0.5 * (1 - smooth(sheets[0].progress)) + 0.5 * smooth(sheets[sheetCount - 1].progress);

    // Travel between the page and the centre of the screen.
    if (phase === "closing" && !returning && sheets[0].progress < 0.3) {
      returning = true;
      travel.target = 0;
      onReturn?.();
      onReturn = null;
    }
    for (let step = dt; step > 0; step -= 1 / 120) {
      const h = Math.min(step, 1 / 120);
      travel.velocity += (TRAVEL.stiffness * (travel.target - travel.value) - TRAVEL.damping * travel.velocity) * h;
      travel.value += travel.velocity * h;
    }
    const travelling = Math.abs(travel.target - travel.value) > 5e-4 || Math.abs(travel.velocity) > 5e-3;
    if (travelling) {
      active = true;
    } else {
      travel.value = travel.target;
      travel.velocity = 0;
    }
    if (phase === "opening" && travel.value > 0.9) phase = "open";

    const tilting = interactive && pointer.isMouse && !reducedMotion;
    const tiltGain = resting ? REST.tilt : 1;
    const tiltX = clamp(((pointer.y - hostTop) / viewportHeight - 0.5) * 2, -1, 1);
    const tiltY = clamp(((pointer.x - hostLeft) / viewportWidth - 0.5) * 2, -1, 1);
    const wantTiltX = tilting ? tiltX * TILT.x * tiltGain : 0;
    const wantTiltY = tilting ? tiltY * TILT.y * tiltGain : 0;
    const tiltEase = 1 - Math.pow(0.001, dt / TILT.smoothTime);
    tilt.x += (wantTiltX - tilt.x) * tiltEase;
    tilt.y += (wantTiltY - tilt.y) * tiltEase;
    if (Math.abs(wantTiltX - tilt.x) + Math.abs(wantTiltY - tilt.y) > SETTLE) active = true;

    // At rest the cover swings the other way under the cursor, as the DOM cover did.
    if (resting) {
      const wantRotation = pointer.inside && pointer.isMouse ? REST.hoverRotation : REST.rotation;
      origin.rotation += (wantRotation - origin.rotation) * (1 - Math.pow(0.001, dt / REST.rotationSmoothTime));
      if (Math.abs(wantRotation - origin.rotation) > SETTLE) active = true;
    }

    const t = travel.value;
    rig.position.set(
      lerp((origin.x - viewportWidth / 2) / unitPx, 0, t),
      lerp((viewportHeight / 2 - origin.y) / unitPx, 0, t),
      0
    );
    rig.scale.setScalar(lerp(restWidth / unitPx, 1, t));
    rig.rotation.set(tilt.x, tilt.y, lerp(-origin.rotation, 0, t));

    // Keep the shadow map centred on the book wherever it travels.
    sun.target.position.copy(rig.position);
    sun.position.copy(sunDirection).multiplyScalar(6).add(rig.position);

    return active;
  }

  function tick(time: number) {
    frame = 0;
    if (disposed) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 1 / 20) : 1 / 60;
    lastTime = time;

    const active = update(dt, performance.now());
    renderer.render(scene, camera);

    if (phase === "closing" && returning && !active) {
      // Landed: hand the canvas back to the page.
      phase = "rest";
      origin.rotation = REST.rotation;
      pointer.inside = false;
      mount(restHost);
      lastTime = 0;
      resolveClose?.();
      resolveClose = null;
      return;
    }
    if (active) invalidate();
    else lastTime = 0;
  }

  function invalidate() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }

  // ── Lifecycle ──

  // Moves the canvas into `next` and redraws before the browser paints, so the
  // book never appears to jump between the page and the stage.
  function mount(next: HTMLElement) {
    host = next;
    host.appendChild(canvas);
    canvas.style.pointerEvents = host === stageHost ? "auto" : "none";
    resize();
    update(0, performance.now());
    renderer.render(scene, camera);
  }

  function hover(point: { x: number; y: number } | null) {
    if (phase !== "rest") return;
    pointer.inside = point !== null;
    pointer.isMouse = true;
    if (point) {
      pointer.x = point.x;
      pointer.y = point.y;
    }
    invalidate();
  }

  function open() {
    if (phase !== "rest") return;
    finishSticker();
    // Carry the cover across from where it rests to the same spot on the stage.
    const from = restHost.getBoundingClientRect();
    const stage = stageHost.getBoundingClientRect();
    origin.x = from.left + from.width / 2 - stage.left;
    origin.y = from.top + from.height / 2 - stage.top;
    phase = "opening";
    press = null;
    drag = null;
    returning = false;
    travel.target = 1;
    pointer.inside = false;
    updateTextureWindow();
    lastTime = 0;
    mount(stageHost);
    invalidate();
  }

  function close(onReturnStart: () => void) {
    if (phase === "rest" || phase === "closing") return Promise.resolve();
    const to = restHost.getBoundingClientRect();
    const stage = stageHost.getBoundingClientRect();
    origin.x = to.left + to.width / 2 - stage.left;
    origin.y = to.top + to.height / 2 - stage.top;
    origin.rotation = REST.rotation;
    phase = "closing";
    stopHold();
    press = null;
    drag = null;
    returning = false;
    onReturn = onReturnStart;
    rewind();
    return new Promise<void>((resolve) => { resolveClose = resolve; });
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(restHost);
  resizeObserver.observe(stageHost);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", invalidate);

  mount(restHost);
  updateTextureWindow();

  function dispose() {
    disposed = true;
    stopHold();
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerCancel);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", invalidate);
    for (const sheet of sheets) {
      sheet.material.dispose();
      sheet.depthMaterial.dispose();
    }
    for (const texture of textures) texture?.dispose();
    (bareCoverTexture as THREE.Texture | null)?.dispose();
    sticker.material.map?.dispose();
    sticker.material.dispose();
    sticker.depthMaterial.dispose();
    sticker.geometry.dispose();
    (backCoverTexture as THREE.Texture | null)?.dispose();
    paper.dispose();
    sheetGeometry.dispose();
    groundGeometry.dispose();
    groundMaterial.dispose();
    sun.shadow.map?.dispose();
    renderer.dispose();
    canvas.remove();
    resolveClose?.();
  }

  return { stickOn, hover, open, close, flipNext, flipPrev, dispose };
}
