import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {_HttpClient, SettingsService} from '@delon/theme';
import {DA_SERVICE_TOKEN, ITokenService} from '@delon/auth';
import {environment} from "@env/environment";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";

// @ts-ignore
@Component({
  selector: 'header-user',
  template: `
      <div
              class="alain-default__nav-item d-flex align-items-center px-sm"
              nz-dropdown
              nzPlacement="bottomRight"
              [nzDropdownMenu]="userMenu"
      >
          <nz-avatar [nzSrc]="settings.user.avatar" nzSize="small" class="mr-sm"></nz-avatar>
          {{ userInfo?.name }}
      </div>
      <nz-dropdown-menu #userMenu="nzDropdownMenu">
          <div nz-menu class="width-sm">
              <div nz-menu-item routerLink="/personal-info">
                  <i nz-icon nzType="user" class="mr-sm"></i>
                  个人中心
              </div>
              <div nz-menu-item (click)="password()">
                  <i nz-icon nzType="user" class="mr-sm"></i>
                  修改密码
              </div>
              <!--<div nz-menu-item routerLink="/exception/trigger">
                <i nz-icon nzType="close-circle" class="mr-sm"></i>
                触发错误
              </div>-->
              <li nz-menu-divider></li>
              <div nz-menu-item (click)="logout()">
                  <i nz-icon nzType="logout" class="mr-sm"></i>
                  退出登录
              </div>
          </div>
      </nz-dropdown-menu>

      <!--修改密码对话框-->
      <nz-modal
              [(nzVisible)]="isVisible"
              [nzMaskClosable]="false"
              [nzTitle]="'修改密码'"
              [nzContent]="modalContent"
              [nzFooter]="modalFooter"
              (nzOnCancel)="handleCancel()">
          <ng-template #modalContent>
              <form nz-form [formGroup]="form">
                  <!--旧密码-->
                  <nz-form-item>
                      <nz-form-label [nzSpan]="3" nzRequired>旧密码</nz-form-label>
                      <nz-form-control [nzErrorTip]="oldPasswordErrorTip">
                          <nz-input-group nzSize="large">
                              <input nz-input type="password" formControlName="oldPassword" placeholder="旧密码" />
                          </nz-input-group>
                          <ng-template #oldPasswordErrorTip let-i>
                              <ng-container *ngIf="i.errors?.required">请输入旧密码！</ng-container>
                              <ng-container *ngIf="i.errors?.equar">旧密码不正确!</ng-container>
                          </ng-template>
                      </nz-form-control>
                  </nz-form-item>
                  <!--密码-->
                  <nz-form-item>
                      <nz-form-label [nzSpan]="3" nzRequired>密码</nz-form-label>
                      <nz-form-control [nzErrorTip]="'请输入密码！'">
                          <nz-input-group
                                  nzSize="large"
                                  nz-popover
                                  nzPopoverPlacement="right"
                                  nzPopoverTrigger="focus"
                                  [(nzVisible)]="visible"
                                  nzOverlayClassName="register-password-cdk"
                                  [nzOverlayStyle]="{ 'width.px': 240 }"
                                  [nzPopoverContent]="pwdCdkTpl"
                          >
                              <input nz-input type="password" formControlName="password" placeholder="密码" />
                          </nz-input-group>
                          <ng-template #pwdCdkTpl>
                              <div style="padding: 4px 0;">
                                  <ng-container [ngSwitch]="status">
                                      <div *ngSwitchCase="'ok'" class="success">强度：强</div>
                                      <div *ngSwitchCase="'pass'" class="warning">强度：中</div>
                                      <div *ngSwitchDefault class="error">强度：太短</div>
                                  </ng-container>
                                  <div class="progress-{{ status }}">
                                      <nz-progress
                                              [nzPercent]="progress"
                                              [nzStatus]="passwordProgressMap[status]"
                                              [nzStrokeWidth]="6"
                                              [nzShowInfo]="false"
                                      ></nz-progress>
                                  </div>
                                  <p class="mt-sm">请至少输入 6 个字符。请不要使用容易被猜到的密码。</p>
                              </div>
                          </ng-template>
                      </nz-form-control>
                  </nz-form-item>
                  <!--确认密码-->
                  <nz-form-item>
                      <nz-form-label [nzSpan]="3" nzRequired>确认密码</nz-form-label>
                      <nz-form-control [nzErrorTip]="confirmErrorTip">
                          <nz-input-group nzSize="large">
                              <input nz-input type="password" formControlName="confirm" placeholder="确认密码" />
                          </nz-input-group>
                          <ng-template #confirmErrorTip let-i>
                              <ng-container *ngIf="i.errors?.required">请确认密码！</ng-container>
                              <ng-container *ngIf="i.errors?.equar">两次输入的密码不匹配!</ng-container>
                          </ng-template>
                      </nz-form-control>
                  </nz-form-item>
              </form>
          </ng-template>
          <ng-template #modalFooter>
              <button nz-button nzType="default" (click)="handleCancel()">取消</button>
              <button nz-button nzType="primary" (click)="handleOk()" [nzLoading]="boxLoading">确定</button>
          </ng-template>
      </nz-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class HeaderUserComponent {
  constructor(
    public settings: SettingsService,
    private fb: FormBuilder,
    private router: Router,
    public http: _HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private msg: NzMessageService
  ) {}

  userInfo = JSON.parse(sessionStorage.getItem(environment.SESSIONNAME));

  // 修改密码对话框是否显示
  isVisible = false;

  // 修改密码表单
  // form: FormGroup;
  form = this.fb.group({
    oldPassword: [null, [Validators.required, Validators.minLength(6), this.checkOldPassword.bind(this)]],
    password: [null, [Validators.required, Validators.minLength(6), this.checkPassword.bind(this)]],
    confirm: [null, [Validators.required, Validators.minLength(6), this.passwordEquar]]
  });
  // 表单加载
  boxLoading = false;

  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception',
  };
  // 退出登录
  logout() {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
    sessionStorage.removeItem(environment.SESSIONNAME);
  }

  // 修改密码
  password(){
    console.log(this.userInfo);
    this.isVisible = true;

  }

  // 取消修改
  handleCancel(){
    this.isVisible = false;
    this.form.reset();
  }

  // 确认修改
  handleOk(){
    Object.keys(this.form.controls).forEach(key => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }
    const data = {
      jobCode: this.userInfo['jobCode'],
      password: this.form.controls['password'].value
    };
    this.http.post('http://localhost:9090/user/update-password', data).subscribe(
      (json) => {
        if (json['meta']['success']) {
          this.msg.create('success', "修改成功！");
          this.isVisible = false;
          this.form.reset();
        } else {
          this.msg.error(json['meta']['message']);
        }

      }
    )
  }

  checkOldPassword(control: FormControl) {
    // 确认旧密码
    if (!control) {
      return null;
    }
    if (control.value !== this.userInfo['password']) {
      return { equar: true };
    }
    return null;
  }

  private checkPassword(control: FormControl) {
    if (!control) {
      return null;
    }
    const self: any = this;
    self.visible = !!control.value;
    if (control.value && control.value.length > 9) {
      self.status = 'ok';
    } else if (control.value && control.value.length > 5) {
      self.status = 'pass';
    } else {
      self.status = 'pool';
    }

    if (self.visible) {
      self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10;
    }
  }

  private passwordEquar(control: FormControl) {
    if (!control || !control.parent) {
      return null;
    }
    if (control.value !== control.parent.get('password')!.value) {
      return { equar: true };
    }
    return null;
  }
}
