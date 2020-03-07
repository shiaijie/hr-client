import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {Router} from "@angular/router";
import {_HttpClient} from "@delon/theme";
import {environment} from "@env/environment";

const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'app-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.less']
})
export class RosterComponent implements OnInit {

  constructor(
    private router: Router,
    public http: _HttpClient,
    public msg: NzMessageService
  ) {}

  pageIndex = 1;
  pageSize = 10;
  total = 1;

  loading = false;
  sortValue: string | null = null;
  sortKey: string | null = null;

  //简单搜索输入框
  simpleSearchStr = "";

  // 用户信息表
  userList = [];

  //简单搜索
  simpleSearch() {
    console.log(this.simpleSearchStr);
    let param = {
      searchStr: this.simpleSearchStr
    };
    this.http.post(apiUrl + '/user/search-user-by-jobCodeOrName', param).subscribe(
      (result) => {
        if (result['meta']['success']) {
          if (result['data']) {
            this.userList = result['data'];
          }
          this.loading = false;
        }
      });
  }

  searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1;
    }
  }

  ngOnInit(): void {
    console.log("初始化");
    this.getUser();
  }

  addPerson() {
    this.router.navigate(['roster-add'],{ queryParams: { jobCode: null } });
  }


  getUser(){
    this.loading = true;
    console.log("花名册");
    let param = {
      current: 1,
      pageSize: this.pageSize,
    };
    this.loading = false;
    this.http.post("http://localhost:9090/user/get-all-userInfo-page", param).subscribe(
      (result) => {
        console.log(result);
        console.log("交互");
        if (result['meta']['success']) {
          this.userList = result['data']['records'];
          this.pageIndex = 1;
          this.total = result['data']['total'];
        }
        this.loading = false;
      }
    );
  }

  // 编辑员工信息
  editInfo(data) {
    console.log(data);
    // 跳转页面
    this.router.navigate(['roster-add'],{ queryParams: { jobCode: data.jobCode } });
  }

  // 删除用户
  deleteUser(data) {
    this.http.post(apiUrl + "/user/delete-user", data.id).subscribe(
      (result) => {
        if (result['meta']['success']) {
          this.msg.create('success', "修改成功！");
          this.getUser();
        }
        this.loading = false;
      }
    );
  }

  departmentManage(){
    this.router.navigate(['department-post-manage']);
  }

  salaryManage() {
    this.router.navigate(['salary']);
  }

  personalInfoManage() {
    this.router.navigate(['personal-info']);
  }

  personalSalary(){
    this.router.navigate(['personal-salary']);
  }
}
