const canvas = document.getElementById("pdfViewer");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

// 🔗 Your Direct MediaFire PDF Link
const url = "https://download1587.mediafire.com/znnj0q6vlwhg-fFrNJticmWs_OtYAdvxJeRu4XUB5qAoMnm35UIt6A1fPZ_aYr-x4wSJYp5EMR1q_u74M3vSUwNT3AjrpAJQI-KoFEOgVrKyYeJt-ru8xVvkPGM569nRSfgWCsC4EmSnEse_XxuEDqEOfI0H_wCLAjkjMfgXWpNk13k/ryfptbe2y4kmnsj/125+Contekan+Iklan.pdf"; 

// Set PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    // Set canvas size based on page
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
  }).catch(err => {
    console.error("Failed to render page", err);
    alert("Error rendering PDF page.");
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

// Load PDF Document
console.log("Loading PDF from:", url);
pdfjsLib.getDocument(url).promise.then(pdf => {
  console.log("PDF loaded successfully", pdf);
  pdfDoc = pdf;
  document.getElementById("page-count").textContent = pdf.numPages;
  renderPage(pageNum);
}).catch(err => {
  console.error("Error loading PDF", err);
  alert("Failed to load PDF. Check console for details.");
});
