import {Component, OnInit} from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {DatePipe} from "@angular/common";
import {environment} from "@env/environment";


const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styles: []
})
export class SalaryComponent implements OnInit {

  salaryData = [];
  // 总页数
  _total = 0;
  // 当前页数
  _current = 1;
  // 一页中包含的数据量
  _pageSize = 10;
  // 搜索栏内容
  searchStr = '';
  // 日期搜索栏
  monthSelect;
  // 添加薪资对话框
  form: FormGroup;
  // 表格加载
  loading = false;
  // 对话框显示
  isVisible = false;
  // 对话框标题
  formTitle: string;
  // 添加or编辑薪资
  isAdd = true;
  // 全体人员信息
  peopleInfo = [];
  // 总工资
  totalWage = 0;
  // 表单加载
  boxLoading = false;

  constructor(
    private http: _HttpClient,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private msg: NzMessageService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    // 初始化表单
    this.formInit();
    // 初始化人员列表
    this.peopleInit();
    // 表格数据初始化
    this.getSalary();
    const data = [];
  }

  formInit() {
    this.form = this.fb.group({
      id: [null],
      // name: [null, [Validators.required]],
      jobCode: [null, [Validators.required]],
      yearMonth: [null, [Validators.required]],
      basicSalary: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator]],
      subsidy: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],
      socialInsurance: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],
      accumulationFund: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],
      otherAdd: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],
      otherMinus: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],
      totalWage: [0, [Validators.required, Validators.maxLength(999999), this.emptyValidator, this.decimalValidator]],

      // isFile: [null, [this.emptyValidator, Validators.required]],
    });
  }

