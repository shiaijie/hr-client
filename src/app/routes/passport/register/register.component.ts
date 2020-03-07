import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd';
import {_HttpClient} from '@delon/theme';
import {environment} from "@env/environment";

const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
})
export class UserRegisterComponent implements OnDestroy {


  constructor(private fb: FormBuilder,
              private router: Router,
              public http: _HttpClient,
              public msg: NzMessageService) { }

  // #region fields

  ngOnInit(){
    this.form = this.fb.group({
      name:['', [Validators.required, Validators.maxLength(10)]],
      jobCode: ['', {
        validators: [Validators.required, this.emptyValidator],
        asyncValidators: [this.jobCodeUniqueValidator.bind(this)], updateOn: 'blur'}],
      password: [null, [Validators.required, Validators.minLength(6), this.checkPassword.bind(this)]],
      confirm: [null, [Validators.required, Validators.minLength(6), this.passwordEquar]],
      phone: [null, {validators: [Validators.required],
        asyncValidators: [this.validatePhone.bind(this)], updateOn: 'blur'}],
    });//asyncValidators: [Validators.pattern(/^1\d{10}$/)], updateOn: 'blur'}],
  }

  get password() {
    return this.form.controls.password;
  }
  get confirm() {
    return this.form.controls.confirm;
  }
  get phone() {
    return this.form.controls.phone;
  }

  form: FormGroup;
  error = '';
  type = 0;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception',
  };

  // #endregion

  // #region get captcha

  count = 0;
  interval$: any;

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

  jobCodeUniqueValidator(control: FormControl) {
    return new Promise(
      resolve => {
        if (this.form.controls['jobCode'].value) {
          let params = {
            id: null,
            jobCode: control.value
          };
          this.http.post(apiUrl + '/user/check-jobCode', params).subscribe(
            result => {
              // 有重复的话返回false
              if (result['meta']['success'] === true) {
                if (!result['data']) {
                  resolve({exist: true});
                } else {
                  resolve(null);
                }
              }
            }
          );
        }
        else {
          resolve(null);
        }
      }
    );
  }

  private emptyValidator(control: AbstractControl): {[key: string]: any} | null {
    const v = control.value;
    // value not blank
    if (v && typeof v === 'string' && v.trim() === '') {
      return {
        validateNull: true
      };
    }
    return null;
  }

  private validatePhone(c: FormControl) {
    let MOBILE_REGEXP = /^1[0-9]{10}$/;
    if (c.value !== '' && c.value !== null && c.value !== '') {
      let judge = MOBILE_REGEXP.test(c.value);
      if (judge){
        let params = {
          id: null,
          phone: c.value
        };
        return new Promise(resolve => {
          // 后台异步验证手机号是否重复
          this.http.post(apiUrl + '/user/check-phone', params).subscribe(
            json => {
              if (json['meta']['success']) {
                // 有重复的话返回false
                if (!json['data']) {
                  resolve({exist: true});
                } else {
                  resolve(null);
                }
              }
            }
          );
        });
      }
      else {
        return new Promise(resolve => {
          resolve({pattern: true});
        });
      }
    }
    else {
      return new Promise(resolve => {
        resolve({required: true});
      });
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

  // #endregion

  submit() {
    this.error = '';
    Object.keys(this.form.controls).forEach(key => {
      this.form.controls[key].markAsDirty();
      this.form.controls[key].updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }

    const data = this.form.value;
    this.http.post('http://localhost:9090/user/register', data).subscribe(() => {
      sessionStorage.setItem(environment.SESSIONNAME, JSON.stringify(data));
      this.router.navigateByUrl('/passport/register-result', {
        queryParams: { jobCode: data.jobCode },
      });
    });
  }

  ngOnDestroy(): void {
    if (this.interval$) clearInterval(this.interval$);
  }
}
