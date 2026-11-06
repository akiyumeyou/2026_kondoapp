const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const SHAPE_COORDINATE_SCALE = 1000;
// VoiceOver用の部品の細かさ。細かいほど形に忠実だが、同じエリア内で読み直しが増える。
const CELL_COLUMNS = 12;
const CELL_ROWS = 16;

const SOUND_PITCHES = {
  high: { frequency: 1046, wave: "sine" },
  mid: { frequency: 660, wave: "triangle" },
  low: { frequency: 262, wave: "triangle" },
  soft: { frequency: 523, wave: "sine" },
};

const startScreen = document.getElementById("start-screen");
const viewScreen = document.getElementById("view-screen");
const stageWrap = document.getElementById("stage-wrap");
const stage = document.getElementById("stage");
const artworkImage = document.getElementById("artwork-image");
const shapeLayer = document.getElementById("shape-layer");
const cellLayer = document.getElementById("cell-layer");
const artworkTitle = document.getElementById("artwork-title");
const touchStatus = document.getElementById("touch-status");
const overviewLive = document.getElementById("overview-live");
const overviewButton = document.getElementById("overview-button");
const nextButton = document.getElementById("next-button");

let audioContext = null;
let japaneseVoice = null;
let isVoiceOverMode = false;
let currentArtworkIndex = 0;
let currentAreaId = null;
let isOverviewOpen = false;

function findJapaneseVoice() {
  const voices = speechSynthesis.getVoices();
  japaneseVoice = voices.find((voice) => voice.lang === "ja-JP") || voices.find((voice) => voice.lang.startsWith("ja")) || null;
}

function speak(text, onEnd) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  if (japaneseVoice) utterance.voice = japaneseVoice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  speechSynthesis.speak(utterance);
}

// iPhone Safari は利用者の操作の中で一度鳴らさないと、以後の音声・効果音が出ない。
function unlockAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  speechSynthesis.speak(new SpeechSynthesisUtterance(""));
}

function playAreaSound(soundType) {
  const pitch = SOUND_PITCHES[soundType];
  if (!audioContext || !pitch) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = pitch.wave;
  oscillator.frequency.value = pitch.frequency;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.16);
}

function currentArtwork() {
  return ARTWORKS[currentArtworkIndex];
}

function isPointInPolygon(x, y, polygon) {
  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) isInside = !isInside;
  }
  return isInside;
}

// priority の小さいもの（手前）を優先する。
function findAreaAt(x, y) {
  const areasFrontToBack = [...currentArtwork().areas].sort((first, second) => first.priority - second.priority);
  return areasFrontToBack.find((area) => isPointInPolygon(x, y, area.polygon)) || null;
}

function fitStageToScreen() {
  const aspect = currentArtwork().aspect;
  let width = stageWrap.clientWidth;
  let height = width / aspect;
  if (height > stageWrap.clientHeight) {
    height = stageWrap.clientHeight;
    width = height * aspect;
  }
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
}

function renderShapes(artwork) {
  shapeLayer.replaceChildren();
  if (artwork.image) return;
  const areasBackToFront = [...artwork.areas].sort((first, second) => second.priority - first.priority);
  for (const area of areasBackToFront) {
    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute("points", area.polygon.map(([x, y]) => `${x * SHAPE_COORDINATE_SCALE},${y * SHAPE_COORDINATE_SCALE}`).join(" "));
    polygon.setAttribute("fill", area.testColor);
    polygon.dataset.areaId = area.id;
    shapeLayer.appendChild(polygon);
  }
}

// SVGの図形はVoiceOver上で位置がずれるため、エリアを格子に分け、同じエリアの隣り合うマスを長方形にまとめてHTMLで置く。
function buildAreaRectangles() {
  const rectangles = [];
  let openRectangles = new Map();
  for (let row = 0; row < CELL_ROWS; row++) {
    const runs = [];
    for (let column = 0; column < CELL_COLUMNS; column++) {
      const area = findAreaAt((column + 0.5) / CELL_COLUMNS, (row + 0.5) / CELL_ROWS);
      const lastRun = runs[runs.length - 1];
      if (area && lastRun && lastRun.area === area && lastRun.columnEnd === column) {
        lastRun.columnEnd = column + 1;
      } else if (area) {
        runs.push({ area, columnStart: column, columnEnd: column + 1 });
      }
    }
    const nextOpenRectangles = new Map();
    for (const run of runs) {
      const key = `${run.area.id}:${run.columnStart}:${run.columnEnd}`;
      const continuing = openRectangles.get(key);
      if (continuing) {
        continuing.rowEnd = row + 1;
        nextOpenRectangles.set(key, continuing);
      } else {
        const rectangle = { ...run, rowStart: row, rowEnd: row + 1 };
        rectangles.push(rectangle);
        nextOpenRectangles.set(key, rectangle);
      }
    }
    openRectangles = nextOpenRectangles;
  }
  return rectangles;
}

