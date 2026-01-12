import { wrapText, canvasDrawBuffer } from "../../utils/util";
// import {canvasDrawBuffer} from "./utils"

export class PosterSource {
    constructor() {
    }

    /**
     * @param canvas {HTMLCanvasElement}
     * @param context {CanvasRenderingContext2D}
     * @return {Promise<void>}
     */
    async load(canvas, context) {
    }

    /**
     * @param context {CanvasRenderingContext2D}
     */
    draw(context) {
    }
}

export class PosterImage extends PosterSource {
    /**
     * @param src
     * @param x
     * @param y
     * @param w
     * @param h
     * @param detail {undefined|"round-image"}
     * @param fit { {mode: "fill"|"contain"|"cover", coverXRatio: number, coverYRatio: number, coverXOffset: number, coverYOffset: number} }
     */
    constructor({ src, x, y, w, h, detail, fit }) {
        super();
        this.src = src;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.detail = detail;
        this.fit = Object.assign({
            mode: "fill",
            coverXRatio: 0.5,
            coverYRatio: 0.5,
            coverXOffset: 0,
            coverYOffset: 0,
        }, fit);
    }

    load(canvas, context) {
        return new Promise((resolve, reject) => {
            this.image = canvas.createImage();
            this.image.src = this.src;
            this.image.onload = () => resolve();
            this.image.onerror = reject;
        });
    }
    draw2(ctx, img, x, y, r) {
        // 如果在绘制图片之后还有需要绘制别的元素，需启动 save() 、restore() 方法，否则 clip() 方法会导致之后元素都不可见
        //    save()：保存当前 Canvas 画布状态
        // restore()：恢复到保存时的状态
        ctx.save();
        let d = r * 2;
        let cx = x + r;
        let cy = y + r;
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#FFFFFF'; // 设置绘制圆形边框的颜色
        ctx.stroke(); // 绘制出圆形，默认为黑色，可通过 ctx.strokeStyle = '#FFFFFF'， 设置想要的颜色
        ctx.clip();
        ctx.drawImage(img, x, y, d, d);
        ctx.restore();
    }
    draw(context) {
        let ix = 0;
        let iy = 0;
        let iw = this.image.width;
        let ih = this.image.height;
        let x = this.x;
        let y = this.y;
        let w = this.w;
        let h = this.h;
        let ratioX = this.fit.coverXRatio;
        let ratioY = this.fit.coverYRatio;

        switch (this.fit.mode) {
            case "fill":
                break;
            case "cover":
                if (iw / ih > w / h) {
                    let scale = h / ih;
                    ix = (iw - w / scale + this.fit.coverXOffset / scale) * ratioX;
                    iw = w / scale;
                } else if (iw / ih < w / h) {
                    let scale = w / iw;
                    iy = (ih - h / scale + this.fit.coverYOffset / scale) * ratioY;
                    ih = h / scale;
                }
                break;
            case "contain":
                if (iw / ih > w / h) {
                    let scale = w / iw;
                    y += (h - ih * scale) / 2;
                    h = ih * scale;
                } else if (iw / ih < w / h) {
                    let scale = h / ih;
                    x += (w - iw * scale) / 2;
                    w = iw * scale;
                }
                break;
            default:
                break;
        }

        if (this.detail == 'round-image')
            this.draw2(context, this.image, x, y, w / 2);
        else {
            context.drawImage(this.image, ix, iy, iw, ih, x, y, w, h);
        }
    }
}

export class PosterText extends PosterSource {
    constructor({ text, font, color, lineHeight, x, y, w, maxLine, align = 'left' }) {
        super();
        this.text = text;
        this.font = font;
        this.color = color;
        this.lineHeight = lineHeight;
        this.x = x;
        this.y = y;
        this.w = w;
        this.align = align;
        this.maxLine = maxLine;
    }

    async load(canvas, context) {
    }

    draw(context) {
        //TODO 看iOS是否文字分辨率过低，不吃scale
        context.fillStyle = this.color;
        context.font = this.font;
        context.textAlign = this.align;
        wrapText(null, context, this.text, this.x, this.y, this.w, this.lineHeight, this.maxLine);
    }
}

// export class PosterWebgl extends PosterImage {
//     /**
//      * @param x
//      * @param y
//      * @param w
//      * @param h
//      * @param fit { {mode: "fill"|"contain"|"cover", coverXRatio: number, coverYRatio: number, coverXOffset: number, coverYOffset: number} }
//      */
//     constructor({ x, y, w, h, fit }) {
//         super({ src: null, x, y, w, h, fit });
//         this.app = getApp();
//     }

//     load(canvas, context) {
//         console.log("进入webglLoad")
//         return new Promise((resolve, reject) => {
//             //webgl截屏直接重用当前canvas，因为尺寸肯定比最终要画的webgl大，所以就算iOS端可能canvas的渲染分辨率没有原生那么大，也差不多够大了。
//             //poster组件会先把canvas放到屏幕外（left属性），等到load结束再拿回来。
//             const captureCanvas = canvas;

//             // this.app.once("postrender", async () => {

