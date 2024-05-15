import constants from "../constants";

export async function searchRegulations(reqData) {
    const res = await fetch(`${constants.baseUrl}/associations/search`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
}

export async function rankTF(reqData) {
    const res = await fetch(`${constants.baseUrl}/associations/ranktf`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function rankGO(reqData) {
    const res = await fetch(`${constants.baseUrl}/associations/rankgo`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function rankTFBS(reqData) {
    const res = await fetch(`${constants.baseUrl}/associations/ranktfbs`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function motifOnPromoter(reqData) {
    const res = await fetch(`${constants.baseUrl}/seq/motif-on-promoter`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function tfbsByMotif(reqData) {
    const res = await fetch(`${constants.baseUrl}/seq/tfbs-by-motif`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function tfbsOnSeq(reqData) {
    const res = await fetch(`${constants.baseUrl}/seq/tfbs-on-seq`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function seqRetrieval(reqData) {
    const res = await fetch(`${constants.baseUrl}/seq/seq-retrieval`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function promoterAnalysis(reqData) {
    const res = await fetch(`${constants.baseUrl}/seq/prom-analysis`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function tfConsensus(species) {
    const res = await fetch(
        `${constants.baseUrl}/seq/tf-consensus?species=${species}`
    );
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function searchTerm(term, species) {
    const res = await fetch(
        `${constants.baseUrl}/info/?term=${term}&species=${species}`
    );
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function getSpecies() {
    const res = await fetch(`${constants.baseUrl}/utils/species`);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}

export async function getEnvCons() {
    const res = await fetch(`${constants.baseUrl}/utils/envcons`);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
}
