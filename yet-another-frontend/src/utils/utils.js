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

export function sequenceFormat(text) {
    const seq = text.split("\n");
    const firstLine = seq.shift();
    return (
        <pre>
            {firstLine}
            <br />
            {seq.map((line) => (
                <>
                    {line}
                    <br />
                </>
            ))}
        </pre>
    );
}

export function splitSequence(text) {
    const newSeq = [];
    for (let i = 0; i < text.length; i += 60) {
        newSeq.push(text.slice(i, i + 60));
    }
    return newSeq;
}
