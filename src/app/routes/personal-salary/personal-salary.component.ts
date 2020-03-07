import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {DatePipe} from "@angular/common";
import {environment} from "@env/environment";
import {_HttpClient} from "@delon/theme";

const apiUrl = environment.SERVER_URL;
@Component({
  selector: 'app-personal-salary',
  templateUrl: './personal-salary.component.html',
  styles: []
})
export class PersonalSalaryComponent implements OnInit {
  // 表格加载
  tableLoading = false;

  // 工号
  jobCode;

// 选择的薪资时间
  yearMonth;

  salaryData = [];

  isEmpty = false;
  constructor(
    private datePipe: DatePipe,
    public http: _HttpClient,
    private msg: NzMessageService
  ) {
  }

  ngOnInit() {

    // 初始化年月检索条件
    this.yearMonth = this.datePipe.transform(new Date(), 'yyyy-MM');

    /**用session存储*/
    const userInfo = JSON.parse(sessionStorage.getItem(environment.SESSIONNAME));
    console.log("获取到的userInfo");
    console.log(userInfo);
    this.jobCode = userInfo['jobCode'];
    console.log("获取到的jobCode"+this.jobCode);
    // this.jobCode=2019001;
    this.getSalary();

  }

  getSalary() {
    this.tableLoading = true;
    let params = {
      jobCode: this.jobCode,
      yearMonth: this.yearMonth,
      current: 1,
      pageSize: 10
    };
    this.http.post(apiUrl + '/salary/get-salary-by-time', params).subscribe(
      (result) => {
        console.log(result);
        if (result['meta']['success']){
          if (result['data']['records'].length != 0){
            this.salaryData = result['data']['records'][0];
            this.isEmpty = false;
            console.log(this.isEmpty);
          }
          else{
            this.salaryData=[];
            this.msg.warning("当前月份无工资详情！");
            this.isEmpty = true;
            console.log(this.isEmpty);
          }
          console.log(this.salaryData.length);
        }
        this.tableLoading = false;
      }
    );
  }

  onChange(event) {
    this.yearMonth = this.datePipe.transform(event, 'yyyy-MM');
    console.log(this.yearMonth);
    this.getSalary();
  }
}
