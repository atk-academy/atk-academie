/* ATK — Notre Crew : les 3 appartements V1 + montage de la page */
(function (global) {
  'use strict';
  var Crew = global.Crew, C = Crew.C, F = Crew.F, Scene = Crew.Scene;

  /* ---------- Le crew ---------- */
  var HOODIE_RED = '#b3211a', WINE = '#5a1410', JACKET = '#8f1913', WHITE_T = '#ece3e1';
  var ROSTER = {
    Kairo:      { avatar: 'assets/crew-kairo.png',    pose: 'arms_crossed' },
    Ezekiel:    { avatar: 'assets/crew-ezekiel.png',  pose: 'lounge', band: '#8a3cff' },
    Youzeo:     { avatar: 'assets/crew-youzeo.png',   pose: 'sit_game' },
    Enclume:    { avatar: 'assets/crew-enclume.png',  pose: 'cross_legs' },
    Greg:       { avatar: 'assets/crew-greg.png', pose: 'wall_lean' },
    Lunatic:    { avatar: 'assets/crew-lunatic.png', pose: 'lean_forward' },
    Doffrite:   { avatar: 'assets/crew-doffrite.png', pose: 'slouch' },
    Vibromax:   { avatar: 'assets/crew-vibromax.png', pose: 'watch_l' },
    Asko:       { avatar: 'assets/crew-asko.png', pose: 'point' },
    MarkArthur: { avatar: 'assets/crew-markarthur.png', pose: 'bar_sit' }
  };
  var ORDER = ['Kairo', 'Ezekiel', 'Youzeo', 'Enclume', 'Greg', 'Lunatic', 'Doffrite', 'Vibromax', 'Asko', 'MarkArthur'];

  function who(name, o) { var c = {}, k; for (k in ROSTER[name]) c[k] = ROSTER[name][k]; c.name = name; for (k in (o || {})) c[k] = o[k]; return c; }
  function neonInner(w, text, size, col) {
    var f = 'font-family="\'Metal Mania\',\'Pirata One\',serif" font-size="' + size + '" text-anchor="middle"';
    return '<text x="' + (w / 2) + '" y="' + (size * .82) + '" ' + f + ' fill="none" stroke="' + col + '" stroke-width=".07" filter="url(#glow)">' + text + '</text>' +
      '<text x="' + (w / 2) + '" y="' + (size * .82) + '" ' + f + ' fill="#fff" fill-opacity=".93" stroke="' + col + '" stroke-width=".02">' + text + '</text>';
  }

  /* =================================================================
     V1-A  « LOFT » — grande pièce ouverte : salon, bar, DJ, billard, coin gaming
     ================================================================= */
  function sceneA() {
    var S = new Scene(15, 11, 4.4);
    Crew.commonDefs(S);
    S.room({ floorA: '#0e0808', floorB: '#100909', wall: '#140909', floorRim: C.red, stripe: C.red, stripeZ: 1.15 });

    // murs
    F.tvWall(S, 2.4, 3.55, 4.4, 1.8);
    F.window(S, 9.0, 3.8, 5.3, 2.5, { seed: 5 });
    S.beam([[9, .3], [14.3, .3], [12.6, 6], [7.4, 6]], .06);
    S.wallX(7.6, 3.9, neonInner(5.0, 'ATK', 1.6, C.red));
    F.poster(S, 'x', 10.6, 3.1, 1.3, 1.7);
    F.poster(S, 'x', 8.9, 2.7, .9, 1.2, { border: C.red });
    F.lantern(S, 0.9, 2.6, 3.8); F.lantern(S, 0.9, 5.2, 3.8); F.lantern(S, 8.4, .6, 3.8, .1);

    // cuisine / bar (mur de gauche)
    F.fridge(S, .1, .15);
    F.counter(S, .1, 1.4, 1.25, 5.4);
    F.stool(S, 1.85, 2.5); F.stool(S, 1.85, 4.2); F.stool(S, 1.85, 5.9);

    // salon
    F.rug(S, 2.2, 1.8, 5.0, 3.6, '#150707', C.red);
    S.pool(4.7, 3.4, 3.4, 'R', .3); S.pool(11.0, 1.9, 2.8, 'R', .26); S.pool(2.6, 3.9, 2.2, 'R', .2); S.pool(9.8, 6.2, 3.2, 'W', .07); S.pool(12.2, 9.2, 2.6, 'R', .18);
    F.sofa(S, 1.8, .15, 5.6, { pillows: true, rim: C.red });
    F.coffeeTable(S, 3.5, 2.7, 2.2, 1.1);
    F.lamp(S, 7.95, .25, 2.3);

    // DJ sous la baie vitrée
    F.speaker(S, 8.75, .3, 1.4); F.speaker(S, 12.75, .3, 1.4);
    F.dj(S, 9.6, .3, 2.8, 1.0);

    // billard
    F.poolTable(S, 8.0, 5.2, 3.8, 2.0);

    // coin gaming
    F.chair(S, 3.6, 6.6);
    F.desk(S, 2.8, 7.9, 3.0, 1.0);
    F.monitorBack(S, 3.3, 8.15, 1.3); F.laptopBack(S, 4.75, 8.1);

    // coin lounge (devant à droite)
    F.rug(S, 10.4, 8.0, 4.2, 2.6, '#150707', C.red);
    F.armchair(S, 10.9, 8.3, { rim: C.red });
    F.coffeeTable(S, 12.5, 8.9, 1.6, .9, { items: false });

    // personnes (debout : z = 0 ; assis : z = hauteur de l'assise)
    S.person(who('Ezekiel'), 3.5, .95, .5);
    S.person(who('Lunatic'), 6.4, 1.0, .5);
    S.person(who('Greg'), 2.7, 1.8, 0);
    S.person(who('MarkArthur'), 2.1, 4.45, .88);
    S.person(who('Doffrite'), .75, 8.0, 0);
    S.person(who('Kairo'), 9.0, 3.5, 0);
    S.person(who('Vibromax'), 11.0, 2.3, 0);
    S.person(who('Asko'), 12.9, 5.5, 0);
    S.person(who('Youzeo'), 4.0, 7.0, .5);
    S.person(who('Enclume'), 6.7, 4.4, .1);
    return S;
  }

  /* =================================================================
     V1-B  « PENTHOUSE NOIR » — baie vitrée panoramique, canapé d'angle, bar îlot
     ================================================================= */
  function sceneB() {
    var S = new Scene(15, 11, 4.6);
    Crew.commonDefs(S);
    S.room({ floorA: '#0d0707', floorB: '#0f0808', wall: '#120a0a', wallTop: '#3a2626', floorRim: C.white, stripe: C.white, stripeZ: 1.1, base: '#070303' });

    F.window(S, 1.4, 4.0, 12.2, 2.7, { seed: 21, frame: C.white });
    S.beam([[1.4, .3], [13.6, .3], [11.8, 6.5], [3.2, 6.5]], .045);
    S.wallX(8.2, 3.9, neonInner(4.6, 'ATK', 1.7, C.red));
    F.poster(S, 'x', 10.4, 3.0, 1.4, 1.9, { bg: '#0b0505' });
    F.strip(S, [[0, 0, 4.6], [15, 0, 4.6]], C.red, 3);
    F.strip(S, [[0, 0, 4.6], [0, 11, 4.6]], C.red, 3);
    F.lantern(S, 5.0, 3.6, 3.9, .1); F.lantern(S, 10.0, 3.6, 3.9, .1);

    // salon d'angle
    F.rug(S, 2.0, 2.0, 6.2, 4.4, '#110707', C.white);
    S.pool(5.0, 3.6, 3.6, 'W', .12); S.pool(11.3, 2.4, 2.6, 'R', .22); S.pool(11.3, 6.8, 3.0, 'R', .2); S.pool(3.2, 9.5, 2.6, 'R', .22);
    F.sofa(S, 1.8, .15, 6.4, { pillows: true, rim: C.white, col: '#201212' });
    F.sofaL(S, .15, 1.55, 4.8, { rim: C.white, col: '#201212' });
    F.coffeeTable(S, 3.8, 3.3, 2.4, 1.2, { rim: C.white });
    F.lamp(S, 8.7, .3, 2.4, C.white);

    // îlot de bar
    F.counter(S, 9.0, 6.2, 4.6, 1.2, { rim: C.red });
    F.stool(S, 9.6, 7.75); F.stool(S, 10.9, 7.75); F.stool(S, 12.2, 7.75);

    // bureau gamer en îlot
    F.chair(S, 10.2, 1.6);
    F.desk(S, 9.6, 3.0, 3.4, 1.0);
    F.monitorBack(S, 10.1, 3.25, 1.3); F.laptopBack(S, 11.6, 3.2);

    // DJ + lounge
    F.speaker(S, .5, 9.2, 1.4); F.speaker(S, 5.0, 9.2, 1.4);
    F.dj(S, 1.6, 9.0, 3.2, 1.0);

    S.person(who('Ezekiel'), 3.6, .95, .5);
    S.person(who('Lunatic'), 6.7, 1.0, .5);
    S.person(who('Kairo'), 7.6, 5.0, 0);
    S.person(who('Doffrite'), .75, 7.6, 0);
    S.person(who('Greg'), 11.2, 5.6, 0);
    S.person(who('MarkArthur'), 9.85, 8.0, .88);
    S.person(who('Asko'), 13.4, 9.0, 0);
    S.person(who('Youzeo'), 10.6, 2.0, .5);
    S.person(who('Vibromax'), 3.2, 8.2, 0);
    S.person(who('Enclume'), 7.0, 5.3, .1);
    return S;
  }

  /* =================================================================
     V1-C  « TAVERNE ATK » — clin d'œil Sea of Thieves : tonneaux, gouvernail, bannières
     ================================================================= */
  function sceneC() {
    var S = new Scene(15, 11, 4.6);
    Crew.commonDefs(S);
    S.room({ floorA: '#0f0706', floorB: '#110807', wall: '#180b09', floorRim: C.red, stripe: '#6a1812', stripeZ: 1.0, wallTop: '#33201c' });

    F.wheel(S, 1.9, 3.9, .95);
    F.banner(S, 'y', 5.8, 4.1, 1.3, 2.3);
    F.banner(S, 'y', 12.6, 4.1, 1.3, 2.3);
    F.window(S, 7.6, 3.6, 3.8, 2.1, { seed: 33 });
    S.beam([[7.6, .3], [11.4, .3], [10.2, 5], [6.4, 5]], .05);
    F.poster(S, 'x', 10.4, 3.1, 1.3, 1.7);
    F.poster(S, 'x', 8.6, 2.8, .9, 1.3, { border: C.red });
    F.lantern(S, 3.5, 2.6, 3.8); F.lantern(S, 7.0, 3.6, 4.0, .15); F.lantern(S, 11.0, 3.2, 3.8);

    // salon-taverne
    F.rug(S, 2.2, 1.8, 4.4, 3.6, '#150707', C.red);
    S.pool(4.6, 3.6, 3.4, 'R', .3); S.pool(11.8, 2.0, 2.8, 'R', .24); S.pool(9.8, 6.3, 3.4, 'R', .2); S.pool(7.3, 9.4, 2.6, 'R', .2);
    F.sofa(S, 1.6, .15, 5.4, { pillows: true, rim: C.red, col: '#2a1311' });
    F.chest(S, 3.3, 2.9, 1.5);
    F.armchair(S, 7.4, .35, { rim: C.red, col: '#2a1311' });

    // bar à tonneaux
    F.counter(S, 9.8, .4, 4.4, 1.1, { col: '#2a1311', top: '#4a2a24', top2: '#5a3630', rim: C.red });
    F.barrel(S, 8.9, 1.9, .85); F.barrel(S, 14.0, 1.9, .85);
    F.stool(S, 11.5, 2.3);

    // grande table + bancs
    F.desk(S, 7.2, 5.6, 5.2, 1.4, { col: '#2a1311', top: '#4a2a24', rim: C.red });
    S.box(7.2, 4.65, 0, 5.2, .55, .5, '#2a1311', { top: '#3a1e1a' });
    S.box(7.2, 7.35, 0, 5.2, .55, .5, '#2a1311', { top: '#3a1e1a' });
    S.box(8.0, 6.1, .84, .5, .4, .06, C.red, { top: C.red2 }); S.box(10.4, 6.2, .84, .5, .3, .12, C.white, { top: '#fff' });

    // coin gaming / DJ
    F.chair(S, 3.0, 7.0); F.desk(S, 2.3, 8.3, 2.9, 1.0, { col: '#2a1311', top: '#3a1e1a' });
    F.monitorBack(S, 2.8, 8.55, 1.2); F.laptopBack(S, 4.1, 8.5);
    F.dj(S, 6.0, 9.0, 2.6, 1.0);
    F.speaker(S, 5.2, 9.2, 1.2); F.speaker(S, 8.9, 9.2, 1.2);
    F.barrel(S, .3, 3.9, .9); F.barrel(S, .3, 4.9, .9);

    S.person(who('Ezekiel'), 2.9, .95, .5);
    S.person(who('Lunatic'), 5.6, 1.0, .5);
    S.person(who('MarkArthur'), 11.75, 2.55, .88);
    S.person(who('Kairo'), 6.8, 3.4, 0);
    S.person(who('Greg'), 8.6, 4.95, .5);
    S.person(who('Doffrite'), 10.8, 4.95, .5);
    S.person(who('Asko'), 9.7, 7.65, .5);
    S.person(who('Youzeo'), 3.4, 7.4, .5);
    S.person(who('Vibromax'), 7.3, 8.3, 0);
    S.person(who('Enclume'), 5.4, 4.5, .1);
    return S;
  }

  /* =================================================================
     5 NOUVEAUX PENTHOUSES (style adulte : noir, rouge, blanc froid)
     ================================================================= */
  function put(S, name, x, y, z, pose) { S.person(who(name, pose ? { pose: pose } : {}), x, y, z); }
  var DARK = '#1c1010', DARK_T = '#2e1b1b';

  // P1 — SKYLINE : baie vitrée d'angle, canapé en U autour d'un foyer, bar îlot, DJ, salle à manger
  function sceneP1() {
    var S = new Scene(16, 14, 4.8, { cam: .36, cropTop: .2 });
    Crew.commonDefs(S);
    S.room({ floorA: '#0d0707', floorB: '#0f0808', wall: '#100909', floorRim: C.white, stripe: C.white, stripeZ: 1.1, base: '#070303' });
    F.window(S, 1.2, 4.2, 13.6, 2.9, { seed: 3, frame: C.white });
    F.window(S, 10.8, 4.2, 8.6, 2.9, { side: 'x', seed: 9, frame: C.white });
    S.beam([[1.2, .3], [14.8, .3], [12.5, 7], [3.5, 7]], .045);
    F.strip(S, [[0, 0, 4.8], [16, 0, 4.8]], C.red, 3); F.strip(S, [[0, 0, 4.8], [0, 12, 4.8]], C.red, 3);
    // salon en U
    S.box(.15, .15, 0, 1.25, 1.45, .98, DARK, { top: DARK_T });
    F.sofa(S, 1.4, .15, 7.6, { pillows: true, rim: C.white, col: DARK });
    F.sofaL(S, .15, 1.6, 5.6, { rim: C.white, col: DARK });
    F.rug(S, 2.0, 2.2, 6.6, 4.8, '#110707', C.white);
    F.firepit(S, 5.2, 4.6, .95);
    // DJ + bar îlot
    F.speaker(S, 9.7, .3, 1.4); F.speaker(S, 14.2, .3, 1.4); F.dj(S, 10.6, .3, 3.2, 1.0);
    F.counter(S, 10.0, 4.6, 4.8, 1.2, { rim: C.red });
    F.stool(S, 10.6, 6.15); F.stool(S, 11.9, 6.15); F.stool(S, 13.2, 6.15);
    // salle à manger + poste gaming
    F.diningTable(S, 3.0, 8.5, 5.4, 1.3, 4);
    F.chair(S, 11.0, 8.1); F.desk(S, 10.4, 9.3, 3.2, 1.0); F.monitorBack(S, 10.9, 9.55, 1.3); F.laptopBack(S, 12.4, 9.5);

    put(S, 'Ezekiel', 3.6, .74, .52); put(S, 'Lunatic', 7.0, .76, .52);
    put(S, 'Kairo', 15.3, 2.6, 0); put(S, 'Greg', .6, 9.6, 0);
    put(S, 'Enclume', 6.9, 5.9, .1); put(S, 'Doffrite', 4.0, 12.8, 0);
    put(S, 'MarkArthur', 10.85, 6.4, .88); put(S, 'Youzeo', 11.4, 8.5, .5);
    put(S, 'Vibromax', 13.4, 11.9, 0); put(S, 'Asko', 14.5, 12.1, 0);
    return S;
  }

  // P2 — GALERIE : œuvres sous spots, sculpture lumineuse, très épuré
  function sceneP2() {
    var S = new Scene(16, 14, 4.8, { cam: .30, cropTop: .27 });
    Crew.commonDefs(S);
    S.room({ floorA: '#0e0909', floorB: '#0e0909', wall: '#0f0a0a', wallTop: '#2a1c1c', floorRim: C.white, stripe: false, base: '#070303' });
    F.window(S, 1.6, 3.9, 3.4, 2.8, { seed: 31, frame: C.white }); F.art(S, 'y', 6.6, 3.7, 3.4, 2.5, 'logo'); F.art(S, 'y', 11.4, 3.7, 3.0, 2.5, 'lines');
    F.art(S, 'x', 10.4, 3.6, 1.9, 2.3, 'split'); F.window(S, 7.9, 3.9, 2.4, 2.8, { side: 'x', seed: 17, frame: C.white }); F.art(S, 'x', 4.8, 3.6, 1.9, 2.3, 'lines');
    S.cone(3.5, 2.4, 1.5, .2); S.cone(8.3, 2.4, 1.6, .2); S.cone(12.9, 2.4, 1.5, .2);
    S.cone(1.8, 9.4, 1.3, .18); S.cone(1.8, 6.6, 1.3, .18); S.cone(1.8, 3.8, 1.3, .18);
    F.sofa(S, 2.2, .15, 4.6, { pillows: true, rim: C.white, col: DARK });
    F.sofa(S, 9.6, .15, 5.0, { rim: C.white, col: DARK });

    F.sculpture(S, 8.4, 5.6);
    S.box(4.4, 7.0, 0, 2.6, .7, .45, DARK, { top: DARK_T, rim: C.white }); S.box(9.8, 7.0, 0, 2.6, .7, .45, DARK, { top: DARK_T, rim: C.white });
    F.armchair(S, 2.4, 8.6, { col: DARK, rim: C.white }); F.armchair(S, 12.6, 8.6, { col: DARK, rim: C.white });
    put(S, 'Ezekiel', 3.5, .74, .52); put(S, 'Lunatic', 11.5, .76, .52);
    put(S, 'Kairo', 8.6, .6, 0); put(S, 'Greg', .6, 4.6, 0);
    put(S, 'Vibromax', 5.6, 5.1, 0); put(S, 'Asko', 6.7, 5.3, 0);
    put(S, 'MarkArthur', 5.7, 7.35, .45); put(S, 'Youzeo', 2.95, 9.15, .5, 'lean_forward');
    put(S, 'Enclume', 13.2, 8.2, .02); put(S, 'Doffrite', 9.0, 12.6, 0);
    return S;
  }

  // P3 — SPEAKEASY : bar à bouteilles rétro-éclairées, cheminée, billard sous suspensions
  function sceneP3() {
    var S = new Scene(15, 14, 4.6, { cam: .40, cropTop: .14 });
    Crew.commonDefs(S);
    S.room({ floorA: '#0d0706', floorB: '#100807', planks: '#2c1612', wall: '#160a08', wallTop: '#2e1c18', floorRim: C.red, stripe: '#6a1812', stripeZ: 1.0 });
    // mur de gauche : grandes baies vitrées sur la ville
    F.window(S, 13.2, 4.25, 11.4, 3.7, { side: 'x', seed: 23, frame: C.white });
    // mur du fond : étagère de bouteilles, cheminée, logo
    F.bottles(S, 2.4, 3.9, 8.6, 3);
    F.fireWall(S, 11.8, 3.3, 2.1, 1.5); S.pool(12.9, 2.8, 2.6, 'R', .35);
    F.art(S, 'y', 12.2, 4.5, 1.0, 1.0, 'logo');
    S.beam([[0, 2.6], [5.2, 2.6], [7.4, 11], [0, 11]], .05);
    // bar
    F.counter(S, 2.2, 1.6, 8.8, 1.2, { col: '#2a1311', top: '#3a2220', rim: C.red });
    F.stool(S, 3.0, 3.1); F.stool(S, 4.6, 3.1); F.stool(S, 6.2, 3.1); F.stool(S, 7.8, 3.1); F.stool(S, 9.4, 3.1);
    F.armchair(S, 12.1, 1.5, { col: '#2a1311', rim: C.red });
    // salon
    F.rug(S, 1.9, 5.0, 4.4, 3.4, '#150707', C.red);
    F.sofaL(S, .15, 4.6, 4.2, { rim: C.red, col: '#2a1311' });
    F.coffeeTable(S, 3.2, 5.8, 1.6, .9);
    F.plant(S, .55, 3.6, 1.5);
    // billard sous suspensions
    F.poolTable(S, 6.8, 6.4, 3.8, 2.0); F.pendant(S, 8.0, 7.4, 1.6); F.pendant(S, 9.8, 7.4, 1.6);
    S.cone(8.0, 7.4, 1.5, .16); S.cone(9.8, 7.4, 1.5, .16);
    // coin bureau + DJ
    F.chair(S, 11.2, 8.2); F.desk(S, 10.8, 9.3, 2.6, 1.1, { col: '#2a1311', top: '#3a2220' }); F.laptopBack(S, 11.8, 9.55);
    F.speaker(S, .5, 10.0, 1.3); F.speaker(S, 4.9, 10.0, 1.3); F.dj(S, 1.6, 10.2, 3.0, 1.0);
    F.plant(S, 14.2, 12.6, 1.5);
    put(S, 'Ezekiel', .72, 6.1, .52, 'lounge_l'); S.person(who('Lunatic', { pose: 'armchair', scale: .95, fp: .75 }), 12.6, 2.02, .5);
    put(S, 'MarkArthur', 3.25, 3.35, .88); put(S, 'Doffrite', 9.65, 3.35, .88, 'bar_sit');
    put(S, 'Kairo', 14.2, 5.6, 0); put(S, 'Greg', .6, 12.2, 0);
    put(S, 'Vibromax', 11.6, 8.6, .5, 'sit_game'); put(S, 'Asko', 4.8, 7.8, .1, 'cross_legs');
    put(S, 'Youzeo', 8.2, 12.0, 0, 'watch_l'); put(S, 'Enclume', 9.3, 12.2, 0, 'point');
    return S;
  }

  // P4 — STUDIO HUB : mur LED, trois postes, console DJ, baies serveur, bar
  function sceneP4() {
    var S = new Scene(16, 14, 4.8, { cam: .34, cropTop: .22 });
    Crew.commonDefs(S);
    S.room({ floorA: '#0b0707', floorB: '#0d0808', wall: '#0f0909', wallTop: '#2a1919', floorRim: C.red, stripe: C.red, stripeZ: 1.25 });
    F.ledWall(S, 2.0, 4.1, 12.0, 2.6);
    F.window(S, 10.6, 3.9, 5.4, 2.4, { side: 'x', seed: 12 }); F.art(S, 'x', 5.0, 3.3, 1.6, 2.0, 'logo');
    F.strip(S, [[0, 0, 4.8], [16, 0, 4.8]], C.red, 3);
    S.pool(8.0, 2.6, 4.2, 'R', .22);
    F.sofa(S, 3.0, .15, 5.6, { rim: C.red, col: DARK });
    F.speaker(S, 10.4, .3, 1.4); F.console(S, 11.2, .3, 2.8, 1.0); F.speaker(S, 14.3, .3, 1.4);
    F.rack(S, 15.0, 3.0); F.rack(S, 15.0, 4.0);
    [2.6, 6.6, 10.6].forEach(function (x) {
      F.chair(S, x + 1.1, 4.8); F.desk(S, x, 6.0, 3.0, 1.0); F.monitorBack(S, x + .45, 6.25, 1.3); F.laptopBack(S, x + 1.9, 6.2);
    });
    F.sofa(S, 2.4, 8.8, 4.8, { rim: C.red, col: DARK }); F.coffeeTable(S, 3.4, 10.5, 2.0, .8, { items: false });
    F.counter(S, 9.6, 8.8, 5.0, 1.2); F.stool(S, 10.2, 10.3); F.stool(S, 11.5, 10.3); F.stool(S, 12.8, 10.3);
    put(S, 'Ezekiel', 5.0, .74, .52); put(S, 'Kairo', 8.9, .6, 0); put(S, 'Greg', .6, 5.2, 0);
    put(S, 'Youzeo', 4.1, 5.3, .5); put(S, 'Lunatic', 8.1, 5.3, .5); put(S, 'Enclume', 12.1, 5.3, .5, 'sit_game');
    put(S, 'Doffrite', 3.4, 9.4, .5, 'lean_forward'); put(S, 'MarkArthur', 10.45, 10.55, .88);
    put(S, 'Vibromax', 13.0, 12.6, 0); put(S, 'Asko', 14.1, 12.8, 0);
    return S;
  }

  // P5 — TERRASSE : salon intérieur + toit-terrasse avec foyer, transats et garde-corps en verre
  function sceneP5() {
    var S = new Scene(17, 14, 4.8, { cam: .38, cropTop: .18 });
    Crew.commonDefs(S);
    S.room({ floorA: '#0d0707', floorB: '#0f0808', wall: '#100909', wallTop: '#2a1919', floorRim: C.white, stripe: C.white, stripeZ: 1.1, base: '#070303' });
    F.window(S, 1.0, 4.1, 8.8, 2.8, { seed: 4, frame: C.white });
    F.window(S, 10.4, 4.5, 6.5, 4.4, { seed: 8, frame: '#000' });
    S.box(10.4, 0, 0, 6.6, .25, .9, '#140b0b', { top: '#2a1a1a' });
    F.deckFloor(S, 10.4, 0, 17, 14);
    S.beam([[1.0, .3], [9.8, .3], [8.2, 6], [2.6, 6]], .045);
    S.wallX(6.4, 3.9, neonInner(4.4, 'ATK', 1.6, C.red)); F.art(S, 'x', 10.8, 3.2, 1.4, 1.8, 'logo');
    // intérieur
    F.sofa(S, 1.6, .15, 6.6, { pillows: true, rim: C.white, col: DARK });
    F.rug(S, 1.8, 1.8, 6.6, 4.4, '#110707', C.white); F.coffeeTable(S, 3.8, 3.2, 2.6, 1.2, { rim: C.white });
    F.counter(S, .1, 1.8, 1.25, 4.4); F.stool(S, 1.85, 2.6); F.stool(S, 1.85, 4.0); F.stool(S, 1.85, 5.4);
    F.chair(S, 5.0, 7.1); F.desk(S, 4.2, 8.2, 3.0, 1.0); F.monitorBack(S, 4.7, 8.45, 1.3); F.laptopBack(S, 6.2, 8.4);

    // terrasse
    F.firepit(S, 13.6, 5.4, .95);
    F.lounger(S, 11.0, 2.9); F.lounger(S, 15.6, 2.9); F.lounger(S, 11.0, 7.0); F.lounger(S, 15.6, 7.0);
    F.counter(S, 13.6, 9.6, 3.0, 1.0, { rim: C.red }); F.stool(S, 14.2, 11.0); F.stool(S, 15.5, 11.0);
    F.railing(S, 10.4, 14, 17, 14, 1.05); F.railing(S, 17, 0.3, 17, 14, 1.05);
    put(S, 'Ezekiel', 3.3, .74, .52); put(S, 'Lunatic', 6.5, .76, .52);
    put(S, 'Greg', .6, 9.8, 0); put(S, 'MarkArthur', 2.1, 4.25, .88);
    put(S, 'Enclume', 7.2, 4.6, .1); put(S, 'Youzeo', 5.4, 7.5, .5);
    put(S, 'Doffrite', 11.45, 3.5, .4, 'lounge'); put(S, 'Kairo', 16.3, 9.0, 0);
    put(S, 'Vibromax', 11.2, 13.0, 0); put(S, 'Asko', 12.3, 13.2, 0);
    return S;
  }

  var VERSIONS = {
    A: { build: sceneA, label: 'A · Loft', sub: 'Les ATK', group: 'v1' },
    B: { build: sceneB, label: 'B · Penthouse', sub: 'Les ATK', group: 'v1' },
    C: { build: sceneC, label: 'C · Taverne', sub: 'Les ATK', group: 'v1' },
    P1: { build: sceneP1, label: 'P1 · Skyline', sub: 'Les ATK', group: 'p' },
    P2: { build: sceneP2, label: 'P2 · Galerie', sub: 'Les ATK', group: 'p' },
    P3: { build: sceneP3, label: 'P3 · Speakeasy', sub: 'Les ATK', group: 'p' },
    P4: { build: sceneP4, label: 'P4 · Studio', sub: 'Les ATK', group: 'p' },
    P5: { build: sceneP5, label: 'P5 · Terrasse', sub: 'Les ATK', group: 'p' }
  };
  function hrefOf(k) { return k.length === 1 ? 'crew-v1' + k.toLowerCase() + '.html' : 'crew-' + k.toLowerCase() + '.html'; }

  function mount(key, opts) {
    opts = opts || {};
    var v = VERSIONS[key] || VERSIONS.A, S = v.build();
    var app = document.getElementById('app');
    var tabs = Object.keys(VERSIONS).filter(function (k) { return VERSIONS[k].group === v.group; }).map(function (k) { return '<a href="' + hrefOf(k) + '" class="' + (k === key ? 'on' : '') + '">' + VERSIONS[k].label + '</a>'; }).join('') +
      '<a class="alt" href="' + (v.group === 'p' ? 'crew-v1a.html' : 'crew-p1.html') + '">' + (v.group === 'p' ? 'Anciens lofts' : 'Penthouses') + ' →</a>';
    var chips = ORDER.map(function (n) { return '<button type="button" class="chip" data-chip="' + n + '">' + n + '</button>'; }).join('');
    app.innerHTML =
      '<div class="page" id="page"><div class="bg"></div><div class="grain"></div><div class="vig"></div>' +
      '<header class="top"><a class="back" href="index.html">← Accueil</a>' +
      '<div class="ttl"><h1>Les ATK</h1></div><nav class="vers">' + (opts.solo ? '' : tabs) + '</nav></header>' +
      '<main class="stage">' + S.render() + '</main>' +
      '<footer class="chips">' + chips + '</footer>' +
      '<div class="tip" id="tip"></div></div>';
    Crew.bind(document.getElementById('page'), document.getElementById('tip'), ORDER.map(function (n) { return { name: n, avatar: ROSTER[n].avatar, role: ROSTER[n].role }; }));
  }

  global.CrewScenes = { mount: mount, _roster: ROSTER, _who: who };
})(window);
