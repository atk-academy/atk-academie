/* ATK — Notre Crew : moteur de scène isométrique (style "Sims") en SVG pur.
   Palette volontairement réduite : noir / rouge / blanc. */
(function (global) {
  'use strict';

  var U = 56, ZH = 54;                       // largeur / hauteur d'une unité monde (px)
  var OUT = '#070303';
  var EDGE = 'stroke="rgba(0,0,0,.32)" stroke-width=".7" stroke-linejoin="round"';

  var C = {
    black: '#0b0606', coal: '#150a0a', char: '#1d0e0e', char2: '#2a1414', ash: '#3b2323',
    red: '#ff4136', red2: '#ff7a6e', deep: '#9c1a12', wine: '#4a0f0c',
    white: '#f5eceb', bone: '#d9cfcd', grey: '#7a5c5c'
  };

  /* ---------- couleurs ---------- */
  function h2r(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function r2h(r, g, b) { return '#' + [r, g, b].map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function shade(h, f) {
    var c = h2r(h);
    if (f <= 1) return r2h(c[0] * f, c[1] * f, c[2] * f);
    var t = f - 1; return r2h(c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t);
  }

  /* ---------- projection ---------- */
  var V = .5;                                 // facteur vertical de la caméra (.5 = iso haute ; plus petit = caméra plus basse)
  function P(x, y, z) { return [(x - y) * U, (x + y) * U * V - (z || 0) * ZH]; }
  function pts(a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
  function poly(a, fill, extra) { return '<polygon points="' + pts(a) + '" fill="' + fill + '" ' + (extra === undefined ? EDGE : extra) + '/>'; }

  // Plans "texturés" : le contenu est dessiné en coordonnées monde (u→droite, v→bas, 1 unité = 1 unité monde)
  function planeY(x, y, zTop, inner) { var p = P(x, y, zTop); return '<g transform="matrix(' + U + ',' + (U * V) + ',0,' + ZH + ',' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' + inner + '</g>'; }
  function planeX(x, yMax, zTop, inner) { var p = P(x, yMax, zTop); return '<g transform="matrix(' + U + ',' + (-U * V) + ',0,' + ZH + ',' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' + inner + '</g>'; }
  function planeF(x, y, z, inner) { var p = P(x, y, z); return '<g transform="matrix(' + U + ',' + (U * V) + ',' + (-U) + ',' + (U * V) + ',' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' + inner + '</g>'; }

  function box(x, y, z, w, d, h, col, o) {
    o = o || {};
    var t = o.top || shade(col, 1.32), l = o.left || shade(col, .86), r = o.right || shade(col, .58), s = '';
    s += poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], l);
    s += poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], r);
    s += poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], t);
    if (o.rim) s += '<polyline points="' + pts([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y, z + h]]) + '" fill="none" stroke="' + o.rim + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
    if (o.rimL) s += '<polyline points="' + pts([[x, y + d, z], [x, y + d, z + h]]) + '" fill="none" stroke="' + o.rimL + '" stroke-width="1.4"/>';
    return s;
  }

  /* =====================================================================
     PERSONNAGES
     ===================================================================== */
  function limb(p, w, col) {
    var d = 'M' + p.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L');
    return '<path d="' + d + '" fill="none" stroke="' + OUT + '" stroke-width="' + (w + 4) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function dot(p, r, col) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r + 2) + '" fill="' + OUT + '"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + col + '"/>'; }
  function shoe(p, col, sole) {
    return '<ellipse cx="' + (p[0] + 2) + '" cy="' + (p[1] + 3) + '" rx="11" ry="6.5" fill="' + OUT + '"/>' +
      '<ellipse cx="' + (p[0] + 2) + '" cy="' + (p[1] + 3) + '" rx="9" ry="4.6" fill="' + col + '"/>' +
      '<ellipse cx="' + (p[0] + 2) + '" cy="' + (p[1] + 5.4) + '" rx="9" ry="2" fill="' + (sole || C.white) + '"/>';
  }

  // Poses : coordonnées relatives au bassin (0,0). y négatif = vers le haut. Visage toujours tourné vers la caméra.
  var POSES = {
    arms_crossed: { S: [-1, -34], H: [-3, -61, -4], stand: true,
      legs: [[[-8, 0], [-11, 19], [-14, 37]], [[7, 0], [10, 19], [9, 38]]],
      arms: [[[-14, -32], [-18, -16], [6, -24]], [[14, -32], [18, -17], [-7, -21]]] },
    lounge: { S: [11, -27], H: [17, -52, -11], armsFirst: true,
      legs: [[[-6, 2], [-22, 9], [-38, 19]], [[6, 2], [24, 8], [42, 18]]],
      arms: [[[-14, -27], [-33, -30], [-50, -26]], [[16, -27], [25, -14], [23, -3]]] },
    lounge_l: { S: [-5, -28], H: [-9, -53, -12], armsFirst: true,
      legs: [[[-3, 3], [15, 12], [34, 20]], [[7, 1], [24, 9], [43, 16]]],
      arms: [[[-14, -26], [-30, -22], [-45, -13]], [[14, -26], [20, -12], [12, -4]]] },
    sit_game: { S: [3, -30], H: [5, -56, 4], props: 'pad',
      legs: [[[-6, 1], [-18, 14], [-15, 34]], [[6, 1], [18, 12], [17, 34]]],
      arms: [[[-14, -28], [-20, -15], [-5, -9]], [[14, -28], [20, -15], [5, -9]]] },
    cross_legs: { S: [0, -31], H: [1, -57, 3], props: 'laptop',
      legs: [[[-6, 0], [-30, 7], [-5, 14]], [[6, 0], [30, 7], [5, 14]]],
      arms: [[[-14, -29], [-22, -12], [-9, -3]], [[14, -29], [22, -12], [9, -3]]] },
    cook: { S: [0, -34], H: [0, -61, -2], props: 'mug', stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [9, 19], [10, 37]]],
      arms: [[[-14, -32], [-27, -20], [-15, -11]], [[14, -32], [28, -24], [22, -40]]] },
    lean_forward: { S: [10, -25], H: [18, -46, 14], props: 'pad',
      legs: [[[-6, 1], [-20, 12], [-17, 34]], [[6, 1], [18, 11], [17, 33]]],
      arms: [[[-2, -22], [-14, -6], [-18, 8]], [[20, -22], [22, -6], [12, 8]]] },
    pocket_lean: { S: [-9, -33], H: [-13, -58, -10], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [17, 17], [5, 36]]],
      arms: [[[-19, -31], [-25, -16], [-13, -5]], [[8, -32], [16, -17], [7, -5]]] },
    idle: { S: [0, -34], H: [-1, -61, -3], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [9, 19], [10, 37]]],
      arms: [[[-14, -32], [-17, -17], [-15, -3]], [[14, -32], [17, -17], [15, -3]]] },
    pockets: { S: [2, -34], H: [4, -61, 5], stand: true,
      legs: [[[-7, 0], [-10, 19], [-11, 37]], [[7, 0], [12, 18], [6, 37]]],
      arms: [[[-13, -32], [-21, -20], [-9, -13]], [[15, -32], [24, -20], [11, -13]]] },
    watch_l: { S: [2, -34], H: [7, -60, 14], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [9, 19], [10, 37]]],
      arms: [[[-13, -32], [-19, -17], [-14, -4]], [[15, -32], [22, -20], [13, -12]]] },
    watch_r: { S: [-2, -34], H: [-7, -60, -14], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [9, 19], [10, 37]]],
      arms: [[[-15, -32], [-22, -20], [-13, -12]], [[13, -32], [19, -17], [14, -4]]] },
    point: { S: [2, -34], H: [6, -60, 12], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [9, 19], [10, 37]]],
      arms: [[[-13, -32], [-19, -17], [-14, -4]], [[15, -32], [30, -34], [43, -39]]] },
    slouch: { S: [-5, -33], H: [-11, -58, -12], stand: true,
      legs: [[[-7, 0], [-10, 19], [-11, 37]], [[7, 0], [15, 18], [4, 37]]],
      arms: [[[-17, -31], [-21, -16], [-18, -3]], [[10, -32], [14, -17], [11, -4]]] },
    wall_lean: { S: [7, -34], H: [13, -60, 12], stand: true,
      legs: [[[-7, 0], [-9, 19], [-10, 37]], [[7, 0], [3, 19], [-9, 37]]],
      arms: [[[-13, -32], [-19, -17], [-15, -3]], [[17, -32], [25, -22], [13, -14]]] },
    dance: { S: [3, -34], H: [5, -61, 7], stand: true,
      legs: [[[-7, 0], [-13, 18], [-15, 37]], [[7, 0], [17, 16], [8, 36]]],
      arms: [[[-12, -33], [-30, -44], [-33, -68]], [[17, -33], [34, -48], [40, -72]]] },
    wave: { S: [4, -34], H: [7, -61, 9], stand: true,
      legs: [[[-7, 0], [-12, 19], [-13, 37]], [[7, 0], [7, 19], [16, 36]]],
      arms: [[[-12, -32], [-20, -18], [-9, -6]], [[16, -33], [33, -42], [34, -62]]] },
    bar_sit: { S: [-3, -31], H: [-6, -57, -6],
      legs: [[[-6, 0], [-14, 15], [-14, 35]], [[6, 0], [12, 13], [8, 35]]],
      arms: [[[-15, -29], [-27, -18], [-33, -9]], [[13, -29], [20, -17], [10, -12]]] },
    desk_type: { S: [0, -33], H: [0, -58, 0],
      legs: [[[-6, 1], [-14, 15], [-12, 33]], [[6, 1], [14, 15], [12, 33]]],
      arms: [[[-14, -31], [-24, -16], [-10, -5]], [[14, -31], [24, -16], [10, -5]]] }
  };

  var SKIN = { a: '#f3cdb0', b: '#e2b08a', c: '#bf875c', d: '#8f5d3b', e: '#f8dccb' };

  function hair(style, col) {
    var d = shade(col, .7);
    switch (style) {
      case 'bald': return '';
      case 'buzz': return '<path d="M-19 -3 C-20 -20 -8 -23 0 -23 C9 -23 20 -20 19 -3 C16 -11 8 -15 0 -15 C-8 -15 -16 -11 -19 -3Z" fill="' + col + '" opacity=".85"/>';
      case 'spiky': return '<path d="M-19 -3 L-23 -22 L-12 -15 L-10 -31 L-2 -19 L6 -33 L10 -18 L22 -26 L19 -3 C15 -11 8 -14 0 -14 C-8 -14 -15 -11 -19 -3Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4" stroke-linejoin="round"/>';
      case 'long': return '<path d="M-20 4 C-24 -22 -8 -27 0 -26 C9 -27 24 -22 20 4 L22 24 L12 22 L12 -2 C6 -9 -6 -9 -12 -2 L-12 22 L-22 24Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4" stroke-linejoin="round"/>';
      case 'curly': return [[-12, -14], [-3, -19], [7, -19], [14, -12], [-18, -5], [18, -5], [0, -13]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8.5" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.2"/>'; }).join('');
      case 'mohawk': return '<path d="M-19 -3 C-19 -14 -10 -17 0 -17 C10 -17 19 -14 19 -3 C14 -9 8 -11 0 -11 C-8 -11 -14 -9 -19 -3Z" fill="' + d + '"/><path d="M-5 -15 L-8 -35 L-1 -29 L5 -37 L6 -15Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.3" stroke-linejoin="round"/>';
      case 'slick': return '<path d="M-19 -2 C-22 -22 -4 -28 6 -26 C18 -24 22 -12 19 -2 C14 -11 6 -14 -2 -13 C-10 -13 -16 -9 -19 -2Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4" stroke-linejoin="round"/><path d="M-8 -20 C-2 -23 6 -22 10 -18" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35" stroke-linecap="round"/>';
      default: return '<path d="M-19.5 -1 C-22 -21 -7 -26 0 -26 C9 -26 22 -21 19.5 -1 C16 -10 8 -13 0 -12 C-8 -13 -16 -10 -19.5 -1Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4" stroke-linejoin="round"/>';
    }
  }

  function accessories(list, o) {
    var s = '';
    (list || []).forEach(function (a) {
      switch (a) {
        case 'cap': s += '<ellipse cx="3" cy="-4" rx="21" ry="5" fill="' + shade(o.cap, .7) + '" stroke="' + OUT + '" stroke-width="1.4"/><path d="M-20 -4 C-21 -28 21 -28 20 -4 C10 -9 -10 -9 -20 -4Z" fill="' + o.cap + '" stroke="' + OUT + '" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="-23" r="2" fill="' + OUT + '"/>'; break;
        case 'beanie': s += '<path d="M-20 -5 C-22 -30 22 -30 20 -5Z" fill="' + o.cap + '" stroke="' + OUT + '" stroke-width="1.5"/><rect x="-21" y="-9" width="42" height="9" rx="4" fill="' + shade(o.cap, 1.35) + '" stroke="' + OUT + '" stroke-width="1.4"/>'; break;
        case 'headphones': s += '<path d="M-21 -2 C-23 -30 23 -30 21 -2" fill="none" stroke="' + OUT + '" stroke-width="6" stroke-linecap="round"/><path d="M-21 -2 C-23 -30 23 -30 21 -2" fill="none" stroke="' + C.char2 + '" stroke-width="3.2" stroke-linecap="round"/><rect x="-26" y="-9" width="9" height="17" rx="4" fill="' + C.red + '" stroke="' + OUT + '" stroke-width="1.5"/><rect x="17" y="-9" width="9" height="17" rx="4" fill="' + C.red + '" stroke="' + OUT + '" stroke-width="1.5"/>'; break;
        case 'headset': s += '<path d="M-21 -2 C-23 -30 23 -30 21 -2" fill="none" stroke="' + OUT + '" stroke-width="6" stroke-linecap="round"/><path d="M-21 -2 C-23 -30 23 -30 21 -2" fill="none" stroke="' + C.coal + '" stroke-width="3.2" stroke-linecap="round"/><rect x="-26" y="-9" width="9" height="17" rx="4" fill="' + C.char2 + '" stroke="' + OUT + '" stroke-width="1.5"/><rect x="17" y="-9" width="9" height="17" rx="4" fill="' + C.char2 + '" stroke="' + OUT + '" stroke-width="1.5"/><path d="M-21 6 C-20 16 -10 20 -4 17" fill="none" stroke="' + OUT + '" stroke-width="3" stroke-linecap="round"/><circle cx="-3" cy="17" r="3" fill="' + C.red + '" stroke="' + OUT + '" stroke-width="1"/>'; break;
        case 'glasses': s += '<g fill="rgba(255,255,255,.12)" stroke="' + OUT + '" stroke-width="2"><rect x="-15" y="-7" width="12" height="10" rx="4"/><rect x="3" y="-7" width="12" height="10" rx="4"/></g><path d="M-3 -3 H3" stroke="' + OUT + '" stroke-width="2"/>'; break;
        case 'shades': s += '<g fill="' + OUT + '" stroke="' + OUT + '" stroke-width="1.5" stroke-linejoin="round"><rect x="-16" y="-8" width="14" height="10" rx="4"/><rect x="2" y="-8" width="14" height="10" rx="4"/></g><path d="M-2 -4 H2" stroke="' + OUT + '" stroke-width="2"/><path d="M-13 -6 l4 0 M5 -6 l4 0" stroke="#fff" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>'; break;
        case 'headband': s += '<path d="M-13.6 -5.6 C-7 -9.6 7 -9.6 13.6 -5.6 L13.6 -1.4 C7 -5.4 -7 -5.4 -13.6 -1.4Z" fill="' + o.cap + '"/><path d="M12.5 -4.6 L21 -8.4 L19.4 -1.6Z" fill="' + o.cap + '"/><path d="M12.8 -3 L19 1.5 L20.4 -3.5Z" fill="' + shade(o.cap, .75) + '"/>'; break;
        case 'bandana': s += '<path d="M-20 -8 C-10 -13 10 -13 20 -8 L20 -2 C10 -7 -10 -7 -20 -2Z" fill="' + o.cap + '" stroke="' + OUT + '" stroke-width="1.4"/><path d="M19 -6 L28 -12 L27 -2Z" fill="' + o.cap + '" stroke="' + OUT + '" stroke-width="1.2"/>'; break;
        case 'beard': s += '<path d="M-18 2 C-20 26 20 26 18 2 C13 12 6 14 0 14 C-6 14 -13 12 -18 2Z" fill="' + o.hair + '" stroke="' + OUT + '" stroke-width="1.3" stroke-linejoin="round"/>'; break;
        case 'stubble': s += '<path d="M-17 4 C-17 24 17 24 17 4 C12 14 -12 14 -17 4Z" fill="' + o.hair + '" opacity=".35"/>'; break;
      }
    });
    return s;
  }

  function face(mood, look) {
    look = look || 0;
    var eyes = '<ellipse cx="' + (-6.5 + look) + '" cy="-1" rx="2.4" ry="3.2" fill="' + OUT + '"/><ellipse cx="' + (6.5 + look) + '" cy="-1" rx="2.4" ry="3.2" fill="' + OUT + '"/>' +
      '<circle cx="' + (-5.6 + look) + '" cy="-2.2" r=".9" fill="#fff"/><circle cx="' + (7.4 + look) + '" cy="-2.2" r=".9" fill="#fff"/>';
    var brows = '<path d="M' + (-10 + look) + ' -7.5 l7 -1 M' + (3 + look) + ' -8.5 l7 1" stroke="' + OUT + '" stroke-width="1.7" stroke-linecap="round"/>';
    var mouth;
    if (mood === 'smirk') mouth = '<path d="M' + (-4 + look) + ' 9 Q' + (2 + look) + ' 12 ' + (7 + look) + ' 7" fill="none" stroke="' + OUT + '" stroke-width="1.8" stroke-linecap="round"/>';
    else if (mood === 'flat') mouth = '<path d="M' + (-4 + look) + ' 9.5 H' + (4 + look) + '" stroke="' + OUT + '" stroke-width="1.8" stroke-linecap="round"/>';
    else if (mood === 'open') mouth = '<path d="M' + (-5 + look) + ' 8 Q' + look + ' 16 ' + (5 + look) + ' 8Z" fill="' + OUT + '"/><path d="M' + (-3 + look) + ' 11 Q' + look + ' 13.5 ' + (3 + look) + ' 11" fill="' + C.red + '"/>';
    else mouth = '<path d="M' + (-5 + look) + ' 8 Q' + look + ' 13 ' + (5 + look) + ' 8" fill="none" stroke="' + OUT + '" stroke-width="1.8" stroke-linecap="round"/>';
    return eyes + brows + mouth;
  }

  function props(kind, pose, skin) {
    var s = '', hand;
    if (kind === 'pad') {
      s += '<g transform="translate(0,' + (pose.arms[0][2][1] - 2) + ')"><rect x="-11" y="-5" width="22" height="10" rx="5" fill="' + C.coal + '" stroke="' + OUT + '" stroke-width="1.5"/><circle cx="-5" cy="0" r="2" fill="' + C.red + '"/><circle cx="5" cy="-1" r="1.5" fill="' + C.white + '"/></g>';
    } else if (kind === 'laptop') {
      s += '<g transform="translate(0,-2)"><path d="M-17 -2 L-13 -18 L13 -18 L17 -2Z" fill="' + C.coal + '" stroke="' + OUT + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M-15 -4 L-12 -16 L12 -16 L15 -4Z" fill="' + C.red + '" opacity=".85"/><path d="M-19 0 L19 0 L21 5 L-21 5Z" fill="' + C.ash + '" stroke="' + OUT + '" stroke-width="1.5" stroke-linejoin="round"/></g>';
    } else if (kind === 'mug' || kind === 'glass') {
      hand = pose.arms[1][2];
      s += '<g transform="translate(' + hand[0] + ',' + hand[1] + ')"><rect x="-5" y="-9" width="10" height="13" rx="2.5" fill="' + (kind === 'mug' ? C.white : 'rgba(255,255,255,.35)') + '" stroke="' + OUT + '" stroke-width="1.5"/>' + (kind === 'glass' ? '<rect x="-4" y="-3" width="8" height="6" rx="1.5" fill="' + C.red + '" opacity=".9"/>' : '<path d="M5 -5 q5 1 0 7" fill="none" stroke="' + OUT + '" stroke-width="2"/>') + '</g>';
      s += dot(hand, 5.4, skin);
    }
    return s;
  }

  /* ---------- Bonhomme bâton « dark » : membres pleins, buste effilé, tête unie, liseré rouge façon contre-jour ---------- */
  var RIM = '#ff4a3d', BLK = '#0b0606';
  function rimmed(inner, col) { // forme noire + copie rouge décalée vers le haut-droit (liseré lumineux)
    return '<g transform="translate(1.7,-1.7)" opacity=".95">' + inner(RIM) + '</g>' + inner(col);
  }
  function sl(p, w, col) {
    var d = 'M' + p.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L');
    return rimmed(function (c) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }, col);
  }
  function sdisc(p, r, col) { return rimmed(function (c) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + c + '"/>'; }, col); }

  // accessoires redessinés pour fond noir (traits clairs), coordonnées de tête r≈14
  function sAcc(list, o) {
    var s = '';
    (list || []).forEach(function (a) {
      switch (a) {
        case 'cap': s += '<ellipse cx="2" cy="-2.2" rx="15.5" ry="3.2" fill="' + shade(o.cap, .62) + '"/><path d="M-14 -2.5 C-14.5 -18 14.5 -18 14 -2.5 C7 -6 -7 -6 -14 -2.5Z" fill="' + o.cap + '"/><path d="M-8 -12 C-3 -15 4 -15 9 -12" fill="none" stroke="#fff" stroke-width="1" opacity=".35" stroke-linecap="round"/>'; break;
        case 'beanie': s += '<path d="M-14 -4 C-15 -20 15 -20 14 -4Z" fill="' + o.cap + '"/><rect x="-14.6" y="-6.6" width="29.2" height="6.4" rx="3" fill="' + shade(o.cap, 1.5) + '"/><path d="M-11 -4.8 H11" stroke="#000" stroke-width=".8" opacity=".4"/>'; break;
        case 'headphones': s += '<path d="M-14.5 -1 C-16 -21 16 -21 14.5 -1" fill="none" stroke="#f5eceb" stroke-width="2.6" stroke-linecap="round"/><rect x="-18" y="-6" width="6" height="12" rx="3" fill="' + C.red + '"/><rect x="12" y="-6" width="6" height="12" rx="3" fill="' + C.red + '"/>'; break;
        case 'headset': s += '<path d="M-14.5 -1 C-16 -21 16 -21 14.5 -1" fill="none" stroke="#f5eceb" stroke-width="2.4" stroke-linecap="round"/><rect x="-18" y="-6" width="6" height="12" rx="3" fill="#2a1717" stroke="#f5eceb" stroke-width="1"/><rect x="12" y="-6" width="6" height="12" rx="3" fill="#2a1717" stroke="#f5eceb" stroke-width="1"/><path d="M-15 5 C-14 12 -8 14 -3 12" fill="none" stroke="#f5eceb" stroke-width="1.8" stroke-linecap="round"/><circle cx="-2.4" cy="12" r="2.3" fill="' + C.red + '"/>'; break;
        case 'glasses': s += '<g fill="none" stroke="#f5eceb" stroke-width="1.7"><rect x="-11.5" y="-4.6" width="9.4" height="7.2" rx="3"/><rect x="2.1" y="-4.6" width="9.4" height="7.2" rx="3"/></g><path d="M-2.1 -2 H2.1" stroke="#f5eceb" stroke-width="1.5"/>'; break;
        case 'shades': s += '<g fill="#000" stroke="#f5eceb" stroke-width="1.4" stroke-linejoin="round"><rect x="-12" y="-5.4" width="10.6" height="7.6" rx="2.6"/><rect x="1.4" y="-5.4" width="10.6" height="7.6" rx="2.6"/></g><path d="M-9 -3.6 l3 0 M4.5 -3.6 l3 0" stroke="' + C.red + '" stroke-width="1.3" stroke-linecap="round"/>'; break;
        case 'headband': s += '<path d="M-13.6 -5.6 C-7 -9.6 7 -9.6 13.6 -5.6 L13.6 -1.4 C7 -5.4 -7 -5.4 -13.6 -1.4Z" fill="' + o.cap + '"/><path d="M12.5 -4.6 L21 -8.4 L19.4 -1.6Z" fill="' + o.cap + '"/><path d="M12.8 -3 L19 1.5 L20.4 -3.5Z" fill="' + shade(o.cap, .75) + '"/>'; break;
        case 'bandana': s += '<path d="M-14 -7 C-7 -11 7 -11 14 -7 L14 -2.5 C7 -6.5 -7 -6.5 -14 -2.5Z" fill="' + o.cap + '"/><path d="M13 -6 L21 -11 L20 -2Z" fill="' + o.cap + '"/>'; break;
        case 'beard': s += '<path d="M-13 3 C-14 19 14 19 13 3 C9 10 4 11 0 11 C-4 11 -9 10 -13 3Z" fill="#3b2626"/>'; break;
        case 'stubble': s += '<path d="M-12 4 C-12 17 12 17 12 4 C8 11 -8 11 -12 4Z" fill="#3b2626" opacity=".55"/>'; break;
      }
    });
    return s;
  }

  // proportions adultes : on allonge le corps (debout : tout ×1.36 ; assis : buste/bras ×1.26, jambes inchangées)
  function scalePose(p) {
    var ku = p.stand ? 1.36 : 1.26, kl = p.stand ? 1.36 : 1.0;
    function sc(q, k) { return [q[0], q[1] * k]; }
    var Sy = p.S[1] * ku, Hy = Sy - 18;
    return { S: sc(p.S, ku), H: [p.S[0] + (p.H[0] - p.S[0]) * .6, Hy, p.H[2]], props: p.props, armsFirst: p.armsFirst, armsLast: p.armsLast, stand: p.stand,
      legs: p.legs.map(function (l) { return l.map(function (q) { return sc(q, kl); }); }),
      arms: p.arms.map(function (a) { return a.map(function (q) { return sc(q, ku); }); }) };
  }

  function stickFigure(cfg) {
    var pose = scalePose(POSES[cfg.pose] || POSES.arms_crossed), s = '';
    var tint = BLK;                     // hauts blancs : gris très sombre, ça reste « dark »
    var hairc = cfg.hair || C.coal, rg = h2r(hairc);
    var hc = (rg[0] + rg[1] + rg[2]) < 150 ? '#3d2626' : hairc;           // cheveux noirs : brun-rouge sombre pour se détacher de la tête
    var shoes = '#2a1616', ts = 'plain';
    var S = pose.S, H = pose.H;
    var L = Math.sqrt(S[0] * S[0] + S[1] * S[1]), th = Math.atan2(S[0], -S[1]) * 180 / Math.PI;

    // jambes + baskets
    pose.legs.forEach(function (l) {
      s += sl(l, 9, BLK);
      s += '';
    });

    // buste : trapèze effilé (épaules larges → taille fine), plus costaud qu'un simple trait
    // buste : gros bâton arrondi (capsule large), sans détails
    s += sl([[0, -3], [S[0], S[1] + 8]], 25, BLK);

    function arms() {
      var a = '';
      pose.arms.forEach(function (arm) {
        a += sl([arm[0], arm[1], arm[2]], 7, BLK);
      });
      return a;
    }
    function head() {
      var HY = H[1] - 4, g = sl([[S[0], S[1] - 2], [H[0], HY + 7]], 7, BLK);
      g += '<g transform="translate(' + H[0] + ',' + HY + ') rotate(' + H[2] + ')">';
      g += rimmed(function (c) { return '<circle r="11.4" fill="' + c + '"/>'; }, BLK);
      g += '<path d="M-7.4 -6.6 A9.8 9.8 0 0 1 1.4 -10.2" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".10"/>';
            g += '<g transform="scale(.77)">' + sAcc(cfg.band ? ['headband'] : [], { cap: cfg.band || '#8a3cff' }) + '</g>';
      g += '</g>';
      return g;
    }
    if (pose.armsFirst) s += arms() + head();
    else if (pose.armsLast) s += head() + arms();
    else s += head() + arms();
    s += props(pose.props, pose, BLK);
    return s;
  }

  function figure(cfg) { return (cfg.style || Crew.style || 'stick') === 'sims' ? simsFigure(cfg) : stickFigure(cfg); }

  /* cfg : {skin, hair, hairStyle, top, topStyle, accent, pants, shoes, acc[], cap, mood, pose, sleeves, scale, flip} */
  function simsFigure(cfg) {
    var pose = POSES[cfg.pose] || POSES.arms_crossed;
    var skin = SKIN[cfg.skin] || cfg.skin || SKIN.a;
    var top = cfg.top || C.char2, acc = cfg.accent || C.red, pants = cfg.pants || C.coal, shoes = cfg.shoes || C.white;
    var hairc = cfg.hair || C.coal, s = '';
    var longSleeve = cfg.sleeves !== 'short';

    // jambes
    pose.legs.forEach(function (l) { s += limb(l, 13.5, pants) + shoe(l[2], shoes, cfg.sole); });

    // torse
    var S = pose.S, L = Math.sqrt(S[0] * S[0] + S[1] * S[1]), th = Math.atan2(S[0], -S[1]) * 180 / Math.PI;
    var t = '';
    t += '<path d="M0 -3 V' + (-L + 5) + '" stroke="' + OUT + '" stroke-width="38" stroke-linecap="round" fill="none"/>';
    t += '<path d="M0 -3 V' + (-L + 5) + '" stroke="' + top + '" stroke-width="34" stroke-linecap="round" fill="none"/>';
    t += '<path d="M-9 -6 V' + (-L + 8) + '" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".13"/>';
    t += '<path d="M11 -4 V' + (-L + 10) + '" stroke="#000" stroke-width="9" stroke-linecap="round" fill="none" opacity=".2"/>';
    var ts = cfg.topStyle || 'tee';
    if (ts === 'hoodie') {
      t += '<path d="M-10 -8 H10 L13 -17 H-13Z" fill="' + shade(top, .8) + '" stroke="' + OUT + '" stroke-width="1.2" stroke-linejoin="round"/>';
      t += '<path d="M-4 ' + (-L + 6) + ' V' + (-L + 22) + ' M4 ' + (-L + 6) + ' V' + (-L + 19) + '" stroke="' + C.white + '" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>';
    } else if (ts === 'jacket') {
      t += '<path d="M0 ' + (-L + 4) + ' V-4" stroke="' + OUT + '" stroke-width="1.8"/><path d="M-6 ' + (-L + 5) + ' L0 ' + (-L + 20) + ' L6 ' + (-L + 5)  + 'Z" fill="' + C.white + '" stroke="' + OUT + '" stroke-width="1.2" stroke-linejoin="round"/>';
      t += '<path d="M-14 -14 H-6" stroke="' + acc + '" stroke-width="2.4" stroke-linecap="round"/>';
    } else if (ts === 'suit') {
      t += '<path d="M-7 ' + (-L + 4) + ' L0 ' + (-L + 24) + ' L7 ' + (-L + 4) + 'Z" fill="' + C.white + '" stroke="' + OUT + '" stroke-width="1.2" stroke-linejoin="round"/><path d="M-2 ' + (-L + 10) + ' L2 ' + (-L + 10) + ' L3 ' + (-L + 24) + ' L0 ' + (-L + 28) + ' L-3 ' + (-L + 24) + 'Z" fill="' + acc + '" stroke="' + OUT + '" stroke-width="1"/>';
    } else if (ts === 'stripe') {
      t += '<path d="M-17 -12 H17" stroke="' + acc + '" stroke-width="4" opacity=".95"/><path d="M-17 -20 H17" stroke="' + C.white + '" stroke-width="2" opacity=".8"/>';
    } else if (ts === 'apron') {
      t += '<path d="M-12 ' + (-L + 8) + ' H12 L14 -4 H-14Z" fill="' + C.white + '" opacity=".92" stroke="' + OUT + '" stroke-width="1.3" stroke-linejoin="round"/><path d="M-12 ' + (-L + 8) + ' L-14 ' + (-L + 2) + ' M12 ' + (-L + 8) + ' L14 ' + (-L + 2) + '" stroke="' + OUT + '" stroke-width="1.5"/>';
    }
    s += '<g transform="rotate(' + th.toFixed(1) + ')">' + t + '</g>';

    // bras
    function arms() {
      var a = '';
      pose.arms.forEach(function (arm) {
        a += limb([arm[0], arm[1]], 11.5, top);
        a += limb([arm[1], arm[2]], 10, longSleeve ? top : skin);
        if (!pose.props || (pose.props !== 'mug' && pose.props !== 'glass')) a += dot(arm[2], 5.3, skin);
        else if (arm !== pose.arms[1]) a += dot(arm[2], 5.3, skin);
      });
      return a;
    }
    function head() {
      var H = pose.H, g = '';
      g += '<path d="M' + S[0] + ' ' + S[1] + ' L' + H[0] + ' ' + (H[1] + 10) + '" stroke="' + OUT + '" stroke-width="13" stroke-linecap="round"/><path d="M' + S[0] + ' ' + S[1] + ' L' + H[0] + ' ' + (H[1] + 10) + '" stroke="' + shade(skin, .88) + '" stroke-width="9" stroke-linecap="round"/>';
      if (ts === 'hoodie') g += '<path d="M' + (S[0] - 17) + ' ' + (S[1] + 2) + ' C' + (S[0] - 14) + ' ' + (S[1] - 12) + ' ' + (S[0] + 14) + ' ' + (S[1] - 12) + ' ' + (S[0] + 17) + ' ' + (S[1] + 2) + ' C' + (S[0] + 8) + ' ' + (S[1] + 6) + ' ' + (S[0] - 8) + ' ' + (S[1] + 6) + ' ' + (S[0] - 17) + ' ' + (S[1] + 2) + 'Z" fill="' + shade(top, .75) + '" stroke="' + OUT + '" stroke-width="1.3"/>';
      g += '<g transform="translate(' + H[0] + ',' + H[1] + ') rotate(' + H[2] + ')">';
      g += '<circle r="19.5" fill="' + OUT + '"/><circle r="18" fill="' + skin + '"/>';
      g += '<ellipse cx="-6" cy="-8" rx="9" ry="6" fill="#fff" opacity=".16"/>';
      g += '<path d="M10 -12 A18 18 0 0 1 10 12 A22 22 0 0 0 10 -12Z" fill="#000" opacity=".12"/>';
      g += '<ellipse cx="-19" cy="1" rx="3" ry="4.5" fill="' + shade(skin, .92) + '" stroke="' + OUT + '" stroke-width="1.2"/><ellipse cx="19" cy="1" rx="3" ry="4.5" fill="' + shade(skin, .86) + '" stroke="' + OUT + '" stroke-width="1.2"/>';
      g += '<circle cx="-11" cy="6" r="3.4" fill="' + C.red + '" opacity=".13"/><circle cx="11" cy="6" r="3.4" fill="' + C.red + '" opacity=".13"/>';
      g += face(cfg.mood, cfg.look);
      g += hair(cfg.hairStyle, hairc);
      g += accessories(cfg.acc, { cap: cfg.cap || C.red, hair: hairc });
      g += '</g>';
      return g;
    }
    if (pose.armsFirst) s += arms() + head();
    else if (pose.armsLast) s += head() + arms();
    else s += head() + arms();
    s += props(pose.props, pose, skin);
    return s;
  }

  /* =====================================================================
     SCÈNE
     ===================================================================== */
  function Scene(W, D, H, opt) {
    this.W = W; this.D = D; this.H = H; this.opt = opt || {};
    V = this.opt.cam || .5;                  // caméra : à régler avant de dessiner quoi que ce soit
    this.defs = []; this.back = []; this.floor = []; this.items = []; this.front = [];
    this.uid = 0;
  }
  Scene.prototype.id = function (p) { return (p || 'i') + (++this.uid); };

  Scene.prototype.item = function (b, svg, extra) {
    this.items.push({ x0: b[0], x1: b[0] + b[3], y0: b[1], y1: b[1] + b[4], z0: b[2], z1: b[2] + b[5], svg: svg, extra: extra || '' });
  };
  Scene.prototype.box = function (x, y, z, w, d, h, col, o) { this.item([x, y, z, w, d, h], box(x, y, z, w, d, h, col, o)); };
  Scene.prototype.shadow = function (x, y, w, d, op) {
    var e = .18;
    this.floor.push('<polygon points="' + pts([[x - e, y - e, .01], [x + w + e, y - e, .01], [x + w + e, y + d + e, .01], [x - e, y + d + e, .01]]) + '" fill="#000" opacity="' + (op == null ? .38 : op) + '" filter="url(#blur)"/>');
  };

  // Pièce : sol à damier + dalle + murs (coupe type "maison de poupée")
  Scene.prototype.room = function (o) {
    var W = this.W, D = this.D, H = this.H, i, j, s = '';
    if (o.planks) {
      var sd = 7, rn = function () { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }, pc = o.planks, x0, len, px;
      for (j = 0; j < D; j++) {
        x0 = -(rn() * 2.2);
        while (x0 < W) {
          len = 1.6 + rn() * 1.6; px = Math.max(0, x0); var px1 = Math.min(W, x0 + len);
          if (px1 > px) s += poly([[px, j, 0], [px1, j, 0], [px1, j + 1, 0], [px, j + 1, 0]], shade(pc, .82 + rn() * .22), 'stroke="rgba(0,0,0,.45)" stroke-width=".8"');
          x0 += len;
        }
      }
      s += '<polygon points="' + pts([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]]) + '" fill="url(#floorShine)"/>';
    } else for (i = 0; i < W; i++) for (j = 0; j < D; j++) {
      s += poly([[i, j, 0], [i + 1, j, 0], [i + 1, j + 1, 0], [i, j + 1, 0]], ((i + j) % 2 ? o.floorB : o.floorA), 'stroke="rgba(255,255,255,.035)" stroke-width=".7"');
    }
    s += poly([[0, D, -.32], [W, D, -.32], [W, D, 0], [0, D, 0]], o.slabL || '#0a0505');
    s += poly([[W, 0, -.32], [W, D, -.32], [W, D, 0], [W, 0, 0]], o.slabR || '#050202');
    if (o.floorRim) s += '<polyline points="' + pts([[0, D, 0], [W, D, 0], [W, 0, 0]]) + '" fill="none" stroke="' + o.floorRim + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>';
    this.back.push(s);
    // murs
    var wc = o.wall || C.char;
    var m = '';
    m += box(-.3, -.3, 0, .3, D + .3, H, wc, { top: o.wallTop || '#2a1919', left: shade(wc, .9), right: shade(wc, 1.12) });
    m += box(-.3, -.3, 0, W + .3, .3, H, wc, { top: o.wallTop || '#2a1919', left: shade(wc, 1.05), right: shade(wc, .6) });
    this.back.push(m);
    // plinthes + bandeau rouge
    var d = '';
    d += poly([[0, 0, 0], [W, 0, 0], [W, 0, .22], [0, 0, .22]], o.base || '#0c0606', 'stroke="none"');
    d += poly([[0, 0, 0], [0, D, 0], [0, D, .22], [0, 0, .22]], o.base || '#0c0606', 'stroke="none"');
    if (o.stripe !== false) {
      var zs = o.stripeZ || 1.0;
      d += poly([[0, 0, zs], [W, 0, zs], [W, 0, zs + .07], [0, 0, zs + .07]], o.stripe || C.red, 'stroke="none" opacity=".9"');
      d += poly([[0, 0, zs], [0, D, zs], [0, D, zs + .07], [0, 0, zs + .07]], o.stripe || C.red, 'stroke="none" opacity=".9"');
    }
    this.back.push(d);
    var pn = '';
    for (i = 1; i < W / 1.5; i++) pn += '<polyline points="' + pts([[i * 1.5, 0, .22], [i * 1.5, 0, H]]) + '" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.3"/>';
    for (i = 1; i < D / 1.5; i++) pn += '<polyline points="' + pts([[0, i * 1.5, .22], [0, i * 1.5, H]]) + '" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.3"/>';
    this.back.push(pn);
  };

  // spot de plafond : cône lumineux + flaque au sol
  Scene.prototype.cone = function (x, y, r, op, kind) {
    var top = P(x, y, this.H), c = P(x, y, 0), rx = r * U * 1.414;
    this.front.push('<polygon points="' + (top[0] - 6).toFixed(1) + ',' + top[1].toFixed(1) + ' ' + (top[0] + 6).toFixed(1) + ',' + top[1].toFixed(1) + ' ' + (c[0] + rx).toFixed(1) + ',' + c[1].toFixed(1) + ' ' + (c[0] - rx).toFixed(1) + ',' + c[1].toFixed(1) + '" fill="url(#cone)" opacity="' + (op || .16) + '" filter="url(#blur)"/>');
    this.pool(x, y, r * 1.05, kind || 'W', (op || .16) * 1.4);
  };

  // faisceau de lumière (fenêtre) projeté au sol : polygone [[x,y],...] flouté
  Scene.prototype.beam = function (p, op) {
    this.floor.push('<polygon points="' + pts(p.map(function (q) { return [q[0], q[1], .015]; })) + '" fill="#f5eceb" opacity="' + (op || .05) + '" filter="url(#blur)"/>');
  };

  // flaque de lumière au sol ('R' rouge, 'W' blanc froid)
  Scene.prototype.pool = function (x, y, r, kind, op) {
    this.floor.push('<g opacity="' + (op == null ? .25 : op) + '">' + planeF(x - r, y - r, .02, '<circle cx="' + r + '" cy="' + r + '" r="' + r + '" fill="url(#lp' + (kind || 'R') + ')"/>') + '</g>');
  };

  // sprites de mur : définis en coordonnées (u,v) du plan
  Scene.prototype.wallY = function (x, zTop, inner) { this.back.push(planeY(x, 0, zTop, inner)); };      // mur du fond droit (y=0)
  Scene.prototype.wallX = function (yMax, zTop, inner) { this.back.push(planeX(0, yMax, zTop, inner)); }; // mur de gauche (x=0)

  Scene.prototype.person = function (cfg, x, y, z) {
    cfg.scale = cfg.scale || 1.1;
    var pz = z + ((POSES[cfg.pose] || {}).stand ? 37 * 1.36 * cfg.scale / ZH : 0);   // debout : le bassin est relevé pour que les pieds touchent le sol
    var p = P(x, y, pz);
    var s = '<g class="char" data-name="' + cfg.name + '" tabindex="0" transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' +
      '<g class="fig" style="--d:' + (2.6 + (this.uid % 5) * .35).toFixed(2) + 's;animation-delay:-' + ((this.uid * 0.7) % 3).toFixed(2) + 's">' +
      '<g class="bob"><g transform="scale(' + ((cfg.flip ? -1 : 1) * (cfg.scale || 1)) + ',' + (cfg.scale || 1) + ')">' + figure(cfg) + '</g></g>' +
      '<rect x="-34" y="-118" width="68" height="170" fill="rgba(0,0,0,0)" pointer-events="all"/></g></g>';
    // ombre au sol sous la personne
    var gz = cfg.groundZ == null ? 0 : cfg.groundZ;
    this.items.push({ x0: x - .22, x1: x + .22, y0: y - .22, y1: y + .22, z0: z, z1: z + 1.8, svg: s, extra: '', person: true, gx: x, gy: y, gz: gz });
  };

  // tri topologique (peintre) : renvoie les items dans l'ordre d'affichage
  function sortItems(items) {
    var n = items.length, i, j, adj = [], indeg = [];
    for (i = 0; i < n; i++) { adj.push([]); indeg.push(0); }
    function before(a, b) { // a doit-il être dessiné avant b ?
      if ((a.x1 <= b.x0 + 1e-6 && b.y1 <= a.y0 + 1e-6) || (b.x1 <= a.x0 + 1e-6 && a.y1 <= b.y0 + 1e-6)) return 0;
      if (a.x1 <= b.x0 + 1e-6 || a.y1 <= b.y0 + 1e-6) return 1;
      if (b.x1 <= a.x0 + 1e-6 || b.y1 <= a.y0 + 1e-6) return -1;
      if (a.z0 !== b.z0) return a.z0 < b.z0 ? 1 : -1;
      var ca = a.x0 + a.x1 + a.y0 + a.y1, cb = b.x0 + b.x1 + b.y0 + b.y1;
      return ca <= cb ? 1 : -1;
    }
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
      var r = before(items[i], items[j]);
      if (r === 1) { adj[i].push(j); indeg[j]++; } else if (r === -1) { adj[j].push(i); indeg[i]++; }
    }
    var out = [], done = {}, c;
    function key(k) { var a = items[k]; return a.x0 + a.x1 + a.y0 + a.y1; }
    for (c = 0; c < n; c++) {
      var pick = -1;
      for (i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || key(i) < key(pick))) pick = i;
      if (pick < 0) for (i = 0; i < n; i++) if (!done[i] && (pick < 0 || key(i) < key(pick))) pick = i;
      done[pick] = 1; out.push(items[pick]);
      adj[pick].forEach(function (k) { indeg[k]--; });
    }
    return out;
  }

  Scene.prototype.render = function () {
    var W = this.W, D = this.D, H = this.H;
    var o = this.opt, cut = (o.cropTop || 0) * H * ZH;     // cropTop : on rogne le haut → caméra plus basse, centrée vers le bas
    var minX = -D * U - 30, maxX = W * U + 30, minY = -H * ZH - 60 + cut, maxY = (W + D) * U * V + .4 * ZH + 40;
    var floorShadows = '';
    this.items.forEach(function (it) {
      if (it.person) { var q = P(it.gx, it.gy, it.gz); floorShadows += '<ellipse cx="' + q[0].toFixed(1) + '" cy="' + (q[1] + 3).toFixed(1) + '" rx="26" ry="10" fill="#000" opacity=".42" filter="url(#blur)"/>'; }
    });
    var ordered = sortItems(this.items);
    var body = this.back.join('') + this.floor.join('') + floorShadows + ordered.map(function (it) { return it.svg; }).join('') + this.front.join('');
    var defs = '<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="glowS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      this.defs.join('');
    return '<svg class="scene" xmlns="http://www.w3.org/2000/svg" viewBox="' + minX + ' ' + minY + ' ' + (maxX - minX) + ' ' + (maxY - minY) + '" preserveAspectRatio="xMidYMid meet"><defs>' + defs + '</defs>' + body + '</svg>';
  };

  /* =====================================================================
     BIBLIOTHÈQUE DE MEUBLES
     ===================================================================== */
  var F = {};

  F.rug = function (S, x, y, w, d, col, border) {
    var s = poly([[x, y, .012], [x + w, y, .012], [x + w, y + d, .012], [x, y + d, .012]], col, 'stroke="rgba(0,0,0,.4)" stroke-width="1"');
    s += poly([[x + .15, y + .15, .013], [x + w - .15, y + .15, .013], [x + w - .15, y + d - .15, .013], [x + .15, y + d - .15, .013]], 'none', 'stroke="' + (border || C.red) + '" stroke-width="1.1" opacity=".45"');
    S.floor.push(s);
    return s;
  };

  // canapé dos au mur du fond (y=0) ou au mur de gauche (x=0)
  F.sofa = function (S, x, y, len, o) {
    o = o || {}; var col = o.col || C.char2, cu = o.cushion || '#5a1814', dp = 1.25;
    S.shadow(x, y, len, dp + .1);
    S.box(x, y, 0, len, dp, .36, col);                                    // assise
    S.box(x, y, .36, len, .34, .62, col, { rim: o.rim });                 // dossier
    S.box(x, y + .34, .36, .28, dp - .34, .3, shade(col, 1.12));          // accoudoir gauche
    S.box(x + len - .28, y + .34, .36, .28, dp - .34, .3, shade(col, 1.12)); // accoudoir droit
    var n = Math.max(2, Math.round((len - .56) / 1.2)), cw = (len - .56) / n, i;
    for (i = 0; i < n; i++) S.box(x + .28 + i * cw + .03, y + .38, .36, cw - .06, dp - .42, .14, shade(col, 1.25), { top: shade(col, 1.55) });
    if (o.pillows) { S.box(x + .34, y + .36, .5, .3, .26, .34, cu, { top: shade(cu, 1.2) }); S.box(x + len - .66, y + .36, .5, .3, .26, .34, '#241414', { top: '#352222' }); }
  };
  F.sofaL = function (S, x, y, len, o) { // dos au mur de gauche (x=0), dépasse en +y
    o = o || {}; var col = o.col || C.char2, dp = 1.25;
    S.shadow(x, y, dp + .1, len);
    S.box(x, y, 0, dp, len, .36, col);
    S.box(x, y, .36, .34, len, .62, col, { rim: o.rim });
    S.box(x + .34, y, .36, dp - .34, .28, .3, shade(col, 1.12));
    S.box(x + .34, y + len - .28, .36, dp - .34, .28, .3, shade(col, 1.12));
    var n = Math.max(2, Math.round((len - .56) / 1.2)), cw = (len - .56) / n, i;
    for (i = 0; i < n; i++) S.box(x + .38, y + .28 + i * cw + .03, .36, dp - .42, cw - .06, .14, shade(col, 1.25), { top: shade(col, 1.55) });
  };
  F.armchair = function (S, x, y, o) {
    o = o || {}; var col = o.col || C.char2;
    S.shadow(x, y, 1.1, 1.1);
    S.box(x, y, 0, 1.1, 1.1, .34, col);
    S.box(x, y, .34, 1.1, .3, .55, col, { rim: o.rim });
    S.box(x, y + .3, .34, .24, .8, .26, shade(col, 1.12));
    S.box(x + .86, y + .3, .34, .24, .8, .26, shade(col, 1.12));
    S.box(x + .26, y + .34, .34, .58, .72, .12, shade(col, 1.25), { top: shade(col, 1.55) });
  };
  F.coffeeTable = function (S, x, y, w, d, o) {
    o = o || {};
    S.shadow(x, y, w, d, .3);
    S.box(x + .08, y + .08, 0, .12, .12, .36, C.black); S.box(x + w - .2, y + .08, 0, .12, .12, .36, C.black);
    S.box(x + .08, y + d - .2, 0, .12, .12, .36, C.black); S.box(x + w - .2, y + d - .2, 0, .12, .12, .36, C.black);
    S.box(x, y, .36, w, d, .1, o.col || '#1d0f0f', { top: o.top || '#2e1919', left: '#150a0a', right: '#0a0505', rim: o.rim || C.red });
    if (o.items !== false) { S.box(x + .25, y + .22, .46, .3, .24, .06, '#4a1410', { top: '#6a2a24' }); S.box(x + w - .6, y + d - .5, .46, .22, .22, .12, C.coal, { top: C.ash }); }
  };
  F.tvWall = function (S, x, zTop, w, h) { // grand écran mural sur le mur du fond
    S.wallY(x, zTop + .06, '<rect x="-.06" y="-.06" width="' + (w + .12) + '" height="' + (h + .12) + '" rx=".06" fill="#050202" stroke="' + C.ash + '" stroke-width=".03"/>' +
      '<rect width="' + w + '" height="' + h + '" rx=".04" fill="url(#tvg)"/>' +
      '<image href="assets/atk-logo.png" x="' + (w / 2 - h * .42) + '" y="' + (h * .08) + '" width="' + (h * .84) + '" height="' + (h * .84) + '" opacity=".92"/>' +
      '<rect class="tvflick" width="' + w + '" height="' + h + '" rx=".04" fill="' + C.red + '" opacity=".08"/>');
  };
  F.window = function (S, x, zTop, w, h, o) {
    o = o || {}; var id = S.id('cw'), g = '', i, seed = o.seed || 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var fr = o.frame || C.ash;
    g += '<clipPath id="' + id + '"><rect width="' + w + '" height="' + h + '"/></clipPath>';
    g += '<radialGradient id="' + id + 'h" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#ff4136" stop-opacity=".5"/><stop offset=".55" stop-color="#7a1410" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>';
    g += '<rect x="-.12" y="-.12" width="' + (w + .24) + '" height="' + (h + .24) + '" fill="#050202" stroke="' + fr + '" stroke-width=".04"/>';
    g += '<g clip-path="url(#' + id + ')"><rect width="' + w + '" height="' + h + '" fill="url(#sky)"/><rect width="' + w + '" height="' + h + '" fill="url(#' + id + 'h)"/>';
    for (i = 0; i < 26; i++) g += '<circle cx="' + (rnd() * w).toFixed(2) + '" cy="' + (rnd() * h * .5).toFixed(2) + '" r="' + (.008 + rnd() * .012).toFixed(3) + '" fill="#fff" opacity="' + (.25 + rnd() * .5).toFixed(2) + '"/>';
    g += '<circle cx="' + (w * .8) + '" cy="' + (h * .24) + '" r=".3" fill="#f5eceb" opacity=".95"/><circle cx="' + (w * .8) + '" cy="' + (h * .24) + '" r=".7" fill="#fff" opacity=".07"/>';
    var layers = [
      { col: '#3a1513', hMin: .34, hMax: .7, wMin: .3, wMax: .6, win: 0, ant: .35 },
      { col: '#1c0b0b', hMin: .22, hMax: .55, wMin: .35, wMax: .75, win: .3, ant: .2 },
      { col: '#090404', hMin: .12, hMax: .38, wMin: .45, wMax: .9, win: .5, ant: .1 }
    ];
    layers.forEach(function (L, li) {
      var bx = -rnd() * .3;
      while (bx < w) {
        var bw = L.wMin + rnd() * (L.wMax - L.wMin), bh = h * (L.hMin + rnd() * (L.hMax - L.hMin)), by = h - bh;
        g += '<rect x="' + bx.toFixed(2) + '" y="' + by.toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '" fill="' + L.col + '"/>';
        if (rnd() < .45) g += '<rect x="' + (bx + bw * .3).toFixed(2) + '" y="' + (by - .1).toFixed(2) + '" width="' + (bw * .4).toFixed(2) + '" height=".1" fill="' + L.col + '"/>';
        if (rnd() < L.ant) {
          var ax = bx + bw * (.3 + rnd() * .4); g += '<path d="M' + ax.toFixed(2) + ' ' + by.toFixed(2) + ' V' + (by - .26 - rnd() * .2).toFixed(2) + '" stroke="' + L.col + '" stroke-width=".02"/>';
          if (li > 0) g += '<circle cx="' + ax.toFixed(2) + '" cy="' + (by - .27).toFixed(2) + '" r=".022" fill="#ff4136"><animate attributeName="opacity" values="1;.1;1" dur="' + (1.2 + rnd() * 1.5).toFixed(2) + 's" repeatCount="indefinite"/></circle>';
        }
        if (L.win) {
          var cx, cy;
          for (cx = bx + .07; cx < bx + bw - .08; cx += .115) for (cy = by + .09; cy < h - .05; cy += .15) if (rnd() < L.win) {
            var lit = rnd() > .5 ? '#ff7a6e' : '#f5eceb';
            g += '<rect x="' + cx.toFixed(2) + '" y="' + cy.toFixed(2) + '" width=".05" height=".07" fill="' + lit + '" opacity="' + (.45 + rnd() * .5).toFixed(2) + '">' + (rnd() < .06 ? '<animate attributeName="opacity" values=".9;.05;.9" dur="' + (2 + rnd() * 3).toFixed(1) + 's" repeatCount="indefinite"/>' : '') + '</rect>';
          }
        }
        bx += bw - .03;
      }
    });
    g += '</g><path d="M' + (w / 2) + ' 0 V' + h + ' M0 ' + (h * .5) + ' H' + w + '" stroke="' + fr + '" stroke-width=".05"/>';
    g += '<rect width="' + w + '" height="' + h + '" fill="url(#glass)"/>';
    (o.side === 'x' ? S.wallX : S.wallY).call(S, x, zTop, g);
  };
  F.neon = function (S, x, zTop, w, text, col, size) {
    col = col || C.red;
    S.wallY(x, zTop, '<text x="' + (w / 2) + '" y="' + (size * .8) + '" text-anchor="middle" font-family="\'Metal Mania\',\'Pirata One\',serif" font-size="' + size + '" fill="none" stroke="' + col + '" stroke-width=".06" filter="url(#glow)">' + text + '</text>' +
      '<text x="' + (w / 2) + '" y="' + (size * .8) + '" text-anchor="middle" font-family="\'Metal Mania\',\'Pirata One\',serif" font-size="' + size + '" fill="#fff" fill-opacity=".92" stroke="' + col + '" stroke-width=".02">' + text + '</text>');
  };
  F.poster = function (S, side, pos, zTop, w, h, o) { // side 'y' (mur fond) ou 'x' (mur gauche) ; pos = x ou yMax
    o = o || {};
    var g = '<rect width="' + w + '" height="' + h + '" fill="' + (o.bg || '#0c0505') + '" stroke="' + (o.border || C.white) + '" stroke-width=".05"/>' + (o.inner || '<image href="assets/atk-logo.png" x=".08" y="' + (h / 2 - (w - .16) / 2) + '" width="' + (w - .16) + '" height="' + (w - .16) + '" opacity=".9"/>');
    if (side === 'y') S.wallY(pos, zTop, g); else S.wallX(pos, zTop, g);
  };
  F.counter = function (S, x, y, w, d, o) { // comptoir / bar
    o = o || {};
    S.shadow(x, y, w, d);
    S.box(x, y, 0, w, d, 1.0, o.col || C.char2, { top: o.top || '#2e1919', rim: o.rim || C.red, left: shade(o.col || C.char2, .95), right: shade(o.col || C.char2, .6) });
    S.box(x - .05, y - .05, 1.0, w + .1, d + .1, .08, o.top || '#2e1919', { top: o.top2 || '#3a2222', left: '#1a0d0d', right: '#0d0606', rim: o.rim || C.red });
  };
  F.stool = function (S, x, y, h) {
    h = h || .78; S.shadow(x, y, .5, .5, .3);
    S.box(x + .2, y + .2, 0, .1, .1, h, C.coal);
    S.box(x, y, h, .5, .5, .1, '#1d1010', { top: '#2e1b1b', rim: C.red });
  };
  F.desk = function (S, x, y, w, d, o) {
    o = o || {};
    S.shadow(x, y, w, d, .32);
    S.box(x + .05, y + .05, 0, .12, .12, .74, C.black); S.box(x + w - .17, y + .05, 0, .12, .12, .74, C.black);
    S.box(x + .05, y + d - .17, 0, .12, .12, .74, C.black); S.box(x + w - .17, y + d - .17, 0, .12, .12, .74, C.black);
    S.box(x, y, .74, w, d, .1, o.col || C.black, { top: o.top || C.char2, rim: o.rim || C.red });
  };
  F.monitorBack = function (S, x, y, w) { // écran vu de dos (logo rouge qui brille)
    S.box(x + w / 2 - .12, y, .84, .24, .2, .08, C.coal);
    S.box(x, y, .92, w, .1, .5, C.coal, { top: C.char2, rim: C.red });
    S.item([x, y, .92, w, .1, .5], '<g transform="translate(' + P(x + w / 2, y + .1, .66)[0].toFixed(1) + ',' + P(x + w / 2, y + .1, .66)[1].toFixed(1) + ')"><circle r="5" fill="' + C.red + '" filter="url(#glowS)" opacity=".95"/></g>');
  };
  F.laptopBack = function (S, x, y) {
    S.box(x, y, .84, .7, .5, .04, C.ash, { top: C.bone });
    S.box(x, y + .02, .88, .7, .06, .46, C.coal, { top: C.char2, rim: C.red });
    S.item([x, y, .88, .7, .06, .46], '<g transform="translate(' + P(x + .35, y + .08, 1.1)[0].toFixed(1) + ',' + P(x + .35, y + .08, 1.1)[1].toFixed(1) + ')"><circle r="3.6" fill="' + C.white + '" filter="url(#glowS)"/></g>');
  };
  F.chair = function (S, x, y, o) { // fauteuil gamer (dossier vers +y => personne face à la caméra : dossier derrière elle côté -y)
    o = o || {};
    S.shadow(x, y, .8, .8, .3);
    S.box(x + .3, y + .3, 0, .2, .2, .3, C.coal);
    S.box(x, y, .3, .8, .8, .16, C.char2, { top: C.ash });
    S.box(x + .05, y - .08, .46, .7, .16, .95, C.black, { top: C.char2, rim: o.rim || C.red });
  };
  F.beanbag = function (S, x, y, col) {
    col = col || C.red; S.shadow(x, y, 1.2, 1.2);
    var cx = x + .6, cy = y + .6, p = P(cx, cy, .36), id = S.id('bb');
    S.item([x, y, 0, 1.2, 1.2, .8], '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')"><ellipse rx="' + (.78 * U * .9).toFixed(1) + '" ry="' + (.78 * U * .5 + 6).toFixed(1) + '" cy="6" fill="' + shade(col, .45) + '" stroke="' + OUT + '" stroke-width="1.4"/><ellipse rx="' + (.74 * U * .9).toFixed(1) + '" ry="' + (.7 * U * .5).toFixed(1) + '" cy="-4" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4"/><ellipse rx="' + (.4 * U).toFixed(1) + '" ry="' + (.22 * U).toFixed(1) + '" cx="-6" cy="-8" fill="#fff" opacity=".12"/></g>');
  };
  F.poolTable = function (S, x, y, w, d) {
    S.shadow(x, y, w, d);
    S.box(x + .15, y + .15, 0, .22, .22, .78, C.black); S.box(x + w - .37, y + .15, 0, .22, .22, .78, C.black);
    S.box(x + .15, y + d - .37, 0, .22, .22, .78, C.black); S.box(x + w - .37, y + d - .37, 0, .22, .22, .78, C.black);
    var id = S.id('pt');
    S.item([x, y, .78, w, d, .3],
      box(x, y, .78, w, d, .26, C.black, { top: C.char2, rim: C.red }) +
      poly([[x + .22, y + .22, 1.045], [x + w - .22, y + .22, 1.045], [x + w - .22, y + d - .22, 1.045], [x + .22, y + d - .22, 1.045]], '#3a0d0b', 'stroke="' + OUT + '" stroke-width="1"') +
      [[.35, .35], [w - .35, .35], [.35, d - .35], [w - .35, d - .35], [w / 2, .35], [w / 2, d - .35]].map(function (p) { var q = P(x + p[0], y + p[1], 1.05); return '<ellipse cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" rx="6" ry="3" fill="#000"/>'; }).join('') +
      [[.9, .9, C.white], [1.15, 1.0, C.red2], [1.0, 1.25, '#fff'], [1.35, 1.15, C.black], [1.25, .8, C.red2]].map(function (b) { var q = P(x + w * .55 + b[0] * .4 - .3, y + d * .35 + b[1] * .3, 1.07); return '<circle cx="' + q[0].toFixed(1) + '" cy="' + (q[1] - 1).toFixed(1) + '" r="4.2" fill="' + b[2] + '" stroke="' + OUT + '" stroke-width="1"/>'; }).join(''));
  };
  F.dj = function (S, x, y, w, d) {
    S.shadow(x, y, w, d);
    S.box(x, y, 0, w, d, .9, C.black, { top: C.char2, rim: C.red });
    var deck = function (cx) { return '<ellipse cx="' + P(cx, y + d / 2, .93)[0].toFixed(1) + '" cy="' + P(cx, y + d / 2, .93)[1].toFixed(1) + '" rx="22" ry="11" fill="#0b0606" stroke="' + C.ash + '" stroke-width="1.4"/><ellipse cx="' + P(cx, y + d / 2, .93)[0].toFixed(1) + '" cy="' + P(cx, y + d / 2, .93)[1].toFixed(1) + '" rx="9" ry="4.5" fill="' + C.red + '" filter="url(#glowS)"/>'; };
    S.item([x, y, .9, w, d, .1], deck(x + w * .25) + deck(x + w * .75) + '<polygon points="' + pts([[x + w * .44, y + .1, .93], [x + w * .56, y + .1, .93], [x + w * .56, y + d - .1, .93], [x + w * .44, y + d - .1, .93]]) + '" fill="' + C.white + '" opacity=".85" stroke="' + OUT + '"/>');
  };
  F.speaker = function (S, x, y, h) {
    h = h || 1.3; S.shadow(x, y, .6, .6, .3);
    S.box(x, y, 0, .6, .6, h, C.black, { top: C.char2 });
    var p = P(x + .3, y + .6, h * .62), p2 = P(x + .3, y + .6, h * .25);
    S.item([x, y, 0, .6, .6, h], '<g><ellipse cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" rx="12" ry="14" fill="#050202" stroke="' + C.red + '" stroke-width="1.4"/><ellipse cx="' + p2[0].toFixed(1) + '" cy="' + p2[1].toFixed(1) + '" rx="7" ry="8" fill="#050202" stroke="' + C.red + '" stroke-width="1.2"/></g>');
  };
  F.plant = function (S, x, y, h) {
    h = h || 1.1; S.shadow(x, y, .6, .6, .3);
    S.box(x, y, 0, .5, .5, .45, C.char2, { top: C.ash });
    var p = P(x + .25, y + .25, .45), leaves = '', i, a;
    for (i = 0; i < 9; i++) { a = (i / 9) * Math.PI - Math.PI / 2 + (i % 2 ? .12 : -.1); var L = 30 + (i % 3) * 14 + h * 8; leaves += '<path d="M0 0 Q' + (Math.sin(a) * L * .6).toFixed(1) + ' ' + (-L * .6).toFixed(1) + ' ' + (Math.sin(a) * L).toFixed(1) + ' ' + (-L * .95).toFixed(1) + ' Q' + (Math.sin(a) * L * .4 - 6).toFixed(1) + ' ' + (-L * .5).toFixed(1) + ' 0 0Z" fill="' + (i % 2 ? '#2a0c0a' : '#3d1210') + '" stroke="' + OUT + '" stroke-width="1.2"/>'; }
    S.item([x, y, 0, .5, .5, h], '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' + leaves + '</g>');
  };
  F.lamp = function (S, x, y, h, col) {
    h = h || 2.1; col = col || C.red; S.shadow(x, y, .4, .4, .3);
    var p = P(x + .15, y + .15, h);
    S.box(x, y, 0, .3, .3, .06, C.coal);
    S.box(x + .12, y + .12, .06, .06, .06, h - .06, C.ash);
    S.item([x, y, h - .2, .3, .3, .3], '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')"><circle r="46" fill="' + col + '" opacity=".16" filter="url(#blur)"/><path d="M-13 6 L-8 -14 L8 -14 L13 6Z" fill="' + col + '" stroke="' + OUT + '" stroke-width="1.4" stroke-linejoin="round" filter="url(#glowS)"/></g>');
  };
  F.shelf = function (S, x, zTop, w, rows) { // étagère murale avec livres/objets (mur du fond)
    var g = '', r, k, seed = 11, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (r = 0; r < rows; r++) {
      var yy = (r + 1) * .55 - .04;
      g += '<rect x="0" y="' + yy + '" width="' + w + '" height=".06" fill="' + C.ash + '" stroke="' + OUT + '" stroke-width=".015"/>';
      var bx = .06;
      while (bx < w - .2) { var bw = .08 + rnd() * .1, bh = .22 + rnd() * .18; g += '<rect x="' + bx.toFixed(2) + '" y="' + (yy - bh).toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '" fill="' + (rnd() > .55 ? C.red : (rnd() > .5 ? C.white : '#2a1414')) + '" stroke="' + OUT + '" stroke-width=".012"/>'; bx += bw + .015; }
    }
    S.wallY(x, zTop, g);
  };
  F.fridge = function (S, x, y) {
    S.shadow(x, y, .9, .9);
    S.box(x, y, 0, .9, .9, 2.0, '#241414', { top: '#3a2424', left: '#1a0d0d', right: '#0d0606', rim: C.red });
    S.item([x, y, 0, .9, .9, 2.0], '<polyline points="' + pts([[x + .05, y + .9, 1.2], [x + .85, y + .9, 1.2]]) + '" stroke="' + OUT + '" stroke-width="1.6" fill="none"/><polyline points="' + pts([[x + .12, y + .9, 1.3], [x + .12, y + .9, 1.7]]) + '" stroke="' + C.red + '" stroke-width="3" stroke-linecap="round"/>');
  };
  F.bar = F.counter;
  F.barrel = function (S, x, y, h) {
    h = h || .9; S.shadow(x, y, .8, .8, .3);
    var p = P(x + .4, y + .4, 0), rx = .45 * U * .98, ry = .45 * U * .5;
    S.item([x, y, 0, .8, .8, h], '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')"><path d="M' + (-rx) + ' 0 V' + (-h * ZH) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' ' + (-h * ZH) + ' V0 A' + rx + ' ' + ry + ' 0 0 1 ' + (-rx) + ' 0Z" fill="#241010" stroke="' + OUT + '" stroke-width="1.4"/>' +
      '<path d="M' + (-rx) + ' ' + (-h * ZH * .3) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' ' + (-h * ZH * .3) + ' M' + (-rx) + ' ' + (-h * ZH * .72) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' ' + (-h * ZH * .72) + '" fill="none" stroke="' + C.red + '" stroke-width="2.2"/>' +
      '<ellipse cy="' + (-h * ZH) + '" rx="' + rx + '" ry="' + ry + '" fill="#3a1a18" stroke="' + OUT + '" stroke-width="1.4"/></g>');
  };
  F.chest = function (S, x, y, w) {
    w = w || 1.1; S.shadow(x, y, w, .7, .3);
    S.box(x, y, 0, w, .7, .5, '#2a1212', { top: '#3a1a18', rim: C.red });
    S.box(x, y, .5, w, .7, .16, '#321414', { top: '#44201d' });
    S.box(x + w / 2 - .08, y + .7, .24, .16, .02, .3, C.white, { top: '#fff' });
  };
  F.wheel = function (S, x, zTop, r) { // barre de gouvernail sur le mur du fond
    var g = '<g transform="translate(' + r + ',' + r + ')"><circle r="' + r + '" fill="none" stroke="' + C.red + '" stroke-width=".11"/><circle r="' + (r * .88) + '" fill="none" stroke="' + OUT + '" stroke-width=".04"/><circle r="' + (r * .22) + '" fill="' + C.char2 + '" stroke="' + C.white + '" stroke-width=".05"/>', i;
    for (i = 0; i < 8; i++) { var a = i * Math.PI / 4; g += '<line x1="0" y1="0" x2="' + (Math.cos(a) * r * 1.2).toFixed(3) + '" y2="' + (Math.sin(a) * r * 1.2).toFixed(3) + '" stroke="' + C.white + '" stroke-width=".07" stroke-linecap="round"/>'; }
    S.wallY(x, zTop, g + '</g>');
  };
  F.banner = function (S, side, pos, zTop, w, h) {
    var g = '<path d="M0 0 H' + w + ' V' + h + ' L' + (w / 2) + ' ' + (h - .3) + ' L0 ' + h + 'Z" fill="#7a1410" stroke="' + OUT + '" stroke-width=".03"/><path d="M.08 .08 H' + (w - .08) + ' V' + (h - .12) + ' L' + (w / 2) + ' ' + (h - .38) + ' L.08 ' + (h - .12) + 'Z" fill="none" stroke="' + C.white + '" stroke-width=".03" opacity=".8"/><image href="assets/atk-logo.png" x=".1" y=".2" width="' + (w - .2) + '" height="' + (w - .2) + '"/>';
    if (side === 'y') S.wallY(pos, zTop, g); else S.wallX(pos, zTop, g);
  };
  F.lantern = function (S, x, y, z, op) {
    var p = P(x, y, z);
    S.front.push('<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')"><circle r="60" fill="' + C.red + '" opacity="' + (op || .12) + '" filter="url(#blur)"/><line x1="0" y1="-60" x2="0" y2="-10" stroke="' + OUT + '" stroke-width="1.5"/><rect x="-7" y="-10" width="14" height="20" rx="3" fill="' + C.red + '" stroke="' + OUT + '" stroke-width="1.4" filter="url(#glowS)"/><rect x="-5" y="-6" width="10" height="12" rx="2" fill="#ffd2c9" opacity=".8"/></g>');
  };
  F.strip = function (S, pts3, col, w) { // néon ruban entre points monde
    S.front.push('<polyline points="' + pts(pts3) + '" fill="none" stroke="' + (col || C.red) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>');
  };

  /* ---------- Meubles & décors « penthouse » ---------- */
  F.bottles = function (S, x, zTop, w, rows) {      // bar de fond : étagères rétro-éclairées avec bouteilles
    var rh = .62, hgt = rows * rh, r, seed = 17;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var g = '<rect x="-.1" y="-.1" width="' + (w + .2) + '" height="' + (hgt + .2) + '" fill="#0a0505" stroke="' + C.ash + '" stroke-width=".03"/><rect width="' + w + '" height="' + hgt + '" fill="url(#bk)"/>';
    for (r = 0; r < rows; r++) {
      var yy = (r + 1) * rh - .05, bx = .08;
      while (bx < w - .15) {
        var bw = .1 + rnd() * .05, bh = .26 + rnd() * .16, red = rnd() > .62;
        g += '<rect x="' + bx.toFixed(2) + '" y="' + (yy - bh).toFixed(2) + '" width="' + bw.toFixed(2) + '" height="' + bh.toFixed(2) + '" rx=".02" fill="' + (red ? '#8a1812' : '#150b0b') + '" stroke="#000" stroke-width=".012"/>' +
          '<rect x="' + (bx + bw * .22).toFixed(2) + '" y="' + (yy - bh + .03).toFixed(2) + '" width=".015" height="' + (bh * .7).toFixed(2) + '" fill="#fff" opacity=".35"/>';
        bx += bw + .035;
      }
      g += '<rect x="0" y="' + yy + '" width="' + w + '" height=".045" fill="' + C.red + '" opacity=".85"/>';
    }
    S.wallY(x, zTop, g);
  };

  F.ledWall = function (S, x, zTop, w, h) {         // grand mur LED au logo ATK
    var g = '<rect width="' + w + '" height="' + h + '" fill="#060303" stroke="' + C.ash + '" stroke-width=".04"/>', i;
    for (i = 1; i < w / .35; i++) g += '<line x1="' + (i * .35).toFixed(2) + '" y1="0" x2="' + (i * .35).toFixed(2) + '" y2="' + h + '" stroke="' + C.red + '" stroke-opacity=".12" stroke-width=".012"/>';
    for (i = 1; i < h / .35; i++) g += '<line x1="0" y1="' + (i * .35).toFixed(2) + '" x2="' + w + '" y2="' + (i * .35).toFixed(2) + '" stroke="' + C.red + '" stroke-opacity=".12" stroke-width=".012"/>';
    g += '<rect width="' + w + '" height="' + h + '" fill="url(#tvg)" opacity=".75"/><image href="assets/atk-logo.png" x="' + (w / 2 - h * .4) + '" y="' + (h * .1) + '" width="' + (h * .8) + '" height="' + (h * .8) + '" opacity=".9"/><rect class="tvflick" width="' + w + '" height="' + h + '" fill="' + C.red + '" opacity=".08"/>';
    S.wallY(x, zTop, g);
  };


  // ---- Feu « vrai » : 3 couches de langues (rouge sombre -> rouge -> blanc chaud) qui ondulent, braises qui montent, lueur qui pulse ----
  function tongue(cx, base, bw, fh, lean) {
    return 'M' + (cx - bw) + ' ' + base + ' C' + (cx - bw * 1.15) + ' ' + (base - fh * .42) + ' ' + (cx - bw * .25 + lean * .3) + ' ' + (base - fh * .72) + ' ' + (cx + lean) + ' ' + (base - fh) +
      ' C' + (cx + bw * .15 + lean * .6) + ' ' + (base - fh * .6) + ' ' + (cx + bw * 1.25) + ' ' + (base - fh * .38) + ' ' + (cx + bw) + ' ' + base + 'Z';
  }
  function fireSvg(cx, base, width, height, n, k, seed) {
    var out = '', L, i, rnd = (function (sd) { return function () { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }; })(seed || 11);
    var fac = [1, .66, .36], grad = ['flR', 'flM', 'flW'], spec = [];
    for (i = 0; i < n; i++) spec.push({ x: cx + (n === 1 ? 0 : (i / (n - 1) - .5) * width), h: height * (.5 + rnd() * .5) * (1 - Math.abs(i / (n - 1) - .5) * .7), lean: (rnd() - .5) * width * .16, t: .8 + rnd() * .9, d: -rnd() * 2 });
    out += '<ellipse class="fglow" cx="' + cx + '" cy="' + (base - height * .3) + '" rx="' + (width * .85) + '" ry="' + (height * .7) + '" fill="url(#flGlow)"/>';
    for (L = 0; L < 3; L++) spec.forEach(function (p, i) {
      out += '<path class="fl ' + (i % 2 ? 'b' : 'a') + '" style="--t:' + (p.t * (1 - L * .15)).toFixed(2) + 's;animation-delay:' + (p.d - L * .2).toFixed(2) + 's" d="' + tongue(p.x, base, (width / n) * .78 * fac[L] + k * 2, p.h * (L === 0 ? 1 : L === 1 ? .78 : .52), p.lean * fac[L]) + '" fill="url(#' + grad[L] + ')"/>';
    });
    for (i = 0; i < 8; i++) {
      var ex = cx + (rnd() - .5) * width * .9, rise = height * (1.1 + rnd() * .9), dur = 1.6 + rnd() * 1.8, dl = (rnd() * 2).toFixed(2);
      out += '<circle cx="' + ex.toFixed(2) + '" cy="' + base + '" r="' + (k * (.9 + rnd() * .9)).toFixed(3) + '" fill="#ff9a8e" opacity="0">' +
        '<animate attributeName="cy" values="' + base + ';' + (base - rise).toFixed(2) + '" dur="' + dur.toFixed(2) + 's" begin="' + dl + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="cx" values="' + ex.toFixed(2) + ';' + (ex + (rnd() - .5) * width * .5).toFixed(2) + '" dur="' + dur.toFixed(2) + 's" begin="' + dl + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;.95;0" dur="' + dur.toFixed(2) + 's" begin="' + dl + 's" repeatCount="indefinite"/></circle>';
    }
    return out;
  }

  F.fireWall = function (S, x, zTop, w, h) {        // cheminée murale
    var g = '<rect x="-.1" y="-.1" width="' + (w + .2) + '" height="' + (h + .2) + '" fill="#050202" stroke="' + C.ash + '" stroke-width="' + .04 + '"/><rect width="' + w + '" height="' + h + '" fill="url(#fireg)" opacity=".75"/>';
    g += '<rect x=".12" y="' + (h - .13) + '" width="' + (w - .24) + '" height=".1" rx=".04" fill="#1a0b0a"/><rect x=".3" y="' + (h - .2) + '" width="' + (w - .6) + '" height=".1" rx=".05" fill="#2a1211"/>';
    g += fireSvg(w / 2, h - .13, w * .72, h * .82, 6, .022, 5);
    S.wallY(x, zTop, g);
  };

  F.firepit = function (S, x, y, r) {               // foyer rond (table de feu)
    r = r || .9;
    var c = P(x, y, 0), rx = r * U * 1.414, ry = r * U * .707, hh = .42 * ZH, fl = '', i;
    S.shadow(x - r, y - r, r * 2, r * 2, .3);
    S.pool(x, y, r * 3.4, 'R', .38);
    fl = fireSvg(0, -hh - 3, rx * 1.25, 62 * r / .95, 5, 1.1, 21);
    S.item([x - r, y - r, 0, r * 2, r * 2, .9], '<g transform="translate(' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + ')">' +
      '<path d="M' + (-rx) + ' 0 V' + (-hh) + ' A' + rx + ' ' + ry + ' 0 0 0 ' + rx + ' ' + (-hh) + ' V0 A' + rx + ' ' + ry + ' 0 0 1 ' + (-rx) + ' 0Z" fill="#150b0b" stroke="#000" stroke-width="1"/>' +
      '<ellipse cy="' + (-hh) + '" rx="' + rx + '" ry="' + ry + '" fill="#0a0505" stroke="' + C.red + '" stroke-width="1.6"/>' +
      '<ellipse cy="' + (-hh) + '" rx="' + (rx * .72) + '" ry="' + (ry * .72) + '" fill="' + C.red + '" opacity=".5" filter="url(#glowS)"/><g transform="translate(0,' + (-hh) + ')"><rect x="' + (-rx * .55) + '" y="-5" width="' + rx * 1.1 + '" height="7" rx="3.5" fill="#1d0c0b" transform="rotate(-6)"/><rect x="' + (-rx * .45) + '" y="-8" width="' + rx * .9 + '" height="7" rx="3.5" fill="#2e1412" transform="rotate(7)"/></g>' + fl + '</g>');
  };

  F.lounger = function (S, x, y, col) {
    col = col || '#1a0f0f'; S.shadow(x, y, .95, 2.1, .3);
    S.box(x, y, 0, .95, 2.1, .3, col, { rim: C.white });
    S.box(x + .06, y + .05, .3, .83, .8, .16, shade(col, 1.5), { top: shade(col, 2.0) });
    S.box(x + .06, y + .85, .3, .83, 1.15, .1, shade(col, 1.4), { top: shade(col, 1.8) });
  };

  F.railing = function (S, x0, y0, x1, y1, h) {     // garde-corps en verre (dessiné par-dessus, translucide)
    h = h || 1.05;
    var n = Math.max(2, Math.round(Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) / 1.8)), i, posts = '';
    for (i = 0; i <= n; i++) { var px = x0 + (x1 - x0) * i / n, py = y0 + (y1 - y0) * i / n; posts += '<polyline points="' + pts([[px, py, 0], [px, py, h]]) + '" fill="none" stroke="#f5eceb" stroke-opacity=".5" stroke-width="1.4"/>'; }
    S.front.push('<polygon points="' + pts([[x0, y0, 0], [x1, y1, 0], [x1, y1, h], [x0, y0, h]]) + '" fill="#fff" fill-opacity=".05" stroke="none"/>' +
      '<polyline points="' + pts([[x0, y0, h], [x1, y1, h]]) + '" fill="none" stroke="#f5eceb" stroke-width="1.6" stroke-opacity=".75"/>' + posts);
  };

  F.console = function (S, x, y, w, d) {            // table de mixage
    S.shadow(x, y, w, d); S.box(x, y, 0, w, d, .9, C.black, { top: C.char2, rim: C.red });
    var g = '', i, j;
    for (i = 0; i < Math.floor((w - .1) / .22); i++) for (j = 0; j < 3; j++) g += '<rect x="' + (.1 + i * .22).toFixed(2) + '" y="' + (.12 + j * .26).toFixed(2) + '" width=".1" height=".14" fill="' + ((i + j) % 3 === 0 ? C.red : '#f5eceb') + '" opacity="' + ((i + j) % 2 ? .9 : .45) + '"/>';
    S.item([x, y, .9, w, d, .1], planeF(x, y, .915, g));
  };

  F.rack = function (S, x, y) {                     // baie serveur / matériel
    S.shadow(x, y, .85, .85, .3); S.box(x, y, 0, .85, .85, 2.3, C.black, { top: C.char2 });
    var g = '', i, j;
    for (i = 0; i < 6; i++) for (j = 0; j < 9; j++) g += '<rect x="' + (.08 + i * .12).toFixed(2) + '" y="' + (.1 + j * .22).toFixed(2) + '" width=".05" height=".05" fill="' + ((i * 7 + j * 3) % 4 === 0 ? C.red : '#f5eceb') + '" opacity="' + ((i + j) % 3 ? .85 : .35) + '"/>';
    S.item([x, y, 0, .85, .85, 2.3], planeY(x, y + .85, 2.3, g));
  };

  F.pendant = function (S, x, y, len, col) {        // suspension
    col = col || C.red; var t = P(x, y, S.H), b = P(x, y, S.H - len), bx = b[0].toFixed(1), by = b[1];
    S.front.push('<g><line x1="' + t[0].toFixed(1) + '" y1="' + t[1].toFixed(1) + '" x2="' + bx + '" y2="' + by.toFixed(1) + '" stroke="#000" stroke-width="1.4"/>' +
      '<circle cx="' + bx + '" cy="' + (by + 8).toFixed(1) + '" r="46" fill="' + col + '" opacity=".12" filter="url(#blur)"/>' +
      '<path d="M' + (b[0] - 15).toFixed(1) + ' ' + (by + 13).toFixed(1) + ' L' + (b[0] - 7).toFixed(1) + ' ' + (by - 3).toFixed(1) + ' L' + (b[0] + 7).toFixed(1) + ' ' + (by - 3).toFixed(1) + ' L' + (b[0] + 15).toFixed(1) + ' ' + (by + 13).toFixed(1) + 'Z" fill="#0b0606" stroke="' + col + '" stroke-width="1.2"/>' +
      '<ellipse cx="' + bx + '" cy="' + (by + 13).toFixed(1) + '" rx="15" ry="3" fill="#fff" opacity=".9" filter="url(#glowS)"/></g>');
  };

  F.sculpture = function (S, x, y) {                // anneau lumineux sur socle
    S.shadow(x - .4, y - .4, .8, .8, .3); S.pool(x, y, 2.4, 'R', .24);
    S.box(x - .3, y - .3, 0, .6, .6, .5, C.black, { top: C.char2, rim: C.white });
    var p = P(x, y, 1.55);
    S.item([x - .3, y - .3, 0, .6, .6, 2.4], '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')"><ellipse rx="26" ry="38" fill="none" stroke="' + C.red + '" stroke-width="7" filter="url(#glow)"/><ellipse rx="26" ry="38" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/><ellipse rx="14" ry="38" fill="none" stroke="' + C.red2 + '" stroke-width="1.4" opacity=".6" transform="rotate(14)"/></g>');
  };

  F.deckFloor = function (S, x0, y0, x1, y1) {      // terrasse en lames
    var i, s = '', n = Math.round((y1 - y0) / .5);
    for (i = 0; i < n; i++) s += poly([[x0, y0 + i * .5, .012], [x1, y0 + i * .5, .012], [x1, y0 + (i + 1) * .5, .012], [x0, y0 + (i + 1) * .5, .012]], i % 2 ? '#160e0c' : '#120a09', 'stroke="rgba(0,0,0,.55)" stroke-width=".6"');
    S.floor.push(s);
  };

  F.diningTable = function (S, x, y, w, d, n) {
    var i, gap = w / n, cx, cc = '#1a0e0e', ct = '#2e1b1b';
    F.desk(S, x, y, w, d, { col: '#1a0e0e', top: '#2a1818', rim: C.white });
    for (i = 0; i < n; i++) {
      cx = x + gap * (i + .5) - .22;
      S.box(cx, y - .7, 0, .45, .45, .42, cc, { top: ct }); S.box(cx, y - .74, .42, .45, .08, .5, cc, { top: ct });
      S.box(cx, y + d + .25, 0, .45, .45, .42, cc, { top: ct }); S.box(cx, y + d + .62, .42, .45, .08, .5, cc, { top: ct });
    }
  };

  // œuvres abstraites (mur du fond 'y' ou mur de gauche 'x')
  F.art = function (S, side, pos, zTop, w, h, kind) {
    var cx = w / 2, cy = h / 2, i, inner = '';
    if (kind === 'circle') inner = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (Math.min(w, h) * .3) + '" fill="' + C.red + '" filter="url(#glowS)"/><line x1=".15" y1="' + (h - .3) + '" x2="' + (w - .15) + '" y2="' + (h - .3) + '" stroke="#fff" stroke-width=".03"/>';
    else if (kind === 'lines') { for (i = 0; i < 9; i++) inner += '<line x1="' + (.15 + i * w / 9.5) + '" y1="' + (h - .12) + '" x2="' + (.4 + i * w / 9.5) + '" y2=".12" stroke="' + (i % 3 === 0 ? C.red : '#f5eceb') + '" stroke-width=".035" opacity=".85"/>'; }
    else if (kind === 'split') inner = '<rect x=".12" y=".12" width="' + (w / 2 - .12) + '" height="' + (h - .24) + '" fill="' + C.red + '" opacity=".85"/><rect x="' + (w / 2) + '" y=".12" width="' + (w / 2 - .12) + '" height="' + (h - .24) + '" fill="#f5eceb" opacity=".9"/>';
    else inner = '<image href="assets/atk-logo.png" x=".1" y="' + (h / 2 - (w - .2) / 2) + '" width="' + (w - .2) + '" height="' + (w - .2) + '" opacity=".92"/>';
    F.poster(S, side, pos, zTop, w, h, { inner: inner, border: '#f5eceb' });
  };

  /* =====================================================================
     DEFS COMMUNS
     ===================================================================== */
  function commonDefs(S, o) {
    o = o || {};
    S.defs.push(
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0305"/><stop offset=".6" stop-color="#3a0d0b"/><stop offset="1" stop-color="#8a1a12"/></linearGradient>' +
      '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="lpR"><stop offset="0" stop-color="#ff4136" stop-opacity=".9"/><stop offset=".55" stop-color="#ff4136" stop-opacity=".25"/><stop offset="1" stop-color="#ff4136" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="lpW"><stop offset="0" stop-color="#f5eceb" stop-opacity=".8"/><stop offset=".55" stop-color="#f5eceb" stop-opacity=".2"/><stop offset="1" stop-color="#f5eceb" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="bk" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4136" stop-opacity=".55"/><stop offset="1" stop-color="#ff4136" stop-opacity=".07"/></linearGradient>' +
      '<linearGradient id="fireg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4136" stop-opacity=".6"/><stop offset="1" stop-color="#2a0807" stop-opacity=".9"/></linearGradient>' +
      '<linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".35" stop-color="#ff7a6e"/><stop offset="1" stop-color="#ff4136" stop-opacity=".1"/></linearGradient>' +
      '<linearGradient id="floorShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>' +
      '<linearGradient id="flR" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a150e"/><stop offset=".55" stop-color="#e8352b"/><stop offset="1" stop-color="#ff4136" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="flM" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4136"/><stop offset=".55" stop-color="#ff7a6e"/><stop offset="1" stop-color="#ff9a8e" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="flW" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#ffe6e1"/><stop offset="1" stop-color="#ffd0c9" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="flGlow"><stop offset="0" stop-color="#ff4136" stop-opacity=".55"/><stop offset="1" stop-color="#ff4136" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient>' +
      '<linearGradient id="tvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0807"/><stop offset=".5" stop-color="#7a140e"/><stop offset="1" stop-color="#1a0505"/></linearGradient>'
    );
  }

  /* =====================================================================
     INTERACTION (survol / focus / toucher)
     ===================================================================== */
  function bind(root, tip, crew) {
    var by = {}; crew.forEach(function (c) { by[c.name] = c; });
    var svg = root.querySelector('svg.scene');
    var chars = svg.querySelectorAll('.char');
    var chips = root.querySelectorAll('[data-chip]');
    function show(name, el) {
      var c = by[name] || { name: name };
      svg.classList.add('has-hot');
      chars.forEach(function (n) { n.classList.toggle('hot', n.getAttribute('data-name') === name); });
      chips.forEach(function (n) { n.classList.toggle('hot', n.getAttribute('data-chip') === name); });
      tip.innerHTML = (c.avatar ? '<img src="' + c.avatar + '" alt="">' : '<span class="av">' + name.charAt(0) + '</span>') +
        '<div><b>' + name + '</b><small>' + (c.role || 'ATK · Crew') + '</small></div>';
      var r = el.getBoundingClientRect(), hostR = root.getBoundingClientRect();
      tip.style.left = (r.left + r.width / 2 - hostR.left) + 'px';
      tip.style.top = (r.top - hostR.top + 6) + 'px';
      tip.classList.add('on');
    }
    function hide() {
      svg.classList.remove('has-hot'); tip.classList.remove('on');
      chars.forEach(function (n) { n.classList.remove('hot'); });
      chips.forEach(function (n) { n.classList.remove('hot'); });
    }
    chars.forEach(function (n) {
      var name = n.getAttribute('data-name');
      n.addEventListener('pointerenter', function () { show(name, n.querySelector('.bob')); });
      n.addEventListener('pointerleave', hide);
      n.addEventListener('focus', function () { show(name, n.querySelector('.bob')); });
      n.addEventListener('blur', hide);
      n.addEventListener('pointerdown', function () { show(name, n.querySelector('.bob')); });
    });
    chips.forEach(function (n) {
      var name = n.getAttribute('data-chip');
      var sel = function () { var el = svg.querySelector('.char[data-name="' + name + '"] .bob'); if (el) show(name, el); };
      n.addEventListener('pointerenter', sel); n.addEventListener('pointerleave', hide); n.addEventListener('focus', sel); n.addEventListener('blur', hide);
    });
    document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('.char')) hide(); });
  }

  global.Crew = { Scene: Scene, F: F, C: C, P: P, U: U, ZH: ZH, box: box, poly: poly, pts: pts, shade: shade, figure: figure, commonDefs: commonDefs, bind: bind, planeY: planeY, planeX: planeX, planeF: planeF };
})(window);
