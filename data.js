// 技術検証用データ（開発ステップ1）。
// 三角形2つは外接矩形が完全に重なるので、VoiceOverが図形どおりに判定するかを見分けられる。
const ARTWORKS = [
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
