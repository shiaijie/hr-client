import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {ActivatedRoute, Router} from "@angular/router";
import {_HttpClient} from "@delon/theme";
import {environment} from "@env/environment";
import {DatePipe} from "@angular/common";

const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.less']
})
export class PersonalInfoComponent implements OnInit {

// 显示保存按钮
  showSaveButton = false;

// 保存加载
  loading = false;

  personInfo = [];
  // 表单信息
  validateForm: FormGroup;
  birthday = '';
  age;

  jobCode;

  // 部门树结构信息
  nodes = [];

// 岗位信息
  postList = [];

  // 单选按钮是否可选
  isDisabled = true;

  // 民族选择框
  NATION_SELECT = ["汉族", "壮族", "满族", "回族", "苗族", "维吾尔族", "土家族", "彝族", "蒙古族", "藏族", "布依族", "侗族", "瑶族", "朝鲜族", "白族", "哈尼族",
    "哈萨克族", "黎族", "傣族", "畲族", "傈僳族", "仡佬族", "东乡族", "高山族", "拉祜族", "水族", "佤族", "纳西族", "羌族", "土族", "仫佬族", "锡伯族",
    "柯尔克孜族", "达斡尔族", "景颇族", "毛南族", "撒拉族", "布朗族", "塔吉克族", "阿昌族", "普米族", "鄂温克族", "怒族", "京族", "基诺族", "德昂族", "保安族",
    "俄罗斯族", "裕固族", "乌孜别克族", "门巴族", "鄂伦春族", "独龙族", "塔塔尔族", "赫哲族", "珞巴族"];

  constructor(private fb: FormBuilder,
              private datePipe: DatePipe,
              public http: _HttpClient,
              private routerinfo: ActivatedRoute,
              private router: Router,
              public msg: NzMessageService,) {}

  ngOnInit(): void {
    // 获取本人的工号
    const userInfo = JSON.parse(sessionStorage.getItem(environment.SESSIONNAME));
    this.jobCode = userInfo['jobCode'];

    this.formInit();
    this.nodesInit();
    this.postInit();
    console.log("获得初始数据");
    if (this.jobCode !== undefined){
      this.getPersonInfo();
    }
  }

  // 初始化nodes结构
  nodesInit() {
    console.log("初始化nodes结构");
    this.http.get(apiUrl + '/department/dept-tree').subscribe(
      result => {
        this.nodes = result['data'];
      }
    );
  }

  // 初始化post
  postInit() {
    this.http.get(apiUrl + '/post/get-all').subscribe(
      result => {
        console.log("初始化post");
        console.log(result);
        if (result['data'] !== null){
          this.postList = result['data'];
        }
      }
    );
  }

  onChangeDepart(value: string): void {
    // 当选择框中的部门改变时，岗位也要变
    this.validateForm.controls['postId'].setValue("");
    this.postList = [];
    console.log("部门变更");
    // 根据部门Id搜索岗位
    if (value){
      this.http.post(apiUrl + '/post/get-post-by-parent', value).subscribe((result: any) => {
        if (result['meta']['success'] && result['data'] !== null) {
          this.postList = result['data'];
        }
      });
    }
  }

  formInit(){
    this.validateForm = this.fb.group({
      id: [null],
      email: [null, {validators: [],
        asyncValidators: [this.validateEmail.bind(this)], updateOn: 'blur'}],
      name: [null, [Validators.required]],
      sex: [null, [Validators.required]],
      phone: [null, {validators: [Validators.required, Validators.minLength(11), Validators.maxLength(11)],
        asyncValidators: [this.validatePhone.bind(this)], updateOn: 'blur'}],
      jobCode: [null, {validators: [Validators.required],
        asyncValidators: [this.validateJobCode.bind(this)], updateOn: 'blur'}],
      political: [null, [Validators.required]],
      marriageStatus: [null, [Validators.required]],
      address: [null, [Validators.required]],
      IDnumber: [null, {validators: [Validators.required, Validators.minLength(18), Validators.maxLength(18)],
        asyncValidators: [this.validateID.bind(this)], updateOn: 'blur'}],
      birthday: [''],
      age: [''],
      isAdmin: ['0', [Validators.required]],
      basicWage: ['', [Validators.required]],
      subsidy: ['', [Validators.required]],
      socialInsurance: ['', [Validators.required]],
      accumulationFund: ['', [Validators.required]],
      totalWage: [''],
      nation:['', [Validators.required]],
      departId:['', [Validators.required]],
      postId:['', [Validators.required]]
    });
  }


