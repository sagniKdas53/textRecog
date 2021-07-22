var inputElement,
  inputImage,
  back_button_ele,
  back_button_cb,
  transition_ele,
  transition_cb,
  referance_ele,
  referance_cb,
  help_ele,
  help_cb,
  change_arrow_ele,
  change_arrow_cb,
  stats_ele,
  stats_cb,
  output_canvas,
  template,
  spinner,
  isresized = false,
  XText,
  YText,
  WText,
  HText;

window.onload = function setup() {
  inputElement = document.getElementById("fileInput");
  inputImage = document.getElementById("main_image");

  back_button_ele = document.getElementById("back_button");
  back_button_cb = document.getElementById("back_button_cb");

  transition_ele = document.getElementById("transition");
  transition_cb = document.getElementById("transition_cb");

  referance_ele = document.getElementById("referance");
  referance_cb = document.getElementById("referance_cb");

  help_ele = document.getElementById("help");
  help_cb = document.getElementById("help_cb");

  change_arrow_ele = document.getElementById("change_arrow");
  change_arrow_cb = document.getElementById("change_arrow_cb");

  stats_ele = document.getElementById("stats");
  stats_cb = document.getElementById("stats_cb");

  output_canvas = document.getElementById("canvasOutput");
  template = document.getElementById("template_canvas");

  spinner = document.getElementById("spinner");
  XText = document.getElementById("XText");
  YText = document.getElementById("YText");
  WText = document.getElementById("WText");
  HText = document.getElementById("HText");

  inputElement.addEventListener(
    "change",
    (e) => {
      inputImage.src = URL.createObjectURL(e.target.files[0]);
    },
    false
  );
  inputImage.onload = function onceImageLoaded() {
    loadImageToCanvas(inputImage.src, output_canvas); // load the main image as a canvas

  };
  // anything outside the onceImageLoaded gives a Mat not initilized error.
  return true;
};

function preProcessImage() {
  if (isresized == false) {
    isresized = cropInputImage();
  }
  //doDetection();  renable this later
};

function loadImageToCanvas(imageUrl, canvasElement) {
  //non cv way to load stuff to canvas
  var context = canvasElement.getContext("2d");
  var image = new Image();
  image.src = imageUrl;
  image.onload = () => {
    canvasElement.width = image.width;
    canvasElement.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
  };
  XText.value = 0;
  YText.value = 0;
  WText.value = image.width;
  HText.value = image.height;
  return false;
};

function cropInputImageParameterized() {
  var start_of_roi_x,start_of_roi_y,roi_width,roi_height;
  var image_full = cv.imread("canvasOutput");
  var image_cropped = new cv.Mat();
  // idk about the x and y coordinates but i assume rows=> y, cols=> x
  start_of_roi_x = parseInt(XText.value); //used only if black bar is present
  start_of_roi_y = parseInt(YText.value);
  roi_width = parseInt(WText.value);  //cols => width
  roi_height = parseInt(HText.value);     // rows => height
  var rect = new cv.Rect(start_of_roi_x, start_of_roi_y, roi_width, roi_height);
  //console.log(start_of_roi);
  //console.log(x, y); //used only if there i no black bar
  console.log(rect);
  image_cropped = image_full.roi(rect);
  cv.imshow("canvasOutput", image_cropped); // this is not working for some reason
  image_cropped.delete();
  image_full.delete();
  return true;
};

function cropInputImage() {
  var start_of_roi_x,start_of_roi_y,roi_width,roi_height;
  var image_full = cv.imread("canvasOutput");
  var image_cropped = new cv.Mat();
  // idk about the x and y coordinates but i assume rows=> y, cols=> x
  start_of_roi_x = Math.round(image_full.rows * 0.07); //used only if black bar is present
  start_of_roi_y = 00;
  roi_width = Math.round(image_full.cols / 2);  //cols => width
  roi_height = Math.round(image_full.rows);     // rows => height
  var rect = new cv.Rect(start_of_roi_x, start_of_roi_y, roi_width, roi_height);
  //console.log(start_of_roi);
  //console.log(x, y); //used only if there i no black bar
  console.log(rect);
  image_cropped = image_full.roi(rect);
  cv.imshow("canvasOutput", image_cropped); // this is not working for some reason
  image_cropped.delete();
  image_full.delete();
  return true;
};


