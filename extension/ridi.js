let reqIdRidi = "";
function imgready(img) {
  let cnv = document.createElement("canvas");
  let w = cnv.width = img.width;
  let h = cnv.height = img.height;
  let ctx = cnv.getContext("2d");
  console.log([img]);
  ctx.drawImage(img, 0, 0);

  imgdata = ctx.getImageData(0, 0, w, h);
  return imgdata;
}

const imageAssignerRidi = () => {
  let images = document.querySelectorAll('.wv-178xo7w');
  images = document.querySelectorAll('[class^="wv-178xo7w"]');

  return images;
}

const RidiRead = async () => {
  let images = imageAssignerRidi()
  const total = images.length;
  const id = window.location.href.split("/").slice(-2)[0];
  const comic = "ridi_" + id

  const pages = await fetch('https://ridibooks.com/api/web-viewer/generate', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "book_id": id
    })
  }).then(res => res.json())
  console.log(pages);

  chrome.runtime.sendMessage(reqIdRidi, {
    provider: "ridi",
    count: total,
    total,
    comic,
    ep: 0,
    images: pages.data.pages.map(pimg => pimg.src)
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    sendResponse({ farewell: "Ridi receiving" });
    const url = window.location.href;
    if (request.greeting === "hello" && url.includes("ridibooks.com")) {
      reqIdRidi = request.id;
      console.log("We Are going")
      await RidiRead();
    }
  } catch (e) {
    console.log(e);
  }
});