//             // let gl = this.app.globalData.poster.photoApp.graphicsDevice.gl;
//             // let photoApp = this.app?.globalData?.poster?.photoApp;
//             // let gl = photoApp?.graphicsDevice?.gl;
//             // let glCanvas = photoApp?.graphicsDevice?.canvas;
//             // if (!gl) {
//             //     reject(new Error("PosterWebgl: gl context unavailable"));
//             //     return;
//             // }
//             // console.log("gl属性",gl)

//             let photoApp = this.app?.globalData?.poster?.photoApp;
//             let photoManager = this.app?.globalData?.poster?.photoManager;
//             let gl = photoApp?.graphicsDevice?.gl;
//             let glCanvas = photoApp?.graphicsDevice?.canvas;
//             if (!gl && photoManager?.app?.graphicsDevice?.gl) {
//                 gl = photoManager.app.graphicsDevice.gl;
//                 glCanvas = photoManager.app.graphicsDevice.canvas;
//             }
//             if (!gl) {
//                 reject(new Error("PosterWebgl: gl context unavailable"));
//                 return;
//             }

//             let [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];
//             if (!w || !h) {
//                 w = glCanvas?.width || captureCanvas?.width || 0;
//                 h = glCanvas?.height || captureCanvas?.height || 0;
//             }
//             if (!w || !h) {
//                 reject(new Error("PosterWebgl: invalid capture size"));
//                 return;
//             }
//             //3d截图
//             let readPixelBuffer = new Uint8Array(w * h * 4);
//             let buffer2 = new Uint8Array(w * h * 4);
//             gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer);

//             //y轴翻转
//             for (let i = 0; i < h; i++) {
//                 buffer2.set(readPixelBuffer.slice(w * 4 * i, w * 4 * (i + 1)), w * 4 * (h - i - 1));
//             }

//             //画到canvas上
//             captureCanvas.width = w;
//             captureCanvas.height = h;

//             canvasDrawBuffer(captureCanvas, buffer2, w, h)

//             //保存到相册
//             wx.canvasToTempFilePath({
//                 canvas: canvas,
//                 fileType: "png",
//                 x: 0,
//                 y: 0,
//                 width: w,
//                 height: h,
//                 destWidth: w,
//                 destHeight: h,

//                 success: result => {
//                     this.image = canvas.createImage();
//                     this.image.src = result.tempFilePath;
//                     this.image.onload = () => resolve();
//                     this.image.onerror = reject;
//                 },
//                 fail: reject,
//             });
//             // });
//         });
//     }
// }

export class PosterWebgl extends PosterImage {
  /**
   * @param x
   * @param y
   * @param w
   * @param h
   * @param fit { {mode: "fill"|"contain"|"cover", coverXRatio: number, coverYRatio: number, coverXOffset: number, coverYOffset: number} }
   */
  constructor({ x, y, w, h, fit }) {
      super({ src: null, x, y, w, h, fit });
      this.app = getApp();
  }

  load(canvas, context) {
      console.log("进入webglLoad");
      return new Promise((resolve, reject) => {
          const captureCanvas = canvas;

          // 方案1：优先使用 PCContext（从调试信息看这是正确的上下文）
          let pcCtx = this.app?.globalData?.poster?.context;
          let photoManager = this.app?.globalData?.poster?.photoManager;
          
          // 方案2：备用方案，通过 photoManager 获取
          if (!pcCtx && photoManager?.app) {
              pcCtx = photoManager.app;
          }
          
          // 方案3：最后尝试 photoApp
          if (!pcCtx) {
              pcCtx = this.app?.globalData?.poster?.photoApp;
          }

          if (!pcCtx) {
              reject(new Error("PosterWebgl: PCContext unavailable"));
              return;
          }

          // 获取图形设备
          const graphicsDevice = pcCtx.graphicsDevice;
          if (!graphicsDevice) {
              reject(new Error("PosterWebgl: graphicsDevice unavailable"));
              return;
          }

          // 获取 WebGL 上下文和画布
          const gl = graphicsDevice.gl;
          const glCanvas = graphicsDevice.canvas;
          
          if (!gl) {
              reject(new Error("PosterWebgl: gl context unavailable"));
              return;
          }

          // 获取渲染尺寸
          let [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];
          if (!w || !h) {
              w = glCanvas?.width || captureCanvas?.width || 0;
              h = glCanvas?.height || captureCanvas?.height || 0;
          }
          
          if (!w || !h) {
              reject(new Error("PosterWebgl: invalid capture size"));
              return;
          }

          // 使用 PlayCanvas 的渲染后事件确保在正确时机截图
          const captureScreenshot = () => {
              // 3D 截图 - 直接读取帧缓冲区
              let readPixelBuffer = new Uint8Array(w * h * 4);
              let buffer2 = new Uint8Array(w * h * 4);
              
              try {
                  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, readPixelBuffer);

                  // Y轴翻转（WebGL坐标系与Canvas坐标系不同）
                  for (let i = 0; i < h; i++) {
                      buffer2.set(
                          readPixelBuffer.slice(w * 4 * i, w * 4 * (i + 1)), 
                          w * 4 * (h - i - 1)
                      );
                  }

                  // 设置捕获画布尺寸
                  captureCanvas.width = w;
                  captureCanvas.height = h;

                  // 绘制到canvas上
                  canvasDrawBuffer(captureCanvas, buffer2, w, h);

                  // 保存到临时文件
                  wx.canvasToTempFilePath({
                      canvas: canvas,
                      fileType: "png",
                      x: 0,
                      y: 0,
                      width: w,
                      height: h,
                      destWidth: w,
                      destHeight: h,
                      success: result => {
                          this.image = canvas.createImage();
                          this.image.src = result.tempFilePath;
                          this.image.onload = () => {
                              // 清理事件监听
                              pcCtx.off("postrender", captureScreenshot);
                              resolve();
                          };
                          this.image.onerror = (err) => {
                              pcCtx.off("postrender", captureScreenshot);
                              reject(err);
                          };
                      },
                      fail: (err) => {
                          pcCtx.off("postrender", captureScreenshot);
                          reject(err);
                      },
                  });
              } catch (error) {
                  pcCtx.off("postrender", captureScreenshot);
                  reject(error);
              }
          };

          // 等待下一帧渲染完成后截图
          pcCtx.once("postrender", captureScreenshot);
          
          // 强制触发一帧渲染（如果当前没有在渲染）
          if (pcCtx.autoRender) {
              pcCtx.renderNextFrame = true;
          }
      });
  }
}

