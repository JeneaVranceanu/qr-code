import calculateImageSize from "../tools/calculateImageSize";
import errorCorrectionPercents from "../constants/errorCorrectionPercents";
import QRDot from "../figures/dot/svg/QRDot";
import QRCornerSquare from "../figures/cornerSquare/svg/QRCornerSquare";
import QRCornerDot from "../figures/cornerDot/svg/QRCornerDot";
import { RequiredOptions } from "./QROptions";
import gradientTypes from "../constants/gradientTypes";
import { QRCode, FilterFunction, Gradient } from "../types";
import { v4 as uuidv4 } from "uuid";

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

export default class QRSVG {
  _element: SVGElement;
  _defs: SVGElement;
  _dotsClipPath?: SVGElement;
  _cornersSquareClipPath?: SVGElement;
  _cornersDotClipPath?: SVGElement;
  _options: RequiredOptions;
  _qr?: QRCode;
  _image?: HTMLImageElement;

  //TODO don't pass all options to this class
  constructor(options: RequiredOptions) {
    this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this._element.setAttribute("id", uuidv4());
    this._element.setAttribute("width", String(options.width));
    this._element.setAttribute("height", String(options.height));
    if (options.shapeRendering) {
      this._element.setAttribute("shape-rendering", options.shapeRendering);
    }
    this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._defs.setAttribute("id", uuidv4());
    this._element.appendChild(this._defs);

    this._options = options;
  }

  get width(): number {
    return this._options.width;
  }

  get height(): number {
    return this._options.height;
  }

  getElement(): SVGElement {
    return this._element;
  }

  clear(): void {
    const oldElement = this._element;
    this._element = oldElement.cloneNode(false) as SVGElement;
    oldElement?.parentNode?.replaceChild(this._element, oldElement);
    this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this._defs.setAttribute("id", uuidv4());
    this._element.appendChild(this._defs);
  }

  async drawQR(qr: QRCode): Promise<void> {
    const count = qr.getModuleCount();
    const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const { imageOptions, qrOptions } = this._options;
    const isCircleShape = imageOptions.shape === "circle";
    // Stays 0 if `isCircleShape` is false
    // Value is a radius/dotSize
    let circleRadiusSquared = 0;
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };
    const imageCenterX = count / 2;
    const imageCenterY = count / 2;
    // A rectangle where we consider hiding QR code dots.
    // Used only if there's an image and it succesfully loaded.
    // Each coordinate is not a pixel value but an x,y of a QR code dot.
    // e.g. a 500x500 QR code may have 36x36 number of dots,
    // `xStart` and `yStart` could be set to 18 and `xEnd`, `yEnd` to 21 (in case of small image).
    let qrCodeFreeRectangle = {
      xStart: 0,
      yStart: 0,
      xEnd: 0,
      yEnd: 0
    };

    this._qr = qr;

    if (this._options.image) {
      //We need it to get image size
      await this.loadImage();
      if (!this._image) return;
      const coverLevel = imageOptions.imageSize * errorCorrectionPercents[qrOptions.errorCorrectionLevel];
      let maxHiddenDots = 0;
      let imageWidth = this._image.width;
      let imageHeight = this._image.height;

      const maxSize = Math.max(this._image.width, this._image.height);
      if (isCircleShape) {
        imageWidth = maxSize;
        imageHeight = maxSize;
      }

      maxHiddenDots =
        imageHeight === imageWidth
          ? Math.floor(coverLevel * count * count)
          : (maxSize - Math.min(this._image.width, this._image.height)) / 2;

      drawImageSize = calculateImageSize({
        originalWidth: imageWidth,
        originalHeight: imageHeight,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize
      });

      if (isCircleShape) {
        circleRadiusSquared = Math.pow(drawImageSize.height / dotSize / 2, 2);
      }

      qrCodeFreeRectangle = {
        xStart: (count - drawImageSize.hideXDots) / 2,
        yStart: (count - drawImageSize.hideYDots) / 2,
        xEnd: (count + drawImageSize.hideXDots) / 2,
        yEnd: (count + drawImageSize.hideYDots) / 2
      };
    }

