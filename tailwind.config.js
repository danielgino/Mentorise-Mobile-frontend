/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                sans:             ["Assistant_400Regular"],
                "sans-medium":    ["Assistant_500Medium"],
                "sans-semibold":  ["Assistant_600SemiBold"],
                "sans-bold":      ["Assistant_700Bold"],
            },
        },
    },
    plugins: [],
};
