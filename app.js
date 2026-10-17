(function () {
  "use strict";

  var DURATION = 60;
  var MAX_HEARTS = 5;
  var POLLUTION_LINGER = 8;
  var ECO_LINGER = 12;

  var BEHAVIORS = [
    {
      id: "exhaust",
      type: "pollution",
      name: "汽車排放尾氣／工廠廢氣",
      emoji: "🚗🏭",
      looks: ["car", "factory"],
      counter: "transit",
      pairText: "對應環保行為：騎單車／乘搭公共交通工具",
      lead: "汽車尾氣和工廠廢氣會弄髒空氣，令植物難以呼吸和製造養分。",
      tip: "懸浮粒子堵塞葉片氣孔阻礙光合作用；二氧化硫造成酸雨，灼傷葉片、土壤酸化，植物易枯萎。"
    },
    {
      id: "burning",
      type: "pollution",
      name: "露天焚燒垃圾／農作物秸稈",
      emoji: "🔥",
      looks: ["fire"],
      counter: "trees",
      pairText: "對應環保行為：植樹造林／種植綠色植物",
      lead: "秸稈是收割後留下的農作物莖。把它或垃圾放在露天燒掉，會傷害動物，也破壞牠們的家。",
      tip: "濃煙與有毒氣體危害鳥類與野生動物呼吸道，破壞棲息地。"
    },
    {
      id: "pesticide",
      type: "pollution",
      name: "過度使用農藥噴霧／化學噴劑",
      emoji: "🧴",
      looks: ["spray"],
      counter: "trees",
      pairText: "對應環保行為：植樹造林／種植綠色植物",
      lead: "VOC 是會飄到空氣中的化學氣體。亂噴農藥和化學噴劑，蜜蜂和其他小動物都會受害。",
      tip: "VOCs 形成臭氧損害植物；化學物隨空氣雨水擴散，毒害蜜蜂等昆蟲與小動物，破壞生態鏈。"
    },
    {
      id: "trees",
      type: "purify",
      name: "植樹造林／種植綠色植物",
      emoji: "🌳",
      looks: ["tree"],
      counters: ["burning", "pesticide"],
      pairText: "可以對應：露天焚燒垃圾／農作物秸稈、過度使用農藥噴霧／化學噴劑",
      lead: "多種樹和綠色植物，可以讓空氣更清新，也給動物一個健康的家。",
      tip: "光合作用吸收二氧化碳釋放氧氣；葉片吸附懸浮粒子，提供健康棲息地。"
    },
    {
      id: "transit",
      type: "purify",
      name: "騎單車／乘搭公共交通工具",
      emoji: "🚲🚌",
      looks: ["bike", "bus"],
      counters: ["exhaust"],
      pairText: "可以對應：汽車排放尾氣／工廠廢氣",
      lead: "騎單車，或乘搭巴士、港鐵等公共交通，比每人開一輛車更能保護森林和水裡的生物。",
      tip: "減少化石燃料，降低酸雨與溫室氣體，保護森林與水棲生態。"
    }
  ];

  var byId = {};
  BEHAVIORS.forEach(function (behavior) { byId[behavior.id] = behavior; });

  var app = document.getElementById("app");
  var scene = document.getElementById("scene");
  var actorsEl = document.getElementById("actors");
  var timerEl = document.getElementById("timer");
  var scoreEl = document.getElementById("score");
  var heartsEl = document.getElementById("hearts");
  var heartsStat = document.querySelector(".stat-hearts");
  var timebar = document.querySelector(".timebar");
  var timebarFill = document.getElementById("timebar-fill");
  var pauseFlag = document.getElementById("pause-flag");
  var timeStat = document.querySelector(".stat-time");
  var screenStart = document.getElementById("screen-start");
  var screenPlay = document.getElementById("screen-play");
  var screenEnd = document.getElementById("screen-end");
  var toast = document.getElementById("toast");
  var modal = document.getElementById("modal");
  var modalCard = document.getElementById("modal-card");
  var modalBadge = document.getElementById("modal-badge");
  var modalEmoji = document.getElementById("modal-emoji");
  var modalTitle = document.getElementById("modal-title");
  var modalScore = document.getElementById("modal-score");
  var modalScoreNote = document.getElementById("modal-score-note");
  var modalPair = document.getElementById("modal-pair");
  var modalHeading = document.getElementById("modal-heading");
  var modalLead = document.getElementById("modal-lead");
  var modalTip = document.getElementById("modal-tip");
  var closeBtn = document.getElementById("modal-close");
  var live = document.getElementById("live");
  var reviewBody = document.getElementById("review-body");
  var endTitle = document.getElementById("end-title");
  var resultPraise = document.getElementById("result-praise");
  var resultScore = document.getElementById("result-score");
  var resultHearts = document.getElementById("result-hearts");
  var resultLearn = document.getElementById("result-learn");

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;
  var toastTimer = 0;
  var uid = 0;

  var state = {
    mode: "start",
    score: 0,
    hearts: MAX_HEARTS,
    heals: 0,
    purifyTaps: 0,
    timeLeft: DURATION,
    paused: false,
    pendingEnd: false,
    endReason: "time",
    lastTs: 0,
    raf: 0,
    actors: [],
    shownSecond: null,
    reviewBuilt: false,
    spawnCooldown: 0,
    ignoreClicksUntil: 0
  };

  function kindLabel(type) {
    return type === "pollution" ? "污染行為" : "環保行為";
  }

  function shortKind(type) {
    return type === "pollution" ? "污染" : "環保";
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

  function announce(text) {
    live.textContent = "";
    window.setTimeout(function () { live.textContent = text; }, 30);
  }

  function renderScore() {
    scoreEl.textContent = state.score + " 分";
  }

  function renderHearts(hurt) {
    heartsEl.replaceChildren();
    var i;
    for (i = 0; i < MAX_HEARTS; i += 1) {
      var heart = document.createElement("span");
      heart.className = "heart " + (i < state.hearts ? "is-full" : "is-empty");
      heart.textContent = "♥";
      heart.setAttribute("aria-hidden", "true");
      heartsEl.appendChild(heart);
    }
    heartsEl.setAttribute("aria-label", "生命值 " + state.hearts + "，共 " + MAX_HEARTS);
    if (hurt) {
      heartsStat.classList.remove("is-hurt");
      void heartsStat.offsetWidth;
      heartsStat.classList.add("is-hurt");
      scene.classList.add("is-hurt");
      window.setTimeout(function () { scene.classList.remove("is-hurt"); }, 450);
    }
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

  function showToast(text) {
    toast.hidden = false;
    toast.textContent = text;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 1800);
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

  function addPuffs(parent, className, count) {
    var wrap = document.createElement("span");
    wrap.className = className;
    var i;
    for (i = 0; i < count; i += 1) wrap.appendChild(document.createElement("i"));
    parent.appendChild(wrap);
  }

  function makeFigure(look) {
    var fig = document.createElement("span");
    fig.className = "fig fig-" + look;
    fig.setAttribute("aria-hidden", "true");
    var emoji = document.createElement("span");
    emoji.className = "emoji";
    if (look === "car") {
      addPuffs(fig, "exhaust", 3);
      emoji.textContent = "🚗";
    } else if (look === "factory") {
      addPuffs(fig, "stack", 2);
      emoji.textContent = "🏭";
    } else if (look === "fire") {
      emoji.textContent = "🔥";
    } else if (look === "spray") {
      addPuffs(fig, "mist", 2);
      emoji.textContent = "🧴";
    } else if (look === "tree") {
      emoji.textContent = "🌳";
    } else if (look === "bus") {
      emoji.textContent = "🚌";
    } else {
      emoji.textContent = "🚲";
    }
    fig.appendChild(emoji);
    return fig;
  }

  function bandFor(look) {
    if (look === "factory") return "sky";
    if (look === "car" || look === "bike" || look === "bus") return "road";
    return "park";
  }

  function aliveActors() {
    return state.actors.filter(function (actor) { return !actor.dying; });
  }

  function countType(type) {
    return aliveActors().filter(function (actor) { return actor.behavior.type === type; }).length;
  }

  function caps() {
    var wide = scene.clientWidth >= 800;
    return { pollution: wide ? 2 : 1, eco: 1 };
  }

  function pickLook(behavior) {
    var used = {};
    state.actors.forEach(function (actor) {
      if (!actor.dying && actor.behavior.id === behavior.id) used[actor.look] = true;
    });
    var fresh = behavior.looks.filter(function (look) { return !used[look]; });
    var pool = fresh.length ? fresh : behavior.looks;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pickBehavior(type) {
    var used = {};
    aliveActors().forEach(function (actor) { used[actor.behavior.id] = true; });
    var pool = BEHAVIORS.filter(function (behavior) {
      return behavior.type === type && !used[behavior.id];
    });
    if (type === "purify") {
      var needed = {};
      aliveActors().forEach(function (actor) {
        if (actor.behavior.type === "pollution") needed[actor.behavior.counter] = true;
      });
      var matched = pool.filter(function (behavior) { return needed[behavior.id]; });
      if (matched.length) pool = matched;
    }
    if (!pool.length) {
      pool = BEHAVIORS.filter(function (behavior) { return behavior.type === type; });
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function paint(actor) {
    actor.el.style.transform = "translate(" + actor.x + "px, " + actor.y + "px)";
    actor.el.style.zIndex = String(2 + Math.round(actor.y / 80));
  }

  function limitsFor(actor) {
    var width = scene.clientWidth;
    var height = scene.clientHeight;
    var actorW = actor.el.offsetWidth || 168;
    var actorH = actor.el.offsetHeight || 150;
    var top = 42;
    var bottom = Math.max(top, height - actorH - 8);
    if (actor.band === "sky") bottom = Math.max(top, Math.min(bottom, height * 0.4));
    if (actor.band === "park") {
      top = Math.max(top, height * 0.3);
      bottom = Math.max(top, Math.min(bottom, height * 0.68));
    }
    if (actor.band === "road") top = Math.max(top, height * 0.5);
    return {
      left: 8,
      right: Math.max(8, width - actorW - 8),
      top: top,
      bottom: bottom
    };
  }

  function placeActor(actor) {
    var box = limitsFor(actor);
    actor.x = box.left + Math.random() * Math.max(0, box.right - box.left);
    actor.y = box.top + Math.random() * Math.max(0, box.bottom - box.top);
    var speed = (reduceMotion ? 12 : 26) + Math.random() * (reduceMotion ? 8 : 18);
    var angle = Math.random() * Math.PI * 2;
    actor.vx = Math.cos(angle) * speed;
    actor.vy = Math.sin(angle) * speed * 0.65;
    if (Math.abs(actor.vx) < 10) actor.vx = (actor.vx < 0 ? -1 : 1) * 10;
    paint(actor);
  }

  function spawn(type) {
    if (scene.clientWidth < 40 || scene.clientHeight < 40) return null;
    var behavior = pickBehavior(type);
    var look = pickLook(behavior);
    var button = document.createElement("button");
    button.type = "button";
    button.className = "actor is-" + behavior.type;
    button.dataset.id = behavior.id;
    button.dataset.look = look;
    button.setAttribute("aria-label", kindLabel(behavior.type) + "：" + behavior.name);

    var card = document.createElement("span");
    card.className = "actor-card";
    card.appendChild(makeFigure(look));

    var chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = shortKind(behavior.type);

    var name = document.createElement("span");
    name.className = "actor-name";
    appendName(name, behavior.name);

    card.appendChild(chip);
    card.appendChild(name);

    var meterFill = null;
    var meterNum = null;
    if (behavior.type === "pollution") {
      var meter = document.createElement("span");
      meter.className = "meter";
      var track = document.createElement("span");
      track.className = "meter-track";
      meterFill = document.createElement("span");
      meterFill.className = "meter-fill";
      track.appendChild(meterFill);
      meterNum = document.createElement("span");
      meterNum.className = "meter-num";
      meterNum.textContent = POLLUTION_LINGER + " 秒";
      meter.appendChild(track);
      meter.appendChild(meterNum);
      card.appendChild(meter);
    }

    button.appendChild(card);
    actorsEl.appendChild(button);

    var actor = {
      uid: uid += 1,
      behavior: behavior,
      look: look,
      el: button,
      band: bandFor(look),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: behavior.type === "pollution" ? POLLUTION_LINGER : ECO_LINGER,
      dying: false,
      born: performance.now(),
      meterFill: meterFill,
      meterNum: meterNum
    };
    placeActor(actor);
    button.addEventListener("click", function () { onTap(actor); });
    state.actors.push(actor);
    return actor;
  }

  function removeActor(actor) {
    state.actors = state.actors.filter(function (item) { return item !== actor; });
    if (actor.el.parentNode) actor.el.remove();
  }

  function dismiss(actor, className, done) {
    if (actor.dying) return;
    actor.dying = true;
    actor.el.classList.add(className);
    actor.el.disabled = true;
    window.setTimeout(function () {
      removeActor(actor);
      if (done) done();
    }, 420);
  }

  function hasMatch(eco) {
    return aliveActors().some(function (actor) {
      return actor.behavior.type === "pollution" && actor.behavior.counter === eco.id;
    });
  }

  function ensureCast(dt) {
    state.spawnCooldown -= dt;
    if (state.spawnCooldown > 0) return;
    var limit = caps();
    if (countType("pollution") < 1 || countType("pollution") < limit.pollution && countType("purify") >= 1) {
      if (countType("pollution") < limit.pollution) {
        spawn("pollution");
        state.spawnCooldown = 0.7;
        return;
      }
    }
    if (countType("purify") < limit.eco) {
      spawn("purify");
      state.spawnCooldown = 0.7;
    }
  }

  function separateActors() {
    var list = aliveActors();
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
          a.x += signX * overlapX / 2;
          b.x -= signX * overlapX / 2;
        } else {
          var signY = dy < 0 ? -1 : 1;
          a.y += signY * overlapY / 2;
          b.y -= signY * overlapY / 2;
        }
      }
    }
  }

  function updateActors(dt) {
    state.actors.slice().forEach(function (actor) {
      if (state.mode !== "play" || actor.dying) return;
      actor.age += dt;
      var remain = actor.life - actor.age;
      if (actor.behavior.type === "pollution" && actor.meterFill) {
        var ratio = Math.max(0, remain / actor.life);
        actor.meterFill.style.transform = "scaleX(" + ratio + ")";
        actor.meterNum.textContent = Math.max(0, Math.ceil(remain)) + " 秒";
      }
      if (remain <= 0) {
        if (actor.behavior.type === "pollution") expirePollution(actor);
        else dismiss(actor, "is-leave");
        return;
      }
      actor.x += actor.vx * dt;
      actor.y += actor.vy * dt;
      var box = limitsFor(actor);
      if (actor.x <= box.left) {
        actor.x = box.left;
        actor.vx = Math.abs(actor.vx);
      } else if (actor.x >= box.right) {
        actor.x = box.right;
        actor.vx = -Math.abs(actor.vx);
      }
      if (actor.y <= box.top) {
        actor.y = box.top;
        actor.vy = Math.abs(actor.vy);
      } else if (actor.y >= box.bottom) {
        actor.y = box.bottom;
        actor.vy = -Math.abs(actor.vy);
      }
      paint(actor);
    });
    separateActors();
    if (state.mode !== "play") return;
    aliveActors().forEach(function (actor) {
      var box = limitsFor(actor);
      actor.x = Math.min(Math.max(actor.x, box.left), box.right);
      actor.y = Math.min(Math.max(actor.y, box.top), box.bottom);
      paint(actor);
    });
  }

  function expirePollution(actor) {
    if (actor.dying || state.mode !== "play" || state.paused) return;
    state.hearts = Math.max(0, state.hearts - 1);
    renderHearts(true);
    showToast("污染停留太久，扣 1 心");
    announce("污染停留太久，扣 1 心。剩下 " + state.hearts + " 粒心心。");
    dismiss(actor, "is-burst");
    if (state.hearts <= 0) endGame("hearts");
  }

  function hideModal() {
    modal.hidden = true;
    setInert(false);
    document.body.classList.remove("is-paused");
    pauseFlag.hidden = true;
    state.paused = false;
    state.lastTs = 0;
  }

  function openModal(behavior, note) {
    var pollution = behavior.type === "pollution";
    modalCard.classList.toggle("is-pollution", pollution);
    modalCard.classList.toggle("is-purify", !pollution);
    modalBadge.textContent = kindLabel(behavior.type);
    modalBadge.className = "badge is-" + behavior.type;
    modalEmoji.textContent = behavior.emoji;
    modalTitle.textContent = behavior.name;
    modalScore.textContent = pollution ? "＋1 分" : "不加分、不扣分";
    modalScore.className = "score-pill " + (pollution ? "is-plus" : "is-zero");
    modalScoreNote.textContent = note;
    modalPair.textContent = behavior.pairText;
    modalHeading.textContent = pollution ? "對動植物／生態的具體危害" : "如何協助改善環境";
    modalLead.textContent = behavior.lead;
    modalTip.textContent = behavior.tip;
    modal.hidden = false;
    document.body.classList.add("is-paused");
    pauseFlag.hidden = false;
    setInert(true);
    closeBtn.focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    var resume = state.mode === "play" && !state.pendingEnd;
    hideModal();
    state.ignoreClicksUntil = performance.now() + 350;
    if (state.pendingEnd || state.timeLeft <= 0) {
      endGame(state.endReason || "time");
      return;
    }
    if (resume) state.spawnCooldown = 0.35;
  }

  function onTap(actor) {
    if (state.mode !== "play" || state.paused || actor.dying) return;
    if (performance.now() < state.ignoreClicksUntil) return;
    if (performance.now() - actor.born < 180) return;
    state.paused = true;
    var behavior = actor.behavior;
    var note;
    if (behavior.type === "pollution") {
      state.score += 1;
      renderScore();
      note = "你及時點中，所以沒有扣心。";
    } else {
      state.purifyTaps += 1;
      var matched = hasMatch(behavior);
      if (!matched) {
        note = "場上暫時沒有它對應的污染，心心不變。";
      } else if (state.hearts >= MAX_HEARTS) {
        note = "對應到了，但心心已經滿了（5 粒）。";
      } else {
        state.hearts += 1;
        state.heals += 1;
        renderHearts(false);
        note = "對應到場上的污染，回復 1 心。";
      }
    }
    removeActor(actor);
    openModal(behavior, note);
    announce(kindLabel(behavior.type) + "：" + behavior.name + "。" + note + " 累計得分 " + state.score + " 分。");
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
        endGame("time");
        return;
      }
      updateActors(dt);
      if (state.mode !== "play") return;
      ensureCast(dt);
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
      emoji.setAttribute("aria-hidden", "true");
      emoji.textContent = behavior.emoji;
      var name = document.createElement("span");
      name.className = "review-name";
      appendName(name, behavior.name);
      var pair = document.createElement("p");
      pair.className = "review-pair";
      pair.textContent = behavior.pairText;
      behaviorCell.appendChild(badge);
      behaviorCell.appendChild(emoji);
      behaviorCell.appendChild(name);
      behaviorCell.appendChild(pair);
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
    if (state.endReason === "hearts") {
      endTitle.textContent = "心心用完了！";
      resultPraise.textContent = "污染停留 8 秒還沒點中，就會扣 1 心。看看複習頁，下一回可以更快出手。";
    } else if (state.score === 0) {
      endTitle.textContent = "時間到！";
      resultPraise.textContent = "這次還沒有點中污染行為。看看複習頁，下一回會更容易認出來。";
    } else if (state.score < 5) {
      endTitle.textContent = "時間到！";
      resultPraise.textContent = "你找出了 " + state.score + " 個污染行為。繼續練習，會愈認愈快！";
    } else {
      endTitle.textContent = "時間到！";
      resultPraise.textContent = "太棒了！你找出了 " + state.score + " 個污染行為，是個細心的小偵探。";
    }
    resultScore.textContent = "累計得分：" + state.score + " 分";
    resultHearts.textContent = "剩下心心：" + state.hearts + " 粒。你回復了 " + state.heals + " 次心心。";
    resultLearn.textContent = state.purifyTaps > 0
      ? "你打開了 " + state.purifyTaps + " 次環保行為說明。這些不加分、不扣分。"
      : "環保行為不加分、不扣分。下一回可以點開來，學習怎樣幫助環境。";
  }

  function clearActors() {
    state.actors.forEach(function (actor) { actor.el.remove(); });
    state.actors = [];
  }

  function endGame(reason) {
    if (state.mode !== "play") return;
    state.endReason = reason || "time";
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
    clearActors();
    toast.hidden = true;
    renderTimer();
    renderScore();
    renderHearts(false);
    renderResults();
    showScreen("end");
    announce((state.endReason === "hearts" ? "心心用完了。" : "時間到。") + "累計得分 " + state.score + " 分。");
    endTitle.focus();
  }

  function startGame() {
    state.mode = "boot";
    state.pendingEnd = false;
    state.paused = false;
    state.endReason = "time";
    hideModal();
    window.cancelAnimationFrame(state.raf);
    clearActors();
    toast.hidden = true;
    state.score = 0;
    state.hearts = MAX_HEARTS;
    state.heals = 0;
    state.purifyTaps = 0;
    state.timeLeft = DURATION;
    state.shownSecond = null;
    state.lastTs = 0;
    state.spawnCooldown = 0;
    state.mode = "play";
    showScreen("play");
    renderScore();
    renderHearts(false);
    renderTimer();
    announce("遊戲開始。5 粒心心，倒數 60 秒。污染停留 8 秒會扣心。");
    window.requestAnimationFrame(function () {
      if (state.mode !== "play") return;
      spawn("pollution");
      spawn("purify");
      state.spawnCooldown = 4;
      state.raf = window.requestAnimationFrame(frame);
    });
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
  document.addEventListener("visibilitychange", function () { state.lastTs = 0; });
  window.addEventListener("resize", function () {
    if (state.mode !== "play" || state.paused) return;
    state.actors.forEach(function (actor) {
      var box = limitsFor(actor);
      actor.x = Math.min(Math.max(actor.x, box.left), box.right);
      actor.y = Math.min(Math.max(actor.y, box.top), box.bottom);
      paint(actor);
    });
  });
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", function (event) { reduceMotion = event.matches; });
  }

  showScreen("start");
  renderScore();
  renderHearts(false);
  renderTimer();
})();
