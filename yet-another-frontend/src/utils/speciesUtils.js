import speciesList from "../conf/speciesList";

export function dbSpeciesList(key) {
    let res = [];
    for (let strain of speciesList[key].dbstrains) {
        res.push(speciesList[key].dbspecies + " " + strain);
    }
    return res;
}

export function findDbSpecies(dbname) {
    for (let key of Object.keys(speciesList)) {
        const strains = dbSpeciesList(key);
        if (strains.includes(dbname)) return speciesList[key].path;
    }
    return null;
}

export function findStrain(dbname) {
    const species = findDbSpecies(dbname);
    for (let strain of speciesList[species].dbstrains) {
        if (speciesList[species].dbspecies + " " + strain === dbname)
            return strain;
    }
    return null;
}