function renderCells(artwork) {
  cellLayer.replaceChildren();
  cellLayer.classList.toggle("debug", !artwork.image);
  for (const rectangle of buildAreaRectangles()) {
    const cell = document.createElement("div");
    cell.setAttribute("role", "img");
    cell.setAttribute("aria-label", `${rectangle.area.name}。${rectangle.area.short}`);
    cell.style.left = `${(rectangle.columnStart / CELL_COLUMNS) * 100}%`;
    cell.style.width = `${((rectangle.columnEnd - rectangle.columnStart) / CELL_COLUMNS) * 100}%`;
    cell.style.top = `${(rectangle.rowStart / CELL_ROWS) * 100}%`;
    cell.style.height = `${((rectangle.rowEnd - rectangle.rowStart) / CELL_ROWS) * 100}%`;
    cellLayer.appendChild(cell);
  }
}

function showArtwork(index) {
  currentArtworkIndex = index;
  currentAreaId = null;
  const artwork = currentArtwork();
  if (artwork.image) {
    artworkImage.src = artwork.image;
    artworkImage.hidden = false;
  } else {
    artworkImage.removeAttribute("src");
    artworkImage.hidden = true;
  }
  renderShapes(artwork);
  renderCells(artwork);
  fitStageToScreen();
  closeOverview();
  touchStatus.textContent = "";
  // VoiceOverモードでは aria-live の見出しをVoiceOverが読むので、アプリからは読まない。
  artworkTitle.textContent = `${artwork.title}　${artwork.artist}　${artwork.year}`;
  if (!isVoiceOverMode) speak(`${artwork.title}。${artwork.artist}。${artwork.year}。`);
}

function highlightShape(areaId) {
  for (const polygon of shapeLayer.children) {
    polygon.classList.toggle("active", polygon.dataset.areaId === areaId);
  }
}

function handleTouchPosition(event) {
  if (isVoiceOverMode) return;
  const stageRectangle = stage.getBoundingClientRect();
  const x = (event.clientX - stageRectangle.left) / stageRectangle.width;
  const y = (event.clientY - stageRectangle.top) / stageRectangle.height;
  const area = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? findAreaAt(x, y) : null;
  const areaId = area ? area.id : null;
  if (areaId === currentAreaId) return;
  currentAreaId = areaId;
  highlightShape(areaId);
  if (!area) {
    touchStatus.textContent = "";
    return;
  }
  closeOverview();
  playAreaSound(area.sound);
  speak(`${area.name}。${area.short}`);
  touchStatus.textContent = `${area.name}：${area.short}`;
}

function handleTouchEnd() {
  currentAreaId = null;
  highlightShape(null);
}

function closeOverview() {
  if (isOverviewOpen && !isVoiceOverMode) speechSynthesis.cancel();
  isOverviewOpen = false;
  overviewLive.textContent = "";
  overviewButton.setAttribute("aria-pressed", "false");
  overviewButton.textContent = "作品の説明";
}

function openOverview() {
  isOverviewOpen = true;
  overviewButton.setAttribute("aria-pressed", "true");
  overviewButton.textContent = "説明を止める";
  const overview = currentArtwork().overview;
  if (isVoiceOverMode) {
    overviewLive.textContent = overview;
  } else {
    speak(overview, () => {
      if (isOverviewOpen) closeOverview();
    });
  }
}

function toggleOverview() {
  if (isOverviewOpen) closeOverview();
  else openOverview();
}

function playGuide() {
  unlockAudio();
  speak(document.getElementById("guide-text").textContent.trim());
}

function startViewing(useVoiceOver) {
  isVoiceOverMode = useVoiceOver;
  if (useVoiceOver) speechSynthesis.cancel();
  else unlockAudio();
  startScreen.hidden = true;
  viewScreen.hidden = false;
  showArtwork(0);
}

findJapaneseVoice();
speechSynthesis.addEventListener("voiceschanged", findJapaneseVoice);

document.getElementById("guide-button").addEventListener("click", playGuide);
document.getElementById("start-voiceover-button").addEventListener("click", () => startViewing(true));
document.getElementById("start-speech-button").addEventListener("click", () => startViewing(false));
overviewButton.addEventListener("click", toggleOverview);
nextButton.addEventListener("click", () => showArtwork((currentArtworkIndex + 1) % ARTWORKS.length));

stage.addEventListener("pointerdown", handleTouchPosition);
stage.addEventListener("pointermove", handleTouchPosition);
stage.addEventListener("pointerup", handleTouchEnd);
stage.addEventListener("pointercancel", handleTouchEnd);
stage.addEventListener("pointerleave", handleTouchEnd);
window.addEventListener("resize", () => {
  if (!viewScreen.hidden) fitStageToScreen();
});
