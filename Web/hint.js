const HINT_MODAL = document.getElementById("hint-modal");
const HINT_BTN = document.getElementById("hint-btn");
const HINT_CLOSE_BTN = document.getElementsByClassName("close-hint")[0];

HINT_BTN.addEventListener("click", function() {
  HINT_MODAL.style.display = "block";
});

HINT_CLOSE_BTN.addEventListener("click", function() {
  HINT_MODAL.style.display = "none";
});

// Close hint after clicked outside of hint
window.addEventListener("click", function(event) {
  if (event.target == HINT_MODAL) {
    HINT_MODAL.style.display = "none";
  }
});

