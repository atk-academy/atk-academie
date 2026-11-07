/* ATK — « Les ATK » : la musique de l'accueil continue, mais passée dans une pièce (réverbération + son un peu étouffé). */
(function () {
  'use strict';
  var SRC = 'assets/bg-music-bandz.mp3';
  var LEVEL = .42;                     // volume global
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('atkMusic') || 'null'); } catch (e) {}
  var t0 = saved && (Date.now() - saved.ts) < 120000 ? saved.t : 0;     // on reprend là où l'accueil s'est arrêté
  var muted = !!(saved && saved.muted);

  var audio = new Audio(SRC);
  audio.loop = true; audio.preload = 'auto';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = AC ? new AC() : null, master, dry, wet, dryLP, started = false;

  // Réponse impulsionnelle d'une pièce : bruit qui s'éteint, de plus en plus sourd (les aigus meurent plus vite)
  function impulse(sec, decay) {
    var sr = ctx.sampleRate, len = Math.floor(sr * sec), pre = Math.floor(sr * .028), buf = ctx.createBuffer(2, len, sr), c, i, d, lp, x;
    for (c = 0; c < 2; c++) {
      d = buf.getChannelData(c); lp = 0;
      for (i = pre; i < len; i++) {
        var k = (i - pre) / (len - pre), a = .5 + .45 * k;                       // lissage croissant
        x = (Math.random() * 2 - 1) * Math.pow(1 - k, decay);
        lp = lp * a + x * (1 - a); d[i] = lp * (1.6 - k);
      }
    }
    return buf;
  }

  function build() {
    var src = ctx.createMediaElementSource(audio);
    master = ctx.createGain(); master.gain.value = 0;
    dryLP = ctx.createBiquadFilter(); dryLP.type = 'lowpass'; dryLP.frequency.value = 9000;
    dry = ctx.createGain(); dry.gain.value = 1;
    var wetLP = ctx.createBiquadFilter(); wetLP.type = 'lowpass'; wetLP.frequency.value = 2600;
    var conv = ctx.createConvolver(); conv.buffer = impulse(3.4, 2.6);
    wet = ctx.createGain(); wet.gain.value = 0;
    src.connect(dryLP); dryLP.connect(dry); dry.connect(master);
    src.connect(wetLP); wetLP.connect(conv); conv.connect(wet); wet.connect(master);
    master.connect(ctx.destination);
  }

  function enter() {                     // la musique « entre dans la pièce » : le direct s'estompe, l'écho prend la place
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(muted ? 0 : LEVEL, t, .9);
    dry.gain.setTargetAtTime(.34, t, 1.6);
    dryLP.frequency.setTargetAtTime(3200, t, 1.8);
    wet.gain.setTargetAtTime(1.15, t, 1.4);
  }

  function start() {
    if (started || !ctx) return;
    started = true;
    try { build(); } catch (e) { started = false; return; }
    var go = function () { try { audio.currentTime = t0; } catch (e) {} };
    if (audio.readyState >= 1) go(); else audio.addEventListener('loadedmetadata', go, { once: true });
    ctx.resume().catch(function () {});
    var p = audio.play();
    if (p && p.catch) p.then(function () { if (ctx.state === 'running') enter(); else ctx.resume().then(enter); }).catch(function () { started = false; try { master.disconnect(); } catch (e) {} audio = rebuild(); });
    else enter();
  }
  function rebuild() { var a = new Audio(SRC); a.loop = true; a.preload = 'auto'; ctx = new AC(); return a; }   // autoplay refusé : on repart propre au 1er geste

  setTimeout(start, 300);
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function onG() { if (!started) start(); else if (ctx && ctx.state === 'suspended') ctx.resume(); }, { passive: true });
  });

  // onglet masqué : fondu vers le silence ; retour : fondu inverse
  document.addEventListener('visibilitychange', function () {
    if (!master) return;
    var t = ctx.currentTime; master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(document.hidden || muted ? 0 : LEVEL, t, document.hidden ? .8 : .6);
  });

  // ouvert par-dessus l'accueil : « ← Accueil » referme le panneau et la réverbération s'efface en douceur
  function leave() { if (!master) return; var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(0, t, .5); }
  if (/embed=1/.test(location.search)) {
    var back = document.querySelector('.back');
    if (back) back.addEventListener('click', function (e) { e.preventDefault(); leave(); try { parent.postMessage('atk-close-crew', '*'); } catch (x) {} });
  }

  // bouton son
  var b = document.createElement('button');
  b.type = 'button'; b.setAttribute('aria-label', 'Couper / activer le son'); b.textContent = muted ? '🔇' : '🔊';
  b.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:30;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(14,6,6,.6);color:#fff;font-size:18px;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
  b.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!started) { start(); return; }
    muted = !muted; b.textContent = muted ? '🔇' : '🔊';
    var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(muted ? 0 : LEVEL, t, .3);
  });
  document.body.appendChild(b);
})();
