import * as qiniu from 'qiniu-js'
import { UploadConfig } from './types'
import { UploadProgress } from 'qiniu-js/esm/upload'
import { isFunction } from './util'
import { CustomError } from 'qiniu-js/esm/utils'
import { UploadCompleteData } from 'qiniu-js/esm/api'

class QiNiuUpload {
  config: UploadConfig

  constructor(config: UploadConfig) {
    this.config = config
    const region = qiniu.region[config.region]
    if (!region) {
      console.error('qiniu:region参数不存在')
      return
    }
    this.config.region = region
  }

  /**
   * 上传
   * 大于 4M 时可分块上传，小于 4M 时直传
   * 分块上传时，支持断点
   * 如果取消上传那么想要继续上传剩下的
   * 直接重新调用这个上传方法就行
   */
  upload(file: File, next?: (res: UploadProgress) => void): Promise<UploadProgress> {
    let promise: Promise<UploadProgress>
    promise = new Promise((resolve, reject) => {
      const key = null,
        putExtra = {
          mimeType: this.config.mimeType
        },
        observer = {
          /**
           *  next: 接收上传进度信息的回调函数，回调函数参数值为 object，包含字段信息如下：
           *  uploadInfo: object，只有分片上传时才返回该字段
           *  uploadInfo.id: 上传任务的唯一标识
           *  uploadInfo.url: 上传地址
           *  total: 包含loaded、total、percent三个属性:
           *  total.loaded: number，已上传大小，单位为字节。
           *  total.total: number，本次上传的总量控制信息，单位为字节，注意这里的 total 跟文件大小并不一致。
           *  total.percent: number，当前上传进度，范围：0～100。
           */
          next: (res: UploadProgress) => {
            if (isFunction(next)) {
              next(res)
            }
          },
          /**
           * error: 上传错误后触发；自动重试本身并不会触发该错误，而当重试次数到达上限后则可以触发。当不是 xhr 请求错误时，
           * 会把当前错误产生原因直接抛出，诸如 JSON 解析异常等；当产生 xhr 请求错误时，
           * 参数 err 为一个包含 code、message、isRequestError 三个属性的 object：
           */
          error: (err: CustomError) => {
            reject(err)
          },
          /**
           * complete: 接收上传完成后的后端返回信息，具体返回结构取决于后端sdk的配置，可参考上传策略。
           */
          complete: (res: UploadCompleteData) => {
            if (res.key) {
              const url = this.config.domain + '/' + res.key
              res.url = url
              resolve(res)
            } else {
              reject(res)
            }
          }
        }
      try {
        const observable = qiniu.upload(file, key, this.config.token, putExtra, this.config)
        const subscription = observable.subscribe(observer)
        promise.abort
        promise.abort = function() {
          subscription.unsubscribe()
        }
      } catch (error) {
        reject(error)
      }
    })
    return promise
  }
  /**
   * 七牛不支持多文件上传
   * 客户循环依次上传
   */
  uploadMulti(
    files: File[],
    next?: (loader: number, size: number) => void
  ): Promise<UploadProgress[]> {
    let Mutiloaded: number, Mutisize: number
    function fileNext(res: UploadProgress) {
      const { loaded, size } = res.total
      Mutiloaded += loaded
      Mutisize += size
      if (isFunction(next)) {
        next(Mutiloaded, Mutisize)
      }
    }
    return Promise.all(files.map(file => this.upload(file, fileNext)))
  }
}

export default QiNiuUpload
