/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25D366',
          'green-dark': '#128C7E',
          'green-light': '#DCF8C6',
          'header': '#075E54',
          'header-dark': '#1f2937',
          'bg-light': '#E5DDD5',
          'bg-dark': '#0C1317',
          'chat-bg': '#ECE5DD',
          'chat-bg-dark': '#0B141A',
          'sidebar': '#F0F0F0',
          'sidebar-dark': '#202C33',
          'message-sent': '#DCF8C6',
          'message-received': '#FFFFFF',
          'message-received-dark': '#2A2F32',
        }
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};