function captureNetworkRequest(name) {
  var capture_network_request = [];
  var capture_resource = performance.getEntriesByType("resource");
  for (var i = 0; i < capture_resource.length; i++) {
    if (capture_resource[i].initiatorType == "xmlhttprequest" || capture_resource[i].initiatorType == "script" || capture_resource[i].initiatorType == "img") {

      if (capture_resource[i].name.includes(name))
        capture_network_request.push(capture_resource[i].name)
    }
  }

  return capture_network_request;
}
const buttonFunction = async () => {
  let imageMap = [];
  let imagesDoc = document.getElementById("scroll-list");
  let total = imagesDoc.children.length;
  // let total = 3;

  const imageTakingUntilLoad = async (i) => {
    // is have a children
    if (imagesDoc.children[i].children.length > 0) {
      // children is a img or canvas
      switch (imagesDoc.children[i].children[0].tagName) {
        case "IMG":
          imageMap[i] = imagesDoc.children[i].children[0].src;
          break;
        case "CANVAS":
          let image = captureNetworkRequest(`${i}.webp`);
          if (image.length > 0) {
            let url = image[0];
            let id = "";
            const regex = /\/episodes\/(\d+)\//;
            const match = url.match(regex);
            if (match && match.length > 1) {
              id = match[1];
            }
            if (id) {
              const matrix = decodeID(id);
              url = await decodeImages(url, matrix);
            }
            imageMap[i] = url;
          }
          break;
      }
    }
    // wait 1 seconds
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!imageMap[i]) await imageTakingUntilLoad(i);
  }
  // auto scroll to load all images
  for (let i = 0; i < total; i++) {
    imagesDoc.children[i].scrollIntoView();
    await imageTakingUntilLoad(i);

    const formdata = new FormData();
    const buffer = await fetch(imageMap[i]).then((r) => r.blob());
    const url = window.location.href;
    const [comic, ep] = url.split("/").slice(-2);
    formdata.append('upload[]', buffer, `${i}.png`);
    formdata.append('comic', comic);
    formdata.append('ep', ep);
    await fetch('http://localhost:8080/upload', {
      method: 'POST',
      body: formdata
    }).then((res) => {
      console.log(res);
    });
  }
  return imageMap;
};
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  sendResponse({ farewell: "recived" });
  if (request.greeting === "hello") {
    const images = await buttonFunction();
    chrome.runtime.sendMessage(request.id, { images: images });
  }
});


class G {
  constructor(value) {
    this.value = typeof value === 'bigint' ? value : BigInt(value);
  }

  xor(other) {
    return new G(this.value ^ other.value);
  }

  shiftRight(bits) {
    return new G(this.value >> bits);
  }

  shiftLeft(bits) {
    return new G(this.value << bits);
  }

  and(mask) {
    return new G(this.value & mask);
  }

  remainder(divisor) {
    return new G(this.value % divisor);
  }
}

function Se(t) {
  return BigInt(t);
}

function seedReader(e) {
  e = (e = (e = e.xor(e.shiftRight(Se(12)))).xor(e.shiftLeft(Se(25)).and(Se("18446744073709551615")))).xor(e.shiftRight(Se(27)));
  const state = e.and(Se("18446744073709551615"));
  const place = e.shiftRight(Se(32)).remainder(Se(25))

  return [place.value, state];
}

const decodeID = (id) => {
  let i = 0;
  const arrays = Array.from({ length: 25 }, () => i++);

  let gstate = new G(id);
  for (let i = 0; i < 25; i++) {
    const [place, state] = seedReader(gstate);
    const u = arrays[i];
    arrays[i] = arrays[place];
    arrays[place] = u;
    gstate = state;
  }

  return arrays;
}

async function decodeImages(url, matrix) {
  const img = new Image();
  img.src = url;
  img.crossOrigin = '*';

  await new Promise((resolve) => (img.onload = resolve));

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const tileWidth = Math.floor(img.width / 5);
  const tileHeight = Math.floor(img.height / 5);

  const images = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const left = col * tileWidth;
      const top = row * tileHeight;

      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;

      const tileCtx = tileCanvas.getContext('2d');
      tileCtx.drawImage(
        canvas,
        left,
        top,
        tileWidth,
        tileHeight,
        0,
        0,
        tileWidth,
        tileHeight
      );

      images.push(tileCanvas.toDataURL('image/png', 1));
    }
  }

  const mergeCanvas = document.createElement('canvas');
  mergeCanvas.width = img.width;
  mergeCanvas.height = img.height;

  const mergeCtx = mergeCanvas.getContext('2d');
  mergeCtx.drawImage(img, 0, 0, img.width, img.height);

  for (const i in matrix) {
    const left = (parseInt(i) % 5) * tileWidth;
    const top = Math.floor(parseInt(i) / 5) * tileHeight;

    const image = new Image();
    image.src = images[matrix[i]];
    image.crossOrigin = '*';

    await new Promise((resolve) => (image.onload = resolve));

    mergeCtx.drawImage(image, left, top);
  }

  return mergeCanvas.toDataURL('image/png', 1);
}