interface Point {
  x: number;
  y: number;
}

const SAMPLE_GRID_SIZE = 10;
const COVER_LABEL = "اینجا را بکش ✨";

/**
 * ScratchSurface - wraps one <canvas> as a scratch-off cover.
 * `paint()` draws the opaque silver layer sized to the element's real CSS size;
 * strokes then erase it with `destination-out`. The composite operation is set
 * inside save()/restore() on every stroke, so no drawing state is ever carried
 * over from a previous paint (a resize or repaint can never break erasing).
 */
export class ScratchSurface {
  private pixelRatio = 1;
  private lastPoint: Point | null = null;

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: CanvasRenderingContext2D,
    private readonly brushRadiusCssPx: number,
  ) {}

  public static create(canvas: HTMLCanvasElement, brushRadiusCssPx: number): ScratchSurface | null {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    return context ? new ScratchSurface(canvas, context, brushRadiusCssPx) : null;
  }

  /** @returns false while the element has no layout size yet (nothing was painted). */
  public paint(): boolean {
    const cssWidth = this.canvas.clientWidth;
    const cssHeight = this.canvas.clientHeight;
    if (cssWidth === 0 || cssHeight === 0) {
      return false;
    }

    this.pixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(cssWidth * this.pixelRatio);
    this.canvas.height = Math.round(cssHeight * this.pixelRatio);

    const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, "#94a3b8");
    gradient.addColorStop(1, "#64748b");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#e2e8f0";
    this.context.font = `${16 * this.pixelRatio}px Vazirmatn, sans-serif`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(COVER_LABEL, this.canvas.width / 2, this.canvas.height / 2);
    return true;
  }

  public beginStroke(event: PointerEvent): void {
    const point = this.toCanvasPoint(event);
    this.erase((context) => {
      context.beginPath();
      context.arc(point.x, point.y, this.brushRadiusCssPx * this.pixelRatio, 0, Math.PI * 2);
      context.fill();
    });
    this.lastPoint = point;
  }

  public continueStroke(event: PointerEvent): void {
    const point = this.toCanvasPoint(event);
    const from = this.lastPoint ?? point;
    this.erase((context) => {
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    });
    this.lastPoint = point;
  }

  public endStroke(): void {
    this.lastPoint = null;
  }

  /** Samples a coarse grid of pixels (cheap) instead of reading the whole canvas. */
  public clearedFraction(): number {
    let cleared = 0;
    for (let row = 0; row < SAMPLE_GRID_SIZE; row += 1) {
      for (let column = 0; column < SAMPLE_GRID_SIZE; column += 1) {
        const x = Math.floor(((column + 0.5) / SAMPLE_GRID_SIZE) * this.canvas.width);
        const y = Math.floor(((row + 0.5) / SAMPLE_GRID_SIZE) * this.canvas.height);
        if (this.context.getImageData(x, y, 1, 1).data[3] === 0) {
          cleared += 1;
        }
      }
    }
    return cleared / (SAMPLE_GRID_SIZE * SAMPLE_GRID_SIZE);
  }

  private erase(draw: (context: CanvasRenderingContext2D) => void): void {
    this.context.save();
    this.context.globalCompositeOperation = "destination-out";
    this.context.fillStyle = "#000000";
    this.context.strokeStyle = "#000000";
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.context.lineWidth = this.brushRadiusCssPx * 2 * this.pixelRatio;
    draw(this.context);
    this.context.restore();
  }

  private toCanvasPoint(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }
}
