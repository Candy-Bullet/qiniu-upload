export interface UploadConfig {
  /** 为七牛空间（bucket)对应的域名，选择某个空间后，可通过"空间设置->基本设置->域名设置"查看获取，前端可以通过接口请求后端得到 */
  domain: string
  /** 选择上传域名区域；当为 null 或 undefined 时，自动分析上传域名区域 */
  region: 'z0' | 'z1' | 'z2' | 'na0' | 'as0'
  /** 后端返回的上传验证信息 */
  token: string
  mimeType?: any
  /** 表示是否使用 cdn 加速域名，为布尔值，true 表示使用，默认为 false */
  useCdnDomain?: boolean
  /** 是否禁用日志报告，为布尔值，默认为 false */
  disableStatisticsReport?: boolean
  /** 上传 host，类型为 string， 如果设定该参数则优先使用该参数作为上传地址，默认为 null */
  uphost?: string
  /** 上传自动重试次数（整体重试次数，而不是某个分片的重试次数）；默认 3 次（即上传失败后最多重试两次） */
  retryCount?: number
  /** 分片上传的并发请求量，number，默认为3；因为浏览器本身也会限制最大并发量，所以最大并发量与浏览器有关 */
  concurrentRequestLimit?: number
  /** 是否开启 MD5 校验，为布尔值；在断点续传时，开启 MD5 校验会将已上传的分片与当前分片进行 MD5 值比对，
   * 若不一致，则重传该分片，避免使用错误的分片。读取分片内容并计算 MD5 需要花费一定的时间，因此会稍微增加断点续传时的耗时
   * 默认为 false，不开启
   */
  checkByMD5?: boolean
  /** 是否上传全部采用直传方式，为布尔值；为 true 时则上传方式全部为直传 form 方式，禁用断点续传，默认 false */
  forceDirect?: boolean
  /**
   * 分片上传时每片的大小，必须为正整数，单位为 MB，且最大不能超过 1024，默认值 4。因为 chunk 数最大 10000，
   * 所以如果文件以你所设的 chunkSize 进行分片并且 chunk 数超过 10000，我们会把你所设的 chunkSize 扩大二倍，
   * 如果仍不符合则继续扩大，直到符合条件
   */
  chunkSize?: number
}

/**
 * 如果是需要扩展原有模块的话，需要在类型声明文件中先引用原有模块，再使用 declare module
 */
declare module Promise {
  export function abort(): void
}
