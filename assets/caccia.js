// Script comune a tutte le pagine.
// 1) Interruttore IT/EN (la lingua iniziale la sceglie lo snippet nel <head>).
// 2) Timbri: ricorda sul telefono quali tappe sono state trovate.
// 3) Quiz: domande a scelta singola, con riquadro verde/rosso/blu e punteggio.
//
// Come si scrive una domanda nell'HTML:
//   <div class="q" data-type="quiz">        quiz = c'è una risposta giusta (vale 1 punto)
//                                            poll = domanda libera, nessun punto (riquadro blu)
//     <p class="q-text">…</p>
//     <div class="opts">
//       <button class="opt">…</button>
//       <button class="opt" data-ok>…</button>   ← data-ok sulla risposta giusta
//     </div>
//     <div class="info">…</div>                  ← curiosità mostrata dopo la risposta
//     <div class="info" data-opt="2">…</div>     ← (facoltativo) testo solo per la risposta n. 2 (si conta da 1)
//   </div>
// Il blocco .after (indizio o finale) compare quando tutte le domande della pagina hanno una risposta.
(function () {
  var TAPPE = 5;
  var DOMANDE_TOTALI = 9; // somma delle domande "quiz" di tutte le tappe: aggiornare se cambiano

  function leggi(k, def) { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } }
  function scrivi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // --- Lingua ---
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.dataset.set;
      document.documentElement.dataset.lang = l;
      document.documentElement.lang = l;
      try { localStorage.setItem("caccia-cx-lang", l); } catch (e) {}
    });
  });

  var tappa = parseInt(document.body.dataset.tappa, 10);
  if (!tappa) return; // pagina introduttiva: niente timbri né quiz

  // --- Timbri ---
  var trovate = leggi("caccia-cx-tappe", []);
  if (trovate.indexOf(tappa) === -1) { trovate.push(tappa); scrivi("caccia-cx-tappe", trovate); }
  var box = document.querySelector(".stamps");
  if (box) {
    for (var i = 1; i <= TAPPE; i++) {
      var s = document.createElement("div");
      s.className = "stamp" + (trovate.indexOf(i) !== -1 ? " done" : "");
      box.appendChild(s);
    }
  }
  document.querySelectorAll(".step-label .n").forEach(function (el) { el.textContent = tappa; });

  // --- Quiz ---
  var risposte = leggi("caccia-cx-risposte", {});
  var domande = Array.prototype.slice.call(document.querySelectorAll(".q"));

  function punteggio() {
    var p = 0;
    for (var k in risposte) if (risposte[k].ok) p++;
    return p;
  }

  function mostra(q, scelta) {
    var tipo = q.dataset.type;
    var opts = q.querySelectorAll(".opt");
    var giusta = q.querySelector(".opt[data-ok]");
    var ok = tipo === "quiz" && opts[scelta] === giusta;

    opts.forEach(function (o, idx) {
      o.disabled = true;
      if (idx === scelta) o.classList.add("picked");
      if (tipo === "quiz" && o === giusta) o.classList.add("right");
      if (tipo === "quiz" && idx === scelta && !ok) o.classList.add("wrong");
    });

    var fb = document.createElement("div");
    fb.className = "fb " + (tipo === "poll" ? "neutral" : ok ? "good" : "bad");
    var testa = document.createElement("p");
    testa.className = "fb-head";
    if (tipo === "quiz") {
      testa.innerHTML = ok
        ? '<span lang="it">✅ Corretto! +1 punto</span><span lang="en">✅ Correct! +1 point</span>'
        : '<span lang="it">❌ Sbagliato! La risposta giusta era:</span><span lang="en">❌ Wrong! The right answer was:</span> <strong>' + giusta.innerHTML + "</strong>";
      fb.appendChild(testa);
    }
    var info = q.querySelector('.info[data-opt="' + (scelta + 1) + '"]') || q.querySelector(".info:not([data-opt])");
    if (info) {
      var c = info.cloneNode(true);
      c.classList.add("shown");
      fb.appendChild(c);
    }
    if (fb.children.length) q.appendChild(fb); // niente riquadro vuoto se non c'è nulla da dire
    return ok;
  }

  function controllaFine() {
    var tutte = domande.every(function (q, idx) { return risposte[tappa + "." + idx]; });
    if (!tutte) return;
    var after = document.querySelector(".after");
    if (after) after.classList.add("shown");
    document.querySelectorAll(".score").forEach(function (el) { el.textContent = punteggio() + " / " + DOMANDE_TOTALI; });
  }

  domande.forEach(function (q, idx) {
    var chiave = tappa + "." + idx;
    var opts = q.querySelectorAll(".opt");
    if (risposte[chiave]) {
      mostra(q, risposte[chiave].pick); // già risposta: la si ritrova com'era
      return;
    }
    opts.forEach(function (o, n) {
      o.addEventListener("click", function () {
        if (risposte[chiave]) return;
        var ok = mostra(q, n);
        risposte[chiave] = { pick: n, ok: ok };
        scrivi("caccia-cx-risposte", risposte);
        controllaFine();
      });
    });
  });
  controllaFine();
})();
