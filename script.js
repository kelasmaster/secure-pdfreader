const canvas = document.getElementById("pdfViewer");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

// Replace with your secure external PDF URL
const url = "https://drive.google.com/file/d/18SOyK3T_X9LWQbLoINPCxXPwuFV7b3f_/view?usp=drive_link"; 

pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderContext);

    pageRendering = false;
    if (pageNumPending !== null) {
      renderPage(pageNumPending);
      pageNumPending = null;
    }
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function nextPage() {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    queueRenderPage(pageNum);
  }
}

function prevPage() {
  if (pageNum > 1) {
    pageNum--;
    queueRenderPage(pageNum);
  }
}

function zoomIn() {
  scale += 0.5;
  queueRenderPage(pageNum);
}

function zoomOut() {
  if (scale > 0.5) {
    scale -= 0.5;
    queueRenderPage(pageNum);
  }
}

// Load PDF
pdfjsLib.getDocument(url).promise.then(pdf => {
  pdfDoc = pdf;
  document.getElementById("page-count").textContent = pdf.numPages;
  renderPage(pageNum);
});
