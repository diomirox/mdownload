let reqIdBom = "";
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

const bomtoonRead = async () => {
  let images = document.querySelectorAll('[class^="ScrollImageContents__ItemContainer"]');
  if (images.length === 0) images = document.querySelectorAll('[class^="sc-fff4cb82-0"]');
  const total = images.length;
  const url = window.location.href;
  const [comic, ep] = url.split("/").slice(-2);

  const imagesLiks = [];
  for (let i = 0; i < total; i++) {
    images[i].scrollIntoView();
    imagesLiks.push(images[i].firstChild.src);
  }
  chrome.runtime.sendMessage(reqIdBom, {
    provider: "bomtoon",
    count: total,
    total,
    comic,
    ep,
    images: imagesLiks
  });
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    sendResponse({ farewell: "recived" });
    const url = window.location.href;
    if (request.greeting === "hello" && url.includes("bomtoon.com")) {
      reqIdBom = request.id;
      await bomtoonRead();
    }
  } catch (e) {
    console.log(e);
  }
});