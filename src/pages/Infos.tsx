export default function Infos() {
  return (
    <div className="prose prose-invert max-w-3xl mx-auto py-8">
      <h1>Bienvenue au Tchin BX 🍻</h1>

      <h2>Le but</h2>
      <p>
        Gagner un max de <b>Tchin</b> en visitant les bars de légende de
        Bruxelles. Monte ton QG, grimpe au classement et débloque des bonus.
      </p>

      <h2>Comment jouer</h2>
      <ul>
        <li>
          <b>TCHIN !</b> – Clique le bouton pour générer des Tchin.
        </li>
        <li>
          Choisis ton mode – <i>Hors bar</i> pour t’entraîner, <i>En bar</i> pour
          scorer en vrai, <i>Défi</i> pour les ambitieux.
        </li>
        <li>
          <b>QG</b> – Désigne ton bar QG, il te donne un boost. Tu peux le changer
          (ça coûte).
        </li>
        <li>
          <b>Shop</b> – Dépense tes Tchin dans des upgrades (multiplicateur, bonus
          de temps, etc.).
        </li>
        <li>
          <b>Favoris</b> – Garde tes bars préférés sous la main.
        </li>
      </ul>

      <h2>Petit lexique</h2>
      <ul>
        <li>
          <b>Banque</b> : ton solde de Tchin.
        </li>
        <li>
          <b>Valeur</b> : combien rapporte un Tchin.
        </li>
        <li>
          <b>Multiplicateur</b> : bonus appliqué à tes gains.
        </li>
      </ul>

      <h2>Astuces de barman</h2>
      <ul>
        <li>Enchaîne les sessions courtes mais régulières.</li>
        <li>
          Pense à passer <i>En bar</i> quand tu sirotes une pinte : le boost est
          plus juteux.
        </li>
        <li>Le QG bien choisi, c’est la moitié du taf.</li>
      </ul>

      <h2>Besoin d’un coup de main ?</h2>
      <p>
        Tu peux lancer le <b>Guide rapide</b> depuis cette page à tout moment.
      </p>
      <button
        onClick={() => window.dispatchEvent(new Event("start-tour"))}
        className="px-4 py-2 mt-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
      >
        🚀 Lancer le Guide rapide
      </button>
    </div>
  );
}
