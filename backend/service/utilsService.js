import { getSpecies } from "../db/repository.js";

export async function species() {
    const res = await getSpecies();
    return res;
}
