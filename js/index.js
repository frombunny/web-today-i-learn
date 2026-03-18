const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");
const dateInput = document.querySelector("#til-date");
const titleInput = document.querySelector("#til-title");
const contentInput = document.querySelector("#til-content");
const modeToggleButton = document.querySelector("#mode-toggle");

function formatDisplayDate(dateValue) {
  return dateValue;
}

function createTilItem(dateValue, titleValue, contentValue) {
  const tilItem = document.createElement("article");
  tilItem.className = "til-item";

  const timeElement = document.createElement("time");
  timeElement.dateTime = dateValue;
  timeElement.textContent = formatDisplayDate(dateValue);

  const titleElement = document.createElement("h3");
  titleElement.textContent = titleValue;

  const contentElement = document.createElement("p");
  contentElement.textContent = contentValue;

  tilItem.append(timeElement, titleElement, contentElement);

  return tilItem;
}

if (tilForm && tilList && dateInput && titleInput && contentInput) {
  if (!dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  tilForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const dateValue = dateInput.value;
    const titleValue = titleInput.value.trim();
    const contentValue = contentInput.value.trim();

    if (!dateValue || !titleValue || !contentValue) {
      return;
    }

    const tilItem = createTilItem(dateValue, titleValue, contentValue);
    tilList.prepend(tilItem);
    tilForm.reset();
    dateInput.focus();
  });
}

if (modeToggleButton) {
  modeToggleButton.addEventListener("click", function () {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    modeToggleButton.textContent = isDarkMode ? "라이트 모드" : "다크 모드";
    modeToggleButton.setAttribute("aria-pressed", String(isDarkMode));
  });
}
