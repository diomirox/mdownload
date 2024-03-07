async function downloadBomtoomImages(images, total, comic, ep) {
  const progress = document.getElementById('progress');
  for (let i = 0; i < images.length; i++) {
    const formdata = new FormData();
    const buffer = await fetch(images[i]).then((r) => r.blob());
    formdata.append('upload[]', buffer, `${(i + 1).toString().padStart(3, '0')}.jpg`);
    formdata.append('comic', comic);
    formdata.append('ep', ep);
    await fetch('http://localhost:8080/upload', {
      method: 'POST',
      body: formdata
    }).then((res) => {
      console.log(res);
    });
    progress.innerHTML = `${i + 1}/${total}`;
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  const { provider, count, total, images } = message;

  if (provider == "bomtoon") {
    const imagesSorted = images.sort((a, b) => a - b);
    downloadBomtoomImages(imagesSorted, total, message.comic, message.ep);
  } else {
    const progress = document.getElementById('progress');
    progress.innerHTML = `${count + 1}/${total}`;
  }
});

