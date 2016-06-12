export default `
<div class="container">


  <div class="row" style="padding-top:50px;">
    <div class="col-md-12">
       <div template="ngFor let button of stepButtons | async; let i = index">
          
          <navigation-button class="pull-left" [buttonModel]="button"></navigation-button> 
      
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
    
      <navigation-button class="pull-left" [buttonModel]="prevButton | async"></navigation-button>   
    
    </div>
    <div class="col-md-6">
      
      <navigation-button class="pull-right" [buttonModel]="nextButton | async"></navigation-button>
      
    </div>
  </div>

</div>

<button (click)="debugsetValidity()">debug set STEP1 STEP2 invalid</button>

<pre>{{ store | async | json }}</pre>
`;