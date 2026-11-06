// エリアの座標は画像に対する相対値（0〜1）。priority が小さいほど手前で、重なりでは優先される。
// sound: high=空・背景 / mid=物 / low=地面・机 / soft=人物
const PAINTINGS = [
  {
    id: "mona-lisa",
    title: "モナ・リザ",
    artist: "レオナルド・ダ・ヴィンチ",
    year: "1503年ごろから",
    image: "images/monariza.jpg",
    aspect: 899 / 1400,
    overview: "縦長の絵の中央に、一人の女性が胸から上を見せて座っています。体は少し左を向き、顔はこちらに向けて、口元にかすかなほほえみを浮かべています。長い髪は肩まで垂れ、暗い緑の服に薄い布をはおっています。両手は絵の下のほうで、右手を左手の上に重ねて組んでいます。女性の後ろには、霧がかかったような山と川の風景が遠くまで広がり、上は淡い空です。全体は茶色と緑の落ち着いた色で、輪郭をぼかした柔らかな描き方が特徴です。",
    areas: [
      { id: "face", name: "顔", short: "かすかにほほえむ顔", polygon: [[0.46, 0.13], [0.56, 0.15], [0.59, 0.22], [0.58, 0.30], [0.53, 0.35], [0.46, 0.36], [0.39, 0.32], [0.35, 0.25], [0.37, 0.17]], sound: "soft", priority: 1 },
      { id: "chest", name: "首と胸元", short: "刺しゅうのある襟元", polygon: [[0.40, 0.35], [0.57, 0.34], [0.64, 0.45], [0.66, 0.55], [0.30, 0.56], [0.34, 0.44]], sound: "soft", priority: 1 },
      { id: "hands", name: "組んだ手", short: "右手を左手の上に重ねた両手", polygon: [[0.22, 0.79], [0.33, 0.74], [0.45, 0.74], [0.57, 0.79], [0.58, 0.88], [0.40, 0.93], [0.24, 0.92], [0.19, 0.86]], sound: "soft", priority: 1 },
      { id: "hair", name: "髪", short: "肩まで垂れる長い髪", polygon: [[0.45, 0.08], [0.60, 0.10], [0.69, 0.20], [0.72, 0.45], [0.66, 0.50], [0.28, 0.50], [0.27, 0.40], [0.29, 0.20], [0.35, 0.10]], sound: "soft", priority: 2 },
      { id: "clothes", name: "服", short: "暗い緑の服と薄い布", polygon: [[0.00, 0.62], [0.20, 0.52], [0.70, 0.47], [0.90, 0.56], [1.00, 0.68], [1.00, 1.00], [0.00, 1.00]], sound: "mid", priority: 3 },
      { id: "sky", name: "空", short: "淡くかすんだ空", polygon: [[0.00, 0.00], [1.00, 0.00], [1.00, 0.17], [0.00, 0.17]], sound: "high", priority: 4 },
      { id: "left-landscape", name: "左の風景", short: "山と、遠くの湖", polygon: [[0.00, 0.17], [0.32, 0.17], [0.30, 0.52], [0.00, 0.62]], sound: "high", priority: 4 },
      { id: "right-landscape", name: "右の風景", short: "岩山と、曲がりくねった道", polygon: [[0.68, 0.17], [1.00, 0.17], [1.00, 0.68], [0.70, 0.47]], sound: "high", priority: 4 },
    ],
  },
  {
    id: "the-scream",
    title: "叫び",
    artist: "エドヴァルド・ムンク",
    year: "1893年",
    image: "images/sakebi.jpg",
    aspect: 1083 / 1400,
    overview: "夕暮れの橋の上で、一人の人物が両手で頬を押さえ、口を大きく開けています。人物は絵の下の中央にいて、こちらを向いています。顔は骸骨のように細く、目と口は丸く開いています。橋の手すりは、左上から右下へ斜めに走っています。左奥の橋の上には、黒い服の二人が歩いています。背景には青黒い入り江が渦を巻くように広がり、その上の空は、赤とオレンジの帯がうねるように流れています。全体が波打つような線で描かれ、不安な気持ちが景色全体に広がっているように感じられます。",
    areas: [
      { id: "screaming-person", name: "叫ぶ人", short: "両手で頬を押さえ、口を開けた人", polygon: [[0.47, 0.46], [0.56, 0.46], [0.60, 0.55], [0.62, 0.66], [0.63, 0.85], [0.62, 1.00], [0.38, 1.00], [0.39, 0.80], [0.42, 0.66], [0.45, 0.55]], sound: "soft", priority: 1 },
      { id: "two-people", name: "奥の二人", short: "橋の向こうを歩く黒い服の二人", polygon: [[0.00, 0.32], [0.12, 0.32], [0.12, 0.54], [0.00, 0.54]], sound: "soft", priority: 1 },
      { id: "bridge", name: "橋と手すり", short: "左上から右下へ斜めに走る橋", polygon: [[0.00, 0.45], [0.12, 0.47], [0.50, 0.62], [1.00, 0.85], [1.00, 1.00], [0.00, 1.00]], sound: "low", priority: 2 },
      { id: "fjord", name: "入り江", short: "渦を巻く青黒い入り江と丘", polygon: [[0.00, 0.31], [1.00, 0.25], [1.00, 0.85], [0.50, 0.62], [0.12, 0.47], [0.00, 0.45]], sound: "mid", priority: 3 },
      { id: "sky", name: "空", short: "赤とオレンジがうねる夕焼け", polygon: [[0.00, 0.00], [1.00, 0.00], [1.00, 0.25], [0.00, 0.31]], sound: "high", priority: 3 },
    ],
  },
  {
    id: "sunflowers",
    title: "ひまわり",
    artist: "フィンセント・ファン・ゴッホ",
    year: "1888年",
    image: "images/himawari.jpg",
    aspect: 1114 / 1400,
    overview: "明るい水色の壁を背に、黄色い花瓶に十数本のひまわりが生けられています。花瓶は絵の下の中央、黄土色のテーブルの上にあります。花は花瓶から上と左右へ大きく広がり、満開の花もあれば、花びらが落ちて種だけになった花や、しおれて垂れ下がった花もあります。中央には大きな丸い花があり、右には赤い芯の花と、下へ垂れる小さな花があります。花瓶には画家のサインがあります。絵全体が黄色を中心に描かれ、厚く盛り上がった絵の具の筆の跡が、花びらの一枚一枚に勢いを与えています。",
    areas: [
      { id: "center-flower", name: "中央の大きな花", short: "丸く大きな花", polygon: [[0.54, 0.22], [0.64, 0.25], [0.68, 0.33], [0.64, 0.42], [0.54, 0.45], [0.44, 0.42], [0.40, 0.33], [0.44, 0.25]], sound: "mid", priority: 1 },
      { id: "vase", name: "花瓶", short: "黄色い花瓶。画家のサイン入り", polygon: [[0.37, 0.62], [0.70, 0.62], [0.73, 0.75], [0.69, 0.95], [0.38, 0.97], [0.34, 0.78]], sound: "mid", priority: 2 },
      { id: "upper-flowers", name: "上の花々", short: "上へ広がる満開の花", polygon: [[0.10, 0.05], [0.95, 0.04], [0.98, 0.25], [0.70, 0.25], [0.44, 0.22], [0.32, 0.33], [0.08, 0.33]], sound: "mid", priority: 2 },
      { id: "right-flowers", name: "右の花々", short: "赤い芯の花と、垂れ下がる小さな花", polygon: [[0.68, 0.25], [0.98, 0.25], [0.97, 0.50], [0.92, 0.68], [0.73, 0.68], [0.68, 0.45]], sound: "mid", priority: 2 },
      { id: "left-flowers", name: "左の花々", short: "しおれかけた花と、種の見える花", polygon: [[0.02, 0.36], [0.33, 0.33], [0.36, 0.66], [0.12, 0.66], [0.04, 0.55]], sound: "mid", priority: 2 },
      { id: "lower-flowers", name: "花瓶の口の花々", short: "花瓶からあふれる、花びらの落ちた花", polygon: [[0.33, 0.42], [0.70, 0.42], [0.74, 0.62], [0.33, 0.64]], sound: "mid", priority: 3 },
      { id: "table", name: "テーブル", short: "黄土色のテーブル", polygon: [[0.00, 0.79], [1.00, 0.79], [1.00, 1.00], [0.00, 1.00]], sound: "low", priority: 4 },
      { id: "wall", name: "壁", short: "明るい水色の壁", polygon: [[0.00, 0.00], [1.00, 0.00], [1.00, 0.79], [0.00, 0.79]], sound: "high", priority: 4 },
    ],
  },
];

