export function creerCarte(pays) {
    const article = document.createElement("article");
    article.className = "pays";
    article.dataset.code = pays.code;
    article.tabIndex = 0;
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `Afficher le détail de ${pays.nom}`);

    const nom = document.createElement("h3");
    nom.className = "nomPays";
    nom.textContent = pays.nom;

    const capitale = document.createElement("p");
    capitale.className = "capitale";
    capitale.textContent = `Capitale: ${pays.capitale}`;

    const region = document.createElement("p");
    region.className = "region";
    region.textContent = `Région: ${pays.region}`;

    const population = document.createElement("p");
    population.className = "population";
    population.textContent = `Population: ${pays.population.toLocaleString("fr-FR")}`;

    const code = document.createElement("p");
    code.className = "code";
    code.textContent = `Code: ${pays.code}`;

    article.append(nom, capitale, region, population, code);

    return article;
}