function doDetection() {
  if (back_button_cb.checked == true) {
    makebox(back_button_ele, 126, 255, 5, 255);
  }
  if (transition_cb.checked == true) {
    makebox(transition_ele, 247, 255, 10, 255);
  }
  if (referance_cb.checked == true) {
    makebox(referance_ele, 255, 108, 10, 255);
  }
  if (help_cb.checked == true) {
    makebox(help_ele, 255, 56, 112, 255);
  }
  if (stats_cb.checked == true) {
    makebox(stats_ele, 127, 60, 251, 255);
  }
  if (change_arrow_cb.checked == true) {
    makebox(change_arrow_ele, 255, 56, 219, 255);
  }
  //add rest of the templates
  return false;
};

function makebox(template_ele, r, g, b, a) {
  var inputImage = cv.imread("canvasOutput");
  loadImageToCanvas(
    template_ele.src,
    document.getElementById("template_canvas")
  ); //loads the template if the template is not loaded into a mat then cv can't use it
  var template = cv.imread(template_ele);
  var destinationMat = new cv.Mat();
  let color = new cv.Scalar(r, g, b, a);
  var mask = new cv.Mat();
  cv.matchTemplate(inputImage, template, destinationMat, cv.TM_CCOEFF, mask);
  var result = cv.minMaxLoc(destinationMat, mask);
  //var minPoint = result.minLoc;
  var maxPoint = result.maxLoc;
  var point = new cv.Point(
    maxPoint.x + template.cols,
    maxPoint.y + template.rows
  );
  cv.rectangle(inputImage, maxPoint, point, color, 2, cv.LINE_8, 0);
  cv.imshow("canvasOutput", inputImage); // this is not working for some reason
  inputImage.delete();
  mask.delete();
  destinationMat.delete();
  return false;
};

function DownloadCanvasAsImage() {
  // saves the output canvas
  var date = new Date();
  var year = date.getFullYear();
  var month = `${date.getMonth() + 1}`.padStart(2, "0");
  var day = `${date.getDate()}`.padStart(2, "0");
  var hour = `${date.getHours()}`.padStart(2, "0");
  var minute = `${date.getMinutes()}`.padStart(2, "0");
  var second = `${date.getSeconds()}`.padStart(2, "0");
  str = `${year}${month}${day}${hour}${minute}${second}`;
  var downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", "Download_" + str + ".png");
  var canvas = document.getElementById("canvasOutput");
  canvas.toBlob(function (blob) {
    var url = URL.createObjectURL(blob);
    downloadLink.setAttribute("href", url);
    downloadLink.click();
  });
};

function GetCanvasURL() {
  // saves the output canvas
  var dataURL;
  var str = "ree";
  var downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", "Download_" + str + ".png");
  var canvas = document.getElementById("canvasOutput");
  dataURL = canvas.toDataURL("image/png", 1.0);
  //canvas.toBlob(function (blob) {
  //  url = URL.createObjectURL(blob);
  //});
  return dataURL;
};


function onOpenCvReady() {
  document.getElementById("statusCV").innerHTML = "OpenCV.js is ready.";
}
function onTessReady() {
  document.getElementById("statusTS").innerHTML = "Tesseract.js worker loaded.";
}
function onTessDone() {
  document.getElementById("statusTS").innerHTML = "Tesseract.js worker unloaded.";
}

var worker = new Tesseract.createWorker({
  logger: (m)=> console.log(m),
});

async function FunctionThatGetsText() {
  spinner.classList.remove("d-none");
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  onTessReady();
  const { data: { text } } = await worker.recognize(GetCanvasURL());//inputImage.src);
  document.getElementById('textarea').innerHTML = text;
  console.log(text);
  spinner.classList.add("d-none");
  onTessDone();
};

async function stopWorker(){
  await worker.terminate();
}
//add a way to call this and run this before page close.

// all that is left is to add a function to turn to greyScale and crop the stats into pieces
// see the inpb for details and then feed the pieces to tesseract for recgnition
// finally integarte this whole thing into my fork of maphe and then upload images to calculate stats
// the stat manipulation can be done by uinsg document properties of the webpage.
