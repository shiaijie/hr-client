import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {environment} from '@env/environment';
// layout
import {LayoutDefaultComponent} from '../layout/default/default.component';
import {LayoutPassportComponent} from '../layout/passport/passport.component';
// dashboard pages
import {DashboardComponent} from './dashboard/dashboard.component';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
import {UserRegisterComponent} from './passport/register/register.component';
import {UserRegisterResultComponent} from './passport/register-result/register-result.component';
// single pages
import {CallbackComponent} from './callback/callback.component';
import {UserLockComponent} from './passport/lock/lock.component';
import {RosterComponent} from "./roster/roster.component";
import {RosterAddComponent} from "./roster-add/roster-add.component";
import {DepartmentPostManageComponent} from "./department-post-manage/department-post-manage.component";
import {SalaryComponent} from "./salary/salary.component";
import {PersonalInfoComponent} from "./personal-info/personal-info.component";
import {PersonalSalaryComponent} from "./personal-salary/personal-salary.component";


const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    // canActivate: [SimpleGuard],
    children: [
      { path: '', loadChildren: './redirect/redirect.module#RedirectModule' },
      { path: 'dashboard', component: DashboardComponent, data: { title: '仪表盘', titleI18n: 'dashboard' } },
      { path: 'exception', loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule) },
      { path: 'roster', component: RosterComponent, data: { title: '花名册', titleI18n: '花名册' } },
      { path: 'roster-add', component: RosterAddComponent, data: {title: '添加人员', titleI18n: '添加人员'}},
      { path: 'department-post-manage', component: DepartmentPostManageComponent, data: {title: '部门岗位管理', titleI18n: '部门岗位管理'}},
      { path: 'personal-info', component: PersonalInfoComponent, data: {title: '个人中心', titleI18n: '个人中心'}},
      { path: 'personal-salary', component: PersonalSalaryComponent, data: {title: '个人工资单', titleI18n: '个人工资单'}},
      { path: 'salary', component: SalaryComponent, data: {title: '薪资管理', titleI18n: '薪资管理'}},
      { path: 'redirect', loadChildren: './redirect/redirect.module#RedirectModule', data: { auth: 'full' } },
      // 业务子模块
      // { path: 'widgets', loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule) },
    ]
  },
  // 全屏布局
  // {
  //     path: 'fullscreen',
  //     component: LayoutFullScreenComponent,
  //     children: [
  //     ]
  // },
  // passport
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: UserLoginComponent, data: { title: '登录', titleI18n: '登录' } },
      { path: 'register', component: UserRegisterComponent, data: { title: '注册', titleI18n: '注册' } },
      { path: 'register-result', component: UserRegisterResultComponent, data: { title: '注册结果', titleI18n: '注册结果' } },
      { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
    ]
  },
  // 单页不包裹Layout
  { path: 'callback/:type', component: CallbackComponent },
  { path: '**', redirectTo: 'exception/404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
        useHash: environment.useHash,
        // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
        // Pls refer to https://ng-alain.com/components/reuse-tab
        scrollPositionRestoration: 'top',
      }
    )],
  exports: [RouterModule],
})
export class RouteRoutingModule { }
