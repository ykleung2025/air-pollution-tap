(function () {
  "use strict";

  var DURATION = 60;
  var EDGE = 12;

  var BEHAVIORS = [
    {
      id: "exhaust",
      type: "pollution",
      name: "汽車排放尾氣／工廠廢氣",
      emoji: ["🚗", "🏭"],
      lead: "汽車尾氣和工廠廢氣會弄髒空氣，令植物難以呼吸和製造養分。",
      tip: "懸浮粒子堵塞葉片氣孔阻礙光合作用；二氧化硫造成酸雨，灼傷葉片、土壤酸化，植物易枯萎。"
    },
    {
      id: "burning",
      type: "pollution",
      name: "露天焚燒垃圾／農作物秸稈",
      emoji: ["🔥", "🗑️"],
      lead: "秸稈是收割後留下的農作物莖。把它或垃圾放在露天燒掉，會傷害動物，也破壞牠們的家。",
      tip: "濃煙與有毒氣體危害鳥類與野生動物呼吸道，破壞棲息地。"
    },
    {
      id: "pesticide",
      type: "pollution",
      name: "過度使用農藥噴霧／化學噴劑",
      emoji: ["🧴", "🧪"],
      lead: "VOC 是會飄到空氣中的化學氣體。亂噴農藥和化學噴劑，蜜蜂和其他小動物都會受害。",
      tip: "VOCs 形成臭氧損害植物；化學物隨空氣雨水擴散，毒害蜜蜂等昆蟲與小動物，破壞生態鏈。"
    },
    {
      id: "trees",
      type: "purify",
      name: "植樹造林／種植綠色植物",
      emoji: ["🌳", "🌿"],
      lead: "多種樹和綠色植物，可以讓空氣更清新，也給動物一個健康的家。",
      tip: "光合作用吸收二氧化碳釋放氧氣；葉片吸附懸浮粒子，提供健康棲息地。"
    },
    {
      id: "transit",
      type: "purify",
      name: "騎單車／乘搭公共交通工具",
      emoji: ["🚲", "🚌"],
      lead: "騎單車，或乘搭巴士、港鐵等公共交通，比每人開一輛車更能保護森林和水裡的生物。",
      tip: "減少化石燃料，降低酸雨與溫室氣體，保護森林與水棲生態。"
    }
  ];

  var app = document.getElementById("app");
  var playArea = document.getElementById("play-area");
  var timerEl = document.getElementById("timer");
  var scoreEl = document.getElementById("score");
  var timebar = document.querySelector(".timebar");
  var timebarFill = document.getElementById("timebar-fill");
  var pauseFlag = document.getElementById("pause-flag");
  var timeStat = document.querySelector(".stat-time");
  var screenStart = document.getElementById("screen-start");
  var screenPlay = document.getElementById("screen-play");
  var screenEnd = document.getElementById("screen-end");
  var modal = document.getElementById("modal");
  var modalCard = document.getElementById("modal-card");
  var modalBadge = document.getElementById("modal-badge");
  var modalEmoji = document.getElementById("modal-emoji");
  var modalTitle = document.getElementById("modal-title");
  var modalScore = document.getElementById("modal-score");
  var modalScoreNote = document.getElementById("modal-score-note");
  var modalHeading = document.getElementById("modal-heading");
  var modalLead = document.getElementById("modal-lead");
  var modalTip = document.getElementById("modal-tip");
  var closeBtn = document.getElementById("modal-close");
  var live = document.getElementById("live");
  var reviewBody = document.getElementById("review-body");
  var endTitle = document.getElementById("end-title");
  var resultPraise = document.getElementById("result-praise");
  var resultScore = document.getElementById("result-score");
  var resultLearn = document.getElementById("result-learn");

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;

  var state = {
    mode: "start",
    score: 0,
    purifyTaps: 0,
    timeLeft: DURATION,
    paused: false,
    pendingEnd: false,
    lastTs: 0,
    raf: 0,
    floaters: [],
    shownSecond: null,
    reviewBuilt: false
  };

  function kindLabel(type) {
    return type === "pollution" ? "污染行為" : "淨化行為";
  }

  function shortKind(type) {
    return type === "pollution" ? "污染" : "淨化";
  }

  function setInert(on) {
    if ("inert" in app) app.inert = on;
    if (on) app.setAttribute("aria-hidden", "true");
    else app.removeAttribute("aria-hidden");
  }

  function showScreen(name) {
    screenStart.hidden = name !== "start";
    screenPlay.hidden = name !== "play";
    screenEnd.hidden = name !== "end";
  }

  function renderScore(pop) {
    scoreEl.textContent = state.score + " 分";
    if (!pop) return;
    scoreEl.classList.remove("pop");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("pop");
  }

  function renderTimer() {
    var seconds = state.mode === "end" ? 0 : Math.ceil(state.timeLeft);
    if (seconds !== state.shownSecond || state.mode === "end") {
      state.shownSecond = seconds;
      timerEl.textContent = seconds + " 秒";
    }
    var ratio = state.mode === "start" ? 1 : Math.max(0, state.timeLeft / DURATION);
    timebarFill.style.transform = "scaleX(" + ratio + ")";
    var urgent = state.mode === "play" && seconds <= 10;
    timeStat.classList.toggle("is-urgent", urgent);
    timebar.classList.toggle("is-urgent", urgent);
  }

  function announce(text) {
    live.textContent = "";
    window.setTimeout(function () {
      live.textContent = text;
    }, 30);
  }

  function clearFloaters() {
    state.floaters.forEach(function (floater) {
      floater.el.remove();
    });
    state.floaters = [];
  }

  function paint(floater) {
    floater.el.style.transform = "translate(" + floater.x + "px, " + floater.y + "px) rotate(" + floater.rot + "deg)";
    floater.el.style.zIndex = String(10 + Math.round(floater.y));
  }

  function syncCardSize(floater) {
    var compact = playArea.clientHeight < 250 || playArea.clientWidth < 360;
    floater.el.classList.toggle("is-compact", compact);
  }

  function layoutSlots(cardW, cardH) {
    var w = Math.max(0, playArea.clientWidth - EDGE * 2);
    var h = Math.max(0, playArea.clientHeight - EDGE * 2);
    var maxCols = Math.max(1, Math.floor(w / (cardW + 10)));
    var maxRows = Math.max(1, Math.floor(h / (cardH + 10)));
    var count = Math.max(2, Math.min(5, maxCols * maxRows));
    var cols = Math.min(maxCols, Math.max(1, Math.round(Math.sqrt(count * (w / Math.max(h, 1))))));
    var rows = Math.min(maxRows, Math.ceil(count / cols));
    while (cols * rows < count && cols < maxCols) cols += 1;
    rows = Math.min(maxRows, Math.ceil(count / cols));
    while (cols * rows < count && rows < maxRows) rows += 1;
    return { cols: cols, rows: rows, count: Math.min(count, cols * rows), w: w, h: h };
  }

  function targetCount() {
    var compact = playArea.clientHeight < 250 || playArea.clientWidth < 360;
    return layoutSlots(compact ? 158 : 200, compact ? 146 : 175).count;
  }

  function chooseBehavior() {
    var types = {};
    var seen = {};
    state.floaters.forEach(function (floater) {
      types[floater.behavior.type] = true;
      seen[floater.behavior.id] = true;
    });
    var pool = BEHAVIORS;
    if (!types.pollution) pool = BEHAVIORS.filter(function (item) { return item.type === "pollution"; });
    else if (!types.purify) pool = BEHAVIORS.filter(function (item) { return item.type === "purify"; });
    var fresh = pool.filter(function (item) { return !seen[item.id]; });
    if (fresh.length) pool = fresh;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function findSpot(width, height) {
    var slots = layoutSlots(width, height);
    var index = state.floaters.length;
    if (index >= slots.count) return null;
    var col = index % slots.cols;
    var row = Math.floor(index / slots.cols);
    var cellW = slots.w / slots.cols;
    var cellH = slots.h / slots.rows;
    var jitterX = (Math.random() - 0.5) * Math.min(16, Math.max(0, cellW - width) * 0.35);
    var jitterY = (Math.random() - 0.5) * Math.min(12, Math.max(0, cellH - height) * 0.3);
    var x = EDGE + col * cellW + Math.max(0, (cellW - width) / 2) + jitterX;
    var y = EDGE + row * cellH + Math.max(0, (cellH - height) / 2) + jitterY;
    var maxX = Math.max(EDGE, playArea.clientWidth - width - EDGE);
    var maxY = Math.max(EDGE, playArea.clientHeight - height - EDGE);
    return {
      x: Math.min(Math.max(EDGE, x), maxX),
      y: Math.min(Math.max(EDGE, y), maxY)
    };
  }

  function appendName(parent, name) {
    var parts = name.split("／");
    parts.forEach(function (part, index) {
      parent.appendChild(document.createTextNode(part));
      if (index < parts.length - 1) {
        parent.appendChild(document.createTextNode("／"));
        parent.appendChild(document.createElement("wbr"));
      }
    });
  }

  function spawnFloater(behavior) {
    if (playArea.clientWidth < 40 || playArea.clientHeight < 40) return;

    var card = document.createElement("div");
    card.className = "float-card is-" + behavior.type;
    card.dataset.id = behavior.id;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "float-hit";
    button.setAttribute("aria-label", kindLabel(behavior.type) + "：" + behavior.name);

    var emoji = document.createElement("span");
    emoji.className = "emoji-row" + (behavior.emoji.length === 1 ? " is-single" : "");
    emoji.translate = false;
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = behavior.emoji.join("");
    emoji.style.setProperty("--bob-delay", (-Math.random() * 2.6).toFixed(2) + "s");

    var chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = shortKind(behavior.type);

    var name = document.createElement("span");
    name.className = "card-name";
    appendName(name, behavior.name);

    button.appendChild(emoji);
    button.appendChild(chip);
    button.appendChild(name);
    card.appendChild(button);
    playArea.appendChild(card);
    syncCardSize({ el: card });

    var spot = findSpot(card.offsetWidth, card.offsetHeight);
    if (!spot) {
      card.remove();
      return;
    }
    var angle = Math.random() * Math.PI * 2;
    var speed = (reduceMotion ? 10 : 18) + Math.random() * (reduceMotion ? 6 : 12);
    var floater = {
      behavior: behavior,
      el: card,
      button: button,
      x: spot.x,
      y: spot.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: (Math.random() - 0.5) * 4,
      rotV: (Math.random() - 0.5) * (reduceMotion ? 0 : 3),
      phase: Math.random() * Math.PI * 2,
      born: performance.now()
    };
    if (Math.abs(floater.vx) < 8) floater.vx = (floater.vx < 0 ? -1 : 1) * 8;
    if (Math.abs(floater.vy) < 8) floater.vy = (floater.vy < 0 ? -1 : 1) * 8;
    paint(floater);
    button.addEventListener("pointerenter", function () {
      floater.hover = true;
    });
    button.addEventListener("pointerleave", function () {
      floater.hover = false;
    });
    button.addEventListener("click", function () {
      onTap(floater);
    });
    state.floaters.push(floater);
  }

  function fillFloaters() {
    var guard = 0;
    var target = targetCount();
    while (state.floaters.length < target && guard < 12) {
      spawnFloater(chooseBehavior());
      guard += 1;
    }
  }

  function removeFloater(floater) {
    state.floaters = state.floaters.filter(function (item) { return item !== floater; });
    floater.el.remove();
  }

  function reclampFloaters() {
    var width = playArea.clientWidth;
    var height = playArea.clientHeight;
    state.floaters.forEach(function (floater) {
      syncCardSize(floater);
      var cardW = floater.el.offsetWidth;
      var cardH = floater.el.offsetHeight;
      var maxX = Math.max(EDGE, width - cardW - EDGE);
      var maxY = Math.max(EDGE, height - cardH - EDGE);
      floater.x = Math.min(Math.max(floater.x, EDGE), maxX);
      floater.y = Math.min(Math.max(floater.y, EDGE), maxY);
      paint(floater);
    });
  }

  function clampFloater(floater, width, height) {
    var cardW = floater.el.offsetWidth;
    var cardH = floater.el.offsetHeight;
    var maxX = Math.max(EDGE, width - cardW - EDGE);
    var maxY = Math.max(EDGE, height - cardH - EDGE);
    if (floater.x <= EDGE) {
      floater.x = EDGE;
      floater.vx = Math.abs(floater.vx);
    } else if (floater.x >= maxX) {
      floater.x = maxX;
      floater.vx = -Math.abs(floater.vx);
    }
    if (floater.y <= EDGE) {
      floater.y = EDGE;
      floater.vy = Math.abs(floater.vy);
    } else if (floater.y >= maxY) {
      floater.y = maxY;
      floater.vy = -Math.abs(floater.vy);
    }
  }

  function separateFloaters() {
    var list = state.floaters;
    var i;
    var j;
    for (i = 0; i < list.length; i += 1) {
      for (j = i + 1; j < list.length; j += 1) {
        var a = list[i];
        var b = list[j];
        var aw = a.el.offsetWidth;
        var ah = a.el.offsetHeight;
        var bw = b.el.offsetWidth;
        var bh = b.el.offsetHeight;
        var dx = (a.x + aw / 2) - (b.x + bw / 2);
        var dy = (a.y + ah / 2) - (b.y + bh / 2);
        var overlapX = (aw + bw) / 2 + 8 - Math.abs(dx);
        var overlapY = (ah + bh) / 2 + 8 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        if (overlapX < overlapY) {
          var signX = dx < 0 ? -1 : 1;
          var pushX = overlapX / 2 + 0.5;
          a.x += signX * pushX;
          b.x -= signX * pushX;
          a.vx = Math.abs(a.vx) * signX;
          b.vx = -Math.abs(b.vx) * signX;
        } else {
          var signY = dy < 0 ? -1 : 1;
          var pushY = overlapY / 2 + 0.5;
          a.y += signY * pushY;
          b.y -= signY * pushY;
          a.vy = Math.abs(a.vy) * signY;
          b.vy = -Math.abs(b.vy) * signY;
        }
      }
    }
  }

  function updateFloaters(dt, now) {
    var width = playArea.clientWidth;
    var height = playArea.clientHeight;
    state.floaters.forEach(function (floater) {
      var wander = reduceMotion ? 0 : 8;
      floater.vx += Math.sin(now / 900 + floater.phase) * wander * dt;
      floater.vy += Math.cos(now / 1100 + floater.phase) * wander * dt;
      var speed = Math.hypot(floater.vx, floater.vy);
      var maxSpeed = reduceMotion ? 18 : 34;
      var minSpeed = reduceMotion ? 8 : 14;
      if (speed > maxSpeed) {
        floater.vx *= maxSpeed / speed;
        floater.vy *= maxSpeed / speed;
      } else if (speed < minSpeed && speed > 0) {
        floater.vx *= minSpeed / speed;
        floater.vy *= minSpeed / speed;
      }
      var moveScale = floater.hover ? 0.12 : 1;
      floater.x += floater.vx * dt * moveScale;
      floater.y += floater.vy * dt * moveScale;
      floater.rot += floater.rotV * dt;
      if (floater.rot > 5) floater.rotV = -Math.abs(floater.rotV);
      if (floater.rot < -5) floater.rotV = Math.abs(floater.rotV);
    });
    separateFloaters();
    state.floaters.forEach(function (floater) {
      clampFloater(floater, width, height);
      paint(floater);
    });
  }

  function hideModal() {
    modal.hidden = true;
    setInert(false);
    document.body.classList.remove("is-paused");
    pauseFlag.hidden = true;
    state.paused = false;
    state.lastTs = 0;
  }

  function openModal(behavior) {
    var pollution = behavior.type === "pollution";
    modalCard.classList.toggle("is-pollution", pollution);
    modalCard.classList.toggle("is-purify", !pollution);
    modalBadge.textContent = kindLabel(behavior.type);
    modalBadge.className = "badge is-" + behavior.type;
    modalEmoji.textContent = behavior.emoji.join("");
    modalTitle.textContent = behavior.name;
    modalScore.textContent = pollution ? "＋1 分" : "不加分、不扣分";
    modalScore.className = "score-pill " + (pollution ? "is-plus" : "is-zero");
    modalScoreNote.textContent = pollution
      ? "你認出了污染行為，所以加 1 分。"
      : "這是淨化行為，這次不加分，也不扣分。";
    modalHeading.textContent = pollution ? "對動植物／生態的具體危害" : "如何協助改善環境";
    modalLead.textContent = behavior.lead;
    modalTip.textContent = behavior.tip;
    modal.hidden = false;
    document.body.classList.add("is-paused");
    pauseFlag.hidden = false;
    setInert(true);
    closeBtn.focus();
    reclampFloaters();
    announce(
      pollution
        ? "污染行為：" + behavior.name + "。加 1 分。累計得分 " + state.score + " 分。"
        : "淨化行為：" + behavior.name + "。不加分，不扣分。累計得分 " + state.score + " 分。"
    );
  }

  function closeModal() {
    if (modal.hidden) return;
    var shouldRefill = state.mode === "play" && !state.pendingEnd;
    hideModal();
    if (state.pendingEnd || state.timeLeft <= 0) {
      endGame();
      return;
    }
    if (shouldRefill) {
      window.setTimeout(function () {
        if (state.mode === "play" && !state.paused) fillFloaters();
      }, 280);
    }
  }

  function onTap(floater) {
    if (state.mode !== "play" || state.paused) return;
    if (performance.now() - floater.born < 180) return;
    state.paused = true;
    if (floater.behavior.type === "pollution") {
      state.score += 1;
      renderScore(true);
    } else {
      state.purifyTaps += 1;
    }
    var behavior = floater.behavior;
    removeFloater(floater);
    openModal(behavior);
  }

  function frame(ts) {
    if (state.mode !== "play") return;
    if (!state.lastTs) state.lastTs = ts;
    var dt = (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    if (!state.paused && !document.hidden) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        renderTimer();
        endGame();
        return;
      }
      updateFloaters(dt, ts);
      renderTimer();
    }
    state.raf = window.requestAnimationFrame(frame);
  }

  function addReviewBlock(cell, label, text) {
    var kicker = document.createElement("span");
    kicker.className = "review-label";
    kicker.textContent = label;
    var paragraph = document.createElement("p");
    paragraph.className = label === "簡單說明" ? "review-lead" : "review-tip";
    paragraph.textContent = text;
    cell.appendChild(kicker);
    cell.appendChild(paragraph);
  }

  function buildReview() {
    if (state.reviewBuilt) return;
    BEHAVIORS.forEach(function (behavior) {
      var row = document.createElement("tr");
      row.className = "is-" + behavior.type;

      var behaviorCell = document.createElement("td");
      behaviorCell.dataset.label = "行為";
      var badge = document.createElement("span");
      badge.className = "badge is-" + behavior.type;
      badge.textContent = shortKind(behavior.type);
      var emoji = document.createElement("span");
      emoji.className = "review-emoji";
      emoji.translate = false;
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = behavior.emoji.join("");
      var name = document.createElement("span");
      name.className = "review-name";
      appendName(name, behavior.name);
      behaviorCell.appendChild(badge);
      behaviorCell.appendChild(emoji);
      behaviorCell.appendChild(name);

      var impactCell = document.createElement("td");
      impactCell.dataset.label = "影響／好處";
      addReviewBlock(impactCell, "簡單說明", behavior.lead);
      addReviewBlock(impactCell, "科學說明", behavior.tip);

      row.appendChild(behaviorCell);
      row.appendChild(impactCell);
      reviewBody.appendChild(row);
    });
    state.reviewBuilt = true;
  }

  function renderResults() {
    buildReview();
    if (state.score === 0) {
      resultPraise.textContent = "這次還沒有點中污染行為。看看下面的複習頁，下一回可以更快認出來。";
    } else if (state.score < 5) {
      resultPraise.textContent = "你找出了 " + state.score + " 個污染行為。繼續練習，會愈認愈快！";
    } else {
      resultPraise.textContent = "太棒了！你找出了 " + state.score + " 個污染行為，是個細心的小偵探。";
    }
    resultScore.textContent = "累計得分：" + state.score + " 分";
    resultLearn.textContent = state.purifyTaps > 0
      ? "你亦打開了 " + state.purifyTaps + " 次淨化行為說明。這些不加分，用來學習。"
      : "淨化行為不加分也不扣分。下一回可以點開來，學習怎樣幫助環境。";
  }

  function endGame() {
    if (state.mode !== "play") return;
    if (!modal.hidden) {
      state.pendingEnd = true;
      state.timeLeft = 0;
      renderTimer();
      return;
    }
    state.mode = "end";
    state.pendingEnd = false;
    state.timeLeft = 0;
    window.cancelAnimationFrame(state.raf);
    hideModal();
    clearFloaters();
    renderTimer();
    renderScore(false);
    renderResults();
    showScreen("end");
    announce("時間到。累計得分 " + state.score + " 分。可以閱讀複習頁。");
    endTitle.focus();
  }

  function startGame() {
    state.mode = "boot";
    state.pendingEnd = false;
    state.paused = false;
    hideModal();
    window.cancelAnimationFrame(state.raf);
    clearFloaters();
    state.score = 0;
    state.purifyTaps = 0;
    state.timeLeft = DURATION;
    state.shownSecond = null;
    state.lastTs = 0;
    state.mode = "play";
    showScreen("play");
    renderScore(false);
    renderTimer();
    announce("遊戲開始。倒數 60 秒。");
    window.requestAnimationFrame(function () {
      if (state.mode !== "play") return;
      fillFloaters();
      state.raf = window.requestAnimationFrame(frame);
    });
  }

  function balanceFloaters() {
    if (state.mode !== "play" || state.paused) {
      reclampFloaters();
      return;
    }
    var target = targetCount();
    while (state.floaters.length > target) {
      var extra = state.floaters.pop();
      extra.el.remove();
    }
    reclampFloaters();
    fillFloaters();
  }

  document.getElementById("btn-start").addEventListener("click", startGame);
  document.getElementById("btn-replay").addEventListener("click", startGame);
  closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      event.preventDefault();
      closeModal();
    }
    if (event.key === "Tab" && !modal.hidden) {
      event.preventDefault();
      closeBtn.focus();
    }
  });

  document.addEventListener("visibilitychange", function () {
    state.lastTs = 0;
  });

  window.addEventListener("resize", balanceFloaters);
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function (event) {
      reduceMotion = event.matches;
    });
  }

  showScreen("start");
  renderScore(false);
  renderTimer();
})();
