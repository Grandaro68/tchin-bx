// Exemple d’encart à positionner au-dessus du bouton
function BankHeader({ amount, value, multiplier }:{
  amount:number; value:number; multiplier:number;
}){
  return (
    <div className="bank-header" role="status" aria-live="polite">
      <div className="bank-title">Banque</div>
      <div className="bank-figures">
        <span className="bank-amount">{amount.toLocaleString("fr-FR")}</span>
        <span className="bank-unit"> Tchin</span>
      </div>
      <div className="bank-sub">
        Valeur: {value.toFixed(2)} • multiplicateur x{multiplier}
      </div>
    </div>
  );
}
