import { chercherPays, chercherRegions, chercherTousLesPays } from "./api.js";
import { creerCarte } from "./ui.js";

const conteneurCartes = document.querySelector("#cartes-pays");
const champRecherche = document.querySelector("#recherche-pays");
const filtreRegion = document.querySelector("#filtre-region");
const statutResultats = document.querySelector("#statut-resultats");
const boutonReessayer = document.querySelector("#reessayer");
const detailPays = document.querySelector("#detail-pays");
const titreDetail = document.querySelector("#titre-detail");
const contenuDetail = document.querySelector("#contenu-detail");
let paysDisponibles = [];
let cataloguePays = [];
let minuteurRecherche;
let numeroRecherche = 0;

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

function remplirFiltreRegions(paysAAfficher) {
    const regions = [...new Set(paysAAfficher.map((paysActuel) => paysActuel.region))].sort();

    filtreRegion.replaceChildren();

    const toutesLesRegions = document.createElement("option");
    toutesLesRegions.value = "";
    toutesLesRegions.textContent = "Toutes les régions";
    filtreRegion.append(toutesLesRegions);

    regions.forEach((region) => {
        const option = document.createElement("option");
        option.value = region;
        option.textContent = region;
        filtreRegion.append(option);
    });
}

function afficherPays(paysAAfficher) {
    const fragment = document.createDocumentFragment();

    paysAAfficher.forEach((paysActuel) => {
        fragment.append(creerCarte(paysActuel));
    });

    conteneurCartes.replaceChildren(fragment);
    boutonReessayer.hidden = true;

    if (paysAAfficher.length === 0) {
        statutResultats.textContent = "Aucun pays trouvé.";
        statutResultats.dataset.etat = "empty";
        return;
    }

    statutResultats.textContent = `${paysAAfficher.length} pays affiché${paysAAfficher.length > 1 ? "s" : ""}.`;
    statutResultats.dataset.etat = "success";
}

function afficherChargement() {
    conteneurCartes.replaceChildren();
    statutResultats.textContent = "Chargement des pays d'Europe...";
    statutResultats.dataset.etat = "loading";
    boutonReessayer.hidden = true;
}

function afficherErreur(message) {
    conteneurCartes.replaceChildren();
    statutResultats.textContent = message;
    statutResultats.dataset.etat = "error";
    boutonReessayer.hidden = false;
}

function filtrerParRegion(paysAAfficher) {
    const regionSelectionnee = filtreRegion.value;

    return regionSelectionnee
        ? paysAAfficher.filter((paysActuel) => paysActuel.region === regionSelectionnee)
        : paysAAfficher;
}

filtreRegion.addEventListener("change", () => {
    afficherPays(filtrerParRegion(paysDisponibles));
});

champRecherche.addEventListener("input", () => {
    clearTimeout(minuteurRecherche);
    const termeRecherche = champRecherche.value.trim();
    const rechercheActuelle = ++numeroRecherche;

    minuteurRecherche = setTimeout(async () => {
        if (!termeRecherche) {
            if (rechercheActuelle === numeroRecherche) {
                paysDisponibles = cataloguePays;
                afficherPays(filtrerParRegion(paysDisponibles));
            }
            return;
        }

        statutResultats.textContent = "Recherche en cours...";
        statutResultats.dataset.etat = "loading";

        try {
            const resultats = await chercherPays(termeRecherche);

            if (rechercheActuelle !== numeroRecherche) {
                return;
            }

            paysDisponibles = resultats;
            afficherPays(filtrerParRegion(paysDisponibles));
        } catch (erreur) {
            if (rechercheActuelle !== numeroRecherche) {
                return;
            }

            conteneurCartes.replaceChildren();
            afficherErreur("La recherche est indisponible. Réessayez.");
            console.error(erreur);
        }
    }, 300);
});

conteneurCartes.addEventListener("click", (event) => {
    const carte = event.target.closest(".pays");
    const paysSelectionne = paysDisponibles.find((paysActuel) => paysActuel.code === carte?.dataset.code);

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

async function chargerPaysEurope(rechercheActuelle = numeroRecherche) {
    afficherChargement();

    try {
        const [tousLesPays, regions] = await Promise.all([
            chercherTousLesPays(),
            chercherRegions()
        ]);

        if (rechercheActuelle !== numeroRecherche) {
            return;
        }

        cataloguePays = tousLesPays;
        paysDisponibles = cataloguePays;
        remplirFiltreRegions(regions.map((region) => ({ region })));
        filtreRegion.value = "Europe";
        afficherPays(filtrerParRegion(paysDisponibles));
    } catch (erreur) {
        if (rechercheActuelle !== numeroRecherche) {
            return;
        }

        afficherErreur(`Impossible de charger les pays d'Europe : ${erreur.message}`);
        console.error(erreur);
    }
}

boutonReessayer.addEventListener("click", () => {
    numeroRecherche += 1;
    chargerPaysEurope();
});

chargerPaysEurope();
