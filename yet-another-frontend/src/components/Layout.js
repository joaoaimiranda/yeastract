import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import speciesList from "../conf/speciesList.js";
import OpenSidebarIcon from "../svg/OpenSidebarIcon.js";
import CloseIcon from "../svg/CloseIcon.js";
import SearchIcon from "../svg/SearchIcon.js";
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
                        <OpenSidebarIcon />
                        {/* <svg
                            className="w-6 h-6 text-gray-800 dark:text-white hidden lg:block"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m15 19-7-7 7-7"
                            />
                        </svg> */}
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
                        <CloseIcon />
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
                            <SearchIcon />
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
