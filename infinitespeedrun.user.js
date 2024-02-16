// ==UserScript==
// @name     Infinite Craft Speedrunning
// @version  1
// @match    https://neal.fun/infinite-craft/
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_setClipboard
// @grant unsafeWindow
// @grant window.close
// @grant window.focus
// @grant window.onurlchange
// ==/UserScript==
'use strict';

// Format time to hh:mm:ss.000 format
function formatTime(milliseconds) {
  // Calculate hours, minutes, seconds, and remaining milliseconds
  let hours = Math.floor(milliseconds / (1000 * 60 * 60));
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  let remainingMilliseconds = milliseconds % 1000;

  // Build the time string
  let timeString = '';
  if (hours > 0) {
    timeString += hours.toString().padStart(2, '0') + ':';
  }
  if (hours > 0 || minutes > 0) {
    timeString += minutes.toString().padStart(2, '0') + ':';
  }
  if (hours > 0 || minutes > 0 || seconds > 0) {
    timeString += seconds.toString().padStart(2, '0') + '.';
  }
  timeString += remainingMilliseconds.toString().padStart(3, '0');

  return timeString;
}


// Create the box to put your speedrun data in
function createSetupBox()
{
  // Container
  var setupbox = document.createElement("div");
  setupbox.id = "ic-speedrun-setup-container";
  setupbox.style.display = "none";
  setupbox.style.position = "fixed";
  setupbox.style.left = "50%";
  setupbox.style.top = "50%";
  setupbox.style.padding = "24px";
  setupbox.style.transform = "translate(-50%, -50%)";
  setupbox.style.background = "white";
  setupbox.style.border = "1px solid #c8c8c8";
  setupbox.style.borderRadius = "5px";
  
  // Titlebox
  
  var titlebox = document.createElement("h3");
  titlebox.innerText = "IC Speedrun";
  titlebox.style.margin = 0;
  titlebox.style.marginRight = "6px";
  titlebox.style.fontSize = "32px";
  titlebox.style.display = "inline-block";
  titlebox.style.padding = 0;
  setupbox.appendChild(titlebox);
  
  // Titlebox subtext
  
  var titlebox_subtext = document.createElement("span");
  titlebox_subtext.innerText = "by mishashto";
  titlebox_subtext.style.margin = 0;
  titlebox_subtext.style.display = "inline-block";
  titlebox_subtext.style.padding = 0;
  titlebox_subtext.style.fontWeight = 0;
  setupbox.appendChild(titlebox_subtext);
  
  setupbox.appendChild(document.createElement("br"));

  // Final goal input
  var setupinput = document.createElement("input");
  setupinput.id = "ic-speedrun-setup-input";
  setupinput.placeholder = "Super Mario";
  
  setupinput.style.margin = "3px";
  setupinput.style.padding = "3px 6px";
  setupbox.appendChild(setupinput);
  
  // Submit button
  var setupsubmit = document.createElement("button");
  setupsubmit.id = "ic-speedrun-setup-submit";
  setupsubmit.innerText = "Start";
  setupsubmit.style.margin = "3px";
  setupsubmit.style.padding = "3px 6px";
  
  setupsubmit.onclick = startSpeedrun;
  
  setupbox.appendChild(setupsubmit);
  
  // Reset button
  var setupreset = document.createElement("button");
  setupreset.id = "ic-speedrun-setup-reset";
  setupreset.innerText = "Reset";
  setupreset.style.margin = "3px";
  setupreset.style.padding = "3px 6px";
  
  setupreset.onclick = resetCrafts;
  
  setupbox.appendChild(setupreset);

  document.body.appendChild(setupbox);
}

// Create speedrun timer
function createTimer()
{
  var timerBox = document.createElement("span");
  timerBox.id = "ic-speedrun-timer";
  timerBox.style.display = "none";
  timerBox.style.position = "fixed";
  timerBox.style.left = "12px";
  timerBox.style.top = "42px";
  timerBox.style.fontSize = "42px";
  timerBox.style.fontWeight = "800";
  timerBox.style.color = "#66d959";
  timerBox.style.padding = "4px 8px";
  timerBox.style.background = "black";
  timerBox.innerText = "0";
  document.body.appendChild(timerBox);
}

function showSetupBox()
{
  document.querySelector("#ic-speedrun-setup-container").style.display = "block";
  setTimeout(() => { document.querySelector(".sidebar").style.pointerEvents = "none"; }, 11);
}

function showTimer()
{
  document.querySelector("#ic-speedrun-timer").style.display = "block";
}

function hideTimer()
{
  document.querySelector("#ic-speedrun-timer").style.display = "none";
}

function hideSetupBox()
{
  document.querySelector("#ic-speedrun-setup-container").style.display = "none";
  document.querySelector(".sidebar").style.pointerEvents = "initial";
}

// Removes all crafts from history
async function resetCrafts()
{
  localStorage.removeItem("infinite-craft-data");
  window.location.reload();
}

// Checks if there's any crafts made
function checkCrafts()
{
  return localStorage.getItem("infinite-craft-data") == null;
}

// Register the word and start the speedrun
async function startSpeedrun()
{
  if (!checkCrafts())
  {
    alert("Error: You need to reset before starting.");
    return;
  }

  let bannedWords = ["fire", "water", "wind", "earth"];
  
  if (bannedWords.includes(document.querySelector("#ic-speedrun-setup-input").value.toLowerCase()) || !document.querySelector("#ic-speedrun-setup-input").value.toLowerCase())
  {
    alert("Error: Selected word is in starting deck.");
    return;
  }
  
  unsafeWindow.speedrunning = true;
  unsafeWindow.started = +Date.now();
  unsafeWindow.timerInterval = setInterval(function() { document.querySelector("#ic-speedrun-timer").innerText = formatTime(+Date.now() - unsafeWindow.started); }, 1);
  unsafeWindow.waitingForWord = document.querySelector("#ic-speedrun-setup-input").value.toLowerCase();
  hideSetupBox();
  showTimer();
}

// Intercept fetch requests to know the result
async function processCrafts()
{
    let script = `function processCraft(craft)
    {
      if(window.speedrunning && window.waitingForWord == craft)
      {
        window.speedrunning = false;
        clearInterval(window.timerInterval);
        window.started = 0;
      }
    }

		var originalFetch = window.fetch;
    
    window.fetch = function(url, options) {
        return originalFetch.apply(this, arguments)
            .then(async function(response) {
								try {
									let responseClone = response.clone();
                  await processCraft((await responseClone.json()).result.toLowerCase());
                  return response;
								} catch { }
            })
            .catch(function(error) {
                console.error('Fetch Error:', error);
                throw error;
            });
    };`;
  	let newScript = document.createElement("script");
  	newScript.innerHTML = script;
  	document.body.appendChild(newScript);
}

async function processCraft(result)
{
	console.log(result);
}

async function main()
{
  unsafeWindow.waitingForWord = null;
  unsafeWindow.speedrunning = false;
  unsafeWindow.tookMs = 0;
  unsafeWindow.timerInterval = null;
  processCrafts();
	createSetupBox();
  createTimer();
  showSetupBox();
}

(async ()=>{ await main(); })().catch(console.error);
