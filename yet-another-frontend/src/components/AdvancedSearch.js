import React from "react";
import { searchTerm } from "../services/remoteServices";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import speciesList from "../conf/speciesList";
import SearchIcon from "../svg/SearchIcon";
export default function AdvancedSearch() {
    const { species } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [results, setResults] = React.useState({});
    const [termInput, setTermInput] = React.useState("");

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
            }
            setTermInput(searchParams.get("term"));
        }
        if (searchParams.get("term")) fetchData();
    }, [searchParams, species, navigate]);

    function handleSearch(event) {
        event.preventDefault();
        setSearchParams({ species: species, term: termInput });
    }

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
            <div className="join join-vertical w-full p-3">
                {Object.keys(results).map(
                    (key) =>
                        results[key].length > 0 && (
                            <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    {`${
                                        key.charAt(0).toUpperCase() +
                                        key.slice(1)
                                    } (${results[key].length})`}
                                </div>
                                <div className="collapse-content">
                                    {results[key].length > 0 && (
                                        <div className="overflow-x-auto">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        {Object.keys(
                                                            results[key][0]
                                                        ).map((col) => (
                                                            <th>
                                                                {col
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    col.slice(
                                                                        1
                                                                    )}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {results[key].map((row) => (
                                                        <tr>
                                                            {Object.keys(
                                                                row
                                                            ).map((cell) =>
                                                                cell !==
                                                                "alias" ? (
                                                                    <td>
                                                                        {cell ===
                                                                            "orf" ||
                                                                        cell ===
                                                                            "gene" ||
                                                                        cell ===
                                                                            "protein" ? (
                                                                            <a
                                                                                className="link"
                                                                                href={`/${species}/view?orf=${row[cell]}`}
                                                                            >
                                                                                {
                                                                                    row[
                                                                                        cell
                                                                                    ]
                                                                                }
                                                                            </a>
                                                                        ) : (
                                                                            row[
                                                                                cell
                                                                            ]
                                                                        )}
                                                                    </td>
                                                                ) : (
                                                                    <td>
                                                                        {row[
                                                                            cell
                                                                        ] ? (
                                                                            <ul>
                                                                                {row[
                                                                                    cell
                                                                                ].map(
                                                                                    (
                                                                                        alias
                                                                                    ) => (
                                                                                        <li>
                                                                                            {
                                                                                                alias
                                                                                            }
                                                                                        </li>
                                                                                    )
                                                                                )}
                                                                            </ul>
                                                                        ) : (
                                                                            ""
                                                                        )}
                                                                    </td>
                                                                )
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                )}
            </div>
        </>
    );
}
