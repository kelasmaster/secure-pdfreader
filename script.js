const canvas = document.getElementById("pdfViewer");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

// Replace YOUR_FILE_ID with the one from your Google Drive link
const url = "https://drive.google.com/uc?export=download&id=1o1XCi9MdPibBRPdpth80XjhiKfih8KlL";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js";

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });

    // Set canvas dimensions
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport
    };

    // Render the page
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
