/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            fontFamily: {
                ntr: ["ntr", "sans-serif"],
            },
        },
    },
    plugins: [require("daisyui")],
};