    this.clear();
    this.drawBackground();
    this.drawDots((x: number, y: number): boolean => {
      if (this._image && this._options.imageOptions.hideBackgroundDots) {
        if (
          x >= qrCodeFreeRectangle.xStart &&
          x < qrCodeFreeRectangle.xEnd &&
          y >= qrCodeFreeRectangle.yStart &&
          y < qrCodeFreeRectangle.yEnd
        ) {
          if (isCircleShape) {
            return !(Math.pow(x - imageCenterX, 2) + Math.pow(y - imageCenterY, 2) <= circleRadiusSquared);
          }
          return false;
        }
      }

      if (squareMask[x]?.[y] || squareMask[x - count + 7]?.[y] || squareMask[x]?.[y - count + 7]) {
        return false;
      }

      if (dotMask[x]?.[y] || dotMask[x - count + 7]?.[y] || dotMask[x]?.[y - count + 7]) {
        return false;
      }

      return true;
    });
    this.drawCorners();

    if (this._options.image) {
      this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }

  drawBackground(): void {
    const element = this._element;
    const options = this._options;

    if (element) {
      const gradientOptions = options.backgroundOptions?.gradient;
      const color = options.backgroundOptions?.color;

      if (gradientOptions || color) {
        this._createColor({
          options: gradientOptions,
          color: color,
          additionalRotation: 0,
          x: 0,
          y: 0,
          height: options.height,
          width: options.width,
          id: "background-color"
        });
      }
    }
  }

