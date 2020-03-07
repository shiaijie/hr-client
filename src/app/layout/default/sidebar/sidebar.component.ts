import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SettingsService} from '@delon/theme';
import {environment} from "@env/environment";
import {Router} from "@angular/router";

@Component({
  selector: 'layout-sidebar',
  templateUrl: './sidebar.component.html',
  styles: [
    `
      [nz-menu] {
        width: 240px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  constructor(
    private router: Router,
    public settings: SettingsService) {}

  userInfo = JSON.parse(sessionStorage.getItem(environment.SESSIONNAME));

}
