import {Component, Inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Component({
  selector: 'default',
  templateUrl: './default.component.html'
})
export class DefaultComponent implements OnInit {

  constructor(private router: Router,
              @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService) {
  }

  ngOnInit() {
    this.router.navigateByUrl(this.tokenService.login_url);
  }

}
