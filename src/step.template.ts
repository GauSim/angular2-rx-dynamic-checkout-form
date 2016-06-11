export default `
<md-card> 
    <h1>{{ step.name }}</h1>
    <pre>{{ step | json }}</pre>

<button (click)="validate()">mark as valid</button>

</md-card>
  
`;