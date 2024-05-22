/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                notosans: ["noto-sans", "sans-serif"],
                figtree: ["figtree", "sans-serif"],
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: "#66ccff",
                    secondary: "#d1d5db",
                    accent: "#37cdbe",
                    neutral: "#3d4451",
                    "base-100": "#ffffff",
                    ".text-color": {
                        color: "rgb(55 65 81)",
                    },
                    ".active-tab": {
                        "background-color": "#1f3d4d",
                        color: "#adcdff",
                    },
                },
            },
        ],
    },
};
