// let isRunning = false;
// let queue = [];

// const downloadImage = async () => {
//   if (isRunning) return;
//   const requestDetails = queue.shift();
//   if (!requestDetails) return;

//   isRunning = true;
//   const blob = await fetch(requestDetails.url).then((r) => r.blob())
//     .catch((e) => console.log(e))
//     .finally(() => isRunning = false);

//   const formdata = new FormData();
//   const name = requestDetails.url.split('/').pop().split('?')[0];

//   formdata.append('upload[]', blob, name);
//   formdata.append('comic', "test");
//   formdata.append('ep', "test");
//   await fetch('http://localhost:8080/upload', {
//     method: 'POST',
//     body: formdata
//   }).then((res) => {
//     console.log(res);
//   });
// }

// function logURL(requestDetails) {
//   if (requestDetails.url.includes("balcony.studio")) {
//     queue.push(requestDetails);
//     downloadImage();
//   }
// }
// // chrome.webRequest.onBeforeRequest.addListener(logURL, {
// //   urls: ["<all_urls>"],
// // });
// chrome.webRequest.onCompleted.addListener(logURL, {
//   urls: ["<all_urls>"],
// });
