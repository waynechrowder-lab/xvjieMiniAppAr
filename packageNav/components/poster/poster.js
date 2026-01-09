import { Poster } from "./PosterGen";
// import { getSystemInfo } from "../../utils/util";
// import { isNumber } from "../../utils/utils/typeTest";

Component({
    properties: {
        sourceParams: {type: Array, value: null}, //source数组
        width: {type: Number, value: 0},
        height: {type: Number, value: 0},
        pixelRatio: {type: Number, value: 0},
        fileType: {type: String, value: "jpg"}, //TODO 测试
        save: {type: Boolean, value: false},
        showDrawed: { type: [Boolean, Number], value: true },
    },
    data: {
        left: 750,
    },

    lifetimes: {
        attached() {
            wx.createSelectorQuery().in(this)
                .select('#poster')
                .fields({node: true})
                .exec((res) => {
                    const canvas = res[0].node;
                    const context = canvas.getContext('2d');

                    this.triggerEvent("start");

                    let pixelRatio = wx.getSystemInfo().pixelRatio;
                    if (this.data.pixelRatio > 0) pixelRatio = this.data.pixelRatio;
                    console.log("canvas,context",canvas, context)
                    this.poster = new Poster(canvas, context, this.data.width, this.data.height, pixelRatio);

                    this.triggerEvent("load");
                    console.log('load sources', this.data.sourceParams)
                    this.loadPromise = this.poster.loadParams(this.data.sourceParams)
                        .then(() => {
                            this.triggerEvent("draw");
                            this.poster.draw();
                            // const left = isNumber(this.data.showDrawed) ? this.data.showDrawed : this.data.showDrawed ? 0 : this.data.left;
                            const left = 0;
                            if (left != this.data.left) this.setData({ left });
                            this.triggerEvent("finish");
                            return this.poster.saveToTemp(this.data.fileType).then(tempPath => {
                                this.triggerEvent("saveTemp", tempPath);
                            });
                        })
                        .catch((e) => {
                            console.error('poster.loadParams err', e)
                            this.triggerEvent("fail");
                        });
                });
        },
        detached() {
            console.log("poster detached");
        },
    },
    observers: {
        save: async function (value) {
            console.log("SAVE改变",value,this.data.sourceParams)
            this.triggerEvent("saveStart");
            if (!value) return;
            console.log("执行逻辑")
            await this.loadPromise; // 等绘制完毕再save
            this.poster.saveToAlbum(this.data.fileType)
                .then(() => {
                    this.triggerEvent("saved");
                })
                .catch(e => {
                    this.triggerEvent("saveError", e);
                });
        },
    },

    methods: {},
});
