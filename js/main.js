import pays from "./data.js";
import { creerCarte } from "./ui.js";

const conteneurCartes = document.querySelector("#cartes-pays");
const filtreRegion = document.querySelector("#filtre-region");
const statutResultats = document.querySelector("#statut-resultats");
const detailPays = document.querySelector("#detail-pays");
const titreDetail = document.querySelector("#titre-detail");
const contenuDetail = document.querySelector("#contenu-detail");

function afficherDetail(paysSelectionne) {
    titreDetail.textContent = paysSelectionne.nom;
    contenuDetail.replaceChildren();

    const details = [
        ["Capitale", paysSelectionne.capitale],
        ["Région", paysSelectionne.region],
        ["Population", paysSelectionne.population.toLocaleString("fr-FR")],
        ["Code", paysSelectionne.code]
    ];

    details.forEach(([libelle, valeur]) => {
        const paragraphe = document.createElement("p");
        paragraphe.textContent = `${libelle}: ${valeur}`;
        contenuDetail.append(paragraphe);
    });

    detailPays.showModal();
}

const regions = [...new Set(pays.map((paysActuel) => paysActuel.region))].sort();

regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    filtreRegion.append(option);
});

function afficherPays(paysAAfficher) {
    const fragment = document.createDocumentFragment();

    paysAAfficher.forEach((paysActuel) => {
        fragment.append(creerCarte(paysActuel));
    });

    conteneurCartes.replaceChildren(fragment);
    statutResultats.textContent = `${paysAAfficher.length} pays affiché${paysAAfficher.length > 1 ? "s" : ""}.`;
}

filtreRegion.addEventListener("change", () => {
    const regionSelectionnee = filtreRegion.value;
    const paysFiltres = regionSelectionnee
        ? pays.filter((paysActuel) => paysActuel.region === regionSelectionnee)
        : pays;

    afficherPays(paysFiltres);
});

conteneurCartes.addEventListener("click", (event) => {
    const carte = event.target.closest(".pays");
    const paysSelectionne = pays.find((paysActuel) => paysActuel.code === carte?.dataset.code);

    if (paysSelectionne) {
        afficherDetail(paysSelectionne);
    }
});

conteneurCartes.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.target.click();
    }
});

afficherPays(pays);
