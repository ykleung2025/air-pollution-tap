var STICKERS = {
  car: '<svg class="art" viewBox="0 0 220 130" aria-hidden="true">' +
    '<ellipse cx="118" cy="118" rx="70" ry="8" fill="rgba(36,48,68,0.15)"/>' +
    '<g class="smoke">' +
      '<circle class="puff" cx="28" cy="78" r="9" fill="#c5d0d8"/>' +
      '<circle class="puff" cx="16" cy="62" r="7" fill="#d5dee6"/>' +
      '<circle class="puff" cx="34" cy="52" r="8" fill="#b7c3cc"/>' +
    "</g>" +
    '<path d="M78 78 L96 46 H148 L166 78 Z" fill="#b7e3f7" stroke="#243044" stroke-width="3" stroke-linejoin="round"/>' +
    '<rect x="58" y="72" width="132" height="34" rx="12" fill="#f25d55" stroke="#243044" stroke-width="3"/>' +
    '<circle cx="196" cy="84" r="5" fill="#ffe08a" stroke="#243044" stroke-width="2"/>' +
    '<g class="wheel"><circle cx="92" cy="108" r="14" fill="#243044"/><circle cx="92" cy="108" r="6" fill="#eef3f7"/></g>' +
    '<g class="wheel"><circle cx="164" cy="108" r="14" fill="#243044"/><circle cx="164" cy="108" r="6" fill="#eef3f7"/></g>' +
    "</svg>",

  bus: '<svg class="art" viewBox="0 0 240 130" aria-hidden="true">' +
    '<ellipse cx="120" cy="118" rx="78" ry="8" fill="rgba(36,48,68,0.15)"/>' +
    '<rect x="28" y="36" width="180" height="68" rx="16" fill="#f6c445" stroke="#243044" stroke-width="3"/>' +
    '<rect x="46" y="50" width="28" height="22" rx="4" fill="#b7e3f7" stroke="#243044" stroke-width="3"/>' +
    '<rect x="84" y="50" width="28" height="22" rx="4" fill="#b7e3f7" stroke="#243044" stroke-width="3"/>' +
    '<rect x="122" y="50" width="28" height="22" rx="4" fill="#b7e3f7" stroke="#243044" stroke-width="3"/>' +
    '<rect x="168" y="62" width="22" height="42" rx="4" fill="#fff6df" stroke="#243044" stroke-width="3"/>' +
    '<g class="wheel"><circle cx="78" cy="108" r="14" fill="#243044"/><circle cx="78" cy="108" r="6" fill="#eef3f7"/></g>' +
    '<g class="wheel"><circle cx="176" cy="108" r="14" fill="#243044"/><circle cx="176" cy="108" r="6" fill="#eef3f7"/></g>' +
    "</svg>",

  bike: '<svg class="art" viewBox="0 0 200 140" aria-hidden="true">' +
    '<ellipse cx="100" cy="128" rx="62" ry="7" fill="rgba(36,48,68,0.15)"/>' +
    '<g class="wheel"><circle cx="48" cy="108" r="22" fill="none" stroke="#243044" stroke-width="4"/><circle cx="48" cy="108" r="4" fill="#243044"/></g>' +
    '<g class="wheel"><circle cx="150" cy="108" r="22" fill="none" stroke="#243044" stroke-width="4"/><circle cx="150" cy="108" r="4" fill="#243044"/></g>' +
    '<path d="M48 108 L92 108 L118 70 L150 108 L92 108 L104 70" fill="none" stroke="#3cba78" stroke-width="4" stroke-linejoin="round"/>' +
    '<circle cx="118" cy="40" r="12" fill="#ffd2b0" stroke="#243044" stroke-width="3"/>' +
    '<path d="M118 54 L108 86" fill="none" stroke="#2f6fbf" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M112 66 L136 74" fill="none" stroke="#243044" stroke-width="3" stroke-linecap="round"/>' +
    "</svg>",

  factory: '<svg class="art" viewBox="0 0 120 180" aria-hidden="true">' +
    '<ellipse cx="60" cy="168" rx="28" ry="7" fill="rgba(36,48,68,0.15)"/>' +
    '<g class="smoke">' +
      '<circle class="puff" cx="52" cy="36" r="13" fill="#1a1a1a"/>' +
      '<circle class="puff" cx="34" cy="18" r="10" fill="#111"/>' +
      '<circle class="puff" cx="70" cy="14" r="11" fill="#2b2b2b"/>' +
    "</g>" +
    '<rect x="44" y="42" width="28" height="118" rx="4" fill="#8d6b5a" stroke="#243044" stroke-width="3"/>' +
    '<rect x="38" y="36" width="40" height="12" rx="3" fill="#6d5348" stroke="#243044" stroke-width="3"/>' +
    "</svg>",

  fire: '<svg class="art" viewBox="0 0 180 150" aria-hidden="true">' +
    '<ellipse cx="90" cy="138" rx="58" ry="8" fill="rgba(36,48,68,0.15)"/>' +
    '<g class="smoke">' +
      '<circle class="puff" cx="78" cy="28" r="10" fill="#c5d0d8"/>' +
      '<circle class="puff" cx="98" cy="16" r="8" fill="#d5dee6"/>' +
      '<circle class="puff" cx="64" cy="14" r="7" fill="#b7c3cc"/>' +
    "</g>" +
    '<path class="flame" d="M70 108 C70 70 96 62 90 36 C108 62 124 70 116 108 Z" fill="#ff8a2a" stroke="#243044" stroke-width="3" stroke-linejoin="round"/>' +
    '<path class="flame flame-b" d="M86 108 C86 82 100 74 98 56 C110 74 118 84 112 108 Z" fill="#ffd15c"/>' +
    '<ellipse cx="92" cy="118" rx="46" ry="16" fill="#a56b3c" stroke="#243044" stroke-width="3"/>' +
    '<rect x="62" y="108" width="22" height="8" rx="2" fill="#6b4423" transform="rotate(-12 73 112)"/>' +
    "</svg>",

  spray: '<svg class="art" viewBox="0 0 200 160" aria-hidden="true">' +
    '<ellipse cx="78" cy="148" rx="40" ry="7" fill="rgba(36,48,68,0.15)"/>' +
    '<g class="smoke">' +
      '<circle class="puff puff-mist" cx="156" cy="78" r="10" fill="#d5e7a8"/>' +
      '<circle class="puff puff-mist" cx="176" cy="64" r="8" fill="#e7f4c4"/>' +
      '<circle class="puff puff-mist" cx="150" cy="58" r="7" fill="#c5dc8e"/>' +
    "</g>" +
    '<circle cx="70" cy="36" r="16" fill="#ffd2b0" stroke="#243044" stroke-width="3"/>' +
    '<rect x="54" y="54" width="32" height="40" rx="12" fill="#2f6fbf" stroke="#243044" stroke-width="3"/>' +
    '<path class="leg" d="M64 94 L56 132" stroke="#243044" stroke-width="5" stroke-linecap="round"/>' +
    '<path class="leg leg-b" d="M78 94 L88 132" stroke="#243044" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="86" y="78" width="28" height="34" rx="6" fill="#7d8b86" stroke="#243044" stroke-width="3"/>' +
    '<path d="M114 88 H146" stroke="#5e6d7a" stroke-width="6" stroke-linecap="round"/>' +
    "</svg>",

  tree: '<svg class="art" viewBox="0 0 200 160" aria-hidden="true">' +
    '<ellipse cx="100" cy="148" rx="64" ry="8" fill="rgba(36,48,68,0.15)"/>' +
    '<ellipse cx="118" cy="132" rx="36" ry="12" fill="#6b4423" stroke="#243044" stroke-width="3"/>' +
    '<g class="sapling">' +
      '<rect x="132" y="92" width="8" height="36" rx="3" fill="#a56b3c" stroke="#243044" stroke-width="3"/>' +
      '<circle cx="136" cy="78" r="20" fill="#3cba78" stroke="#243044" stroke-width="3"/>' +
    "</g>" +
    '<circle cx="62" cy="48" r="16" fill="#ffd2b0" stroke="#243044" stroke-width="3"/>' +
    '<rect x="46" y="66" width="32" height="38" rx="12" fill="#0a6b40" stroke="#243044" stroke-width="3"/>' +
    '<path class="arm" d="M76 82 L112 104" stroke="#a56b3c" stroke-width="5" stroke-linecap="round"/>' +
    '<path class="leg" d="M56 104 L50 140" stroke="#243044" stroke-width="5" stroke-linecap="round"/>' +
    '<path class="leg leg-b" d="M72 104 L80 140" stroke="#243044" stroke-width="5" stroke-linecap="round"/>' +
    "</svg>"
};
