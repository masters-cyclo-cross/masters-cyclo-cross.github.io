// Ricorda sul telefono quali tappe sono state trovate e disegna i timbri.
// Ogni pagina dichiara il suo numero con <body data-tappa="3">.
(function () {
  var TOTALE = 5;
  var CHIAVE = "caccia-cx-tappe";
  var tappa = parseInt(document.body.dataset.tappa, 10);

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
  var label = document.querySelector(".step-label");
  if (label) label.textContent = "Tappa " + tappa + " di " + TOTALE;
})();
