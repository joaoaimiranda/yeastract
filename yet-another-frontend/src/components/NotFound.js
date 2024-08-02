import React from "react";

export default function NotFound() {
    return (
        <div className="p-6 flex flex-col">
            <h1 className="text-xl text-center font-figtree">404 Not Found</h1>
            <br />
            <p className="text-center">
                It seems we did not find what you were looking for.
            </p>
            <a className="btn self-center mt-4" href="/">
                Go To Main Page
            </a>
        </div>
    );
}
