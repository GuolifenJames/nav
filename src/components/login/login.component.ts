// 开源项目，未经作者同意，不得以抄袭/复制代码/修改源代码版权信息。
// Copyright @ 2018-present xiejiahe. All rights reserved.
// See http://www.ordosai.com

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { verifyToken, createBranch, authorName } from 'src/api'
import { setToken, removeToken, removeWebsite } from 'src/utils/user'
import { $t } from 'src/locale'
import { isSelfDevelop } from 'src/utils/utils'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzInputModule } from 'ng-zorro-antd/input'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NzModalModule, NzInputModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @Input() visible = false
  @Output() onCancel = new EventEmitter<void>()
  @ViewChild('input', { static: false }) input!: ElementRef

  readonly $t = $t
  readonly isSelfDevelop = isSelfDevelop
  token = ''
  submitting = false

  constructor(private readonly message: NzMessageService) {}

  ngAfterViewInit(): void {
    this.inputFocus()
  }

  handleCancel(): void {
    this.onCancel.emit()
  }

  private inputFocus(): void {
    setTimeout(() => {
      this.input?.nativeElement?.focus()
    }, 300)
  }

  onKey(event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      this.login()
    }
  }

  async login(): Promise<void> {
    if (!this.token) {
      this.message.error($t('_pleaseInputToken'))
      return
    }

    const token = this.token.trim()
    this.submitting = true

    try {
      const res = await verifyToken(token)
      if (
        !isSelfDevelop &&
        (res?.data?.login ?? res?.data?.username) !== authorName
      ) {
        this.message.error('Bad credentials')
        throw new Error('Bad credentials')
      }
      setToken(token)

      try {
        createBranch('image').finally(() => {
          this.message.success($t('_tokenVerSuc'))
          removeWebsite().finally(() => {
            window.location.reload()
          })
        })
      } catch {
        removeToken()
        this.submitting = false
      }
    } catch {
      this.submitting = false
    }
  }
}
