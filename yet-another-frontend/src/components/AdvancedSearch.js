import React from "react";
import { searchTerm } from "../services/remoteServices";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import speciesList from "../conf/speciesList";
import SearchIcon from "../svg/SearchIcon";
import Table from "./Table";
import { gridAutoSize } from "../utils/utils";

export default function AdvancedSearch() {
    const { species } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [results, setResults] = React.useState({});
    const [termInput, setTermInput] = React.useState("");

    const orfGridRef = React.useRef();
    const goGridRef = React.useRef();
    const reactionGridRef = React.useRef();

    React.useEffect(() => {
        async function fetchData() {
            const res = await searchTerm(
                searchParams.get("term"),
                speciesList[species].path
            );
            if (res.fullMatch) navigate(`/${species}/view?orf=${res.matches}`);
            else {
                console.log(res.matches);
                setResults(res.matches);
                gridAutoSize(orfGridRef);
                gridAutoSize(goGridRef);
                gridAutoSize(reactionGridRef);
            }
            setTermInput(searchParams.get("term"));
        }
        if (searchParams.get("term")) fetchData();
    }, [searchParams, species, navigate]);

    function handleSearch(event) {
        event.preventDefault();
        setSearchParams({ term: termInput });
    }

    // prettier-ignore
    const [orfColDefs, setOrfColDefs] = React.useState([
        { headerName: "ORF", field: "orf", cellRenderer:  p => <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a>}, 
        { headerName: "Gene", field: "gene", cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a>}, 
        { headerName: "TF", field: "protein", cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.protein}`}>{p.data.protein}</a>}, 
        { headerName: "Alias", field: "alias", valueFormatter: p => p.value ? p.value.join(", ") : ""}, 
        { headerName: "Description", field: "description", maxWidth: 600, autoHeight: true, cellRenderer: p => <p className="text-wrap leading-5">{p.value}</p> }])
    // prettier-ignore
    const [goColDefs, setGoColDefs] = React.useState([
        { headerName: "GO Term", field: "term", cellRenderer: p => <a className="link" href={`/${species}/view?goid=${p.data.goid}`}>{p.data.term}</a>}, 
        { headerName: "Ontology", field: "ontology"} ])
    // prettier-ignore
    const [reactionColDefs, setReactionColDefs] = React.useState([
        { headerName: "Reaction Name", field: "reactionname", maxWidth: 500, autoHeight: true, cellRenderer: p => <p className="text-wrap leading-6">{p.value}</p>}, 
        { headerName: "Reaction String", field: "reactionstr", maxWidth: 500, autoHeight: true, cellRenderer: p => <p className="text-wrap leading-6">{p.value}</p>}])

    return (
        <>
            <h1 className="p-3  font-figtree text-xl">Advanced Search</h1>
            <form className="p-3 max-w-lg" onSubmit={handleSearch}>
                {/* <div className="flex-auto max-w-lg"> */}
                <label className="input input-bordered flex items-center gap-2">
                    <SearchIcon />
                    <input
                        type="text"
                        className="w-full"
                        placeholder="Search"
                        id="search"
                        name="search"
                        value={termInput}
                        onChange={(e) => setTermInput(e.target.value)}
                    />
                </label>
                {/* </div> */}
            </form>
            {Object.keys(results).length !== 0 && (
                <span className="p-3">{`Showing matches for term "${searchParams.get(
                    "term"
                )}"`}</span>
            )}
            {Object.keys(results).length > 0 && (
                <div className="join join-vertical w-full p-3">
                    {results.orf.length > 0 && (
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                {`ORF (${results.orf.length})`}
                            </div>
                            <div className="collapse-content">
                                <Table
                                    gridRef={orfGridRef}
                                    colDefs={orfColDefs}
                                    setColDefs={setOrfColDefs}
                                    rowData={results.orf}
                                />
                            </div>
                        </div>
                    )}

                    {results.go.length > 0 && (
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                {`GO (${results.go.length})`}
                            </div>
                            <div className="collapse-content">
                                <Table
                                    gridRef={goGridRef}
                                    colDefs={goColDefs}
                                    setColDefs={setGoColDefs}
                                    rowData={results.go}
                                />
                            </div>
                        </div>
                    )}
                    {results.reaction.length > 0 && (
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                {`Reaction (${results.reaction.length})`}
                            </div>
                            <div className="collapse-content">
                                <Table
                                    gridRef={reactionGridRef}
                                    colDefs={reactionColDefs}
                                    setColDefs={setReactionColDefs}
                                    rowData={results.reaction}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

// <div className="overflow-x-auto">
//     <table className="table">
//         <thead>
//             <tr>
//                 {Object.keys(
//                     results[key][0]
//                 ).map((col) => (
//                     <th>
//                         {col
//                             .charAt(0)
//                             .toUpperCase() +
//                             col.slice(
//                                 1
//                             )}
//                     </th>
//                 ))}
//             </tr>
//         </thead>
//         <tbody>
//             {results[key].map((row) => (
//                 <tr>
//                     {Object.keys(
//                         row
//                     ).map((cell) =>
//                         cell !==
//                         "alias" ? (
//                             <td>
//                                 {cell ===
//                                     "orf" ||
//                                 cell ===
//                                     "gene" ||
//                                 cell ===
//                                     "protein" ? (
//                                     <a
//                                         className="link"
//                                         href={`/${species}/view?orf=${row[cell]}`}
//                                     >
//                                         {
//                                             row[
//                                                 cell
//                                             ]
//                                         }
//                                     </a>
//                                 ) : (
//                                     row[
//                                         cell
//                                     ]
//                                 )}
//                             </td>
//                         ) : (
//                             <td>
//                                 {row[
//                                     cell
//                                 ] ? (
//                                     <ul>
//                                         {row[
//                                             cell
//                                         ].map(
//                                             (
//                                                 alias
//                                             ) => (
//                                                 <li>
//                                                     {
//                                                         alias
//                                                     }
//                                                 </li>
//                                             )
//                                         )}
//                                     </ul>
//                                 ) : (
//                                     ""
//                                 )}
//                             </td>
//                         )
//                     )}
//                 </tr>
//             ))}
//         </tbody>
//     </table>
// </div>
