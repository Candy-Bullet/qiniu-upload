# 基于 qiniu SDK 封装文件上传

## Feature

- 支持单文件上传
- 支持多文件上传
- 支持取消文件上传

## example

```ts
import QiNiuUpload from 'QiNiuUpload'

const config = {
  useCdnDomain: true,
  region: qiniu.region.z2,
  domain: 'www.baidu.com',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
}
const qiniuUpload = new QiNiuUpload(config)
const resultPromise = qiniuUpload.upload(file, function(progress) {
  /**
   * 获取上传进度
   */
  console.log(progress)
})
/**
 * 终止文件上传
 */
resultPromise.abort()

/**
 * 多文件上传
 */
qiniuUpload.uploadMulti(files, function(progress) {
  /**
   * 获取上传进度
   */
  console.log(progress)
})
```

### 大文件传输

> qiniu SDK 支持大文件传输

上传
大于 4M 时可分块上传，小于 4M 时直传
分块上传时，支持断点续传

```ts
const config = {
  // config.chunkSize: number，分片上传时每片的大小，必须为正整数，单位为 MB，且最大不能超过 1024，默认值 4。
  // 因为 chunk 数最大 10000，所以如果文件以你所设的 chunkSize 进行分片并且 chunk 数超过 10000，
  // 我们会把你所设的 chunkSize 扩大二倍，如果仍不符合则继续扩大，直到符合条件。
  chunkSize: 4 * 1024 * 1024
}
```

### 断点续传

> 当我们需要做文件的断点上传时，可以调用 abort 方法，继续传送文件时候再次调取 upload 方法即可
