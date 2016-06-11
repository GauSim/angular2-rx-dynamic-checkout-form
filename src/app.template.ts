export default `
<div class="container">


  <div class="row">
    <div class="col-md-12">
       <div template="ngFor let button of stepButtons; let i = index">
        <button class="pull-left" md-raised-button [disabled]="!button.depsAreValid" [color]="(button.isCurrent ? 'primary' : '')" (click)="goTo(button.stepId)">
          {{ button.name }}
        </button>
      </div>
    </div>
  </div>
  
  <div class="row">
    <div class="col-md-12">
      <step-base [step]="currentStep"></step-base> 
    </div>
  </div>

  <div class="row">
    <div class="col-md-6">
    <button md-raised-button [class.hidden]="!showPrevButton" [disabled]="disablePrevButton" (click)="goPrev()">Zurück</button>  
    </div>
    <div class="col-md-6">
    <button class="pull-right" md-raised-button [class.hidden]="!showNextButton" [disabled]="disableNextButton" (click)="goNext()">Weiter</button>
    </div>
  </div>

</div>


<pre>{{ root | async | json }}</pre>
`;