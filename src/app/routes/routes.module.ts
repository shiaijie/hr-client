import {NgModule} from '@angular/core';
import {IconDefinition} from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {DatePipe} from "@angular/common"
import {SharedModule} from '@shared';
import {RouteRoutingModule} from './routes-routing.module';
// dashboard pages
import {DashboardComponent} from './dashboard/dashboard.component';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
import {UserRegisterComponent} from './passport/register/register.component';
import {UserRegisterResultComponent} from './passport/register-result/register-result.component';
// single pages
import {CallbackComponent} from './callback/callback.component';
import {UserLockComponent} from './passport/lock/lock.component';
import {RosterComponent} from './roster/roster.component';
import {RosterAddComponent} from './roster-add/roster-add.component';
import {DepartComponent} from './depart/depart.component';
import {SalaryComponent} from './salary/salary.component';
import {NgZorroAntdModule, NZ_ICONS} from "ng-zorro-antd";
import {DepartmentPostManageComponent} from './department-post-manage/department-post-manage.component';

import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientJsonpModule, HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {PersonalSalaryComponent} from './personal-salary/personal-salary.component';
import {PersonalInfoComponent} from './personal-info/personal-info.component';


const COMPONENTS = [
  DashboardComponent,
  // passport pages
  UserLoginComponent,
  UserRegisterComponent,
  UserRegisterResultComponent,
  // single pages
  CallbackComponent,
  UserLockComponent,
  RosterComponent,
  RosterAddComponent,
  DepartmentPostManageComponent,
  SalaryComponent
];
const COMPONENTS_NOROUNT = [];
const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    BrowserAnimationsModule,
    SharedModule,
    RouteRoutingModule,
    ScrollingModule,
    DragDropModule],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT,
    RosterComponent,
    RosterAddComponent,
    DepartComponent,
    SalaryComponent,
    DepartmentPostManageComponent,
    PersonalSalaryComponent,
    PersonalInfoComponent
    /*,
    DepartPostDutySelectComponent,
    PostTreeSelectComponent*/
  ],
  providers:[{provide: NZ_ICONS, useValue: icons}, DatePipe],
  entryComponents: COMPONENTS_NOROUNT
})
export class RoutesModule {}
