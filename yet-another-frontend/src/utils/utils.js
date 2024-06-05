export function titleFormat(str) {
    str = str.replaceAll("_", " ");
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function referenceFormat(ref) {
    const authors = ref["authors"].split(", ");
    let abbrev = authors.length > 1 ? authors[0] + " et al." : authors[0];
    abbrev += ", " + ref["journal"];
    abbrev += ", " + ref["date"];
    abbrev += ";" + ref["volume"] + "(" + ref["issue"] + ")";
    abbrev += ":" + ref["pages"];
    return abbrev;
}
