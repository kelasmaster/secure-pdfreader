const canvas = document.getElementById("pdfViewer");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;

// Your Uploadfiles.io PDF link
const url = "https://ufile.io/3flwkgvw"; 

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

// Load PDF via proxy
async function loadPDF() {
  const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);

  console.log("Trying to load PDF via proxy:", proxyUrl);

  try {
    const loadingTask = pdfjsLib.getDocument(proxyUrl);
    const pdf = await loadingTask.promise;
    console.log("🎉 PDF loaded successfully!", pdf);
    pdfDoc = pdf;
    document.getElementById("page-count").textContent = pdf.numPages;
    renderPage(pageNum);
  } catch (err) {
    console.error("🛑 Failed to load PDF:", err);
    alert("Could not load PDF. Check console for details.");
  }
}

loadPDF();
