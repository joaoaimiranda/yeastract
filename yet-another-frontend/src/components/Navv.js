import React from "react";
// import species from "./Species";
import { Navbar, NavbarContent, NavbarItem, Link } from "@nextui-org/react";

export default function Navv() {
    // const [value, setValue] = React.useState("SaccharomycescerevisiaeS288c");

    // function handleChange(event) {
    //     setValue(species[event]);
    // }

    // function mapSpecies() {
    //     let l = [];
    //     for (let i = 0; i < species.length; i++) {
    //         let el = species[i];
    //         l.push(
    //             <NavDropdown.Item key={i} eventKey={i} href="#">
    //                 {el}
    //             </NavDropdown.Item>
    //         );
    //     }
    //     return l;
    // }

    // const speciesMenu = React.useMemo(mapSpecies, []);

    return (
        <Navbar isBordered maxWidth="full">
            {/* <NavbarBrand className="font-bold text-inherit">
                YEASTRACT+
            </NavbarBrand> */}
            <NavbarContent className="hidden sm:flex gap-5" justify="start">
                <NavbarItem>
                    <Link
                        className="font-bold text-inherit gap-5"
                        color="foreground"
                        href="/"
                    >
                        YEASTRACT+
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="/">
                        Regulations
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="/">
                        Sequences
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="/">
                        About
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link color="foreground" href="/">
                        Help
                    </Link>
                </NavbarItem>
            </NavbarContent>
            {/* <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
              Sign Up
            </Button>
          </NavbarItem>
        </NavbarContent> */}
        </Navbar>
    );
}