  setDisableForm(obj: any) {
    this.showSaveButton = !obj;
    // 选择”取消“按钮
    if (obj) {
      // 重新加载页面数据；
      this.getPersonInfo();
    } else {
      // 选择”编辑“按钮，组建变成可编辑状态表
      this.isDisabled = false;
      this.validateForm.controls['name'].enable();
      this.validateForm.controls['jobCode'].enable();
      this.validateForm.controls['email'].enable();
      this.validateForm.controls['phone'].enable();
      this.validateForm.controls['postId'].enable();
      this.validateForm.controls['departId'].enable();
      this.validateForm.controls['political'].enable();
      this.validateForm.controls['marriageStatus'].enable();
      this.validateForm.controls['address'].enable();
      this.validateForm.controls['IDnumber'].enable();
      this.validateForm.controls['nation'].enable();
      this.validateForm.controls['basicWage'].enable();
      this.validateForm.controls['subsidy'].enable();
      this.validateForm.controls['socialInsurance'].enable();
      this.validateForm.controls['accumulationFund'].enable();
    }
  }

  getPersonInfo() {
    this.http.post('http://localhost:9090/user/get-user-by-jobCode', this.jobCode).subscribe((res: any) => {
      if (res['meta']['success'] && res['data'] !== null) {
        console.log("get");
        console.log(res);
        let data = res['data'];
        this.validateForm.controls['id'].setValue(data.id);
        this.validateForm.controls['name'].setValue(data.name);
        if (data.departId != null) {
          this.validateForm.controls['departId'].setValue((data.departId).toString());
          this.onChangeDepart(data.departId);
        }
        this.validateForm.controls['postId'].setValue(data.postId);
        this.validateForm.controls['email'].setValue(data.email);
        if(data.sex != null){
          this.validateForm.controls['sex'].setValue((data.sex).toString());
        }
        this.validateForm.controls['phone'].setValue(data.phone);
        this.validateForm.controls['jobCode'].setValue(data.jobCode);
        this.validateForm.controls['political'].setValue(data.political);
        this.validateForm.controls['marriageStatus'].setValue(data.marriageStatus);
        this.validateForm.controls['address'].setValue(data.address);
        this.validateForm.controls['IDnumber'].setValue(data.IDnumber);
        this.validateForm.controls['birthday'].setValue(data.birthday);
        this.validateForm.controls['age'].setValue(data.age);
        if(data.isAdmin != null){
          this.validateForm.controls['isAdmin'].setValue((data.isAdmin).toString());
        }
        this.validateForm.controls['basicWage'].setValue(data.basicWage);
        this.validateForm.controls['subsidy'].setValue(data.subsidy);
        this.validateForm.controls['socialInsurance'].setValue(data.socialInsurance);
        this.validateForm.controls['accumulationFund'].setValue(data.accumulationFund);
        this.validateForm.controls['totalWage'].setValue(data.totalWage);
        this.validateForm.controls['nation'].setValue(data.nation);
        console.log("表单初始化赋值");
        console.log(this.validateForm);
        this.formDisableInit();
      }
    });
  }

  formDisableInit(){
    this.validateForm.controls['id'].disable();
    this.validateForm.controls['name'].disable();
    this.validateForm.controls['departId'].disable();
    this.validateForm.controls['postId'].disable();
    this.validateForm.controls['email'].disable();
    this.isDisabled = true;
    this.validateForm.controls['phone'].disable();
    this.validateForm.controls['jobCode'].disable();
    this.validateForm.controls['political'].disable();
    this.validateForm.controls['marriageStatus'].disable();
    this.validateForm.controls['address'].disable();
    this.validateForm.controls['IDnumber'].disable();
    this.validateForm.controls['birthday'].disable();
    this.validateForm.controls['age'].disable();
    this.validateForm.controls['basicWage'].disable();
    this.validateForm.controls['subsidy'].disable();
    this.validateForm.controls['socialInsurance'].disable();
    this.validateForm.controls['accumulationFund'].disable();
    this.validateForm.controls['nation'].disable();
  }

  submitForm(): void {
    this.showSaveButton = false;
    console.log("提交表单");
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsDirty();
    //   this.validateForm.controls[i].updateValueAndValidity({onlySelf: true});
    // }
    console.log(this.validateForm);
    console.log(this.validateForm.valid);
    console.log(this.validateForm.invalid);
    if (this.validateForm.valid){
      let params = {
        id: this.validateForm.controls['id'].value,
        jobCode: this.validateForm.controls['jobCode'].value,
        name: this.validateForm.controls['name'].value,
        sex: this.validateForm.controls['sex'].value,
        nation: this.validateForm.controls['nation'].value,
        phone: this.validateForm.controls['phone'].value,
        IDnumber: this.validateForm.controls['IDnumber'].value,
        birthday: this.validateForm.controls['birthday'].value,
        age: this.validateForm.controls['age'].value,
        email: this.validateForm.controls['email'].value,
        political: this.validateForm.controls['political'].value,
        marriageStatus: this.validateForm.controls['marriageStatus'].value,
        address: this.validateForm.controls['address'].value,

        basicWage: this.validateForm.controls['basicWage'].value,
        subsidy: this.validateForm.controls['subsidy'].value,
        socialInsurance: this.validateForm.controls['socialInsurance'].value,
        accumulationFund: this.validateForm.controls['accumulationFund'].value,
        totalWage: this.validateForm.controls['totalWage'].value,
        departId: this.validateForm.controls['departId'].value,
        postId: this.validateForm.controls['postId'].value,
        isAdmin: this.validateForm.controls['isAdmin'].value
      };
      console.log(params);

        this.http.post('http://localhost:9090/user/update-userInfo', params).subscribe((res: any) => {
          console.log(res);
          if (!res.meta.success || res.data === null) {
            this.msg.success("更新成功！");
            this.formDisableInit();
          }
        });

    }
  }

