// Partneruitnodiging: leest token en invitationId uit de URL-fragment en zet de
// app-link klaar. Het token is een privégegeven: niet loggen, niet in de
// paginatekst zetten en niet opslaan.
(function () {
  "use strict";

  // Dezelfde regels als in de app.
  var TOKEN_PATTERN = /^[a-zA-Z0-9-]{20,100}$/;
  var INVITATION_ID_PATTERN = /^[a-zA-Z0-9_-]{20,200}$/;

  var intro = document.getElementById("invite-intro");
  var openLink = document.getElementById("invite-open");
  var error = document.getElementById("invite-error");

  function render() {
    var params = new URLSearchParams(location.hash.slice(1));
    var token = params.get("token") || "";
    var invitationId = params.get("invitationId") || "";
    var valid = TOKEN_PATTERN.test(token) && INVITATION_ID_PATTERN.test(invitationId);

    if (valid) {
      openLink.setAttribute(
        "href",
        "klaariskees://invite-accept?token=" + encodeURIComponent(token) +
          "&invitationId=" + encodeURIComponent(invitationId)
      );
    } else {
      openLink.removeAttribute("href");
    }

    intro.hidden = !valid;
    openLink.hidden = !valid;
    error.hidden = valid;
  }

  render();
  window.addEventListener("hashchange", render);
})();
