
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  const images = message.images;
  const progress = document.createElement('div');

  progress.id = 'progress';
  progress.innerHTML = `0/${images.length}`;
  document.body.appendChild(progress);
});
