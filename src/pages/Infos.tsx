export default function Infos(){
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1>Bienvenue au Tchin BX 🍻</h1>
      <p>Le but : gagner un max de <b>Tchin</b> en visitant les bars de légende...</p>
<h2>Bienvenue au Tchin BX 🍻</h2>
<h3>Le but</h3>
<p>Gagner un max de Tchin en visitant les bars de légende de Bruxelles. Monte ton QG, grimpe au classement et débloque des bonus.</p>
<h3>Comment jouer</h3>
<ul>
  <li><b>TCHIN !</b> – Clique le bouton pour générer des Tchin.</li>
  <li>Choisis ton mode – Hors bar pour t’entrainer, En bar pour scorer en vrai, Défi pour les ambitieux.</li>
  <li><b>QG</b> – Désigne ton bar QG, il te donne un boost. Tu peux le changer (ça coûte).</li>
  <li><b>Shop</b> – Dépense tes Tchin dans des upgrades (multiplicateur, bonus de temps, etc.).</li>
  <li><b>Favoris</b> – Garde tes bars préférés sous la main.</li>
</ul>
<h3>Petit lexique</h3>
<ul>
  <li><b>Banque</b> : ton solde de Tchin.</li>
  <li><b>Valeur</b> : combien rapporte un Tchin.</li>
  <li><b>Multiplicateur</b> : bonus appliqué à tes gains.</li>
</ul>
<h3>Astuces de barman</h3>
<ul>
  <li>Enchaîne les sessions courtes mais régulières.</li>
  <li>Pense à passer En bar quand tu sirotes une pinte : le boost est plus juteux.</li>
  <li>Le QG bien choisi, c’est la moitié du taf.</li>
</ul>
<h3>Besoin d’un coup de main ?</h3>
<p>Lance le Guide rapide depuis cette page à tout moment.</p>
      <button onClick={()=>window.dispatchEvent(new Event("start-tour"))}>
        Lancer le Guide rapide
      </button>
    </div>
  );
}