  drawDots(filter?: FilterFunction): void {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const options = this._options;
    const count = this._qr.getModuleCount();

    if (count > options.width || count > options.height) {
      throw "The canvas is too small.";
    }

    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

    this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    const id = uuidv4();
    this._dotsClipPath.setAttribute("id", id);
    this._defs.appendChild(this._dotsClipPath);

    this._createColor({
      options: options.dotsOptions?.gradient,
      color: options.dotsOptions.color,
      additionalRotation: 0,
      x: xBeginning,
      y: yBeginning,
      height: count * dotSize,
      width: count * dotSize,
      id: id
    });

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        if (filter && !filter(x, y)) {
          continue;
        }
        if (!this._qr?.isDark(x, y)) {
          continue;
        }

        dot.draw(
          xBeginning + x * dotSize,
          yBeginning + y * dotSize,
          dotSize,
          (xOffset: number, yOffset: number): boolean => {
            if (x + xOffset < 0 || y + yOffset < 0 || x + xOffset >= count || y + yOffset >= count) return false;
            if (filter && !filter(x + xOffset, y + yOffset)) return false;
            return !!this._qr && this._qr.isDark(x + xOffset, y + yOffset);
          }
        );

        if (dot._element && this._dotsClipPath) {
          this._dotsClipPath.appendChild(dot._element);
        }
      }
    }
  }

  drawCorners(): void {
    if (!this._qr) {
      throw "QR code is not defined";
    }

    const element = this._element;
    const options = this._options;

    if (!element) {
      throw "Element code is not defined";
    }

    const count = this._qr.getModuleCount();
    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const cornersSquareSize = dotSize * 7;
    const cornersDotSize = dotSize * 3;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);

    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([column, row, rotation]) => {
      const x = xBeginning + column * dotSize * (count - 7);
      const y = yBeginning + row * dotSize * (count - 7);
      let cornersSquareClipPath = this._dotsClipPath;
      let cornersDotClipPath = this._dotsClipPath;

      if (options.cornersSquareOptions?.gradient || options.cornersSquareOptions?.color) {
        cornersSquareClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        const id = uuidv4();
        cornersSquareClipPath.setAttribute("id", id);
        this._defs.appendChild(cornersSquareClipPath);
        this._cornersSquareClipPath = this._cornersDotClipPath = cornersDotClipPath = cornersSquareClipPath;

        this._createColor({
          options: options.cornersSquareOptions?.gradient,
          color: options.cornersSquareOptions?.color,
          additionalRotation: rotation,
          x,
          y,
          height: cornersSquareSize,
          width: cornersSquareSize,
          id: id
        });
      }

      if (options.cornersSquareOptions?.type) {
        const cornersSquare = new QRCornerSquare({ svg: this._element, type: options.cornersSquareOptions.type });

        cornersSquare.draw(x, y, cornersSquareSize, rotation);

        if (cornersSquare._element && cornersSquareClipPath) {
          cornersSquareClipPath.appendChild(cornersSquare._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
            );

            if (dot._element && cornersSquareClipPath) {
              cornersSquareClipPath.appendChild(dot._element);
            }
          }
        }
      }

      if (options.cornersDotOptions?.gradient || options.cornersDotOptions?.color) {
        cornersDotClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        const id = uuidv4();
        cornersDotClipPath.setAttribute("id", id);
        this._defs.appendChild(cornersDotClipPath);
        this._cornersDotClipPath = cornersDotClipPath;

        this._createColor({
          options: options.cornersDotOptions?.gradient,
          color: options.cornersDotOptions?.color,
          additionalRotation: rotation,
          x: x + dotSize * 2,
          y: y + dotSize * 2,
          height: cornersDotSize,
          width: cornersDotSize,
          id: id
        });
      }

      if (options.cornersDotOptions?.type) {
        const cornersDot = new QRCornerDot({ svg: this._element, type: options.cornersDotOptions.type });

        cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);

        if (cornersDot._element && cornersDotClipPath) {
          cornersDotClipPath.appendChild(cornersDot._element);
        }
      } else {
        const dot = new QRDot({ svg: this._element, type: options.dotsOptions.type });

        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
            );

            if (dot._element && cornersDotClipPath) {
              cornersDotClipPath.appendChild(dot._element);
            }
          }
        }
      }
    });
  }

  loadImage(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options = this._options;
      const image = new Image();

      if (!options.image) {
        return reject("Image is not defined");
      }

      if (typeof options.imageOptions.crossOrigin === "string") {
        image.crossOrigin = options.imageOptions.crossOrigin;
      }

      this._image = image;
      image.onload = (): void => {
        resolve();
      };
      image.src = options.image;
    });
  }

  drawImage({
    width,
    height,
    count,
    dotSize
  }: {
    width: number;
    height: number;
    count: number;
    dotSize: number;
  }): void {
    if (!this._image) return;
    console.debug(count, dotSize);
    const options = this._options;
    const imageOptions = this._options.imageOptions;

    // Calculate the dimensions for the SVG element, accounting for margin and border width
    const borderWidth = imageOptions.borderWidth || 0; // Use 0 if borderWidth is not provided
    const totalMargin = 2 * imageOptions.margin;
    let imageWidth = width;
    let imageHeight = height;

    // Calculate the dimensions of the square (based on the greater of imageWidth or imageHeight)
    const squareSize = Math.max(imageWidth, imageHeight);
    let xImageOffset = 0;
    let yImageOffset = 0;

    const isCircleShape = imageOptions.shape === "circle";

    if (isCircleShape) {
      const aspectRatio = this._image.width / this._image.height;
      if (aspectRatio > 1) {
        imageHeight = squareSize;
        const _imageWidth = imageHeight * aspectRatio;
        xImageOffset = -(_imageWidth - imageWidth) / 2;
        imageWidth = _imageWidth;
      } else {
        imageWidth = squareSize;
        const _imageHeight = imageWidth / aspectRatio;
        yImageOffset = -(_imageHeight - imageHeight) / 2;
        imageHeight = _imageHeight;
      }
    }

    // Calculate the position of the SVG element
    const svgRootXPosition = Math.floor(Math.abs(options.width - imageWidth) / 2);
    const svgRootYPosition = Math.floor(Math.abs(options.height - imageHeight) / 2);

    // Calculate the center and radius of the image/circle based on the size
    const circleX = imageWidth / 2;
    const circleY = imageHeight / 2;
    const circleRadius = squareSize / 2 - borderWidth / 2;

    // Create an SVG element for the square
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", uuidv4());
    svg.setAttribute("width", `${imageWidth}px`); // Set the SVG width to the square size
    svg.setAttribute("height", `${imageHeight}px`); // Set the SVG height to the square size
    svg.setAttribute("x", String(svgRootXPosition)); // Set X position
    svg.setAttribute("y", String(svgRootYPosition)); // Set Y position

    // Create an image element
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("id", uuidv4());
    image.setAttribute("href", options.image || "");
    image.setAttribute("width", `${imageWidth}px`); // Set the image width to the square size
    image.setAttribute("height", `${imageHeight}px`); // Set the image height to the square size
    image.setAttribute("x", String(xImageOffset));
    image.setAttribute("y", String(yImageOffset));

    if (isCircleShape) {
      // Define a circular clip path
      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      const circleClipId = uuidv4();
      clipPath.setAttribute("id", circleClipId);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("id", uuidv4());
      circle.setAttribute("cx", String(circleX));
      circle.setAttribute("cy", String(circleY));
      circle.setAttribute("r", String(circleRadius - totalMargin / 2)); // Adjust for margin

      clipPath.appendChild(circle);
      image.setAttribute("clip-path", `url(#${circleClipId})`);

      // Append the elements to the SVG in the correct order
      svg.appendChild(clipPath);
    }

    svg.appendChild(image);

    if (borderWidth > 0) {
      let borderElement: SVGElement;
      if (isCircleShape) {
        borderElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        borderElement.setAttribute("cx", String(circleX));
        borderElement.setAttribute("cy", String(circleY));
        borderElement.setAttribute("r", String(circleRadius));
      } else {
        borderElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      }
      borderElement.setAttribute("id", uuidv4());
      borderElement.setAttribute("width", `${imageWidth}px`); // Set the SVG width to the square size
      borderElement.setAttribute("height", `${imageHeight}px`); // Set the SVG height to the square size
      borderElement.setAttribute("stroke", imageOptions.borderColor || "black"); // Border color
      borderElement.setAttribute("stroke-width", String(borderWidth)); // Border width
      borderElement.setAttribute("fill", "none"); // Transparent fill
      svg.appendChild(borderElement); // Add the circular border after the image
    }

    // Append the SVG to the container
    this._element.appendChild(svg);
  }

  _createColor({
    options,
    color,
    additionalRotation,
    x,
    y,
    height,
    width,
    id
  }: {
    options?: Gradient;
    color?: string;
    additionalRotation: number;
    x: number;
    y: number;
    height: number;
    width: number;
    id: string;
  }): void {
    const size = width > height ? width : height;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("height", String(height));
    rect.setAttribute("width", String(width));
    rect.setAttribute("clip-path", `url('#${id}')`);

    if (options) {
      let gradient: SVGElement;
      const gradientId = uuidv4();
      if (options.type === gradientTypes.radial) {
        gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        gradient.setAttribute("id", gradientId);
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("fx", String(x + width / 2));
        gradient.setAttribute("fy", String(y + height / 2));
        gradient.setAttribute("cx", String(x + width / 2));
        gradient.setAttribute("cy", String(y + height / 2));
        gradient.setAttribute("r", String(size / 2));
      } else {
        const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
        const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
        let x0 = x + width / 2;
        let y0 = y + height / 2;
        let x1 = x + width / 2;
        let y1 = y + height / 2;

        if (
          (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI) ||
          (positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI)
        ) {
          x0 = x0 - width / 2;
          y0 = y0 - (height / 2) * Math.tan(rotation);
          x1 = x1 + width / 2;
          y1 = y1 + (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
          y0 = y0 - height / 2;
          x0 = x0 - width / 2 / Math.tan(rotation);
          y1 = y1 + height / 2;
          x1 = x1 + width / 2 / Math.tan(rotation);
        } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
          x0 = x0 + width / 2;
          y0 = y0 + (height / 2) * Math.tan(rotation);
          x1 = x1 - width / 2;
          y1 = y1 - (height / 2) * Math.tan(rotation);
        } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
          y0 = y0 + height / 2;
          x0 = x0 + width / 2 / Math.tan(rotation);
          y1 = y1 - height / 2;
          x1 = x1 - width / 2 / Math.tan(rotation);
        }

        gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        gradient.setAttribute("gradientUnits", "userSpaceOnUse");
        gradient.setAttribute("x1", String(Math.round(x0)));
        gradient.setAttribute("y1", String(Math.round(y0)));
        gradient.setAttribute("x2", String(Math.round(x1)));
        gradient.setAttribute("y2", String(Math.round(y1)));
      }
      gradient.setAttribute("id", gradientId);
      options.colorStops.forEach(({ offset, color }: { offset: number; color: string }) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", `${100 * offset}%`);
        stop.setAttribute("stop-color", color);
        gradient.appendChild(stop);
      });

      rect.setAttribute("fill", `url('#${gradientId}')`);
      this._defs.appendChild(gradient);
    } else if (color) {
      rect.setAttribute("fill", color);
    }

    this._element.appendChild(rect);
  }
}
