import React from "react";
import { Outlet } from "react-router-dom";
// import { Select, SelectItem, Input, Link } from "@nextui-org/react";
import species from "./Species";

export default function Layout() {
    const [searchFormData, setSearchFormData] = React.useState("");
    const [currentSpecies, setCurrentSpecies] = React.useState(
        "SaccharomycescerevisiaeS288c"
    );

    function handleSearch(event) {
        event.preventDefault();
        console.log(searchFormData);
    }

    return (
        <div className="grid grid-cols-6 h-full">
            <div className="flex flex-col p-5 h-screen bg-primary shadow-2xl shadow-black">
                <h1 className="text-4xl mb-2 font-ntr text-color">
                    YEASTRACT+
                </h1>

                {/* <Select
                    label="Species"
                    className="max-w-xs mb-6"
                    id="species"
                    name="species"
                    defaultSelectedKeys={[currentSpecies]}
                    onChange={(e) => setCurrentSpecies(e.target.value)}
                >
                    {species.map((x) => (
                        <SelectItem key={x} value={x}>
                            {x}
                        </SelectItem>
                    ))}
                </Select> */}
                <label>
                    <div className="label p-0 mb-2">
                        <span className="label-text text-color">
                            Current Species:
                        </span>
                    </div>

                    <select
                        className="select select-bordered w-full max-w-xs mb-8 text-color"
                        id="species"
                        name="species"
                        value={currentSpecies}
                        onChange={(e) => setCurrentSpecies(e.target.value)}
                    >
                        {species.map((option) => (
                            <option value={option}>{option}</option>
                        ))}
                    </select>
                </label>

                <form onSubmit={handleSearch}>
                    {/* <Input
                        isClearable
                        defaultValue={searchFormData}
                        placeholder="Search"
                        onChange={(e) => setSearchFormData(e.target.value)}
                        onClear={() => setSearchFormData("")}
                    /> */}
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
                            className="grow"
                            placeholder="Search"
                            id="search"
                            name="search"
                            onChange={(e) => setSearchFormData(e.target.value)}
                        />
                    </label>
                </form>
                {/* <Link
                    href="/advanced-search"
                    underline="always"
                    className="justify-center mt-1 mb-6"
                    color="foreground"
                >
                    Advanced Search
                </Link> */}
                <a
                    href="/advanced-search"
                    className="link mt-1 mb-8 ml-3 text-sm text-color"
                >
                    Advanced Search
                </a>
                {/* <Link href="/" size="lg" color="foreground" className="mb-5">
                    Regulations
                </Link>
                <Link
                    href="/sequences"
                    size="lg"
                    color="foreground"
                    className="mb-5"
                >
                    Sequences
                </Link>
                <Link
                    href="/about"
                    size="lg"
                    color="foreground"
                    className="mb-5"
                >
                    About
                </Link>
                <Link
                    href="/help"
                    size="lg"
                    color="foreground"
                    className="mb-5"
                >
                    Help
                </Link> */}
                <ul className="menu w-full gap-3 text-lg p-0">
                    <li>
                        <a
                            className={`text-color ${
                                window.location.pathname === "/"
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            href="/"
                        >
                            Regulations
                        </a>
                    </li>
                    <li>
                        <a
                            className={`text-color ${
                                window.location.pathname === "/sequences"
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            href="/sequences"
                        >
                            Sequences
                        </a>
                    </li>
                    <li>
                        <a
                            className={`text-color ${
                                window.location.pathname === "/about"
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            href="/about"
                        >
                            About
                        </a>
                    </li>
                    <li>
                        <a
                            className={`text-color ${
                                window.location.pathname === "/help"
                                    ? "bg-blue-500"
                                    : ""
                            }`}
                            href="/help"
                        >
                            Help
                        </a>
                    </li>
                </ul>
            </div>
            <div className="col-span-5 p-6">
                <Outlet />
            </div>
        </div>
    );
}
