const API_URL = "https://api.restcountries.com/countries/v5/name";
const PAYS_API_URL = "https://api.restcountries.com/countries/v5";
const REGION_API_URL = "https://api.restcountries.com/countries/v5/region/Europe";
const CORS_PROXY_URL = "/api/restcountries?url=";
const CHAMPS_PAYS = "response_fields=names.common,capitals,region,population,codes.alpha_2&limit=100";
const CHAMPS_REGION = "response_fields=region&limit=100";

async function appelerApi(url) {
    const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(url)}`);
    const donnees = await response.json();

    if (!response.ok) {
        const message = donnees?.message
            ?? donnees?.errors?.[0]?.message
            ?? `Erreur API : ${response.status} ${response.statusText}`;
        throw new Error(message);
    }

    return donnees;
}

function normaliserPays(donnees) {
    let listePays = donnees;

    if (typeof listePays === "string") {
        try {
            listePays = JSON.parse(listePays);
        } catch (erreur) {
            throw new Error("La réponse de l'API n'est pas un JSON valide.");
        }
    }

    if (!Array.isArray(listePays)) {
        listePays = listePays?.data?.objects ?? listePays?.data ?? listePays?.results ?? listePays?.contents;
    }

    if (typeof listePays === "string") {
        try {
            listePays = JSON.parse(listePays);
        } catch (erreur) {
            throw new Error("La réponse de l'API n'est pas un JSON valide.");
        }
    }

    if (!Array.isArray(listePays)) {
        const message = donnees?.errors?.[0]?.message
            ?? donnees?.message
            ?? "La réponse de l'API n'est pas une liste de pays.";
        throw new Error(message);
    }

    return listePays.map((pays) => ({
        nom: pays.names?.common ?? pays.name?.common ?? "Nom inconnu",
        capitale: pays.capitals?.[0]?.name ?? pays.capital?.[0] ?? "Capitale inconnue",
        region: pays.region ?? "Région inconnue",
        population: pays.population ?? 0,
        code: pays.codes?.alpha_2 ?? pays.cca2 ?? ""
    }));
}

export async function chercherPays(nom) {
    const nomRecherche = nom.trim();

    if (!nomRecherche) {
        return [];
    }

    const url = `${API_URL}?q=${encodeURIComponent(nomRecherche)}&${CHAMPS_PAYS}`;
    const donnees = await appelerApi(url);
    const paysTrouves = normaliserPays(donnees);
    const debutNom = nomRecherche.toLocaleLowerCase("fr-FR");

    return paysTrouves.filter((pays) => pays.nom.toLocaleLowerCase("fr-FR").startsWith(debutNom));
}

export async function chercherPaysEurope() {
    const donnees = await appelerApi(`${REGION_API_URL}?${CHAMPS_PAYS}`);
    return normaliserPays(donnees).filter((pays) => pays.region === "Europe");
}

export async function chercherTousLesPays() {
    const premierePage = await appelerApi(`${PAYS_API_URL}?${CHAMPS_PAYS}`);
    const objets = premierePage?.data?.objects ?? [];
    const total = premierePage?.data?.meta?.total ?? objets.length;
    const toutesLesPages = [objets];

    for (let offset = objets.length; offset < total; offset += 100) {
        const page = await appelerApi(`${PAYS_API_URL}?${CHAMPS_PAYS}&offset=${offset}`);
        toutesLesPages.push(page?.data?.objects ?? []);
    }

    return normaliserPays(toutesLesPages.flat());
}

export async function chercherRegions() {
    const premierePage = await appelerApi(`${PAYS_API_URL}?${CHAMPS_REGION}`);
    const objets = premierePage?.data?.objects ?? [];
    const total = premierePage?.data?.meta?.total ?? objets.length;
    const pages = [objets];

    for (let offset = objets.length; offset < total; offset += 100) {
        const page = await appelerApi(`${PAYS_API_URL}?${CHAMPS_REGION}&offset=${offset}`);
        pages.push(page?.data?.objects ?? []);
    }

    return [...new Set(pages.flat()
        .map((pays) => pays.region)
        .filter(Boolean))].sort();
}
