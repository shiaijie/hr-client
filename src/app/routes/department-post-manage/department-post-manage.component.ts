import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {Observable, Observer} from "rxjs";
import {_HttpClient} from "@delon/theme";
import {environment} from "@env/environment";
import {NzMessageService} from "ng-zorro-antd";

const apiUrl = environment.SERVER_URL;

@Component({
  selector: 'app-department-post-manage',
  templateUrl: './department-post-manage.component.html',
  styleUrls: ['./department-post-manage.component.less']
})
export class DepartmentPostManageComponent implements OnInit {
  // 部门搜索栏
  searchValue = '';
  // 岗位列表头
  postListHead = '所有岗位列表';
  // 岗位查询输入
  postSearchStr = '';

  // 添加/编辑岗位对话框表单
  postForm: FormGroup;
  // 添加/编辑岗位对话框显示
  isVisiblePost = false;
  // 添加/编辑岗位对话框Loading
  isPostLoading = false;
  // 添加or编辑岗位
  addPostFlag = false;
  // 添加or编辑岗位对话框标题
  postFormTitle = '';

  // 添加/编辑部门对话框表单
  departForm: FormGroup;
  // 添加/编辑部门对话框显示
  isVisibleDepart = false;
  // 添加/编辑部门对话框Loading
  isDepartLoading = false;
  // 添加or编辑岗位
  addDepartFlag = false;
  // 添加or编辑岗位对话框标题
  departFormTitle = '';

  // 部门树结构信息
  nodes = [];

  // 岗位信息
  postList = [];

  //添加/编辑框中选中的部门名称
  departValue = '';

  //当前被选中的部门
  clikDepart = '';

  constructor(private fb: FormBuilder,
              public http: _HttpClient,
              public msg: NzMessageService,) {}

