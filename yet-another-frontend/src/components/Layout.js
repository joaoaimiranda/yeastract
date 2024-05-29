import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import speciesList from "../conf/speciesList.js";
// import species from "./Species";

export default function Layout() {
    const [searchFormData, setSearchFormData] = React.useState("");
    const navigate = useNavigate();
    const { species } = useParams();
    // if (speciesList[species] === undefined) return <div>not found</div>; // create 404 page eventually

    function handleSearch(event) {
        event.preventDefault();
        console.log(searchFormData);
        if (searchFormData.trim() !== "") {
            // const res = await searchTerm(searchFormData.trim(), species);
            // console.log(res);
            navigate(
                `/${species}/advanced-search?term=${searchFormData.trim()}`
            );
        }
    }

    function currentPage() {
        return window.location.pathname.substring(
            window.location.pathname.lastIndexOf("/") + 1
        );
    }

    return (
        // <div className="flex flex-row h-full">
        <div className="drawer lg:drawer-open">
            <input
                id="sidebar-toggle"
                type="checkbox"
                className="drawer-toggle"
            />
            <div className="drawer-content">
                <div className="flex flex-row gap-2 px-1 items-center">
                    <label
                        htmlFor="sidebar-toggle"
                        aria-label="open sidebar"
                        className="btn btn-square btn-ghost drawer-button lg:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block w-6 h-6 stroke-current"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </label>
                    <h1 className="text-2xl font-figtree mt-1 lg:hidden">
                        YEASTRACT+
                    </h1>
                </div>
                <div className="max-w-[100vw] h-full container mx-auto mt-2">
                    <Outlet />
                </div>
            </div>
            {/* shadow-2xl shadow-black */}
            <div className="drawer-side">
                <label
                    htmlFor="sidebar-toggle"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <div className="flex flex-col p-5 h-screen bg-primary max-w-60">
                    <label
                        htmlFor="sidebar-toggle"
                        aria-label="close sidebar"
                        className="btn btn-circle btn-ghost self-end lg:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </label>
                    <h1 className="hidden lg:block font-figtree text-2xl">
                        YEASTRACT+
                    </h1>

                    <select
                        className="select select-sm select-bordered w-full max-w-xs mb-4 mt-2 text-color"
                        id="species"
                        name="species"
                        value={species}
                        onChange={(e) => navigate(`/${e.target.value}`)}
                    >
                        {Object.keys(speciesList).map((option) => (
                            <option key={option} value={option}>
                                {speciesList[option].short}
                            </option>
                        ))}
                    </select>
                    {/* </label> */}

                    <form onSubmit={handleSearch}>
                        {/* <Input
                        isClearable
                        defaultValue={searchFormData}
                        placeholder="Search"
                        onChange={(e) => setSearchFormData(e.target.value)}
                        onClear={() => setSearchFormData("")}
                    /> */}
                        <label className="input input-sm input-bordered flex items-center gap-2">
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
                                onChange={(e) =>
                                    setSearchFormData(e.target.value)
                                }
                            />
                        </label>
                    </form>
                    <a
                        href="/advanced-search"
                        className="link mt-1 mb-6 ml-3 text-sm text-color"
                    >
                        Advanced Search
                    </a>

                    <ul className="menu w-full gap-1 text-lg p-0">
                        <li>
                            <a
                                className={`text-color ${
                                    currentPage() === species
                                        ? "active-tab"
                                        : ""
                                }`}
                                href={`/${species}`}
                            >
                                Regulations
                            </a>
                        </li>
                        <li>
                            <a
                                className={`text-color ${
                                    currentPage() === "sequences"
                                        ? "active-tab"
                                        : ""
                                }`}
                                href={`/${species}/sequences`}
                            >
                                Sequences
                            </a>
                        </li>
                        <li>
                            <a
                                className={`text-color ${
                                    currentPage() === "about"
                                        ? "active-tab"
                                        : ""
                                }`}
                                href={`/${species}/about`}
                            >
                                About
                            </a>
                        </li>
                        <li>
                            <a
                                className={`text-color ${
                                    currentPage() === "help" ? "active-tab" : ""
                                }`}
                                href={`/${species}/help`}
                            >
                                Help
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        // </div>
    );
}
