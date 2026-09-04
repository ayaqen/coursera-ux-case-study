// main.js

(function(){
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll("#slides .slide"));
  var total = slides.length;
  var currentIndex = 0;

  var dotNav = document.getElementById("dotNav");
  var counterEl = document.getElementById("counter");
  var nextBtn = document.getElementById("nextBtn");
  var brandBtn = document.getElementById("brandBtn");
  var bgLayer = document.getElementById("bgLayer");
  var cursorGlow = document.getElementById("cursorGlow");
  var progressBar = document.getElementById("progressBar");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  function pad(n){ return n < 10 ? "0" + n : String(n); }

  function goToSlide(i){
    if(i < 0) i = 0;
    if(i > total - 1) i = total - 1;
    slides[i].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // dot navigation, built from the DOM
  var dots = slides.map(function(slide, i){
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dot";
    var name = slide.getAttribute("data-name") || slide.id;
    btn.setAttribute("aria-label", "Go to " + name);
    var label = document.createElement("span");
    label.className = "dot-label glass";
    label.textContent = name;
    btn.appendChild(label);
    btn.addEventListener("click", function(){ goToSlide(i); });
    dotNav.appendChild(btn);
    return btn;
  });

  function updateChrome(){
    dots.forEach(function(d, i){ d.classList.toggle("active", i === currentIndex); });
    counterEl.textContent = pad(currentIndex + 1) + " / " + pad(total);
    nextBtn.textContent = (currentIndex === total - 1) ? "Back to top ↑" : "Next ↓";
  }

  var slideObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var idx = slides.indexOf(entry.target);
        if(idx !== -1){
          currentIndex = idx;
          updateChrome();
        }
      }
    });
  }, { threshold: 0.5 });
  slides.forEach(function(s){ slideObserver.observe(s); });

  updateChrome();

  nextBtn.addEventListener("click", function(){
    if(currentIndex === total - 1){ goToSlide(0); }
    else { goToSlide(currentIndex + 1); }
  });

  brandBtn.addEventListener("click", function(){ goToSlide(0); });

  var startBtn = document.getElementById("startBtn");
  var jumpBtn = document.getElementById("jumpBtn");
  var backToTopBtn = document.getElementById("backToTopBtn");
  if(startBtn) startBtn.addEventListener("click", function(){ goToSlide(1); });
  if(jumpBtn) jumpBtn.addEventListener("click", function(){
    var target = document.getElementById("hr-1");
    if(target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  if(backToTopBtn) backToTopBtn.addEventListener("click", function(){ goToSlide(0); });

  // keyboard navigation between slides
  window.addEventListener("keydown", function(e){
    var tag = document.activeElement ? document.activeElement.tagName : "";
    var key = e.key;
    if(key === " " && (tag === "BUTTON" || tag === "A")){ return; }
    if(key === "ArrowDown" || key === "PageDown" || key === " "){
      e.preventDefault();
      goToSlide(currentIndex + 1);
    } else if(key === "ArrowUp" || key === "PageUp"){
      e.preventDefault();
      goToSlide(currentIndex - 1);
    } else if(key === "Home"){
      e.preventDefault();
      goToSlide(0);
    } else if(key === "End"){
      e.preventDefault();
      goToSlide(total - 1);
    }
  });

  // scroll progress bar
  var progressTicking = false;
  function updateProgress(){
    progressTicking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", function(){
    if(!progressTicking){
      progressTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  // background parallax + cursor glow, one rAF loop
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var normX = 0;
  var normY = 0;
  var curNormX = 0;
  var curNormY = 0;
  var glowX = mouseX;
  var glowY = mouseY;

  window.addEventListener("mousemove", function(e){
    mouseX = e.clientX;
    mouseY = e.clientY;
    normX = (e.clientX / window.innerWidth - 0.5) * 2;
    normY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function raf(){
    curNormX += (normX - curNormX) * 0.04;
    curNormY += (normY - curNormY) * 0.04;
    bgLayer.style.transform = "translate(" + (curNormX * 14) + "px, " + (curNormY * 14) + "px)";

    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.transform = "translate(" + glowX + "px, " + glowY + "px)";

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // reveal on scroll + count up
  function animateCount(el){
    if(el.dataset.counted) return;
    el.dataset.counted = "true";
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1600;
    var start = null;
    function tick(ts){
      if(start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString("en-US");
      if(p < 1){ requestAnimationFrame(tick); }
      else { el.textContent = target.toLocaleString("en-US"); }
    }
    requestAnimationFrame(tick);
  }

  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var items = entry.target.querySelectorAll("[data-reveal]");
        items.forEach(function(el, i){
          el.style.transitionDelay = (i * 90) + "ms";
          el.classList.add("revealed");
        });
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
      }
    });
  }, { threshold: 0.25 });
  slides.forEach(function(s){ revealObserver.observe(s); });

  // card tilt + sheen
  var tiltEls = Array.prototype.slice.call(document.querySelectorAll(".card, .tilt-hero"));
  tiltEls.forEach(function(el){
    el.addEventListener("mousemove", function(e){
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var rx = ((y / rect.height) - 0.5) * -10;
      var ry = ((x / rect.width) - 0.5) * 10;
      el.style.setProperty("--rx", rx + "deg");
      el.style.setProperty("--ry", ry + "deg");
    });
    el.addEventListener("mouseenter", function(){
      el.classList.add("sheen");
      setTimeout(function(){ el.classList.remove("sheen"); }, 950);
    });
    el.addEventListener("mouseleave", function(){
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  });

  // screenshot lightbox
  function openLightbox(img){
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox(){
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".shot-frame").forEach(function(frame){
    var img = frame.querySelector("img");
    if(!img) return;
    frame.addEventListener("click", function(){ openLightbox(img); });
    frame.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        openLightbox(img);
      }
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function(e){
    if(e.target === lightbox){ closeLightbox(); }
  });
  window.addEventListener("keydown", function(e){
    if(e.key === "Escape" && !lightbox.hidden){ closeLightbox(); }
  });

  // image fallback for the hero screenshot
  document.querySelectorAll("img[data-fallback]").forEach(function(img){
    img.addEventListener("error", function handler(){
      img.removeEventListener("error", handler);
      img.src = img.getAttribute("data-fallback");
    });
  });

  // task stepper
  var stepper = document.getElementById("taskStepper");
  if(stepper){
    var tabs = Array.prototype.slice.call(stepper.querySelectorAll(".stepper-tab"));
    var panels = Array.prototype.slice.call(stepper.querySelectorAll(".stepper-panel"));
    var stepperName = document.getElementById("stepperName");
    var taskNames = [
      "Find something you'd want to learn",
      "Make it fit your life",
      "Pick between two",
      "Check the cost and the time",
      "Go for it"
    ];
    var stepIndex = 0;

    function setStep(i){
      stepIndex = (i + panels.length) % panels.length;
      tabs.forEach(function(t, idx){
        var active = idx === stepIndex;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      panels.forEach(function(p, idx){ p.classList.toggle("active", idx === stepIndex); });
      stepperName.textContent = taskNames[stepIndex];
    }

    tabs.forEach(function(t, idx){
      t.addEventListener("click", function(){ setStep(idx); });
    });
    var stepPrev = document.getElementById("stepPrev");
    var stepNext = document.getElementById("stepNext");
    stepPrev.addEventListener("click", function(){ setStep(stepIndex - 1); });
    stepNext.addEventListener("click", function(){ setStep(stepIndex + 1); });

    stepper.addEventListener("keydown", function(e){
      if(e.key === "ArrowRight"){ e.preventDefault(); setStep(stepIndex + 1); }
      else if(e.key === "ArrowLeft"){ e.preventDefault(); setStep(stepIndex - 1); }
    });
  }

})();
