class FilteredView {
  constructor() {
    this.activeFilters = [];
    this.filtersLabel = "Typical";
    this.canvas = fx.canvas();
    this.video = document.createElement("video");
    this.video.addEventListener("canplay", () => {
      this.initVideo();
    }, false);

    this.getVideoStream();
  }

  setFilters(filters, label) {
    this.filtersLabel = label;
    this.activeFilters = filters;
  }

  async getVideoStream() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(
        { video: { facingMode: "environment" } });
    } catch (e) {
      console.log(e);
    }
    this.video.srcObject = this.stream;
    this.video.play();
    this.texture = this.canvas.texture(this.video);
  }

  canvasDraw() {
    this.texture.loadContentsOf(this.video);
    this.canvas.draw(this.texture);
    for(let [filter, args] of this.activeFilters){
      this.canvas[filter].apply(this.canvas, args);
    }
    this.canvas.update();
    requestAnimationFrame(this.canvasDraw.bind(this));
  }

  initVideo() {
    requestAnimationFrame(this.canvasDraw.bind(this));
  }

  snapshot() {
    var canvas = document.createElement('canvas');
    canvas.width = this.canvas.width * 2;
    canvas.height = this.canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.canvas, this.canvas.width, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    ctx.font = '36px serif';
    ctx.fillStyle = 'yellow';

    ctx.fillText("Typical", 10, 50);
    ctx.strokeText("Typical", 10, 50);

    ctx.fillText(this.filtersLabel, this.canvas.width + 10, 50);
    ctx.strokeText(this.filtersLabel, this.canvas.width + 10, 50);

    return new Promise(resolve => {
      canvas.toBlob(resolve, "image/jpeg", 0.85);
    });
  }
}
