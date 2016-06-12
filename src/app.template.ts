export default `
<div class="container">


  <div class="row" style="padding-top:50px;">
    <div class="col-md-12">
       <div template="ngFor let button of stepButtons; let i = index">
        <button class="pull-left" md-raised-button [disabled]="!button.isReachable && !button.isCurrent" [color]="(button.isCurrent ? 'primary' : '')" (click)="goTo(button.stepId)">
          {{ button.title }}
          <span [class]="(button.isValid ? 'glyphicon glyphicon-ok' : '')" aria-hidden="true"></span>
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
      <button md-raised-button [class.hidden]="!prevButton.isAvailable" [disabled]="!prevButton.isReachable" (click)="goTo(prevButton.stepId)">{{ prevButton.title }}</button>
    </div>
    <div class="col-md-6">
      <button class="pull-right" md-raised-button [class.hidden]="!nextButton.isAvailable" [disabled]="!nextButton.isReachable" (click)="goTo(nextButton.stepId)">{{ nextButton.title }}</button>  
    </div>
  </div>

</div>

<button (click)="debugsetValidity()">debug set STEP1 STEP2 invalid</button>

<pre>{{ root | async | json }}</pre>
`;