  ngOnInit(): void {
    this.postForm = this.fb.group({
      id: [null],
      postName: [null, [Validators.required]],// , [this.postNameValidator]
      parentDepart: [null, [Validators.required]],
      remark: [null]
    });

    this.departForm = this.fb.group({
      id: [null],
      departName: [null, [Validators.required]],
      parentDepart: [null, [Validators.required]],
      remark: [null]
    });
    this.nodesInit();
    this.postInit();
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

  showPost(node){
    console.log("查看部门详情");
    console.log(node);
    console.log(node.key);
    this.clikDepart = node.key;
    this.postListHead = node._title + '岗位列表';
    // 部门名称为node.key
    // 利用部门名称进行岗位查询
    // 在岗位表，根据departId进行查询
    // 返回的结果保存在this.postList里
    this.http.post(apiUrl + '/post/get-post-by-parent', node.key).subscribe(
      result => {
        console.log(result);
        this.postList = result['data'];
      }
    );
  }

  deletePost(item){
    console.log("删除岗位");
    console.log(item);
    this.http.post(apiUrl + '/post/delete-post', item.id).subscribe(
      result => {
        console.log(result);
        if (result['meta']['success']) {
          this.msg.success("删除成功！");
        }
        this.nodesInit();
        this.postInit();
      }
    );
  }

  searchPost(){
    // 查询岗位名
    console.log("查询岗位");
    console.log(this.postSearchStr);
    if(this.postSearchStr === ''){
      this.postInit();
    }
    else {
      this.http.post('http://localhost:9090/post/search-post', this.postSearchStr).subscribe(
        result => {
          console.log(result);
          if (result['meta']['success']) {
            if (result['data'] !== null){
              this.postList = result['data'];
            }
            else{
              this.postList = [];
              this.msg.warning("无查询结果！");
            }
          }
        }
      );
    }
  }

  showPostModal(data): void {
    console.log(data);
    this.isVisiblePost = true;
    if (data === null) {
      this.postFormTitle = "添加岗位对话框";
      this.addPostFlag = true;
      if(this.clikDepart){
        this.postForm.controls['parentDepart'].setValue(this.clikDepart);
      }
      else {
        this.postForm.controls['parentDepart'].setValue(this.nodes[0].key);
      }
    } else {
      this.addPostFlag = false;
      console.log(data);
      this.postFormTitle = "编辑岗位对话框";
      this.postForm.controls['id'].setValue(data.id);
      this.postForm.controls['parentDepart'].setValue((data.departId).toString());
      this.postForm.controls['postName'].setValue(data.name);
      this.postForm.controls['remark'].setValue(data.remark);
    }
  }

  postHandleOk(): void {
    for (const key in this.postForm.controls) {
      this.postForm.controls[key].markAsDirty();
      this.postForm.controls[key].updateValueAndValidity();
    }
    console.log(this.postForm);
    console.log(this.postForm.valid);
    console.log(this.postForm.invalid);
    let url = '';
    if (this.addPostFlag){
      console.log("添加岗位");
      url = 'http://localhost:9090/post/add-post';
    }
    else {
      console.log("编辑岗位");
      url = 'http://localhost:9090/post/update-post';
    }
    if (this.postForm.valid === true) {
      // 后台进行添加操作
      this.isPostLoading = true;
      let params = {
        id: this.postForm.controls['id'].value,
        name: this.postForm.controls['postName'].value,
        parentDepart: this.postForm.controls['parentDepart'].value,
        remark: this.postForm.controls['remark'].value
      };
      console.log("传值前");
      console.log(params);
      this.http.post(url, params).subscribe((result: any) => {
        console.log(result);
        if (result['meta']['success']) {
          this.msg.success("更新成功！");
        }
        this.isVisiblePost = false;
        this.isPostLoading = false;
        this.postForm.reset();
        this.postInit();
      });
    }

  }

  postHandleCancel(): void {
    this.isVisiblePost = false;
    this.postForm.reset();
  }

  // 编辑/添加部门，该部门是否为根部门
  isRoot = false;

  showDepartModal(data, judge): void {
    this.departValue = data.key;
    this.isVisibleDepart = true;
    if (judge === null) {
      console.log("depart添加子部门");
      console.log(data);
      this.departFormTitle = "添加子部门对话框";
      this.departForm.controls['parentDepart'].setValue(data.key);
      this.addDepartFlag = true;
    } else {
      this.addDepartFlag = false;
      console.log("编辑部门");
      console.log(data);
      this.http.post("http://localhost:9090/department/get-name-by-id", data.key).subscribe((result: any) => {
        console.log(result);
        if (result['meta']['success']) {
          this.departForm.controls['remark'].setValue(result['data']['remark']);
        }
      });

      this.departFormTitle = "编辑部门对话框";
      this.departForm.controls['id'].setValue(data.key);
      this.departForm.controls['departName'].setValue(data._title);
      if(data.parentNode === null){
        this.isRoot = true;
      }
      else{
        this.isRoot = false;
        this.departForm.controls['parentDepart'].setValue(data.parentNode.key);
      }
      // this.departForm.controls['remark'].setValue(data['origin'][]);

    }
  }

  departHandleOk(): void {
    for (const key in this.departForm.controls) {
      this.departForm.controls[key].markAsDirty();
      this.departForm.controls[key].updateValueAndValidity();
    }
    console.log(this.departForm);
    console.log(this.departForm.valid);
    console.log(this.departForm.invalid);
    let url = '';
    if (this.addDepartFlag){
      console.log("添加部门");
      url = 'http://localhost:9090/department/add-department';
    }
    else {
      console.log("编辑部门");
      url = 'http://localhost:9090/department/update-department';
    }

    if (this.departForm.valid === true) {
      // 后台进行添加操作
      this.isDepartLoading = true;
      let params = {
        id: this.departForm.controls['id'].value,
        name: this.departForm.controls['departName'].value,
        parentDepart: this.departForm.controls['parentDepart'].value,
        remark: this.departForm.controls['remark'].value
      };
      console.log(params);
      this.http.post(url, params).subscribe((result: any) => {
        console.log(result);
        if (result['meta']['success']) {
          this.msg.success("更新成功！");
        }
        this.isVisibleDepart = false;
        this.isDepartLoading = false;
        this.departForm.reset();
        this.nodesInit();
      });
    }
  }

  departHandleCancel(): void {
    this.isVisibleDepart = false;
    this.departForm.reset();
  }

  deleteDepartment(node) {
    console.log("depart删除");
    console.log(node);
    this.http.post('http://localhost:9090/department/delete-department', node.key).subscribe((result: any) => {
      console.log(result);
      if (result['meta']['success']) {
        this.msg.success("删除成功！");
      }
      this.nodesInit();
      this.postInit();
    });
  }

  postNameValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
        // 在该部门下搜出所有岗位名称，有相同的就返回error
        if (control.value === 'JasonWood') {
          // 返回{error: true}表示这是错误的输入
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }
    );

  departNameValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
        // 在该部门下搜出所有岗位名称，有相同的就返回error
        if (control.value === 'JasonWood') {
          // 返回{error: true}表示这是错误的输入
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }
    );

}