export class PosterCamera extends PosterImage {
    /**
     * @param cameraContext {CameraContext}
     * @param x
     * @param y
     * @param w
     * @param h
     * @param fit { {mode: "fill"|"contain"|"cover", coverXRatio: number, coverYRatio: number, coverXOffset: number, coverYOffset: number} }
     */
    constructor({ cameraContext, x, y, w, h, fit }) {
        super({ src: null, x, y, w, h, fit });
        this.cameraContext = cameraContext;
    }

    load(canvas, context) {
        return new Promise((resolve, reject) => {
            this.cameraContext.takePhoto({ //先拍照
                quality: "high",
                success: result => {
                    let imageUrl = result.tempImagePath;
                    this.image = canvas.createImage(); //加载图片
                    this.image.src = imageUrl;
                    this.image.onload = () => resolve();
                    this.image.onerror = reject;
                },
            });
        });
    }
}

export class Poster {
    /**
     * @param canvas {HTMLCanvasElement}
     * @param context {CanvasRenderingContext2D}
     * @param widthRpx {number}
     * @param heightRpx {number}
     * @param pixelRatio {number}
     */
    constructor(canvas, context, widthRpx, heightRpx, pixelRatio) {
        this.canvas = canvas;
        this.context = context;
        this.widthRpx = widthRpx;
        this.heightRpx = heightRpx;
        this.pixelRatio = pixelRatio;
    }

    /**
     * @param sourceParams { ({type, src, x, y, w, h, detail, fit}|{type, text, font, color, lineHeight, x, y, w, maxLine})[]}
     * @return {Promise<void[]>}
     */
    loadParams(sourceParams) {
        let sources = [];
        sourceParams.forEach(sourceParam => {
            let type = sourceParam.type;
            switch (type) {
                case "image":
                    sources.push(new PosterImage(sourceParam));
                    break;
                case "text":
                    sources.push(new PosterText(sourceParam));
                    break;
                case "webgl":
                    sources.push(new PosterWebgl(sourceParam));
                    break;
                case "camera":
                    sources.push(new PosterCamera(sourceParam));
                    break;
            }
        });

        this.sources = sources;
        let arr = [];
        this.sources.map(source => {
            arr.push(source.load(this.canvas, this.context));
        });
        return Promise.all(arr);
    }

    draw() {
        let pixelRatio = this.pixelRatio;
        let width = this.canvas.width = Math.round(this.widthRpx * pixelRatio);
        let height = this.canvas.height = Math.round(this.heightRpx * pixelRatio);

        this.context.clearRect(0, 0, width, height);
        this.context.save();
        this.context.scale(pixelRatio, pixelRatio);

        for (let source of this.sources) {
            this.context.save();
            source.draw(this.context);
            this.context.restore();
        }

        this.context.restore();
    }

    saveToTemp(fileType = "jpg") {
        //TODO 支持只截图一部分保存（区域从外部传入）
        if (this.saveToTempPromise) {
            return this.saveToTempPromise;
        }
        return this.saveToTempPromise = new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                canvas: this.canvas,
                fileType: fileType,
                quality: 80,
                x: 0,
                y: 0,
                width: this.canvas.width,
                height: this.canvas.height,
                destWidth: this.canvas.width,
                destHeight: this.canvas.height,
                success: result => {
                    resolve(result.tempFilePath);
                },
                fail: reject,
            });
        });
    }

    saveToAlbum(fileType = "jpg") {
        return this.saveToTemp(fileType).then(tempFilePath => {
            return new Promise((resolve, reject) => {
                wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success: resolve,
                    fail: reject,
                });
            });
        });
    }

}