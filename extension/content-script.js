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
            imageMap[i] = image[0];
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