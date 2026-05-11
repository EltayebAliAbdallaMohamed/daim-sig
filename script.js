let data = [];
let currentIndex = 0;
let filterMode = false;
let filteredSlides = [];

async function loadData() {
  try {
    const response = await fetch("data.json");
    data = await response.json();
    renderContent();
  } catch (error) {
    document.getElementById("slideBody").textContent = "Failed to load data.";
    console.error(error);
  }
}

function getActiveData() {
  return filterMode && filteredSlides.length
    ? filteredSlides.map(i => data[i])
    : data;
}

function renderContent() {
  const slideBody = document.getElementById("slideBody");
  const slideNum = document.getElementById("slideNumber");

  const activeData = getActiveData();
  if (!activeData.length) {
    slideBody.textContent = "No slides to display.";
    slideNum.textContent = "0 of 0";
    return;
  }

  if (currentIndex >= activeData.length) currentIndex = activeData.length - 1;

  const item = activeData[currentIndex];
  slideBody.innerHTML = "";
  slideNum.textContent = `Slide ${currentIndex + 1} of ${activeData.length}`;

  // --- Individual details blocks ---
  if (item.script_en) {
    const detailsEn = document.createElement("details");
    const sumEn = document.createElement("summary");
    sumEn.textContent = "Show/Hide English Script";
    detailsEn.appendChild(sumEn);

    const p = document.createElement("p");
    p.textContent = item.script_en;
    detailsEn.appendChild(p);
    slideBody.appendChild(detailsEn);
  }

  if (item.script_ar) {
    const detailsAr = document.createElement("details");
    const sumAr = document.createElement("summary");
    sumAr.textContent = "عرض / إخفاء الترجمة العربية";
    detailsAr.appendChild(sumAr);

    const trans = document.createElement("div");
    trans.className = "translation";
    trans.textContent = item.script_ar;
    detailsAr.appendChild(trans);
    slideBody.appendChild(detailsAr);
  }

  if (item.image) {
    const detailsImg = document.createElement("details");
    const sumImg = document.createElement("summary");
    sumImg.textContent = "Show/Hide Image";
    detailsImg.appendChild(sumImg);

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = "Image content";
    detailsImg.appendChild(img);
    slideBody.appendChild(detailsImg);
  }

  // --- Video ---
  if (item.video) {
    const video = document.createElement("video");
    video.src = item.video;
    video.controls = true;
    slideBody.appendChild(video);
  }

  // --- Audio ---
  if (item.audio) {
    const audio = document.createElement("audio");
    audio.src = item.audio;
    audio.controls = true;
    slideBody.appendChild(audio);
  }

  // --- Question ---
  if (item.question) {
    const q = document.createElement("h3");
    q.textContent = item.question;
    slideBody.appendChild(q);
  }

  // --- Options ---
  if (item.opts && item.opts.length) {
    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("options");
    item.opts.forEach(opt => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "opt";
      input.value = opt;
      label.appendChild(input);
      label.append(` ${opt}`);
      optionsDiv.appendChild(label);
    });
    slideBody.appendChild(optionsDiv);
  }

  // --- Feedback Box ---
  const feedback = document.createElement("div");
  feedback.id = "feedback";
  feedback.className = "feedback";
  slideBody.appendChild(feedback);

  // Navigation state
  document.getElementById("prevBtn").disabled = currentIndex === 0;
  document.getElementById("nextBtn").disabled = currentIndex === activeData.length - 1;
}

function checkAnswer() {
  const activeData = getActiveData();
  const item = activeData[currentIndex];
  const feedback = document.getElementById("feedback");
  const selected = document.querySelector('input[name="opt"]:checked');

  if (!item.answer) {
    feedback.textContent = "This item has no answer key.";
    feedback.className = "feedback incorrect";
    feedback.style.display = "block";
    return;
  }

  if (!selected) {
    feedback.textContent = "Please select an option first.";
    feedback.className = "feedback incorrect";
    feedback.style.display = "block";
    return;
  }

  const correct =
    selected.value.trim().toLowerCase() === item.answer.trim().toLowerCase();

  feedback.textContent = correct
    ? `✅ Correct! (${item.answer})`
    : `❌ Incorrect. Correct answer: ${item.answer}`;
  feedback.className = correct ? "feedback correct" : "feedback incorrect";
  feedback.style.display = "block";
}

// --- Search features ---
document.getElementById("searchBtn").addEventListener("click", () => {
  const input = document.getElementById("searchInput").value.trim();
  const toggle = document.getElementById("filterToggle").checked;

  if (!input) return;

  const parts = input
    .split(",")
    .map(x => parseInt(x.trim(), 10) - 1)
    .filter(x => !isNaN(x) && x >= 0);

  if (!parts.length) return;

  if (toggle && parts.length > 1) {
    filterMode = true;
    filteredSlides = parts.filter(i => i < data.length);
    currentIndex = 0;
  } else {
    filterMode = false;
    filteredSlides = [];
    const idx = parts[0];
    currentIndex = idx < data.length ? idx : 0;
  }

  renderContent();
});

document.getElementById("filterToggle").addEventListener("change", e => {
  if (!e.target.checked) {
    filterMode = false;
    filteredSlides = [];
    currentIndex = 0;
    renderContent();
  }
});

// --- Navigation ---
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderContent();
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const activeData = getActiveData();
  if (currentIndex < activeData.length - 1) {
    currentIndex++;
    renderContent();
  }
});

document.getElementById("checkBtn").addEventListener("click", checkAnswer);

loadData();
