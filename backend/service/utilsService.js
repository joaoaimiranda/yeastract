import { getEnvCons, getSpecies } from "../db/repository.js";

export async function species() {
    const res = await getSpecies();
    return res;
}

export async function envCons() {
    const res = await getEnvCons();
    return res;
}
