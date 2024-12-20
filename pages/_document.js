import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head />
            <body
                style={{
                    fontFamily: "Arial, sans-serif",
                    backgroundColor: "#f4f4f9",
                    color: "#333",
                    lineHeight: "1.6",
                    margin: "0",
                    padding: "0",
                    // display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start", 
                    minHeight: "100vh",
                }}
            >
                

                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
