import React from "react";
import { searchTerm } from "../services/remoteServices";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import speciesList from "../conf/speciesList";
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
        fetchData();
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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-4 h-4 opacity-70"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            clipRule="evenodd"
                        />
                    </svg>
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
            {Object.keys(results) !== 0 && (
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
                                                                                href={`/view?orf=${row[cell]}`}
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
