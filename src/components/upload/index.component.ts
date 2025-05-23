// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See http://www.ordosai.com

import { Component, EventEmitter, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { $t } from 'src/locale'
import { NzMessageService } from 'ng-zorro-antd/message'
import { createFile, getCDN, getImageRepo } from 'src/api'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { isSelfDevelop } from 'src/utils/utils'

@Component({
  standalone: true,
  imports: [CommonModule, NzIconModule],
  selector: 'app-upload',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class UploadComponent {
  @Output() onChange = new EventEmitter()

  readonly $t = $t
  uploading: boolean = false
  // @ts-ignore
  id = `f${Date.now()}${parseInt(Math.random() * 1000000)}`

  constructor(private message: NzMessageService) {}

  onChangeFile(e: any): any {
    if (this.uploading) {
      return
    }

    const { files } = e.target
    if (files.length <= 0) return
    const file = files[0]

    if (!file.type.startsWith('image')) {
      return this.message.error($t('_notUpload'))
    }
    this.onUpload(file).finally(() => {
      e.target.value = ''
    })
  }

  onUpload(file: File) {
    const that = this
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onerror = reject
      fileReader.onload = function () {
        that.uploading = true
        const iconUrl = this.result as string
        const url = iconUrl.split(',')[1]
        const mime = `.${file.name.split('.').at(-1) || 'png'}`
        const path = `${Date.now()}${mime}`

        createFile({
          branch: getImageRepo().branch,
          message: 'create image',
          content: url,
          isEncode: false,
          path,
        })
          .then((res) => {
            const params = {
              cdn: isSelfDevelop ? res?.data?.fullImagePath : getCDN(path),
            }
            that.onChange.emit(params)
            that.message.success($t('_uploadSuccess'))
            resolve(params)
          })
          .catch(reject)
          .finally(() => {
            that.uploading = false
          })
      }
    })
  }
}
