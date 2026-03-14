/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#5b13ec",
                "background-light": "#f6f6f8",
                "background-dark": "#0a0712",
                "accent-pink": "#ff4d8d",
                "accent-blue": "#00d2ff",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "Noto Sans KR", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "2xl": "2rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
