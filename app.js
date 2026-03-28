var produced = 0;
var consumed = 0;
var partitions = [0, 0, 0];
var events = [];

var topics = ["orders", "users", "payments"];
var keys = ["user_1", "user_2", "user_3", "order_55", "order_99", "pay_100", "user_42"];
var values = ["order.created", "order.failed", "user.signup", "user.login", "payment.success", "payment.failed", "order.shipped"];


var clock = document.querySelector("#clock");
var eventList = document.querySelector("#event-list");
var consumerLog = document.querySelector("#consumer-log");
var produceCountEl = document.querySelector("#produce-count");
var consumedEl = document.querySelector("#consumed-count");
var lagEl = document.querySelector("#lag");
var offsetEl = document.querySelector("#current-offset");
var lastProduced = document.querySelector("#last-produced");
var epsEl = document.querySelector("#eps");
var sizeText = document.querySelector("#window-size");
var produceBtn = document.querySelector("#produce-btn");
var randomBtn = document.querySelector("#random-btn");
var darkBtn = document.querySelector("#dark-btn");
var topBtn = document.querySelector("#top-btn");
var allPartitions = document.querySelectorAll(".partition");


function produceEvent() {
    var topic = topics[Math.floor(Math.random() * topics.length)];
    var key = keys[Math.floor(Math.random() * keys.length)];
    var value = values[Math.floor(Math.random() * values.length)];

    var hash = 0;
    for (var i = 0; i < key.length; i++) {
        hash = hash + key.charCodeAt(i);
    }
    var partition = hash % 3;

    events.push({ topic: topic, key: key, value: value, partition: partition });
    produced++;
    partitions[partition]++;


    produceCountEl.textContent = produced + " produced";
    offsetEl.textContent = produced;
    lagEl.textContent = produced - consumed;
    lastProduced.textContent = "[" + topic + "] " + key + " → " + value;


    var div = document.createElement("div");
    div.classList.add("event-item");
    div.innerHTML = '<span class="ev-topic">[' + topic + ']</span><span class="ev-key">' + key + '</span><span class="ev-value">' + value + '</span><span class="ev-meta">P' + partition + ' @' + (produced - 1) + '</span>';
    if (eventList.firstChild) {
        eventList.insertBefore(div, eventList.firstChild);
    } else {
        eventList.appendChild(div);
    }
    if (eventList.children.length > 30) {
        eventList.removeChild(eventList.lastChild);
    }


    var max = Math.max(partitions[0], partitions[1], partitions[2], 1);
    for (var j = 0; j < 3; j++) {
        document.querySelector("#p" + j + "-fill").style.width = (partitions[j] / max * 100) + "%";
        document.querySelector("#p" + j + "-count").textContent = partitions[j];
    }

    allPartitions[partition].classList.add("active");
    allPartitions[partition].style.transform = "scale(1.01)";
    setTimeout(function() {
        allPartitions[partition].style.transform = "";
        allPartitions[partition].classList.remove("active");
    }, 400);
}



function consumeEvent() {
    if (consumed >= events.length) return;

    var ev = events[consumed];
    consumed++;

    // update screen
    consumedEl.textContent = consumed;
    lagEl.textContent = produced - consumed;

    // add to consumer log
    var div = document.createElement("div");
    div.classList.add("consumed");
    div.textContent = "✓ [" + ev.topic + "] " + ev.key + " → " + ev.value;
    if (consumerLog.firstChild) {
        consumerLog.insertBefore(div, consumerLog.firstChild);
    } else {
        consumerLog.appendChild(div);
    }
    if (consumerLog.children.length > 12) {
        consumerLog.removeChild(consumerLog.lastChild);
    }
}




produceBtn.addEventListener("click", function() {
    produceEvent();
});

randomBtn.addEventListener("click", function(e) {
    for (var i = 0; i < 5; i++) {
        setTimeout(produceEvent, i * 150);
    }
});

darkBtn.addEventListener("click", function() {
    document.body.classList.toggle("dark");
    darkBtn.textContent = document.body.classList.contains("dark") ? "light mode" : "dark mode";
});

document.addEventListener("keydown", function(e) {
    if (e.key === "p" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        produceEvent();
    }
});

window.addEventListener("scroll", function() {
    if (window.scrollY > 300) {
        topBtn.classList.remove("hide");
    } else {
        topBtn.classList.add("hide");
    }
});

topBtn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("resize", function() {
    sizeText.textContent = window.innerWidth + " x " + window.innerHeight;
});




setInterval(function() {
    clock.textContent = new Date().toLocaleTimeString();
}, 1000);

setInterval(produceEvent, 2500);

setInterval(consumeEvent, 3500);

setInterval(function() {
    epsEl.textContent = (produced / (Date.now() / 1000)).toFixed(1) + " evt/s";
}, 2000);




clock.textContent = new Date().toLocaleTimeString();
sizeText.textContent = window.innerWidth + " x " + window.innerHeight;
produceEvent();
produceEvent();
produceEvent();