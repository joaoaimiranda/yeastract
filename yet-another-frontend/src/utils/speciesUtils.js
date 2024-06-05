import speciesList from "../conf/speciesList";

export function dbSpeciesList(key) {
    let res = [];
    for (let strain of speciesList[key].dbstrains.split("\t")) {
        res.push(speciesList.dbspecies + " " + strain);
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
