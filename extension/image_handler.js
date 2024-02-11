
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  const images = message.images;
  const progress = document.createElement('div');

  progress.id = 'progress';
  progress.innerHTML = `0/${images.length}`;
  document.body.appendChild(progress);

  for (let i = 0; i < images.length; i++) {
    console.log(images[i]);
    let url = images[i];
    let id = "";
    const regex = /\/episodes\/(\d+)\//;
    const match = url.match(regex);
    if (match && match.length > 1) {
      id = match[1];
    }

    if (id) {
      const matrix = decodeID(id);
      url = await decodeImages(images[i], matrix);
    }

    const formdata = new FormData();
    const buffer = await fetch(url).then((r) => r.blob());
    formdata.append('upload[]', buffer, `${i}.jpg`);
    await fetch('http://localhost:8080/upload', {
      method: 'POST',
      body: formdata
    }).then((res) => {
      console.log(res);
    });
    var progressDiv = document.getElementById('progress');
    progressDiv.innerHTML = `${i + 1}/${images.length}`;
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

      images.push(tileCanvas.toDataURL('image/jpeg', 1));
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

  return mergeCanvas.toDataURL('image/jpeg', 1);
}