  wageChange(event) {
    console.log("wage变更");
    let temp = 0;
    if(this.validateForm.controls['basicWage'].valid && this.validateForm.controls['subsidy'].valid && this.validateForm.controls['socialInsurance'].valid && this.validateForm.controls['accumulationFund'].valid){
      temp = Number(this.validateForm.get('basicWage').value) + Number(this.validateForm.get('subsidy').value) - Number(this.validateForm.get('socialInsurance').value) - Number(this.validateForm.get('accumulationFund').value);
    }
    this.validateForm.controls['totalWage'].setValue(temp);
  }

  private validatePhone(c: FormControl) {
    let MOBILE_REGEXP = /^1[0-9]{10}$/;
    if (c.value !== '' && c.value !== null && c.value !== '') {
      let judge = MOBILE_REGEXP.test(c.value);
      if (judge){
        let params = {
          id: this.validateForm.controls['id'].value,
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

  validateEmail(c: FormControl) {
    let REGEX_EMAIL = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if (c.value !== '' && c.value !== null && c.value !== '') {
      let judge = REGEX_EMAIL.test(c.value);
      if (judge){
        return new Promise(resolve => {
          resolve(null);
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
        // resolve({required: true});
        resolve(null);
      });
    }
  }

  validateJobCode(c: FormControl) {
    let params = {
      id: this.validateForm.controls['id'].value,
      jobCode: c.value,
    };
    return new Promise(
      resolve => {
        if (c.value) {
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

  validateID(c: FormControl) {
    console.log("验证身份证是否重复");
    const birthday = this.getBirthdayFromIdCard(c.value);
    this.showAgeByBirthday(birthday);
    const birthdayDate: Date = new Date(birthday);
    console.log(birthdayDate.toString());
    if (birthdayDate !== null && birthdayDate.toString() === 'Invalid Date') {
      // 非法日期
      return new Promise(resolve => {
        resolve({pattern: true});
      });
    }
    if (c.value !== '' && c.value !== null && c.value !== '') {
      let params = {
        id: this.validateForm.controls['id'].value,
        IDnumber: c.value
      };
      return new Promise(
        resolve => {
          // 后台异步验证身份证号是否重复
          this.http.post(apiUrl + '/user/check-IDnumber', params).subscribe(
            result => {
              // 有重复的话返回false
              console.log(result);
              if (result['meta']['success']) {
                if (!result['data']) {
                  resolve({exist: true});
                } else {
                  resolve(null);
                }
              }/* else {
                resolve({error: {msg: result['meta']['message']}});
              }*/
            }
          );
        },
      );
    }
    else {
      return new Promise(resolve => {
        resolve({required: true});
      });
    }
  }

  getBirthdayFromIdCard(idCard) {
    console.log("身份证转换为出生年月和年龄");
    let birthday = '';
    if (idCard != null && idCard !== '') {
      if (idCard.length === 15) {
        birthday = '19' + idCard.substr(6, 6);
      } else if (idCard.length === 18) {
        birthday = idCard.substr(6, 8);
      }
      birthday = birthday.replace(/(.{4})(.{2})/, '$1/$2/');
    }
    return birthday;
  }

  showAgeByBirthday(birthday) {
    console.log("根据出生年月显示年龄");
    const birthdayDate: Date = new Date(birthday);
    if (birthdayDate !== null && birthdayDate.toString() !== 'Invalid Date') {
      this.birthday = this.datePipe.transform(birthdayDate, 'yyyy/MM/dd');
      let nowYear = new Date().getFullYear();
      let pastYaer = this.birthday.substr(0, 4);
      this.age = nowYear - Number(pastYaer);
      this.validateForm.controls['birthday'].setValue(this.birthday);
      this.validateForm.controls['age'].setValue(this.age);
    } else {
      console.log("非法出生年月值！");
      this.validateForm.controls['birthday'].setValue(null);
      this.validateForm.controls['age'].setValue('');
      this.birthday = '';
      this.age = '';
    }
  }

}
