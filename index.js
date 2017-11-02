var filteredView;

function getCurrentFilter() {
  return location.hash.length ? location.hash.substr(1) : "typical";
}

function getSlider(filter) {
  if (!filter.slider) {
    return null;
  }

  let id = `slider-${filter.id}`;
  let input = document.getElementById(id);

  if (input) {
    return input;
  }

  input = document.createElement("input");
  input.type = "range";
  input.id = id;
  for (let attr of ["min", "max", "step", "value"]) {
    input[attr] = filter.slider[attr];
  }
  input.addEventListener("input", () => {
    updateFilter(filter.id);
  });
  document.getElementById("sliders").appendChild(input);

  return input;
}

function updateFilter(filterId) {
  let index = FILTERS.findIndex(f => f.id == (filterId || filterId || "typical"));
  let filter = FILTERS[index];
  let slider = getSlider(filter);
  let filterSet = slider ? filter.slider.argFunc(slider.value) : filter.filters;
  filteredView.setFilters(filterSet, filter.label);

  document.getElementById("previous").disabled = index == 0;
  document.getElementById("next").disabled = index + 1 == FILTERS.length;
  let otherSliders =
    document.querySelectorAll(`#sliders > input:not(#slider-${filter.id})`);
  for (let s of otherSliders) {
    s.classList.toggle("show", false);
  }
  if (slider) {
    setTimeout(() => {
      slider.classList.toggle("show", true);
    }, 100);
  }
}

function recenterHeading() {
  let target = document.querySelector(":target");
  target.scrollIntoView({block: "start", inline: "center"});
}

function toggleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

function init() {
  let header = document.querySelector("header");
  for (let filter of FILTERS) {
    let h1 = document.createElement("h1");
    h1.id = filter.id;
    let link = document.createElement("a");
    link.href = filter.link;
    link.textContent = filter.label;
    link.target = "_blank";
    h1.appendChild(link);
    header.appendChild(h1);
  }

  filteredView = new FilteredView();
  document.getElementById("viewport").appendChild(filteredView.canvas);

  if (location.hash.length == 0) {
    location.hash = "typical";
  } else {
    updateFilter(getCurrentFilter());
  }

  addEventListener("hashchange", () => {
    updateFilter(location.hash.substr(1));
  });


  addEventListener("resize", recenterHeading);

  filteredView.video.addEventListener("canplay",  evt => {
    let overlay = document.getElementById("overlay");
    overlay.addEventListener("transitionend", recenterHeading);
    overlay.classList.add("show");
  });

  document.getElementById("fullscreen").addEventListener("click", toggleFullScreen);

  document.addEventListener("fullscreenchange", () => {
    let fullscreen = document.getElementById("fullscreen");
    fullscreen.src = document.fullscreenElement ? "exit-fullscreen.svg" : "fullscreen.svg";
    fullscreen.alt = document.fullscreenElement ? "Exit fullscreen" : "Fullscreen";
    recenterHeading();
  });

  document.getElementById("next").addEventListener("click", () => {
    let index = FILTERS.findIndex(f => f.id == getCurrentFilter());
    location.hash = FILTERS[++index].id;
  });

  document.getElementById("previous").addEventListener("click", () => {
    let index = FILTERS.findIndex(f => f.id == getCurrentFilter());
    location.hash = FILTERS[--index].id;
  });

  let camera = document.getElementById("camera");
  camera.addEventListener("click", evt => {
    console.log(evt);
    camera.href = filteredView.snapshot();
    camera.download = `${getCurrentFilter()}.jpg`;
  }, false);
}

init();
