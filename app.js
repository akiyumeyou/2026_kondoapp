const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const AREA_COORDINATE_SCALE = 1000;

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
const areaLayer = document.getElementById("area-layer");
const artworkTitle = document.getElementById("artwork-title");
const touchStatus = document.getElementById("touch-status");
const overviewButton = document.getElementById("overview-button");
const nextButton = document.getElementById("next-button");

let audioContext = null;
let japaneseVoice = null;
let currentArtworkIndex = 0;
let currentAreaId = null;
let isOverviewSpeaking = false;

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

function stopSpeaking() {
  speechSynthesis.cancel();
  setOverviewSpeaking(false);
}

// iPhone Safari は利用者の操作の中で一度鳴らさないと、以後の音声・効果音が出ない。
function unlockAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  const silentUtterance = new SpeechSynthesisUtterance("");
  speechSynthesis.speak(silentUtterance);
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

function fitStageToScreen() {
  const aspect = currentArtwork().aspect;
  const availableWidth = stageWrap.clientWidth;
  const availableHeight = stageWrap.clientHeight;
  let width = availableWidth;
  let height = width / aspect;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspect;
  }
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
}

function toPointsAttribute(polygon) {
  return polygon.map(([x, y]) => `${x * AREA_COORDINATE_SCALE},${y * AREA_COORDINATE_SCALE}`).join(" ");
}

// 後に描いた図形が手前になるので、priority の大きい順（奥）から描く。
function renderAreas(artwork) {
  areaLayer.replaceChildren();
  const areasBackToFront = [...artwork.areas].sort((first, second) => second.priority - first.priority);
  for (const area of areasBackToFront) {
    const polygon = document.createElementNS(SVG_NAMESPACE, "polygon");
    polygon.setAttribute("points", toPointsAttribute(area.polygon));
    polygon.setAttribute("role", "img");
    polygon.setAttribute("aria-label", `${area.name}。${area.short}`);
    polygon.setAttribute("fill", artwork.image ? "rgba(0,0,0,0)" : area.testColor);
    polygon.dataset.areaId = area.id;
    areaLayer.appendChild(polygon);
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
  renderAreas(artwork);
  fitStageToScreen();
  artworkTitle.textContent = `${artwork.title}　${artwork.artist}　${artwork.year}`;
  touchStatus.textContent = "";
  stopSpeaking();
  speak(`${artwork.title}。${artwork.artist}。${artwork.year}。`);
}

function findAreaAtPoint(clientX, clientY) {
  const element = document.elementFromPoint(clientX, clientY);
  if (!element || !element.dataset || !element.dataset.areaId) return null;
  return currentArtwork().areas.find((area) => area.id === element.dataset.areaId) || null;
}

function highlightArea(areaId) {
  for (const polygon of areaLayer.children) {
    polygon.classList.toggle("active", polygon.dataset.areaId === areaId);
  }
}

function handleTouchPosition(event) {
  const area = findAreaAtPoint(event.clientX, event.clientY);
  const areaId = area ? area.id : null;
  if (areaId === currentAreaId) return;
  currentAreaId = areaId;
  highlightArea(areaId);
  if (!area) {
    touchStatus.textContent = "";
    return;
  }
  setOverviewSpeaking(false);
  playAreaSound(area.sound);
  speak(`${area.name}。${area.short}`);
  touchStatus.textContent = `${area.name}：${area.short}`;
}

function handleTouchEnd() {
  currentAreaId = null;
  highlightArea(null);
}

function setOverviewSpeaking(isSpeaking) {
  isOverviewSpeaking = isSpeaking;
  overviewButton.setAttribute("aria-pressed", String(isSpeaking));
  overviewButton.textContent = isSpeaking ? "説明を止める" : "作品の説明";
}

function toggleOverview() {
  if (isOverviewSpeaking) {
    stopSpeaking();
    return;
  }
  setOverviewSpeaking(true);
  speak(currentArtwork().overview, () => setOverviewSpeaking(false));
}

function playGuide() {
  unlockAudio();
  speak(document.getElementById("guide-text").textContent.trim());
}

function startViewing() {
  unlockAudio();
  startScreen.hidden = true;
  viewScreen.hidden = false;
  showArtwork(0);
}

findJapaneseVoice();
speechSynthesis.addEventListener("voiceschanged", findJapaneseVoice);

document.getElementById("guide-button").addEventListener("click", playGuide);
document.getElementById("start-button").addEventListener("click", startViewing);
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
