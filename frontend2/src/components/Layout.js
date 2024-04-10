import React from "react";
import { Outlet } from "react-router-dom";
import { Select, SelectItem, Input, Link } from "@nextui-org/react";
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
        <div className="grid grid-cols-6 gap-4">
            <div className="flex flex-col p-5">
                <h1 className="text-4xl p-2 font-ntr">YEASTRACT+</h1>

                <Select
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
                </Select>
                <form onSubmit={handleSearch}>
                    <Input
                        isClearable
                        defaultValue={searchFormData}
                        placeholder="Search"
                        onChange={(e) => setSearchFormData(e.target.value)}
                        onClear={() => setSearchFormData("")}
                    />
                </form>
                <Link
                    href="/advanced-search"
                    underline="always"
                    className="justify-center mt-1 mb-6"
                    color="foreground"
                >
                    Advanced Search
                </Link>
                <Link href="/" size="lg" color="foreground" className="mb-5">
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
                </Link>
            </div>
            <div className="col-span-5 p-6">
                <Outlet />
            </div>
        </div>
    );
}
