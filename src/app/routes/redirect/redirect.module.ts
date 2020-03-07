import {NgModule} from '@angular/core';

import {RedirectRoutingModule} from './redirect-routing.module';
import {DefaultComponent} from "./default/default.component";


@NgModule({
  imports: [
    RedirectRoutingModule
  ],
  declarations: [
    DefaultComponent
  ]
})
export class RedirectModule { }