// 技術検証用（URL末尾に ?test を付けると表示）。三角形2つは外接矩形が重なるので、形どおりに判定できるかを見分けられる。
const TEST_ARTWORKS = [
  {
    id: "test-shapes",
    title: "テスト図形1",
    artist: "検証用",
    year: "2026年",
    image: null,
    aspect: 0.8,
    overview: "検証用の図形です。上に長方形が2つ、下に斜めに区切った三角形が2つあります。",
    areas: [
      { id: "sky", name: "空", short: "上の長方形", polygon: [[0, 0], [1, 0], [1, 0.25], [0, 0.25]], sound: "high", priority: 1, testColor: "#7ec8e3" },
      { id: "town", name: "町", short: "二番目の長方形", polygon: [[0, 0.25], [1, 0.25], [1, 0.5], [0, 0.5]], sound: "mid", priority: 1, testColor: "#f2c14e" },
      { id: "mountain", name: "山", short: "左下の三角形", polygon: [[0, 0.5], [1, 0.5], [0, 1]], sound: "low", priority: 1, testColor: "#5fa55a" },
      { id: "sea", name: "海", short: "右下の三角形", polygon: [[1, 0.5], [1, 1], [0, 1]], sound: "soft", priority: 1, testColor: "#3c6e9f" },
    ],
  },
  {
    id: "test-overlap",
    title: "テスト図形2",
    artist: "検証用",
    year: "2026年",
    image: null,
    aspect: 0.8,
    overview: "重なりの検証です。背景の中央に、ひし形の太陽が重なっています。太陽のほうが優先されます。",
    areas: [
      { id: "background", name: "背景", short: "全体に広がる背景", polygon: [[0, 0], [1, 0], [1, 1], [0, 1]], sound: "low", priority: 2, testColor: "#c9b8e8" },
      { id: "sun", name: "太陽", short: "中央のひし形", polygon: [[0.5, 0.25], [0.8, 0.5], [0.5, 0.75], [0.2, 0.5]], sound: "high", priority: 1, testColor: "#f28c28" },
    ],
  },
];

const URL_PARAMETERS = new URLSearchParams(location.search);
const ARTWORKS = URL_PARAMETERS.has("test") ? TEST_ARTWORKS : PAINTINGS;
// ?debug を付けると、名画の上にエリアを半透明で重ねて表示する（座標調整用）。
const SHOW_AREA_OUTLINES = URL_PARAMETERS.has("debug") || URL_PARAMETERS.has("test");