// 输入栏搜索
  inputSearch() {
    console.log("姓名/工号搜索");
    console.log(this.searchStr);
    this.simpleSearch();
  }

  // 时间搜索
  timeChange(result: Date): void {
    console.log('时间搜索:');
    this.monthSelect = this.datePipe.transform(result, 'yyyy-MM');
    console.log(this.monthSelect);
    this.simpleSearch();
  }

  // 表格快速到达/表格一页容量变化
  pageChange(reset = false) {
    if(reset) {
      this._current = 1;
    }
    this.simpleSearch();
  }

  simpleSearch(){
    let params = {
      searchStr: this.searchStr,
      yearMonth: this.monthSelect,
      current: this._current,
      pageSize: this._pageSize
    };
    console.log(params);
    // 后台查询
    //返回的结果显示放在salaryData里

    this.http.post(apiUrl + '/salary/get-salary-by-nameOrJobCode', params).subscribe(
      (result) => {
        console.log(result);
      if (result['meta']['success']){
        if (result['data']){
          this.salaryData = result['data']['records'];
          this._total = this.salaryData.length;
          this._current = result['data'].current;
        }
      }
    });
  }

  peopleInit() {
    this.loading = true;
    // 去数据库获取所有人员信息（包括人员id，name，jobCode，部门，岗位）
    this.http.get(apiUrl + '/user/get-user-name-jobCode').subscribe(
      (result) => {
        if (result['meta']['success']) {
          if (result['data']) {
            this.peopleInfo = result['data'];
          }
          this.loading = false;
        }
      });
    }

    /* // 模拟数据
    this.peopleInfo = [
      {name: 'qwe', jobCode: '126784', id: '1', department: '体育部', departmentId: '1', post: '部长', postId: '1'},
      {name: 'asd', jobCode: '12386324', id: '2', department: '宣传部', departmentId: '2', post: '部长', postId: '2'},
      {name: 'qcxzwe', jobCode: '123324', id: '3', department: '新闻部', departmentId: '3', post: '部长', postId: '3'},
      {name: 'af', jobCode: '1234524', id: '4', department: '办公司', departmentId: '4', post: '部长', postId: '4'},
      {name: 'er', jobCode: '123224', id: '5', department: '公关部', departmentId: '5', post: '部长', postId: '5'},
      {name: 'wef', jobCode: '1235524', id: '6', department: '人事部', departmentId: '6', post: '部长', postId: '6'},
      {name: 'sfs', jobCode: '1352324', id: '7', department: '纪检部', departmentId: '7', post: '部长', postId: '7'},
      {name: 'afs', jobCode: '35212324', id: '8', department: '部门1', departmentId: '8', post: '部长', postId: '8'},
      {name: 'afwer', jobCode: '12712324', id: '9', department: '部门2', departmentId: '80', post: '部长', postId: '9'},
      {name: 'gere', jobCode: '86812324', id: '10', department: '部门2', departmentId: '80', post: '副部长', postId: '10'},
      {name: 'iuy', jobCode: '4212324', id: '11', department: '部门2', departmentId: '80', post: '操作工', postId: '11'},
      {name: 'hcv', jobCode: '2112324', id: '12', department: '部门2', departmentId: '80', post: '秘书', postId: '12'},
      {name: 'rtyj', jobCode: '0012324', id: '13', department: '部门2', departmentId: '80', post: '秘书2', postId: '13'},
    ];
    */

  // 表格初始化
  getSalary() {
    let params = {
      current: this._current,
      pageSize: this._pageSize,
    };

    this.loading = true;
    this.http.post(apiUrl + '/salary/get-salary-all', params).subscribe(
      (result) => {
        console.log(result);
        if (result['meta']['success']) {
          this.salaryData = result['data']['records'];
          this._total = this.salaryData.length;
          this._current = result['data'].current;
        }
        this.loading = false;
      }
    );
  }

  showSalaryModal(data){
    this.isVisible = true;
    if(data){
      this.isAdd = false;
      console.log("编辑薪资");
      console.log(data);
      console.log(data.totalWage);
      this.formTitle = "编辑薪资对话框";
      this.form.controls['id'].setValue(data.id);
      this.form.controls['jobCode'].setValue(data.jobCode);
      this.form.controls['yearMonth'].setValue(data.yearMonth);
      this.form.controls['basicSalary'].setValue(data.basicSalary);
      this.form.controls['subsidy'].setValue(data.subsidy);
      this.form.controls['socialInsurance'].setValue(data.socialInsurance);
      this.form.controls['accumulationFund'].setValue(data.accumulationFund);
      this.form.controls['otherAdd'].setValue(data.otherAdd);
      this.form.controls['otherMinus'].setValue(data.otherMinus);
      this.form.controls['totalWage'].setValue(data.totalWage);
      if(data.remark){
        this.form.controls['remark'].setValue(data.remark);
      }
    }
    else {
      this.isAdd = true;
      console.log("添加薪资");
      this.formTitle = "添加薪资对话框";
    }
  }

  //删除一行数据
  // 传入：data.id（薪资信息的id号），返回void
  delete(data) {
    console.log("删除");
    console.log(data);
    this.http.post(apiUrl + '/salary/delete-salary', data.id).subscribe(
      (json) => {
        if (json['meta']['success']) {
          this.msg.create('success', "删除成功");
        } else {
          this.msg.error(json['meta']['message']);
        }
        if (this._total % this._pageSize === 1 && this._current * this._pageSize > this._total) {
          this._current = this._current - 1;
        }
        this.simpleSearch();
      }
    )
  }

  handleOk() {
    console.log("更新");
    console.log(this.form);

    for(const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity({onlySelf: true});
    }
    console.log(this.form.valid);
    if (this.form.valid === true) {
      this.boxLoading = true;
      let url;
      if(this.isAdd){
        url = '/salary/add-salary';
      }
      else{
        url = '/salary/update-salary';
      }
      let uid = -1;
      for(let i = 0; i < this.peopleInfo.length; i++) {
        if(this.peopleInfo[i].jobCode === this.form.controls['jobCode'].value){
          uid = this.peopleInfo[i].id;
        }
      }
      let yearMonth = this.datePipe.transform(this.form.controls['yearMonth'].value, 'yyyy-MM');
      let params = {
        id: this.form.controls['id'].value,
        jobCode: this.form.controls['jobCode'].value,
        uid: uid,
        yearMonth: yearMonth,
        basicSalary: this.form.controls['basicSalary'].value,
        subsidy: this.form.controls['subsidy'].value,
        socialInsurance: this.form.controls['socialInsurance'].value,
        accumulationFund: this.form.controls['accumulationFund'].value,
        otherAdd: this.form.controls['otherAdd'].value,
        otherMinus: this.form.controls['otherMinus'].value,
        totalWage: this.form.controls['totalWage'].value,
        // remark: this.form.controls['remark'].value,
      };
      console.log(params);
      console.log(apiUrl + url);
      this.http.post(apiUrl + url, params).subscribe(
        (result) => {
          console.log(result);

          if (result['meta']['success']) {
            if(!this.isAdd){
              this.msg.create('success', "操作成功");
              this.handleCancel();
              this.simpleSearch();
            } else {
              if(result['data']){
                this.msg.create('success', "操作成功");

                this.handleCancel();
                this.simpleSearch();
              }
              else{
                this.msg.error("该员工已存在相同时间薪资单！");
                this.handleCancel();
              }
            }


          }
          this.boxLoading = false;
        }
      );
    }
  }

  // 模态框关闭
  handleCancel() {
    this.boxLoading = false;
    this.isVisible = false;
    this.formInit();
  }

  valueChange(event) {
    console.log(event);
    let temp = 0;
    console.log(this.form.get('basicSalary').valid);
    console.log(this.form.get('subsidy').valid);
    console.log(this.form.get('socialInsurance').valid);
    console.log(this.form.get('accumulationFund').valid);
    console.log(this.form.get('otherAdd').valid);
    console.log(this.form.get('otherMinus').valid);
    if((this.form.get('basicSalary').valid && this.form.get('subsidy').valid && this.form.get('socialInsurance').valid && this.form.get('accumulationFund').valid && this.form.get('otherAdd').valid && this.form.get('otherMinus').valid)){
      console.log("in");
      temp = Number(this.form.get('basicSalary').value) + Number(this.form.get('subsidy').value) - Number(this.form.get('socialInsurance').value) - Number(this.form.get('accumulationFund').value) + Number(this.form.get('otherAdd').value) - Number(this.form.get('otherMinus').value);
    }
    this.form.controls['totalWage'].setValue(temp);
  }

  emptyValidator(c: AbstractControl): {[key: string]: any} | null {
    const v = c.value;
    if (v && v != null && typeof v === 'string' && v.trim() === '') {
      return {
        validateNull: true
      };
    }
    return null;
  }

  decimalValidator(c: FormControl): {[key: string]: boolean} {
    const DECIMAL_REGEXP = /^[0-9]+\.?[0-9]{0,2}$/;
    if (c.value === 0){
      return null;
    }
    if (!c.value) {
      return {required: true};
    }
    else{
      if(!DECIMAL_REGEXP.test(c.value)) {
        return {decimalError: true};
      }
    }
  }
}
