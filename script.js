async function init() {
  console.log("Hello World!");
  const button = document.createElement("button");
  button.textContent = "Get Images";
  button.addEventListener("click", getImages);
  document.body.appendChild(button);
}

async function getImages() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { greeting: "hello", id: chrome.runtime.id });
  // do something with response here, not outside the function
  console.log(response);
}

init();