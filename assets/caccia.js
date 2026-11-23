// Script comune a tutte le pagine.
// 1) Interruttore IT/EN (la lingua iniziale la sceglie lo snippet nel <head>).
// 2) Timbri: ricorda sul telefono quali tappe sono state trovate.
//    Ogni tappa dichiara il suo numero con <body data-tappa="3">; l'intro non ce l'ha.
(function () {
  var TOTALE = 5;

  // --- Lingua ---
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.dataset.set;
      document.documentElement.dataset.lang = l;
      document.documentElement.lang = l;
      try { localStorage.setItem("caccia-cx-lang", l); } catch (e) {}
    });
  });

  // --- Timbri ---
  var tappa = parseInt(document.body.dataset.tappa, 10);
  if (!tappa) return;

  var CHIAVE = "caccia-cx-tappe";
  var trovate = [];
  try { trovate = JSON.parse(localStorage.getItem(CHIAVE)) || []; } catch (e) {}
  if (trovate.indexOf(tappa) === -1) trovate.push(tappa);
  try { localStorage.setItem(CHIAVE, JSON.stringify(trovate)); } catch (e) {}

  var box = document.querySelector(".stamps");
  if (box) {
    for (var i = 1; i <= TOTALE; i++) {
      var s = document.createElement("div");
      s.className = "stamp" + (trovate.indexOf(i) !== -1 ? " done" : "");
      box.appendChild(s);
    }
  }
  document.querySelectorAll(".step-label .n").forEach(function (el) {
    el.textContent = tappa;
  });
})();
