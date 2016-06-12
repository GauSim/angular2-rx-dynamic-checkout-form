export default `
<md-card> 
    <h1>{{ step.title }}</h1>
    <pre>{{ step | json }}</pre>

<button class="pull-right" (click)="toggleValidity()">toogle valid</button>

</md-card>
  
`;