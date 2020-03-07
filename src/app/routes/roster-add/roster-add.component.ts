import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {ActivatedRoute, Router} from "@angular/router";
import {_HttpClient} from "@delon/theme";
import {environment} from "@env/environment";
import {DatePipe} from "@angular/common";

const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'app-roster-add',
  templateUrl: './roster-add.component.html',
  styleUrls:  ['./roster-add.component.less']
})
export class RosterAddComponent implements OnInit {
  // 表单信息
  validateForm: FormGroup;
  birthday = '';
  age;
  // 判断：添加员工/编辑员工
  isAdd = true;

  // 由“编辑人员”传进来的id号
  jobCode: any;

  // 部门树结构信息
  nodes = [];
// 岗位信息
  postList = [];

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
    this.formInit();
    this.nodesInit();
    this.postInit();
    console.log("获得初始数据");
    console.log(this.routerinfo.snapshot.queryParams["jobCode"]);
    this.jobCode = this.routerinfo.snapshot.queryParams["jobCode"];
    if (this.jobCode !== undefined){
      this.isAdd = false;
      console.log("通过验证");
      // 去后台找这个人的数据
      // 填入表单中
      this.http.post('http://localhost:9090/user/get-user-by-jobCode', this.jobCode).subscribe((res: any) => {
        if (res['meta']['success'] && res['data'] !== null) {
          console.log("get");
          let data = res['data'];
          console.log(data);

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
          if(data.isAdmin != null){
            this.validateForm.controls['isAdmin'].setValue((data.isAdmin).toString());
          }
          this.validateForm.controls['phone'].setValue(data.phone);
          this.validateForm.controls['jobCode'].setValue(data.jobCode);
          this.validateForm.controls['political'].setValue(data.political);
          this.validateForm.controls['marriageStatus'].setValue(data.marriageStatus);
          this.validateForm.controls['address'].setValue(data.address);
          this.validateForm.controls['IDnumber'].setValue(data.IDnumber);
          this.validateForm.controls['birthday'].setValue(data.birthday);
          this.validateForm.controls['age'].setValue(data.age);
          this.validateForm.controls['basicWage'].setValue(data.basicWage);
          this.validateForm.controls['subsidy'].setValue(data.subsidy);
          this.validateForm.controls['socialInsurance'].setValue(data.socialInsurance);
          this.validateForm.controls['accumulationFund'].setValue(data.accumulationFund);
          this.validateForm.controls['totalWage'].setValue(data.totalWage);
          this.validateForm.controls['nation'].setValue(data.nation);
          console.log("表单初始化赋值");
          console.log(this.validateForm);
        }
      });
    }
  }

  // 初始化nodes结构
  nodesInit() {
    this.http.get(apiUrl + '/department/dept-tree').subscribe(
      result => {
        console.log(result);
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
    console.log(value);
    // 根据部门Id搜索岗位
    if (value){
      console.log("存在value值");
      this.http.post(apiUrl + '/post/get-post-by-parent', value).subscribe((result: any) => {
        console.log(result);
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

  submitForm(): void {
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
      if(this.isAdd){
        this.http.post('http://localhost:9090/user/add-user', params).subscribe((res: any) => {
          console.log(res);
          if (!res.meta.success || res.data === null) {
            this.msg.success("添加成功！");
            this.router.navigate(['roster']);
          }
        });
      }
      else{
        this.http.post('http://localhost:9090/user/update-userInfo', params).subscribe((res: any) => {
          console.log(res);
          if (!res.meta.success || res.data === null) {
            this.msg.success("更新成功！");
            this.router.navigate(['roster']);
          }
        });
      }
    }else{
      this.msg.error("请完善表单信息！");
    }
  }

  wageChange(event) {
    console.log("wage变更");
    console.log(event);
    let temp = 0;
    console.log(this.validateForm.controls['basicWage']);
    if(this.validateForm.controls['basicWage'].valid && this.validateForm.controls['subsidy'].valid && this.validateForm.controls['socialInsurance'].valid && this.validateForm.controls['accumulationFund'].valid){
      console.log("in");
      temp = Number(this.validateForm.get('basicWage').value) + Number(this.validateForm.get('subsidy').value) - Number(this.validateForm.get('socialInsurance').value) - Number(this.validateForm.get('accumulationFund').value);
    }
    this.validateForm.controls['totalWage'].setValue(temp);
  }

  resetForm(e: MouseEvent): void {
    console.log("重置");
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
      this.validateForm.controls[key].updateValueAndValidity();
    }
  }

  returnButton(e: MouseEvent): void {
    console.log("返回按钮");
    e.preventDefault();
    this.validateForm.reset();
    this.router.navigate(['roster']);
  }

  private validatePhone(c: FormControl) {
    let params = {
      id: this.validateForm.controls['id'].value,
      phone: c.value,
    };
    let MOBILE_REGEXP = /^1[0-9]{10}$/;
    if (c.value !== '' && c.value !== null && c.value !== '') {
      let judge = MOBILE_REGEXP.test(c.value);
      if (judge){
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
      }/*
      else {
        return new Promise(resolve => {
          resolve({pattern: true});
        });
      }*/
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
    let params = {
      id: this.validateForm.controls['id'].value,
      IDnumber: c.value,
    };
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
    console.log("開始验证");
    if (c.value !== '' && c.value !== null && c.value !== '') {
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
