import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectionComponent } from './components/selection/selection.component';
import { ResultComponent } from './components/result/result.component';


const routes: Routes = [
  {path: '', redirectTo: 'selection', pathMatch:'full' },
  {path: 'selection', component: SelectionComponent},
  {path: 'result', component: ResultComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
